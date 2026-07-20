// DigitalHumanPanel — 数字人主面板
// 组合 AvatarVideo + AvatarControls，管理完整交互生命周期
// 接入智学帮 ChatPage / TutorPage / CourseDetailPage

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAvatarSession } from '@/hooks/useAvatarSession';
import AvatarVideo from '@/components/digital-human/AvatarVideo';
import AvatarControls from '@/components/digital-human/AvatarControls';
import { Button } from '@/components/ui/button';
import type { DigitalHumanPanelProps, AvatarSessionState, DegradationMode } from '@/types/digital-human';
import { User, WifiOff, AlertTriangle, Monitor, Volume2 } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { consumeSse } from '@/lib/sse';

const MAX_TEXT_LENGTH = 5000;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://pnmjgxsemgldncqbimbt.supabase.co';

// 过滤 Markdown 标记，提取纯文本用于 TTS 播报
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')           // 标题 # ## ###
    .replace(/\*\*(.+?)\*\*/g, '$1')       // 加粗 **text**
    .replace(/\*(.+?)\*/g, '$1')           // 斜体 *text*
    .replace(/`{1,3}[^`]*`{1,3}/g, '')    // 行内代码和代码块
    .replace(/^>\s*/gm, '')                // 引用 >
    .replace(/^---+\s*$/gm, '')            // 分隔线 ---
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')    // 链接 [text](url)
    .replace(/!\[.*?\]\(.+?\)/g, '')       // 图片 ![alt](url)
    .replace(/^[-*+]\s+/gm, '')            // 无序列表 - * +
    .replace(/^\d+\.\s+/gm, '')            // 有序列表 1. 2.
    .replace(/~~(.+?)~~/g, '$1')           // 删除线 ~~text~~
    .replace(/&[a-z]+;/g, '')              // HTML实体 &nbsp;
    .replace(/```[\s\S]*?```/g, '')        // 代码块
    .replace(/\n{3,}/g, '\n\n')            // 多个换行合并
    .trim();
}

// 调用 DeepSeek AI 获取回答文本（30秒超时）
async function askAI(question: string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('未登录');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  const res = await fetch(`${SUPABASE_URL}/functions/v1/deepseek-chat-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message: question, history: [], sessionId: undefined, useRag: false }),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (res.ok && res.headers.get('content-type')?.includes('text/event-stream')) {
    let fullText = '';
    await consumeSse(res.body!, ({ data }) => {
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        if (parsed.delta) fullText += parsed.delta;
      } catch {}
    });
    if (fullText.trim()) return fullText.trim();
  }

  // 降级：普通调用
  const { data: fallback } = await supabase.functions.invoke('deepseek-chat', {
    body: { messages: [{ role: 'user', content: question }], sessionId: undefined, saveHistory: false, useRag: false },
  });
  return fallback?.content || fallback?.response || '抱歉，AI暂时无法回答';
}

