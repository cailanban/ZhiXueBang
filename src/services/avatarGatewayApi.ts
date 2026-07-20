// 数字人网关 API 客户端 — 智学帮 M3
// 安全要求：不在此文件中硬编码 TURN/SSH/讯飞/Supabase 密钥
//
// 双模式：
//   本地GPU模式 (VITE_USE_LOCAL_GPU=true) → 直连 SSH 隧道 :16006
//   生产模式 → 走 Supabase Edge Function 网关
//
// 2026-07-19 已适配 LiveTalking 真实协议：
//   /api/ice-config → /offer → /human → /interrupt

import { supabase } from '@/db/supabase';
import type {
  CreateSessionRequest,
  CreateSessionResponse,
  SdpOfferRequest,
  SdpAnswerResponse,
  SpeakRequest,
  SpeakResponse,
  AudioDataRequest,
  InterruptResponse,
  SpeakingStatus,
  AvatarGatewayError,
} from '@/types/digital-human';

// ── 模式判断 ─────────────────────────────────────────────────
// 仅当明确设置 VITE_USE_LOCAL_GPU=true 时才直连本地GPU
const IS_DEV = import.meta.env.VITE_USE_LOCAL_GPU === 'true';
const DEV_GPU_URL = import.meta.env.VITE_DIGIHUMAN_GPU_URL || 'http://127.0.0.1:16006';
const DEV_AVATAR_ID = import.meta.env.VITE_DIGIHUMAN_AVATAR_ID || 'teacher1';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://pnmjgxsemgldncqbimbt.supabase.co';

// ── 本地会话映射（前端 sessionId → GPU sessionid） ──────────
const localSessionMap = new Map<string, string>();

// ── 内部 fetch（开发模式：直连 LiveTalking，兼容空响应/纯文本/JSON） ──
async function devFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${DEV_GPU_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    throw {
      code: 'GPU_ERROR',
      message: `GPU ${res.status}`,
      retryable: res.status >= 500,
    } as AvatarGatewayError;
  }
  // 兼容空响应、纯文本、JSON（LiveTalking /human 返回空）
  const text = await res.text();
  if (!text || text.trim() === '') return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

