-- 学习管家第二批：限时撤销与 Realtime 审计状态

ALTER TABLE public.assistant_action_requests
  DROP CONSTRAINT IF EXISTS assistant_action_requests_status_check;
ALTER TABLE public.assistant_action_requests
  ADD CONSTRAINT assistant_action_requests_status_check
  CHECK (status IN ('proposed', 'executed', 'rejected', 'failed', 'undone'));

ALTER TABLE public.assistant_action_requests
  ADD COLUMN IF NOT EXISTS undo_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS undone_at timestamptz;

ALTER TABLE public.assistant_action_audit
  DROP CONSTRAINT IF EXISTS assistant_action_audit_event_type_check;
ALTER TABLE public.assistant_action_audit
  ADD CONSTRAINT assistant_action_audit_event_type_check
  CHECK (event_type IN ('proposed', 'executed', 'rejected', 'failed', 'undone'));

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.assistant_action_requests;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.assistant_action_audit;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
