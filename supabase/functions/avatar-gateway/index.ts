// avatar-gateway — 数字人网关 Supabase Edge Function (v2: DB 持久化)
// 职责：JWT 鉴权、会话管理（Supabase DB）、TURN 临时凭证签发、GPU 转发、限流、审计
// 安全要求：不得在日志/响应中输出任何密钥、token 或密码

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// crypto 是 Deno 全局变量，无需导入

// ── CORS ─────────────────────────────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
};

// ── 配置常量 ─────────────────────────────────────────────────
const SESSION_TTL = 30 * 60; // 30 分钟
const MAX_SESSIONS_PER_USER = 3;
const MAX_TEXT_LENGTH = 500;
const RATE_LIMIT_WINDOW = 10; // 秒
const RATE_LIMIT_MAX = 20; // 每窗口请求数
const TURN_CREDENTIAL_TTL = 30 * 60; // TURN 凭证有效期 30 分钟

// ── GPU 后端地址 ──────────────────────────────────────────────
const GPU_BASE_URL = Deno.env.get('DIGIHUMAN_GPU_URL') || 'http://127.0.0.1:6006';

// ── 类型 ─────────────────────────────────────────────────────
interface SessionRecord {
  id: string;
  user_id: string;
  course_id?: string;
  avatar_id?: string;
  state: 'active' | 'closed';
  created_at: string;
  expires_at: string;
}

interface AuthUser {
  id: string;
  email?: string;
}

// ── 工具函数 ─────────────────────────────────────────────────
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function error(code: string, message: string, status: number): Response {
  return json({ code, message, retryable: status >= 500 || status === 429 }, status);
}

// ── Supabase 客户端（单例） ───────────────────────────────────
let _serviceClient: ReturnType<typeof createClient> | null = null;
function getServiceClient() {
  if (!_serviceClient) {
    _serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );
  }
  return _serviceClient;
}

// 创建带用户 token 的 Supabase 客户端（用于 RLS 查询）
function createUserClient(token: string) {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );
}

// ── JWT 鉴权 ─────────────────────────────────────────────────
async function requireUser(req: Request): Promise<AuthUser> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) throw { code: 'UNAUTHORIZED', message: 'Missing Authorization', status: 401 };

  const token = authHeader.replace('Bearer ', '');
  if (!token) throw { code: 'UNAUTHORIZED', message: 'Invalid Authorization', status: 401 };

  // 支持 service_role key 作为管理员鉴权
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (token === serviceRoleKey) {
    return { id: 'admin', email: 'admin@gateway' };
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );

  const { data, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !data?.user) {
    throw { code: 'UNAUTHORIZED', message: 'Invalid or expired token', status: 401 };
  }

  return { id: data.user.id, email: data.user.email };
}

// ── 限流（基于内存缓存） ──────────────────────────────────────
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitCache.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitCache.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW * 1000 });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// ── GPU 熔断器（Circuit Breaker）────────────────────────────────
const CB_OPEN = 'open';
const CB_HALF_OPEN = 'half_open';
const CB_CLOSED = 'closed';
const CB_FAILURE_THRESHOLD = 5;       // 连续失败 5 次进入 open
const CB_RECOVERY_TIMEOUT = 30_000;   // 30 秒后进入 half-open
const CB_HALF_OPEN_MAX = 2;           // half-open 允许 2 个试探请求

let circuitState = CB_CLOSED;
let circuitFailures = 0;
let circuitLastFailure = 0;
let circuitHalfOpenCount = 0;

function checkCircuit(): boolean {
  if (circuitState === CB_CLOSED) return true;
  if (circuitState === CB_OPEN) {
    if (Date.now() - circuitLastFailure > CB_RECOVERY_TIMEOUT) {
      circuitState = CB_HALF_OPEN;
      circuitHalfOpenCount = 0;
      console.log('GPU circuit: open → half_open (recovery attempt)');
      return true;
    }
    return false;
  }
  // half-open
  if (circuitHalfOpenCount < CB_HALF_OPEN_MAX) {
    circuitHalfOpenCount++;
    return true;
  }
  return false;
}

function recordCircuitSuccess(): void {
  if (circuitState === CB_HALF_OPEN) {
    circuitState = CB_CLOSED;
    circuitFailures = 0;
    circuitHalfOpenCount = 0;
    console.log('GPU circuit: half_open → closed (recovered)');
  }
  if (circuitState === CB_CLOSED) {
    circuitFailures = 0;
  }
}

