// useAvatarSession — 数字人 WebRTC 会话管理 Hook
// 实现完整状态机：idle → creating → connecting → ready → speaking
// 支持：创建/销毁/重连/讲话/打断/音频输入/降级/指标采集
//
// 2026-07-19 已适配 LiveTalking 真实协议：
//   - 等待 ICE gathering 完成再发送 offer
//   - 不主动创建 DataChannel（LiveTalking 不接受）
//   - 本地GPU模式心跳改为时长估算

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  createSession,
  deleteSession,
  sendOffer,
  speak as apiSpeak,
  interrupt as apiInterrupt,
  getIceConfig,
} from '@/services/avatarGatewayApi';
import type {
  AvatarSessionState,
  IceConfig,
  SessionMetrics,
  VisualEvent,
  AvatarGatewayError,
  DegradationMode,
} from '@/types/digital-human';

// ── 配置常量 ─────────────────────────────────────────────────
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_BASE_DELAY_MS = 1000;
const SESSION_HEARTBEAT_MS = 30_000;
const MAX_TEXT_LENGTH = 5000;
const ICE_GATHERING_TIMEOUT_MS = 15_000;
const IS_LOCAL_GPU = import.meta.env.VITE_USE_LOCAL_GPU === 'true';

interface UseAvatarSessionOptions {
  courseId?: string;
  avatarId?: string;
  autoConnect?: boolean;
  onStateChange?: (state: AvatarSessionState) => void;
  onMetrics?: (metrics: SessionMetrics) => void;
  onVisualEvent?: (event: VisualEvent) => void;
}

interface UseAvatarSessionReturn {
  // 状态
  state: AvatarSessionState;
  sessionId: string | null;
  stream: MediaStream | null;
  degradation: DegradationMode;
  metrics: SessionMetrics;
  error: string | null;

  // 操作
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  reconnect: () => Promise<void>;
  sendText: (text: string) => Promise<void>;
  sendAudio: (audioData: string) => Promise<void>;
  interrupt: () => Promise<void>;
  setMuted: (muted: boolean) => void;
  muted: boolean;
}

// ── 等待 ICE gathering 完成 ──────────────────────────────────
function waitForIceGatheringComplete(pc: RTCPeerConnection, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    // 已经完成了
    if (pc.iceGatheringState === 'complete') {
      resolve();
      return;
    }
    const timeout = setTimeout(() => {
      console.warn('[WebRTC] ICE gathering 超时，以当前 candidate 发送 offer');
      resolve();
    }, timeoutMs);
    pc.addEventListener('icegatheringstatechange', () => {
      if (pc.iceGatheringState === 'complete') {
        clearTimeout(timeout);
        console.log('[WebRTC] ICE gathering 完成');
        resolve();
      }
    });
  });
}

