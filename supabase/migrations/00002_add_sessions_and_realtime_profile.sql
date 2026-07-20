
-- 1. 对话会话表（chat/tutor两种类型，可查看历史）
CREATE TABLE IF NOT EXISTS chat_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title       text NOT NULL DEFAULT '新对话',
  agent_type  text NOT NULL DEFAULT 'chat' CHECK (agent_type IN ('chat','tutor')),
  topic       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_sessions" ON chat_sessions FOR ALL USING (user_id = auth.uid());

-- 2. chat_messages 增加 agent_type 字段（方便按会话类型过滤）
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS agent_type text DEFAULT 'chat' CHECK (agent_type IN ('chat','tutor'));
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- 3. learning_profiles 增加 profile_data jsonb（存DeepSeek返回的6维文字描述）
ALTER TABLE learning_profiles ADD COLUMN IF NOT EXISTS profile_data jsonb DEFAULT '{}'::jsonb;
ALTER TABLE learning_profiles ADD COLUMN IF NOT EXISTS last_analysis_at timestamptz;

-- 4. quiz_attempts 增加字段
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS course_id uuid REFERENCES courses(id) ON DELETE SET NULL;
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS chapter_id uuid REFERENCES chapters(id) ON DELETE SET NULL;
ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS time_spent_seconds int DEFAULT 0;

-- 5. questions 增加 knowledge_point / ima_context 字段（存IMA检索到的知识背景）
ALTER TABLE questions ADD COLUMN IF NOT EXISTS knowledge_point text;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS ima_context text;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS topic text;

-- 6. quiz_sessions 表（一次题目练习的完整记录）
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  course_id    uuid REFERENCES courses(id) ON DELETE SET NULL,
  chapter_id   uuid REFERENCES chapters(id) ON DELETE SET NULL,
  topic        text,
  total_q      int NOT NULL DEFAULT 0,
  correct_q    int NOT NULL DEFAULT 0,
  score        numeric(5,2) DEFAULT 0,
  completed    boolean NOT NULL DEFAULT false,
  started_at   timestamptz NOT NULL DEFAULT now(),
  finished_at  timestamptz
);
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_quiz_sessions" ON quiz_sessions FOR ALL USING (user_id = auth.uid());

-- 7. mistake_book 增加 quiz_session_id 外键及 explanation 冗余
ALTER TABLE mistake_book ADD COLUMN IF NOT EXISTS quiz_session_id uuid REFERENCES quiz_sessions(id) ON DELETE SET NULL;
ALTER TABLE mistake_book ADD COLUMN IF NOT EXISTS correct_answer text;
ALTER TABLE mistake_book ADD COLUMN IF NOT EXISTS explanation text;

-- 8. 更新触发器：chat_sessions.updated_at 自动更新
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 9. 学习画像更新函数（事务性，供Edge Function调用）
CREATE OR REPLACE FUNCTION upsert_learning_profile(
  p_user_id uuid,
  p_knowledge_base int,
  p_cognitive_style int,
  p_learning_preference int,
  p_error_prone int,
  p_learning_goal int,
  p_learning_pace int,
  p_weak_points text[],
  p_suggestions text[],
  p_profile_data jsonb
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO learning_profiles (
    user_id, knowledge_base, cognitive_style, learning_preference,
    error_prone, learning_goal, learning_pace, weak_points, suggestions,
    profile_data, last_analysis_at, updated_at
  ) VALUES (
    p_user_id, p_knowledge_base, p_cognitive_style, p_learning_preference,
    p_error_prone, p_learning_goal, p_learning_pace, p_weak_points, p_suggestions,
    p_profile_data, now(), now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    knowledge_base = EXCLUDED.knowledge_base,
    cognitive_style = EXCLUDED.cognitive_style,
    learning_preference = EXCLUDED.learning_preference,
    error_prone = EXCLUDED.error_prone,
    learning_goal = EXCLUDED.learning_goal,
    learning_pace = EXCLUDED.learning_pace,
    weak_points = EXCLUDED.weak_points,
    suggestions = EXCLUDED.suggestions,
    profile_data = EXCLUDED.profile_data,
    last_analysis_at = now(),
    updated_at = now();
END;
$$;