function recordCircuitFailure(): void {
  circuitFailures++;
  circuitLastFailure = Date.now();
  if (circuitState === CB_CLOSED && circuitFailures >= CB_FAILURE_THRESHOLD) {
    circuitState = CB_OPEN;
    console.log(`GPU circuit: closed → open (${circuitFailures} failures)`);
  }
  if (circuitState === CB_HALF_OPEN) {
    circuitState = CB_OPEN;
    console.log('GPU circuit: half_open → open (test request failed)');
  }
}

function getCircuitStatus(): { state: string; failures: number; since: string | null } {
  return {
    state: circuitState,
    failures: circuitFailures,
    since: circuitLastFailure ? new Date(circuitLastFailure).toISOString() : null,
  };
}

// ── GPU 请求封装（带熔断器）────────────────────────────────────
async function gpuFetch(
  path: string,
  options: { method?: string; body?: unknown; timeout?: number } = {},
): Promise<Response> {
  if (!checkCircuit()) {
    throw { code: 'GPU_CIRCUIT_OPEN', message: 'GPU 服务暂时不可用（熔断保护）', status: 503 };
  }

  const { method = 'POST', body, timeout = 10_000 } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${GPU_BASE_URL}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      recordCircuitSuccess();
    } else if (res.status >= 500) {
      recordCircuitFailure();
    }
    return res;
  } catch (e: any) {
    clearTimeout(timer);
    recordCircuitFailure();
    if (e.name === 'AbortError') {
      throw { code: 'GPU_TIMEOUT', message: 'GPU 服务响应超时', status: 504 };
    }
    throw { code: 'GPU_UNREACHABLE', message: 'GPU 服务不可达', status: 502 };
  }
}

// ── DB 会话操作 ──────────────────────────────────────────────
async function createDbSession(
  user: AuthUser,
  body: { courseId?: string; avatarId?: string; topic?: string; knowledgePoints?: string[] },
): Promise<SessionRecord> {
  const supabase = getServiceClient();
  const expiresAt = new Date(Date.now() + SESSION_TTL * 1000).toISOString();

  const { data, error: dbErr } = await supabase
    .from('digital_human_sessions')
    .insert({
      user_id: user.id,
      course_id: body.courseId || null,
      avatar_id: body.avatarId || 'teacher1',
      topic: body.topic || null,
      knowledge_points: body.knowledgePoints || null,
      state: 'active',
      expires_at: expiresAt,
    })
    .select('*')
    .single();

  if (dbErr || !data) {
    throw { code: 'INTERNAL_ERROR', message: '创建会话失败', status: 500 };
  }

  return data as SessionRecord;
}

async function getDbSession(sessionId: string, user: AuthUser): Promise<SessionRecord> {
  const supabase = getServiceClient();

  const { data, error: dbErr } = await supabase
    .from('digital_human_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (dbErr || !data) {
    throw { code: 'SESSION_NOT_FOUND', message: '会话不存在', status: 404 };
  }

  if (data.user_id !== user.id) {
    throw { code: 'FORBIDDEN', message: '无权访问此会话', status: 403 };
  }

  if (data.state === 'closed' || new Date(data.expires_at) < new Date()) {
    // 自动关闭过期会话
    await supabase
      .from('digital_human_sessions')
      .update({ state: 'closed', updated_at: new Date().toISOString() })
      .eq('id', sessionId);
    throw { code: 'SESSION_EXPIRED', message: '会话已过期', status: 410 };
  }

  return data as SessionRecord;
}

