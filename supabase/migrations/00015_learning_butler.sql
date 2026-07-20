-- 常驻 AI 学习管家：真实任务/计划、受控操作请求与审计记录

CREATE TABLE IF NOT EXISTS public.learning_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_at timestamptz,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai_butler', 'learning_loop')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learning_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  start_date date,
  end_date date,
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ai_butler', 'learning_loop')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS public.assistant_action_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('create_task', 'update_plan', 'mark_mistake_status')),
  payload jsonb NOT NULL DEFAULT '{}',
  summary text NOT NULL,
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'executed', 'rejected', 'failed')),
  idempotency_key uuid NOT NULL DEFAULT gen_random_uuid(),
  result jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  UNIQUE (user_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS public.assistant_action_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_id uuid NOT NULL REFERENCES public.assistant_action_requests(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('proposed', 'executed', 'rejected', 'failed')),
  action_type text NOT NULL,
  safe_payload jsonb NOT NULL DEFAULT '{}',
  result jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.learning_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_action_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_action_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users own learning tasks" ON public.learning_tasks;
CREATE POLICY "users own learning tasks" ON public.learning_tasks FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "users own learning plans" ON public.learning_plans;
CREATE POLICY "users own learning plans" ON public.learning_plans FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "users read own assistant requests" ON public.assistant_action_requests;
CREATE POLICY "users read own assistant requests" ON public.assistant_action_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "users read own assistant audit" ON public.assistant_action_audit;
CREATE POLICY "users read own assistant audit" ON public.assistant_action_audit FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_learning_tasks_user_status ON public.learning_tasks(user_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_learning_plans_user_status ON public.learning_plans(user_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistant_requests_user_time ON public.assistant_action_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistant_audit_user_time ON public.assistant_action_audit(user_id, created_at DESC);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_tasks;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_plans;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
