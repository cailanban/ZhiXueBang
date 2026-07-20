// _shared/auth.ts — 统一 JWT 鉴权辅助函数
// 所有 Edge Functions 必须从 Authorization header 的 JWT 中提取用户身份，
// 绝不可信任请求体中的 userId 字段。

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface AuthUser {
  id: string;
  email?: string;
}

/**
 * 从请求的 Authorization header 中验证 JWT 并返回用户信息。
 * 失败时抛出错误，调用方应返回 401。
 *
 * 用法：
 *   const user = await requireUser(req);
 *   // 之后使用 user.id 作为可信用户标识
 */
export async function requireUser(req: Request): Promise<AuthUser> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new AuthError('Missing Authorization header', 401);
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    throw new AuthError('Invalid Authorization format', 401);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw new AuthError('Invalid or expired token', 401);
  }

  return {
    id: data.user.id,
    email: data.user.email,
  };
}

/**
 * 创建 service role 客户端（仅用于确需绕过 RLS 的后台操作）。
 * 注意：使用此客户端时必须确保 user_id 来自 requireUser() 而非请求体。
 */
export function createServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

/**
 * 统一的 CORS headers
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * 处理 OPTIONS 预检请求
 */
export function handleCORS(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  return null;
}
