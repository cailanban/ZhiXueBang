-- 扩展 mistake_book 表，支持来自静态 JSON 课程的错题（无 question_id）
-- 打通课程中心错题本与独立错题本页的数据

-- 1. 让 question_id 可空（静态 JSON 题目没有 questions 表记录）
ALTER TABLE public.mistake_book ALTER COLUMN question_id DROP NOT NULL;

-- 2. 新增字段：保存完整题目 JSON、课程/知识点追踪信息
ALTER TABLE public.mistake_book
  ADD COLUMN IF NOT EXISTS question_data jsonb,
  ADD COLUMN IF NOT EXISTS course_id text,
  ADD COLUMN IF NOT EXISTS topic_id text,
  ADD COLUMN IF NOT EXISTS topic_title text,
  ADD COLUMN IF NOT EXISTS correct_answer text,
  ADD COLUMN IF NOT EXISTS explanation text;

-- 3. 已有 UNIQUE 约束在 question_id 可空后，允许同一用户多条 question_id 为空的记录
-- 先删除旧约束，再添加条件唯一约束
ALTER TABLE public.mistake_book DROP CONSTRAINT IF EXISTS mistake_book_user_id_question_id_key;

-- 当 question_id 非空时保持唯一；question_id 为空时不限制（静态题可重复记录，靠业务层去重）
CREATE UNIQUE INDEX IF NOT EXISTS mistake_book_user_question_unique
  ON public.mistake_book (user_id, question_id)
  WHERE question_id IS NOT NULL;

-- 4. 为 question_data 添加 GIN 索引加速 JSON 查询
CREATE INDEX IF NOT EXISTS idx_mistake_book_question_data
  ON public.mistake_book USING GIN (question_data);
