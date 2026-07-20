-- ============================================================
-- P1: 赛题主链 — 数据库迁移
-- 新增: 学习事件、画像版本、知识掌握度、资源资产、Agent运行记录
-- 目标: 构建画像→资源→学习→评估的闭环
-- ============================================================

-- ============================================================
-- 1. 学习事件表 (learning_events)
-- 记录学生答题/学习/笔记等行为，驱动掌握度更新与画像变化
-- ============================================================
CREATE TABLE IF NOT EXISTS public.learning_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'quiz_attempt', 'quiz_complete', 'chapter_complete',
    'course_enroll', 'learning_session', 'note_create',
    'resource_generate', 'resource_view', 'path_replan',
    'profile_update', 'mastery_change'
  )),
  event_data jsonb NOT NULL DEFAULT '{}',
  -- event_data 示例:
  -- quiz_attempt:   {"question_id":"...","is_correct":true,"topic":"继承","chapter_id":"..."}
  -- chapter_complete: {"course_id":"...","chapter_id":"...","score":85}
  -- learning_session: {"duration_minutes":25,"course_id":"...","topics":["多态","接口"]}
  -- profile_update:   {"dimension":"knowledge_base","old_value":55,"new_value":62,"reason":"答题正确率提升"}
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.learning_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_events" ON learning_events FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 索引: 加速按用户+时间范围查询
CREATE INDEX IF NOT EXISTS idx_learning_events_user_time ON learning_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_events_type ON learning_events(event_type);

-- ============================================================
-- 2. 画像版本表 (profile_versions)
-- 记录每次画像变化的历史，展示"谁发生了什么变化，为什么"
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profile_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  profile_data jsonb NOT NULL, -- 当时的完整画像快照
  scores jsonb NOT NULL, -- {knowledge_base: 60, cognitive_style: 55, ...}
  weak_points text[] NOT NULL DEFAULT '{}',
  suggestions text[] NOT NULL DEFAULT '{}',
  change_summary text, -- "本次更新：知识基础从55→62(↑7)，原因：本周答题正确率80%"
  trigger_event_type text, -- quiz_complete / learning_session / manual_update
  trigger_event_id uuid, -- 关联的学习事件 ID
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_profile_versions" ON profile_versions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_profile_versions_user_time ON profile_versions(user_id, created_at DESC);

-- ============================================================
-- 3. 知识掌握度表 (knowledge_mastery)
-- 按知识点粒度追踪掌握状态，替代单一评分
-- ============================================================
CREATE TABLE IF NOT EXISTS public.knowledge_mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  knowledge_point text NOT NULL, -- 知识点名称，如 "Java多态"、"HashMap"
  category text, -- 知识分类，如 "Java基础"、"集合框架"
  mastery_level numeric(5,2) NOT NULL DEFAULT 0.00 CHECK (mastery_level >= 0 AND mastery_level <= 100),
  -- 掌握度 = f(正确率, 最近练习时间, 错题状态) 的加权值
  total_attempts int NOT NULL DEFAULT 0,
  correct_attempts int NOT NULL DEFAULT 0,
  last_attempted_at timestamptz,
  last_correct_at timestamptz,
  mistake_count int NOT NULL DEFAULT 0, -- 当前未掌握的错题数
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, knowledge_point)
);

ALTER TABLE public.knowledge_mastery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_mastery" ON knowledge_mastery FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_mastery_user ON knowledge_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_mastery_level ON knowledge_mastery(user_id, mastery_level ASC);