async function countUserActiveSessions(userId: string): Promise<number> {
  const supabase = getServiceClient();
  const nowIso = new Date().toISOString();
  // 顺手把过期的会话标为 closed（防止历史脏数据阻塞新会话）
  await supabase
    .from('digital_human_sessions')
    .update({ state: 'closed', updated_at: nowIso })
    .eq('state', 'active')
    .lt('expires_at', nowIso);

  const { count, error: dbErr } = await supabase
    .from('digital_human_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('state', 'active')
    .gt('expires_at', nowIso);

  if (dbErr) return 0;
  return count ?? 0;
}

async function deleteDbSession(sessionId: string, user: AuthUser): Promise<void> {
  const supabase = getServiceClient();
  await supabase
    .from('digital_human_sessions')
    .update({ state: 'closed', updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', user.id);
}

// ── TURN HMAC 临时凭证签发 ───────────────────────────────────
async function generateTurnCredentials(): Promise<{
  username: string;
  credential: string;
  ttl: number;
}> {
  const turnSecret = Deno.env.get('TURN_REST_SECRET');
  if (!turnSecret) {
    throw { code: 'TURN_ERROR', message: 'TURN REST API secret not configured', status: 500 };
  }

  const timestamp = Math.floor(Date.now() / 1000) + TURN_CREDENTIAL_TTL;
  const username = `${timestamp}:avatar`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(turnSecret),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(username));
  const credential = btoa(String.fromCharCode(...new Uint8Array(signature)));

  return { username, credential, ttl: TURN_CREDENTIAL_TTL };
}

async function buildIceConfig(): Promise<{
  iceServers: Array<{ urls: string[]; username: string; credential: string }>;
  iceTransportPolicy: 'relay';
}> {
  const turnServer = Deno.env.get('TURN_SERVER') || '101.132.27.67:3478';

  try {
    const turnCreds = await generateTurnCredentials();
    return {
      iceServers: [
        {
          urls: [`turn:${turnServer}?transport=udp`, `turn:${turnServer}?transport=tcp`],
          username: turnCreds.username,
          credential: turnCreds.credential,
        },
      ],
      iceTransportPolicy: 'relay',
    };
  } catch {
    // 降级：静态凭证
    return {
      iceServers: [
        {
          urls: [`turn:${turnServer}?transport=udp`, `turn:${turnServer}?transport=tcp`],
          username: Deno.env.get('TURN_USERNAME') || 'avatar',
          credential: Deno.env.get('TURN_CREDENTIAL') || '',
        },
      ],
      iceTransportPolicy: 'relay',
    };
  }
}

// ── 主路由 ───────────────────────────────────────────────────
serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const path = url.pathname;
  const p = path; // 别名，用于 includes 匹配

  try {
    // ── 健康检查（无需鉴权，用 includes 免疫路径前缀） ──────────
    if (p.includes('/health/live')) {
      return json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    if (p.includes('/health/ready')) {
      try {
        const gpuRes = await fetch(`${GPU_BASE_URL}/api/ice-config`, {
          signal: AbortSignal.timeout(5000),
        });
        const circuitStatus = getCircuitStatus(); return json({ status: 'ok', gpu: gpuRes.ok ? 'reachable' : 'unreachable', circuit: circuitStatus });
      } catch {
        const circuitStatus = getCircuitStatus(); return json({ status: 'degraded', gpu: 'unreachable', circuit: circuitStatus });
      }
    }

    // ── 鉴权 ─────────────────────────────────────────────────
    const user = await requireUser(req);

    // ── 限流检查 ──────────────────────────────────────────────
    if (!checkRateLimit(user.id)) {
      return error('RATE_LIMITED', '请求过于频繁，请稍后重试', 429);
    }

    // ── GET /api/v1/avatar/ice-config ──────────────────────────
    if (req.method === 'GET' && p.includes('/ice-config')) {
      const iceConfig = await buildIceConfig();
      return json({
        iceConfig,
        expiresAt: new Date(Date.now() + TURN_CREDENTIAL_TTL * 1000).toISOString(),
      });
    }

    // ── POST /api/v1/avatar/sessions（必须精确匹配 sessions，不是子路径）──
    const sessionSubMatch = p.match(/\/sessions\/([^/]+)(\/.*)?$/);
    
    if (req.method === 'POST' && p.includes('/sessions') && !sessionSubMatch) {
      const activeCount = await countUserActiveSessions(user.id);
      if (activeCount >= MAX_SESSIONS_PER_USER) {
        return error('TOO_MANY_SESSIONS', `最多同时创建 ${MAX_SESSIONS_PER_USER} 个会话`, 429);
      }

      const body = await req.json().catch(() => ({}));
      const session = await createDbSession(user, body);
      const iceConfig = await buildIceConfig();

      return json({
        sessionId: session.id,
        iceConfig,
        expiresAt: session.expires_at,
      }, 201);
    }

    // ── 会话子路由 ────────────────────────────────────────────
    const sessionMatch = sessionSubMatch;
    if (sessionMatch) {
      const sessionId = sessionMatch[1];
      const subPath = sessionMatch[2] || '';

      // ── POST /api/v1/avatar/sessions/{id}/offer ──────────────
      if (req.method === 'POST' && subPath === '/offer') {
        await getDbSession(sessionId, user);
        const body = await req.json();
        const offerBody = { sdp: body.sdp, type: 'offer', sessionid: sessionId };
        try {
          const gpuRes = await fetch(`${GPU_BASE_URL}/offer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(offerBody),
            signal: AbortSignal.timeout(10000),
          });
          if (!gpuRes.ok) throw { code: 'GPU_ERROR', message: `GPU error: ${gpuRes.status}`, status: 502 };
          const gpuData = await gpuRes.json();
          return json({ sdp: gpuData.sdp });
        } catch (e: any) {
          if (e.code) throw e;
          throw { code: 'GPU_TIMEOUT', message: 'GPU 服务器响应超时', status: 504 };
        }
      }

      // ── POST /api/v1/avatar/sessions/{id}/speak ──────────────
      if (req.method === 'POST' && subPath === '/speak') {
        await getDbSession(sessionId, user);
        const body = await req.json();

        if (body.text && body.text.length > MAX_TEXT_LENGTH) {
          return error('TEXT_TOO_LONG', `文本长度不能超过 ${MAX_TEXT_LENGTH} 字`, 400);
        }

        try {
          const gpuRes = await fetch(`${GPU_BASE_URL}/human`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionid: sessionId,
              type: 'echo',
              text: body.text,
            }),
            signal: AbortSignal.timeout(5000),
          });
          const gpuData = await gpuRes.json().catch(() => ({}));
          return json({ turnId: body.turnId || crypto.randomUUID(), sequence: body.sequence || 0, accepted: gpuRes.ok });
        } catch {
          return error('GPU_TIMEOUT', '说话请求超时', 504);
        }
      }

      // ── POST /api/v1/avatar/sessions/{id}/audio ──────────────
      if (req.method === 'POST' && subPath === '/audio') {
        await getDbSession(sessionId, user);
        const body = await req.json();
        try {
          // LiveTalking's /humanaudio expects multipart form data
          const formData = new FormData();
          formData.append('sessionid', sessionId);
          if (body.audioBlob) {
            formData.append('file', new Blob([body.audioBlob], { type: 'audio/wav' }), 'audio.wav');
          }
          await fetch(`${GPU_BASE_URL}/humanaudio`, {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(5000),
          });
          return json({ accepted: true });
        } catch {
          return error('GPU_TIMEOUT', '音频发送超时', 504);
        }
      }

      // ── POST /api/v1/avatar/sessions/{id}/interrupt ──────────
      if (req.method === 'POST' && subPath === '/interrupt') {
        await getDbSession(sessionId, user);
        try {
          const gpuRes = await fetch(`${GPU_BASE_URL}/interrupt_talk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionid: sessionId }),
            signal: AbortSignal.timeout(3000),
          });
          const gpuData = await gpuRes.json().catch(() => ({}));
          return json({ cleared: gpuRes.ok, clearedTurnId: gpuData.turnId });
        } catch {
          return error('GPU_TIMEOUT', '打断请求超时', 504);
        }
      }

      // ── GET /api/v1/avatar/sessions/{id}/speaking ────────────
      if (req.method === 'GET' && subPath === '/speaking') {
        await getDbSession(sessionId, user);
        try {
          const gpuRes = await fetch(`${GPU_BASE_URL}/is_speaking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionid: sessionId }),
            signal: AbortSignal.timeout(3000),
          });
          const gpuData = await gpuRes.json().catch(() => ({ speaking: false }));
          return json(gpuData);
        } catch {
          return json({ speaking: false });
        }
      }

      // ── DELETE /api/v1/avatar/sessions/{id} ──────────────────
      if (req.method === 'DELETE' && subPath === '') {
        await getDbSession(sessionId, user);
        await deleteDbSession(sessionId, user);

        // GPU 端清理（可选，失败不影响）
        try {
          await fetch(`${GPU_BASE_URL}/interrupt_talk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionid: sessionId }),
            signal: AbortSignal.timeout(3000),
          });
        } catch { /* GPU 清理失败不影响 */ }

        return json({ deleted: true });
      }
    }

    // ── 404 ──────────────────────────────────────────────────
    return error('NOT_FOUND', `Unknown endpoint: ${req.method} ${path}`, 404);

  } catch (e: any) {
    if (e.code && e.status) {
      return error(e.code, e.message, e.status);
    }
    console.error('Gateway internal error');
    return error('INTERNAL_ERROR', '内部服务错误', 500);
  }
});