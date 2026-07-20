
-- ============================================================
-- 1. ENUMS
-- ============================================================
CREATE TYPE public.user_role AS ENUM ('user', 'teacher', 'admin');
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE public.question_type AS ENUM ('choice', 'fill', 'coding');
CREATE TYPE public.mastery_status AS ENUM ('unmastered', 'mastered');

-- ============================================================
-- 2. PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  username text,
  avatar_url text,
  role public.user_role NOT NULL DEFAULT 'user',
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_user_role(uid uuid)
RETURNS public.user_role
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM profiles WHERE id = uid; $$;

CREATE POLICY "admins full access profiles" ON profiles FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin'::user_role);
CREATE POLICY "users view own profile" ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);
CREATE POLICY "users update own profile" ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM get_user_role(auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user'::public.user_role);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. COURSES & CHAPTERS
-- ============================================================
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  cover_url text,
  category text NOT NULL DEFAULT 'programming',
  difficulty public.difficulty_level NOT NULL DEFAULT 'medium',
  chapter_count int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  is_published boolean NOT NULL DEFAULT true
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads published courses" ON courses FOR SELECT USING (is_published = true);
CREATE POLICY "admins full courses" ON courses FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE TABLE public.chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  order_num int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all read chapters" ON chapters FOR SELECT USING (true);
CREATE POLICY "admins full chapters" ON chapters FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- ============================================================
-- 4. QUESTIONS
-- ============================================================
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid REFERENCES chapters(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  content text NOT NULL,
  type public.question_type NOT NULL DEFAULT 'choice',
  options jsonb,
  answer text NOT NULL,
  explanation text,
  difficulty public.difficulty_level NOT NULL DEFAULT 'medium',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all read questions" ON questions FOR SELECT USING (true);
CREATE POLICY "admins full questions" ON questions FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- ============================================================
-- 5. MISTAKE BOOK
-- ============================================================
CREATE TABLE public.mistake_book (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_answer text,
  status public.mastery_status NOT NULL DEFAULT 'unmastered',
  notes text,
  added_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);
ALTER TABLE public.mistake_book ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own mistake book" ON mistake_book FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 6. LEARNING PROGRESS & RECORDS
-- ============================================================
CREATE TABLE public.learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES chapters(id) ON DELETE SET NULL,
  completed_chapters int NOT NULL DEFAULT 0,
  total_chapters int NOT NULL DEFAULT 0,
  last_studied_at timestamptz,
  UNIQUE(user_id, course_id)
);
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own progress" ON learning_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins read progress" ON learning_progress FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE TABLE public.learning_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  chapter_id uuid REFERENCES chapters(id) ON DELETE SET NULL,
  duration_minutes int NOT NULL DEFAULT 0,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own records" ON learning_records FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins read records" ON learning_records FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- ============================================================
-- 7. QUIZ ATTEMPTS
-- ============================================================
CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_answer text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own attempts" ON quiz_attempts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 8. NOTES
-- ============================================================
CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '未命名笔记',
  content text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  chapter_id uuid REFERENCES chapters(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own notes" ON notes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 9. LEARNING PROFILES (6-dimension)
-- ============================================================
CREATE TABLE public.learning_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  knowledge_base int NOT NULL DEFAULT 60,
  cognitive_style int NOT NULL DEFAULT 60,
  learning_preference int NOT NULL DEFAULT 60,
  error_prone int NOT NULL DEFAULT 60,
  learning_goal int NOT NULL DEFAULT 60,
  learning_pace int NOT NULL DEFAULT 60,
  weak_points text[] NOT NULL DEFAULT '{}',
  suggestions text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.learning_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own lprofile" ON learning_profiles FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 10. CHAT MESSAGES
-- ============================================================
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  session_id uuid NOT NULL DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  images text[],
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own chat" ON chat_messages FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 11. KNOWLEDGE FILES
-- ============================================================
CREATE TABLE public.knowledge_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_url text,
  ima_file_id text,
  content_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own kfiles" ON knowledge_files FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 12. VIDEO TASKS
-- ============================================================
CREATE TABLE public.video_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  task_id text,
  status text NOT NULL DEFAULT 'pending',
  video_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.video_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users own video tasks" ON video_tasks FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 13. SEED COURSES
-- ============================================================
INSERT INTO public.courses (title, description, category, difficulty, chapter_count, is_published) VALUES
('Java编程入门', '从零开始学习Java，涵盖面向对象编程、集合框架、IO等核心内容', 'programming', 'easy', 12, true),
('数据结构与算法', '深入理解常见数据结构和算法，提升编程能力', 'programming', 'medium', 15, true),
('C语言程序设计', 'C语言基础到进阶，指针、内存管理、系统编程', 'programming', 'medium', 10, true),
('英语四级备考', '词汇、阅读、听力、写作全方位备考指导', 'english', 'easy', 8, true),
('Python数据分析', '使用Python进行数据处理和分析', 'programming', 'medium', 10, true),
('计算机网络基础', 'TCP/IP协议栈、HTTP、网络安全等核心知识', 'cs', 'medium', 8, true);

-- ============================================================
-- 14. SEED CHAPTERS (Java)
-- ============================================================
DO $$
DECLARE
  java_id uuid;
  chapter_titles text[] := ARRAY[
    'Java环境搭建与Hello World','基本数据类型与运算符','流程控制语句',
    '面向对象基础：类与对象','继承与多态','接口与抽象类',
    '异常处理机制','集合框架ArrayList与HashMap','字符串处理',
    'IO流基础','多线程编程','JDBC数据库操作'
  ];
  i int;
BEGIN
  SELECT id INTO java_id FROM courses WHERE title='Java编程入门' LIMIT 1;
  FOR i IN 1..array_length(chapter_titles, 1) LOOP
    INSERT INTO chapters (course_id, title, order_num) VALUES (java_id, chapter_titles[i], i);
  END LOOP;
END $$;

-- ============================================================
-- 15. SEED QUESTIONS
-- ============================================================
DO $$
DECLARE
  ch_id uuid;
  co_id uuid;
BEGIN
  SELECT c.id, co.id INTO ch_id, co_id
  FROM chapters c JOIN courses co ON c.course_id=co.id
  WHERE co.title='Java编程入门' AND c.order_num=5 LIMIT 1;

  INSERT INTO questions (chapter_id, course_id, content, type, options, answer, explanation, difficulty) VALUES
  (ch_id, co_id,
   '下面哪个关键字用于实现Java接口？',
   'choice'::question_type,
   '["A. extends", "B. implements", "C. interface", "D. abstract"]',
   'B', 'Java中使用implements关键字实现接口，extends用于继承类', 'easy'),
  (ch_id, co_id,
   'Java中多态的实现依赖于什么机制？',
   'choice'::question_type,
   '["A. 重载", "B. 重写+动态绑定", "C. 静态绑定", "D. 构造函数"]',
   'B', '多态通过方法重写和JVM动态绑定实现', 'medium'),
  (ch_id, co_id,
   'String类是不可变的，这意味着每次修改都会______',
   'fill'::question_type,
   NULL,
   '创建新对象', '不可变性确保线程安全，频繁修改建议使用StringBuilder', 'medium');
END $$;

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
-- 预设课程种子数据（自动生成）
-- 先清理旧的预设数据（保留用户自建数据）
DELETE FROM questions WHERE course_id IN (SELECT id FROM courses WHERE created_by IS NULL);
DELETE FROM chapters WHERE course_id IN (SELECT id FROM courses WHERE created_by IS NULL);
DELETE FROM courses WHERE created_by IS NULL;INSERT INTO courses (id,title,description,category,difficulty,chapter_count,is_published,created_by,cover_url,created_at) VALUES ('ee457af5-4c72-5d64-8d8f-3e11bf82f0f7','Java面向对象程序设计','掌握Java面向对象核心概念与实战编程技巧，从类与对象到多线程完整覆盖。','Java','medium',6,true,NULL,NULL,NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO courses (id,title,description,category,difficulty,chapter_count,is_published,created_by,cover_url,created_at) VALUES ('0b49df3d-2ca1-5373-befe-4cf212d8db28','数据结构','系统学习数据结构与算法，涵盖线性表、树、图、排序查找等核心内容。','数据结构','hard',5,true,NULL,NULL,NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO courses (id,title,description,category,difficulty,chapter_count,is_published,created_by,cover_url,created_at) VALUES ('9c01a8fb-9ebc-50ae-b160-527f3928a7d1','C语言程序设计','从零掌握C语言程序设计，包括指针、内存管理、文件操作等关键知识点。','C语言','easy',7,true,NULL,NULL,NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO courses (id,title,description,category,difficulty,chapter_count,is_published,created_by,cover_url,created_at) VALUES ('c5c96d16-435b-51e8-b9b9-605cb73cb6f2','四级英语','全面备战四级英语考试，覆盖词汇语法、听力阅读、翻译写作四大题型。','英语','easy',4,true,NULL,NULL,NOW()) ON CONFLICT (id) DO NOTHING;
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
ALTER TABLE quiz_attempts
  ADD COLUMN IF NOT EXISTS topic_name text,
  ADD COLUMN IF NOT EXISTS score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total integer DEFAULT 0;DROP TABLE IF EXISTS video_tasks CASCADE;
