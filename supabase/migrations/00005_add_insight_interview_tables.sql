
-- 学习周报表
CREATE TABLE IF NOT EXISTS learning_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  week_end date NOT NULL,
  report_type text NOT NULL DEFAULT 'weekly', -- weekly / monthly
  narrative text,                             -- AI生成的叙事段落
  stats jsonb,                                -- {total_hours, topics, top_topic, weak_points, ...}
  created_at timestamptz DEFAULT now()
);
ALTER TABLE learning_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_reports" ON learning_reports FOR ALL USING (auth.uid() = user_id);

-- 模拟面试/辩论会话表
CREATE TABLE IF NOT EXISTS interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type text NOT NULL DEFAULT 'interview', -- interview / debate
  topic text NOT NULL,
  messages jsonb DEFAULT '[]',
  score integer,
  feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_sessions" ON interview_sessions FOR ALL USING (auth.uid() = user_id);
