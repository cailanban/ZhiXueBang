-- 智能资源推送闭环：候选发现 -> 管理员审核 -> 个性化展示 -> 行为反馈
CREATE TABLE IF NOT EXISTS public.recommendation_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  url text NOT NULL,
  source_name text NOT NULL,
  resource_type text NOT NULL CHECK (resource_type IN ('blog', 'website', 'bilibili', 'video', 'course', 'document')),
  topic text NOT NULL,
  knowledge_points text[] NOT NULL DEFAULT '{}',
  poster_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  discovery_source text NOT NULL DEFAULT 'manual' CHECK (discovery_source IN ('manual', 'web_agent', 'import')),
  discovered_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(url)
);

CREATE TABLE IF NOT EXISTS public.resource_recommendation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES public.recommendation_resources(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('impression', 'preview', 'open', 'save', 'complete', 'dismiss')),
  placement text NOT NULL,
  context_type text NOT NULL,
  context_id text,
  context_topics text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recommendation_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_recommendation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_approved_resources"
  ON public.recommendation_resources FOR SELECT TO authenticated
  USING (status = 'approved' OR public.get_user_role(auth.uid()) = 'admin'::public.user_role);

CREATE POLICY "admins_manage_recommendation_resources"
  ON public.recommendation_resources FOR ALL TO authenticated
  USING (public.get_user_role(auth.uid()) = 'admin'::public.user_role)
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin'::public.user_role);

CREATE POLICY "users_own_recommendation_events"
  ON public.resource_recommendation_events FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_recommendation_resources_status_topic
  ON public.recommendation_resources(status, topic);
CREATE INDEX IF NOT EXISTS idx_recommendation_resources_points
  ON public.recommendation_resources USING GIN(knowledge_points);
CREATE INDEX IF NOT EXISTS idx_recommendation_events_user_time
  ON public.resource_recommendation_events(user_id, created_at DESC);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.resource_recommendation_events;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