async function prodFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) {
    throw { code: 'UNAUTHORIZED', message: '未登录', retryable: false } as AvatarGatewayError;
  }
  const url = `${SUPABASE_URL}/functions/v1/avatar-gateway/api/v1/avatar${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw {
      code: body.code || 'INTERNAL_ERROR',
      message: body.message || `HTTP ${res.status}`,
      retryable: res.status >= 500 || res.status === 429,
    } as AvatarGatewayError;
  }
  return res.json();
}

// ── 健康检查 ─────────────────────────────────────────────────
export async function healthCheck(): Promise<{ live: boolean; ready: boolean }> {
  if (IS_DEV) {
    try {
      const res = await fetch(`${DEV_GPU_URL}/api/ice-config`);
      return { live: res.ok, ready: res.ok };
    } catch {
      return { live: false, ready: false };
    }
  }
  const [live, ready] = await Promise.allSettled([
    prodFetch('/health/live').then(() => true),
    prodFetch('/health/ready').then(() => true),
  ]);
  return {
    live: live.status === 'fulfilled' && live.value,
    ready: ready.status === 'fulfilled' && ready.value,
  };
}

// ── 获取 ICE 配置 ────────────────────────────────────────────
// 混合模式：优先从 avatar-gateway 获取 HMAC TURN 凭据，失败则用 GPU 静态凭据
// TURN URL 重排：TCP 优先（UDP relay 常被防火墙阻止）

function reorderTurnUrlsTcpFirst(iceConfig: CreateSessionResponse): CreateSessionResponse {
  // TCP 优先 + 保留原有 TURN 配置（Coturn 现在 no-auth 已修复）
  const servers = iceConfig.iceConfig.iceServers.map((server) => {
    if (!Array.isArray(server.urls)) return server;
    const tcpUrls = server.urls.filter((u) => u.includes('transport=tcp'));
    const udpUrls = server.urls.filter((u) => !u.includes('transport=tcp'));
    return { ...server, urls: [...tcpUrls, ...udpUrls] };
  });
  return {
    ...iceConfig,
    iceConfig: {
      iceTransportPolicy: 'relay' as const,
      iceServers: servers,
    },
  };
}

async function fetchHybridIceConfig(): Promise<CreateSessionResponse> {
  // 1. 尝试从 avatar-gateway 获取 HMAC 凭据（更可靠）
  try {
    const prodConfig = await prodFetch<CreateSessionResponse>('/ice-config');
    if (prodConfig?.iceConfig?.iceServers?.length > 0) {
      console.log('[WebRTC] ✅ 使用 avatar-gateway HMAC TURN 凭据');
      // avatar-gateway /ice-config 可能不含 sessionId，补上
      if (!prodConfig.sessionId) {
        prodConfig.sessionId = crypto.randomUUID();
      }
      return reorderTurnUrlsTcpFirst(prodConfig);
    }
  } catch (e) {
    console.warn('[WebRTC] avatar-gateway ICE 获取失败，回退到 GPU 静态凭据:', e);
  }

  // 2. 回退：从 GPU 直连获取静态凭据
  const data = await devFetch<{
    iceServers: CreateSessionResponse['iceConfig']['iceServers'];
    iceTransportPolicy?: 'all' | 'relay';
  }>('/api/ice-config');
  const sid = crypto.randomUUID();
  const result: CreateSessionResponse = {
    sessionId: sid,
    iceConfig: {
      iceServers: data.iceServers,
      iceTransportPolicy: data.iceTransportPolicy || 'relay',
    },
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
  return reorderTurnUrlsTcpFirst(result);
}

export async function getIceConfig(): Promise<CreateSessionResponse> {
  if (IS_DEV) {
    return fetchHybridIceConfig();
  }
  return prodFetch<CreateSessionResponse>('/ice-config');
}

// ── 会话管理 ─────────────────────────────────────────────────
export async function createSession(
  req: CreateSessionRequest = {},
): Promise<CreateSessionResponse> {
  if (IS_DEV) {
    // 混合模式：从 avatar-gateway 获取 HMAC TURN 凭据
    const result = await fetchHybridIceConfig();
    return result;
  }
  return prodFetch<CreateSessionResponse>('/sessions', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function deleteSession(sessionId: string): Promise<void> {
  // 清理本地映射
  localSessionMap.delete(sessionId);
  if (IS_DEV) {
    // GPU 端无会话管理，仅清理本地
    return;
  }
  await prodFetch(`/sessions/${sessionId}`, { method: 'DELETE' });
}

// ── WebRTC 信令（已适配 LiveTalking 真实协议） ──────────────
export async function sendOffer(
  sessionId: string,
  sdp: string,
): Promise<SdpAnswerResponse> {
  if (IS_DEV) {
    // LiveTalking 真实协议：POST /offer { sdp, type: 'offer', avatar }
    // 自定义 fetch 处理：LiveTalking 可能返回 JSON 或纯 SDP 文本
    const url = `${DEV_GPU_URL}/offer`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sdp, type: 'offer', avatar: DEV_AVATAR_ID }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[WebRTC] /offer 返回错误:', res.status, errText.substring(0, 200));
      throw { code: 'GPU_ERROR', message: `GPU offer ${res.status}`, retryable: res.status >= 500 };
    }

    const raw = await res.text();
    console.log('[WebRTC] /offer 原始响应 (前200字符):', raw.substring(0, 200));

    let answerSdp = '';
    // 尝试解析为 JSON
    try {
      const data = JSON.parse(raw);
      const remoteSid = data.sessionid || data.sessionId || '';
      if (remoteSid && sessionId) {
        localSessionMap.set(sessionId, remoteSid);
      }
      answerSdp = data.sdp || '';
    } catch {
      // JSON 解析失败，检查是否为纯 SDP 文本
      if (raw.trim().startsWith('v=')) {
        console.log('[WebRTC] /offer 返回纯 SDP 文本，直接使用');
        answerSdp = raw.trim();
      } else {
        console.error('[WebRTC] /offer 返回格式未知:', raw.substring(0, 200));
        throw { code: 'GPU_ERROR', message: 'GPU offer 返回格式错误', retryable: false };
      }
    }

    if (!answerSdp) {
      throw { code: 'GPU_ERROR', message: 'GPU 未返回有效 SDP', retryable: true };
    }

    return { sdp: answerSdp };
  }
  return prodFetch<SdpAnswerResponse>(`/sessions/${sessionId}/offer`, {
    method: 'POST',
    body: JSON.stringify({ sdp } as SdpOfferRequest),
  });
}

// ── 讲话控制（已适配 LiveTalking 真实协议） ──────────────────
export async function speak(
  sessionId: string,
  req: SpeakRequest,
): Promise<SpeakResponse> {
  if (IS_DEV) {
    // LiveTalking 真实协议：POST /human { type: 'echo', text, interrupt: true, sessionid }
    const remoteSid = localSessionMap.get(sessionId) || sessionId;
    await devFetch('/human', {
      method: 'POST',
      body: JSON.stringify({
        type: 'echo',
        text: req.text,
        interrupt: true,
        sessionid: remoteSid,
      }),
    });
    return { turnId: req.turnId || crypto.randomUUID(), sequence: req.sequence || 0, accepted: true };
  }
  return prodFetch<SpeakResponse>(`/sessions/${sessionId}/speak`, {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function sendAudio(
  sessionId: string,
  _req: AudioDataRequest,
): Promise<{ accepted: boolean }> {
  if (IS_DEV) {
    // 本地GPU模式不支持音频上传
    throw { code: 'GPU_ERROR', message: '本地GPU模式不支持音频上传', retryable: false } as AvatarGatewayError;
  }
  return prodFetch(`/sessions/${sessionId}/audio`, {
    method: 'POST',
    body: JSON.stringify(_req),
  });
}

export async function interrupt(
  sessionId: string,
): Promise<InterruptResponse> {
  if (IS_DEV) {
    // LiveTalking /interrupt 端点返回 405，改用 /human 发空文本实现打断
    const remoteSid = localSessionMap.get(sessionId) || sessionId;
    try {
      await devFetch('/human', {
        method: 'POST',
        body: JSON.stringify({
          type: 'echo',
          text: '',
          interrupt: true,
          sessionid: remoteSid,
        }),
      });
    } catch {
      // 打断失败不阻塞
    }
    return { cleared: true };
  }
  return prodFetch<InterruptResponse>(`/sessions/${sessionId}/interrupt`, {
    method: 'POST',
  });
}

export async function getSpeakingStatus(
  _sessionId: string,
): Promise<SpeakingStatus> {
  if (IS_DEV) {
    // LiveTalking 没有 speaking-status 接口，返回安全默认值
    return { speaking: false };
  }
  return prodFetch<SpeakingStatus>(`/sessions/${_sessionId}/speaking`);
}
