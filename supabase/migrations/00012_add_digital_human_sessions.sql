-- 00012_add_digital_human_sessions
-- 数字人会话表：替代内存 Map，支持跨实例共享、持久化、自动清理

CREATE TABLE public.digital_human_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id text,
  avatar_id text NOT NULL DEFAULT 'teacher1',
  state text NOT NULL DEFAULT 'active' CHECK (state IN ('active', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes'),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_dh_sessions_user ON public.digital_human_sessions(user_id, state);
CREATE INDEX idx_dh_sessions_expires ON public.digital_human_sessions(expires_at) WHERE state = 'active';

ALTER TABLE public.digital_human_sessions ENABLE ROW LEVEL SECURITY;

-- 用户只能操作自己的会话
CREATE POLICY "users own sessions" ON public.digital_human_sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 定时清理过期会话的函数
CREATE OR REPLACE FUNCTION public.cleanup_expired_dh_sessions()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  UPDATE public.digital_human_sessions
    SET state = 'closed', updated_at = now()
    WHERE state = 'active' AND expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 用户会话数限制检查函数
CREATE OR REPLACE FUNCTION public.count_active_dh_sessions(p_user_id uuid)
RETURNS integer
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT count(*)::integer FROM public.digital_human_sessions
  WHERE user_id = p_user_id AND state = 'active';
$$;