export function useAvatarSession(
  options: UseAvatarSessionOptions = {},
): UseAvatarSessionReturn {
  const {
    courseId,
    avatarId,
    autoConnect = false,
    onStateChange,
    onMetrics,
    onVisualEvent,
  } = options;

  // ── 状态 ──────────────────────────────────────────────────
  const [state, setState] = useState<AvatarSessionState>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [degradation, setDegradation] = useState<DegradationMode>('full');
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);

  const [metrics, setMetrics] = useState<SessionMetrics>({
    sessionCreated: false,
    iceConnected: false,
    turnProtocol: 'unknown',
    reconnectCount: 0,
    errorCount: 0,
  });

  // ── Refs（避免闭包陈旧值） ──────────────────────────────────
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const stateRef = useRef<AvatarSessionState>('idle');
  const sessionIdRef = useRef<string | null>(null);
  const metricsRef = useRef<SessionMetrics>(metrics);
  const reconnectAttemptsRef = useRef(0);
  const heartbeatTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speakingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectStartTimeRef = useRef(0);
  const handleReconnectRef = useRef<() => void>(() => {});

  // 同步 ref
  const updateState = useCallback(
    (newState: AvatarSessionState) => {
      stateRef.current = newState;
      setState(newState);
      onStateChange?.(newState);
    },
    [onStateChange],
  );

  const updateMetrics = useCallback(
    (patch: Partial<SessionMetrics>) => {
      setMetrics((prev) => {
        const next = { ...prev, ...patch };
        metricsRef.current = next;
        onMetrics?.(next);
        return next;
      });
    },
    [onMetrics],
  );

  // ── 清理资源 ──────────────────────────────────────────────
  const cleanup = useCallback(async () => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    if (speakingTimerRef.current) {
      clearInterval(speakingTimerRef.current);
      speakingTimerRef.current = null;
    }

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    setStream(null);

    const sid = sessionIdRef.current;
    if (sid) {
      try {
        await deleteSession(sid);
      } catch {
        // 忽略清理错误
      }
    }
    sessionIdRef.current = null;
    setSessionId(null);
  }, []);

  // ── 创建 PeerConnection ───────────────────────────────────
  const createPeerConnection = useCallback(
    (iceConfig: IceConfig): RTCPeerConnection => {
      const pc = new RTCPeerConnection({
        iceServers: iceConfig.iceServers,
        iceTransportPolicy: iceConfig.iceTransportPolicy || 'relay',
      });

      // 接收远程音视频流
      pc.ontrack = (event) => {
        console.log(`[WebRTC] ontrack: kind=${event.track.kind}, label=${event.track.label}, streams=${event.streams?.length || 0}`);
        if (event.streams && event.streams[0]) {
          const s = event.streams[0];
          console.log(`[WebRTC] 收到媒体流: video=${s.getVideoTracks().length}, audio=${s.getAudioTracks().length}`);
          s.getAudioTracks().forEach(t => console.log(`[WebRTC] Audio track: enabled=${t.enabled}, muted=${t.muted}, readyState=${t.readyState}`));
          setStream(s);
          const now = Date.now();
          if (connectStartTimeRef.current && !metricsRef.current.firstFrameMs) {
            updateMetrics({ firstFrameMs: now - connectStartTimeRef.current });
          }
        }
      };

      // ICE 连接状态
      pc.oniceconnectionstatechange = () => {
        const iceState = pc.iceConnectionState;
        console.log('[WebRTC] ICE 连接状态:', iceState);
        if (iceState === 'connected' || iceState === 'completed') {
          updateMetrics({ iceConnected: true });
          setDegradation('full');
          if (stateRef.current === 'connecting' || stateRef.current === 'reconnecting') {
            reconnectAttemptsRef.current = 0;
            updateState('ready');
          }
        } else if (iceState === 'failed') {
          if (stateRef.current !== 'closed' && stateRef.current !== 'error') {
            console.log('[WebRTC] ICE failed，尝试 ICE restart...');
            iceRestart().then(() => {
              console.log('[WebRTC] ICE restart 成功，避免完整重连');
            }).catch(() => {
              console.log('[WebRTC] ICE restart 失败，执行完整重连');
              handleReconnectRef.current();
            });
          }
        } else if (iceState === 'disconnected') {
          // TTS 播完后的正常空闲状态，不需要处理
          // Chrome 会在 15s 后转 failed，届时再 ICE restart
          console.log('[WebRTC] ICE 空闲（TTS 未播报时的正常状态）');
        }
      };

      // ICE 候选收集
      const candidateTypes = new Set<string>();
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const cand = event.candidate;
          console.log(`[WebRTC] ICE candidate: type=${cand.type}, protocol=${cand.protocol}, address=${cand.address}:${cand.port}, transport=${cand.candidate?.split(' ')[2] || '?'}`);
          candidateTypes.add(cand.type);
          const protocol = cand.protocol?.toLowerCase();
          if (protocol === 'udp' || protocol === 'tcp') {
            updateMetrics({ turnProtocol: protocol });
          }
          if (cand.type === 'relay') {
            console.log('[WebRTC] ✅ 获取到 relay candidate');
          }
        } else {
          // ICE gathering 完成（event.candidate === null）
          const types = Array.from(candidateTypes).join(', ') || 'none';
          console.log(`[WebRTC] ICE gathering 完成，候选类型: [${types}]`);
          if (!candidateTypes.has('relay')) {
            console.warn('[WebRTC] ⚠️ 没有 relay candidate！TURN 服务器可能不可达或凭据错误');
          }
        }
      };

      // 仅监听服务端 DataChannel（LiveTalking 不接受客户端 DataChannel）
      pc.ondatachannel = (event) => {
        const channel = event.channel;
        console.log('[WebRTC] 收到远端 DataChannel:', channel.label);
        if (channel.label === 'visual-events') {
          channel.onmessage = (msg) => {
            try {
              const event = JSON.parse(msg.data) as VisualEvent;
              onVisualEvent?.(event);
            } catch {
              // 忽略解析错误
            }
          };
        }
      };

      return pc;
    },
    [updateState, updateMetrics, onVisualEvent],
  );

  // ── ICE 重启（仅重启 ICE，保留 sessionId，不重建 PC） ────
  const iceRestart = useCallback(async () => {
    const pc = pcRef.current;
    const sid = sessionIdRef.current;
    if (!pc || !sid || pc.signalingState !== 'stable') return;

    const offer = await pc.createOffer({ iceRestart: true });
    await pc.setLocalDescription(offer);
    await waitForIceGatheringComplete(pc, ICE_GATHERING_TIMEOUT_MS);
    const answer = await sendOffer(sid, pc.localDescription!.sdp!);
    await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: answer.sdp }));
    console.log('[WebRTC] ICE restart 完成');
  }, []);

  // ── 重连逻辑 ──────────────────────────────────────────────
  const handleReconnect = useCallback(async () => {
    const maxAttempts = MAX_RECONNECT_ATTEMPTS;
    if (reconnectAttemptsRef.current >= maxAttempts) {
      updateState('error');
      setError(`重连失败，已尝试 ${maxAttempts} 次`);
      updateMetrics({
        errorCount: metricsRef.current.errorCount + 1,
        lastError: 'Max reconnect attempts reached',
      });
      return;
    }

    reconnectAttemptsRef.current++;
    updateMetrics({ reconnectCount: metricsRef.current.reconnectCount + 1 });
    updateState('reconnecting');

    const delay = RECONNECT_BASE_DELAY_MS * Math.pow(2, reconnectAttemptsRef.current - 1);
    await new Promise((r) => setTimeout(r, delay));

    try {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }

      // 创建新会话（包含 ICE 配置 + sessionId）
      const { iceConfig, sessionId: newSid } = await createSession({
        courseId,
        avatarId,
      });
      if (newSid) {
        sessionIdRef.current = newSid;
        setSessionId(newSid);
        console.log('[WebRTC] 重连: 新 sessionId =', newSid);
      }
      const pc = createPeerConnection(iceConfig);
      pcRef.current = pc;

      pc.addTransceiver('audio', { direction: 'recvonly' });
      pc.addTransceiver('video', { direction: 'recvonly' });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 等待 ICE gathering 完成
      await waitForIceGatheringComplete(pc, ICE_GATHERING_TIMEOUT_MS);

      const sid = sessionIdRef.current;
      if (!sid) throw new Error('No session id');

      const answer = await sendOffer(sid, pc.localDescription!.sdp!);
      await pc.setRemoteDescription(
        new RTCSessionDescription({ type: 'answer', sdp: answer.sdp }),
      );

      reconnectAttemptsRef.current = 0;
      console.log('[WebRTC] 重连成功');
    } catch (e) {
      const err = e as AvatarGatewayError;
      updateMetrics({
        errorCount: metricsRef.current.errorCount + 1,
        lastError: err.message || 'Reconnect failed',
      });
      // 延迟后继续重试，避免栈溢出
      await new Promise((r) => setTimeout(r, 500));
      handleReconnectRef.current();
    }
  }, [createPeerConnection, updateState, updateMetrics]);

  // 打破循环依赖
  handleReconnectRef.current = handleReconnect;

  // ── 连接（完整流程） ──────────────────────────────────────
  const connect = useCallback(async () => {
    if (stateRef.current !== 'idle' && stateRef.current !== 'error' && stateRef.current !== 'closed') {
      return;
    }

    connectStartTimeRef.current = Date.now();
    updateState('creating');
    setError(null);

    try {
      // 0. 清理残留旧会话
      if (sessionIdRef.current) {
        try {
          await deleteSession(sessionIdRef.current);
        } catch {
          // 忽略
        }
        sessionIdRef.current = null;
        setSessionId(null);
      }

      // 1. 获取会话 + ICE 配置
      const sessionResult = await createSession({
        courseId,
        avatarId,
      });
      const sid = sessionResult.sessionId;
      const iceConfig = sessionResult.iceConfig;
      console.log('[WebRTC] createSession 返回:', { sid, hasIceConfig: !!iceConfig, iceServers: iceConfig?.iceServers?.length });
      sessionIdRef.current = sid;
      setSessionId(sid);
      updateMetrics({ sessionCreated: true });

      // 2. 创建 PeerConnection
      updateState('connecting');
      const pc = createPeerConnection(iceConfig);
      pcRef.current = pc;

      // 添加音频/视频接收器
      pc.addTransceiver('audio', { direction: 'recvonly' });
      pc.addTransceiver('video', { direction: 'recvonly' });

      // 3. 创建 offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // 4. 等待 ICE gathering 完成后再发送 SDP
      console.log('[WebRTC] 等待 ICE gathering 完成...');
      await waitForIceGatheringComplete(pc, ICE_GATHERING_TIMEOUT_MS);

      // 5. 发送完整 SDP offer
      const answer = await sendOffer(sid, pc.localDescription!.sdp!);
      await pc.setRemoteDescription(
        new RTCSessionDescription({ type: 'answer', sdp: answer.sdp }),
      );

      // 6. 启动心跳（本地GPU模式用轻量心跳，不轮询不存在接口）
      heartbeatTimerRef.current = setInterval(async () => {
        if (!sessionIdRef.current) return;
        // 本地模式：只在 ICE 彻底失败时重连，不因 disconnected 触发
        if (IS_LOCAL_GPU) {
          const pc = pcRef.current;
          if (pc && pc.iceConnectionState === 'failed') {
            if (stateRef.current !== 'closed' && stateRef.current !== 'error') {
              handleReconnectRef.current();
            }
          }
          return;
        }
        // 生产模式：通过网关心跳
        try {
          const { getSpeakingStatus } = await import('@/services/avatarGatewayApi');
          await getSpeakingStatus(sessionIdRef.current!);
        } catch {
          // 忽略
        }
      }, SESSION_HEARTBEAT_MS);

      // 连接成功由 oniceconnectionstatechange 处理
    } catch (e) {
      const err = e as AvatarGatewayError;
      console.error('[WebRTC] 连接失败:', err);
      updateState('error');
      setError(err.message || '连接失败');
      updateMetrics({
        errorCount: metricsRef.current.errorCount + 1,
        lastError: err.message,
      });
      if (err.retryable) {
        setDegradation('audio_only');
      } else {
        setDegradation('static');
      }
    }
  }, [courseId, avatarId, createPeerConnection, updateState, updateMetrics]);

  const disconnect = useCallback(async () => {
    updateState('closed');
    await cleanup();
    setDegradation('static');
    setError(null);
  }, [cleanup, updateState]);

  const reconnect = useCallback(async () => {
    reconnectAttemptsRef.current = 0;
    await handleReconnect();
  }, [handleReconnect]);

  // ── 发送文本（讲话） ──────────────────────────────────────
  const sendText = useCallback(
    async (text: string) => {
      console.log('[WebRTC] sendText 被调用:', { text: text.substring(0, 30), state: stateRef.current, sid: !!sessionIdRef.current });
      const sid = sessionIdRef.current;
      if (!sid) { console.warn('[WebRTC] sendText 失败: 无 sessionId'); return; }
      if (text.length > MAX_TEXT_LENGTH) { console.warn('[WebRTC] sendText 失败: 文本过长'); return; }

      const currentState = stateRef.current;
      if (currentState !== 'ready' && currentState !== 'speaking') {
        console.warn('[WebRTC] sendText 失败: 状态不是 ready/speaking, 当前=', currentState);
        setError('数字人未就绪，请稍后重试');
        return;
      }

      updateState('speaking');

      try {
        const turnId = crypto.randomUUID();
        const ttsStart = Date.now();
        console.log('[WebRTC] 发送 /human:', { sid, text: text.substring(0, 50), turnId });
        await apiSpeak(sid, { text, turnId, sequence: 0 });
        console.log('[WebRTC] /human 发送成功, TTS延迟:', Date.now() - ttsStart, 'ms');
        updateMetrics({ ttsLatencyMs: Date.now() - ttsStart });

        // 本地GPU模式：根据文本长度估算播报时长（中文约 4字/秒）
        // 不轮询不存在的 /api/speaking
        if (IS_LOCAL_GPU) {
          const estimatedDurationMs = Math.max(text.length * 250, 2000);
          speakingTimerRef.current = setTimeout(() => {
            speakingTimerRef.current = null;
            if (stateRef.current === 'speaking') {
              updateState('ready');
            }
          }, estimatedDurationMs);
        } else {
          // 生产模式：轮询说话状态
          speakingTimerRef.current = setInterval(async () => {
            try {
              if (!sessionIdRef.current) {
                clearInterval(speakingTimerRef.current!);
                speakingTimerRef.current = null;
                return;
              }
              const { getSpeakingStatus } = await import('@/services/avatarGatewayApi');
              const status = await getSpeakingStatus(sessionIdRef.current);
              if (!status.speaking) {
                clearInterval(speakingTimerRef.current!);
                speakingTimerRef.current = null;
                if (stateRef.current === 'speaking') {
                  updateState('ready');
                }
              }
            } catch {
              // 忽略
            }
          }, 500);
        }
      } catch (e) {
        const err = e as AvatarGatewayError;
        if (stateRef.current === 'speaking') {
          updateState('ready');
        }
        setError(err.message || '发送文本失败');
      }
    },
    [updateState, updateMetrics],
  );

  // ── 发送音频数据 ──────────────────────────────────────────
  const sendAudio = useCallback(
    async (_audioData: string) => {
      const sid = sessionIdRef.current;
      if (!sid) return;
      try {
        await apiInterrupt(sid);
        // 音频上传在本地GPU模式会抛出错误，这是预期行为
      } catch {
        // 忽略
      }
    },
    [],
  );

  // ── 打断 ──────────────────────────────────────────────────
  const interrupt = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid) return;

    const interruptStart = Date.now();
    try {
      await apiInterrupt(sid);
      updateMetrics({ interruptResponseMs: Date.now() - interruptStart });

      if (speakingTimerRef.current) {
        clearInterval(speakingTimerRef.current);
        speakingTimerRef.current = null;
      }
      if (IS_LOCAL_GPU && typeof speakingTimerRef.current === 'object') {
        clearTimeout(speakingTimerRef.current as unknown as ReturnType<typeof setTimeout>);
        speakingTimerRef.current = null;
      }

      if (stateRef.current === 'speaking') {
        updateState('ready');
      }
    } catch (e) {
      const err = e as AvatarGatewayError;
      setError(err.message || '打断失败');
    }
  }, [updateState, updateMetrics]);

  // ── 静音控制 ──────────────────────────────────────────────
  const handleSetMuted = useCallback((m: boolean) => {
    setMuted(m);
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !m;
      });
    }
  }, [stream]);

  // ── 自动连接 ──────────────────────────────────────────────
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      cleanup();
    };
  }, [autoConnect]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 页面隐藏时不再自动断开（会导致 sessionId 丢失） ──
  // useEffect(() => {
  //   const handleVisibility = () => {
  //     if (document.hidden && stateRef.current !== 'idle' && stateRef.current !== 'closed') {
  //       disconnect();
  //     }
  //   };
  //   document.addEventListener('visibilitychange', handleVisibility);
  //   return () => document.removeEventListener('visibilitychange', handleVisibility);
  // }, [disconnect]);

  return {
    state,
    sessionId,
    stream,
    degradation,
    metrics,
    error,
    connect,
    disconnect,
    reconnect,
    sendText,
    sendAudio,
    interrupt,
    setMuted: handleSetMuted,
    muted,
  };
}