-- 掌握度更新函数: 加权计算 mastery_level
-- 公式: mastery = 0.5 * 正确率 + 0.3 * 时效衰减 + 0.2 * 错题逆转
CREATE OR REPLACE FUNCTION public.update_mastery(
  p_user_id uuid,
  p_knowledge_point text,
  p_is_correct boolean,
  p_category text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_row knowledge_mastery%ROWTYPE;
  v_total int;
  v_correct int;
  v_mistake int;
  v_accuracy numeric;
  v_recency numeric;
  v_mistake_recovery numeric;
  v_new_mastery numeric;
  v_days_since_last numeric;
BEGIN
  -- 获取或创建掌握度记录
  SELECT * INTO v_row FROM knowledge_mastery
    WHERE user_id = p_user_id AND knowledge_point = p_knowledge_point;
  IF NOT FOUND THEN
    INSERT INTO knowledge_mastery (user_id, knowledge_point, category, mastery_level, total_attempts, correct_attempts, last_attempted_at)
    VALUES (p_user_id, p_knowledge_point, p_category, 0, 1, CASE WHEN p_is_correct THEN 1 ELSE 0 END, now())
    RETURNING * INTO v_row;
  ELSE
    -- 更新计数
    v_total := v_row.total_attempts + 1;
    v_correct := v_row.correct_attempts + CASE WHEN p_is_correct THEN 1 ELSE 0 END;
    v_mistake := CASE WHEN p_is_correct THEN v_row.mistake_count ELSE v_row.mistake_count + 1 END;
    -- 正确率 (0-100)
    v_accuracy := CASE WHEN v_total > 0 THEN (v_correct::numeric / v_total::numeric) * 100 ELSE 0 END;
    -- 时效衰减: 最近7天内做过得满分，超过30天衰减到0.5
    v_days_since_last := EXTRACT(EPOCH FROM (now() - v_row.last_attempted_at)) / 86400.0;
    v_recency := CASE
      WHEN v_days_since_last <= 7 THEN 100
      WHEN v_days_since_last <= 30 THEN 100 - ((v_days_since_last - 7) / 23.0) * 50
      ELSE 50
    END;
    -- 错题逆转: 错题数越少越好
    v_mistake_recovery := CASE
      WHEN v_mistake <= 2 THEN 100
      WHEN v_mistake <= 5 THEN 80
      ELSE 60
    END;
    -- 加权计算
    v_new_mastery := (0.5 * v_accuracy) + (0.3 * v_recency) + (0.2 * v_mistake_recovery);
    UPDATE knowledge_mastery SET
      mastery_level = v_new_mastery,
      total_attempts = v_total,
      correct_attempts = v_correct,
      mistake_count = v_mistake,
      last_attempted_at = now(),
      last_correct_at = CASE WHEN p_is_correct THEN now() ELSE v_row.last_correct_at END,
      updated_at = now()
    WHERE id = v_row.id;
  END IF;
END;
$$;

-- ============================================================
-- 4. 资源资产表 (resource_assets)
-- 保存生成的资源，支持版本管理和历史回溯
-- ============================================================
CREATE TABLE IF NOT EXISTS public.resource_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  resource_type text NOT NULL CHECK (resource_type IN (
    'handout', 'mindmap', 'quiz', 'code', 'reading', 'explanation', 'ppt', 'curriculum'
  )),
  topic text NOT NULL,
  knowledge_points text[] NOT NULL DEFAULT '{}',
  content text NOT NULL,
  -- 生成时的画像快照
  profile_snapshot jsonb, -- {scores, weak_points, suggestions}
  -- 关联的审核结果
  review_score numeric(3,1),
  review_verdict text CHECK (review_verdict IN ('pass', 'warn', 'reject')),
  review_issues text[],
  review_suggestions text[],
  -- 生成元数据
  agent_trace jsonb, -- Agent 执行轨迹
  generation_duration_ms int,
  -- 版本管理
  version int NOT NULL DEFAULT 1,
  parent_id uuid REFERENCES resource_assets(id) ON DELETE SET NULL,
  -- 来源关联
  source_type text, -- 'manual' | 'path_recommendation' | 'regeneration'
  source_path_id text, -- 学习路径节点 ID
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resource_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_assets" ON resource_assets FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_resource_assets_user_time ON resource_assets(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resource_assets_type ON resource_assets(resource_type);
CREATE INDEX IF NOT EXISTS idx_resource_assets_topic ON resource_assets USING GIN (knowledge_points);

-- ============================================================
-- 5. Agent 运行记录表 (agent_runs)
-- 追踪每次多智能体编排的执行过程
-- ============================================================
CREATE TABLE IF NOT EXISTS public.agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  run_type text NOT NULL CHECK (run_type IN (
    'resource_generation', 'profile_analysis', 'path_planning',
    'evaluation', 'interview', 'report_generation'
  )),
  topic text,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'partial', 'failed')),
  -- 编排详情
  total_agents int NOT NULL DEFAULT 0,
  success_agents int NOT NULL DEFAULT 0,
  failed_agents int NOT NULL DEFAULT 0,
  retry_count int NOT NULL DEFAULT 0,
  -- 性能指标
  total_duration_ms int,
  agent_trace jsonb, -- 每个 Agent 的输入/输出/耗时
  -- 审核结果
  review_score numeric(3,1),
  review_verdict text CHECK (review_verdict IN ('pass', 'warn', 'reject')),
  auto_retry_reason text, -- 自动返工的原因
  -- 关联的资源
  asset_id uuid REFERENCES resource_assets(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_agent_runs" ON agent_runs FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_agent_runs_user_time ON agent_runs(user_id, created_at DESC);

-- ============================================================
-- 6. 给 quiz_attempts 补充 topic_name 字段（如果还没有）
-- ============================================================
ALTER TABLE public.quiz_attempts ADD COLUMN IF NOT EXISTS topic_name text;

-- ============================================================
-- 7. 给 learning_profiles 补充 profile_data 字段（存储完整画像JSON）
-- ============================================================
ALTER TABLE public.learning_profiles ADD COLUMN IF NOT EXISTS profile_data jsonb;

-- ============================================================
-- 8. 学习事件触发器: 答题后自动更新知识掌握度
-- ============================================================
CREATE OR REPLACE FUNCTION public.on_quiz_attempt_update_mastery()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_topic text;
  v_question questions%ROWTYPE;
BEGIN
  -- 获取题目关联的知识点
  SELECT * INTO v_question FROM questions WHERE id = NEW.question_id;
  v_topic := COALESCE(NEW.topic_name, v_question.content);
  IF v_topic IS NOT NULL AND length(v_topic) > 0 THEN
    -- 取前30个字符作为知识点名称
    PERFORM update_mastery(NEW.user_id, left(v_topic, 60), NEW.is_correct);
  END IF;
  RETURN NEW;
END;
$$;

-- 检查触发器是否已存在
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_quiz_attempt_mastery') THEN
    CREATE TRIGGER trg_quiz_attempt_mastery
      AFTER INSERT ON quiz_attempts
      FOR EACH ROW EXECUTE FUNCTION on_quiz_attempt_update_mastery();
  END IF;
END;
$$;

-- ============================================================
-- 9. 弱知识点画像更新函数: 合并 knowledge_mastery 到 learning_profiles
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_mastery_to_profile(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_weak jsonb;
  v_strong jsonb;
  v_profile_id uuid;
  v_avg_mastery numeric;
BEGIN
  -- 聚合薄弱知识点 (mastery < 50) 和强项 (mastery >= 80)
  SELECT jsonb_agg(jsonb_build_object('point', knowledge_point, 'level', mastery_level))
    INTO v_weak FROM knowledge_mastery
    WHERE user_id = p_user_id AND mastery_level < 50
    ORDER BY mastery_level ASC LIMIT 10;

  SELECT jsonb_agg(jsonb_build_object('point', knowledge_point, 'level', mastery_level))
    INTO v_strong FROM knowledge_mastery
    WHERE user_id = p_user_id AND mastery_level >= 80
    ORDER BY mastery_level DESC LIMIT 10;

  SELECT AVG(mastery_level) INTO v_avg_mastery FROM knowledge_mastery WHERE user_id = p_user_id;

  SELECT id INTO v_profile_id FROM learning_profiles WHERE user_id = p_user_id;
  IF FOUND THEN
    UPDATE learning_profiles SET
      knowledge_base = COALESCE(v_avg_mastery::int, 60),
      weak_points = COALESCE((SELECT array_agg(point) FROM jsonb_to_recordset(v_weak) AS x(point text, level numeric)), '{}'),
      updated_at = now()
    WHERE id = v_profile_id;
  END IF;

  -- 保存画像版本
  INSERT INTO profile_versions (user_id, profile_data, scores, weak_points, suggestions, change_summary, trigger_event_type)
  VALUES (
    p_user_id,
    jsonb_build_object('weak_points', v_weak, 'strong_points', v_strong, 'avg_mastery', v_avg_mastery),
    jsonb_build_object('knowledge_base', COALESCE(v_avg_mastery::int, 60)),
    COALESCE((SELECT array_agg(point) FROM jsonb_to_recordset(v_weak) AS x(point text, level numeric)), '{}'),
    '{}',
    '知识掌握度自动同步: mastery_avg=' || COALESCE(round(v_avg_mastery, 1)::text, 'N/A'),
    'mastery_change'
  );
END;
$$;
