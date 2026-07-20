// cleanup-sessions — 一次性管理函数：清理/列出数字人 session
// 调用方式：POST /functions/v1/cleanup-sessions
// Body: { "action": "list" | "close_all" | "close_user", "userId"?: "..." }
// Header: x-admin-token: <SUPABASE_SERVICE_ROLE_KEY>

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  // 临时无鉴权，仅用于一次性清理。生产环境应严格鉴权。
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'list';

    if (action === 'list') {
      const { data, error } = await supabase
        .from('digital_human_sessions')
        .select('id, user_id, state, created_at, expires_at, avatar_id, topic')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) return json({ error: error.message }, 500);
      return json({ count: data?.length ?? 0, sessions: data });
    }

    if (action === 'close_all') {
      const { data, error } = await supabase
        .from('digital_human_sessions')
        .update({ state: 'closed', updated_at: new Date().toISOString() })
        .eq('state', 'active')
        .select('id, user_id');
      if (error) return json({ error: error.message }, 500);
      return json({ closed: data?.length ?? 0, sessions: data });
    }

    if (action === 'close_user') {
      if (!body.userId) return json({ error: 'userId required' }, 400);
      const { data, error } = await supabase
        .from('digital_human_sessions')
        .update({ state: 'closed', updated_at: new Date().toISOString() })
        .eq('state', 'active')
        .eq('user_id', body.userId)
        .select('id');
      if (error) return json({ error: error.message }, 500);
      return json({ closed: data?.length ?? 0, sessions: data });
    }

    if (action === 'delete_all') {
      const { data, error } = await supabase
        .from('digital_human_sessions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
        .select('id, user_id, state');
      if (error) return json({ error: error.message }, 500);
      return json({ deleted: data?.length ?? 0, sessions: data });
    }

    return json({ error: 'unknown action' }, 400);
  } catch (e: any) {
    return json({ error: e?.message || String(e) }, 500);
  }
});
