
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