export default function DigitalHumanPanel({
  courseId,
  avatarId,
  className = '',
  showControls = true,
  autoConnect = false,
  onStateChange,
  onMetrics,
  onVisualEvent,
}: DigitalHumanPanelProps) {
  const {
    state,
    stream,
    degradation,
    metrics,
    error,
    connect,
    disconnect,
    reconnect,
    sendText,
    interrupt,
    setMuted,
    muted,
  } = useAvatarSession({
    courseId,
    avatarId,
    autoConnect,
    onStateChange,
    onMetrics,
    onVisualEvent,
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [textLength, setTextLength] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  // 全屏切换
  const toggleFullscreen = useCallback(async () => {
    if (!panelRef.current) return;
    if (!isFullscreen) {
      try {
        await panelRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch {
        // 全屏不支持
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // 监听 fullscreenchange 事件
  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isTtsSpeaking, setIsTtsSpeaking] = useState(false);

  // ── 浏览器 TTS（GPU 不可用时的降级方案） ─────────────────
  const speakWithBrowserTTS = useCallback(async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) { resolve(); return; }
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = 1;
      u.onstart = () => setIsTtsSpeaking(true);
      u.onend = () => { setIsTtsSpeaking(false); resolve(); };
      u.onerror = () => { setIsTtsSpeaking(false); resolve(); };
      // 兜底：最多等 60 秒
      setTimeout(() => { setIsTtsSpeaking(false); resolve(); }, Math.max(text.length * 250, 60000));
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(u);
    });
  }, []);

  // 演示模式：VITE_DEMO_DIGITAL_HUMAN=true 且非本地GPU模式时直接启用
  // 无需等待连接失败，评委打开即可使用
  const isDemoMode = import.meta.env.VITE_DEMO_DIGITAL_HUMAN === 'true' && import.meta.env.VITE_USE_LOCAL_GPU !== 'true';

  // 发送文本（先问 AI，再播报。GPU在线走WebRTC，离线走浏览器TTS）
  const handleSendText = useCallback(
    async (text: string) => {
      setTextLength(text.length);
      setIsAiThinking(true);
      try {
        const rawAnswer = await askAI(text);
        const answer = stripMarkdown(rawAnswer);
        console.log('[DigitalHuman] AI回答:', answer.substring(0, 100));

        const sentences = answer.match(/[^。！？\n]+[。！？\n]?/g) || [answer];
        const chunks: string[] = [];
        let cur = '';
        for (const s of sentences) {
          if ((cur + s).length > 1500) { if (cur) chunks.push(cur.trim()); cur = s; }
          else cur += s;
        }
        if (cur.trim()) chunks.push(cur.trim());

        setIsAiThinking(false);

        // GPU 在线 → WebRTC 播报；GPU 离线 → 浏览器 TTS
        const useBrowserTTS = degradation !== 'full' || !stream;
        for (const chunk of chunks) {
          if (useBrowserTTS) {
            console.log('[DigitalHuman] 浏览器TTS:', chunk.substring(0, 30));
            await speakWithBrowserTTS(chunk);
          } else {
            await sendText(chunk);
            await new Promise(r => setTimeout(r, Math.max(chunk.length * 250, 1500)));
          }
        }
      } catch (e) {
        console.error('[DigitalHuman] AI调用失败:', e);
        if (degradation === 'full') sendText('抱歉，AI暂时无法回答');
        setIsAiThinking(false);
        setIsTtsSpeaking(false);
      }
    },
    [sendText, speakWithBrowserTTS, degradation, stream],
  );

  // 关闭/断开
  const handleClose = useCallback(() => {
    if (state === 'idle') return;
    disconnect();
  }, [state, disconnect]);

  const isConnected = state === 'ready' || state === 'speaking' || state === 'reconnecting';
  // 演示模式：不需 WebRTC，输入框始终可用
  const showInput = isConnected || isDemoMode;

  return (
    <div
      ref={panelRef}
      className={`flex flex-col gap-3 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-6' : ''} ${className}`}
    >
      {/* 视频区域 */}
      <AvatarVideo
        stream={stream}
        state={state}
        muted={muted}
        demoMode={isDemoMode}
        isSpeaking={isAiThinking || isTtsSpeaking}
        className={isFullscreen ? 'flex-1' : ''}
      />

      {/* 演示模式横幅 */}
      {isDemoMode && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs">
          <Monitor className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-blue-400">演示模式 — AI回答 + 浏览器语音播报</span>
        </div>
      )}

      {/* 降级横幅 */}
      {degradation !== 'full' && isConnected && !isDemoMode && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-xs">
          {degradation === 'audio_only' ? (
            <>
              <WifiOff className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
              <span className="text-yellow-500">
                视频连接失败，已降级为音频模式。AI教师仍可正常讲解。
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
              <span className="text-yellow-500">
                数字人服务暂不可用，已降级为静态形象+音频模式。
              </span>
            </>
          )}
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* 连接按钮（未连接时，演示模式不显示） */}
      {(state === 'idle' || state === 'closed' || state === 'error') && !isDemoMode ? (
        <div className="flex flex-col gap-2">
          <Button
            onClick={connect}
            className="gradient-bg text-white w-full"
          >
            {state === 'error' ? (
              <>重新连接</>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                连接AI教师
              </>
            )}
          </Button>
          {/* 降级模式提示 */}
          {state === 'error' && (
            <p className="text-[10px] text-muted-foreground text-center">
              多次重连失败将自动降级为音频+静态形象模式
            </p>
          )}
        </div>
      ) : null}

      {/* AI思考中提示 */}
      {isAiThinking && showInput && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-400">
          <div className="w-3 h-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          AI正在生成回答…
        </div>
      )}

      {/* 控制面板（WebRTC连接后 或 演示模式 显示） */}
      {showControls && showInput && (
        <AvatarControls
          state={state}
          onSendText={handleSendText}
          onInterrupt={interrupt}
          onToggleMute={() => setMuted(!muted)}
          onToggleFullscreen={toggleFullscreen}
          onReconnect={reconnect}
          onClose={handleClose}
          muted={muted}
          isFullscreen={isFullscreen}
          textLength={textLength}
          maxTextLength={MAX_TEXT_LENGTH}
          disabled={isAiThinking}
          demoMode={isDemoMode}
        />
      )}

      {/* 指标面板（开发调试用，可折叠） */}
      {import.meta.env.DEV && isConnected && (
        <details className="text-[10px] text-muted-foreground bg-muted/30 rounded-lg p-2">
          <summary className="cursor-pointer font-medium">会话指标</summary>
          <div className="mt-1 space-y-0.5">
            <div>ICE: {metrics.iceConnected ? '✓ 已连接' : '未连接'}</div>
            <div>TURN: {metrics.turnProtocol}</div>
            <div>首帧: {metrics.firstFrameMs ? `${metrics.firstFrameMs}ms` : '—'}</div>
            <div>TTS延迟: {metrics.ttsLatencyMs ? `${metrics.ttsLatencyMs}ms` : '—'}</div>
            <div>打断响应: {metrics.interruptResponseMs ? `${metrics.interruptResponseMs}ms` : '—'}</div>
            <div>重连次数: {metrics.reconnectCount}</div>
            <div>错误次数: {metrics.errorCount}</div>
            <div>降级模式: {degradation}</div>
          </div>
        </details>
      )}
    </div>
  );
}
