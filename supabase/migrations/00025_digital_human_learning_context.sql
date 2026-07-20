-- 00025: Add learning context columns to digital_human_sessions
-- P1-4: Connect digital human sessions to learning context and Spark AI output
BEGIN;

ALTER TABLE public.digital_human_sessions
  ADD COLUMN IF NOT EXISTS topic text,
  ADD COLUMN IF NOT EXISTS knowledge_points text[];

COMMENT ON COLUMN public.digital_human_sessions.topic IS '当前学习主题/知识点';
COMMENT ON COLUMN public.digital_human_sessions.knowledge_points IS '关联的薄弱知识点列表';

COMMIT;