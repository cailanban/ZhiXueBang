-- 00022: Retrieval eval dataset table (persistent annotation store)
BEGIN;

CREATE TABLE IF NOT EXISTS public.retrieval_eval_queries (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  query text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  relevant_ids text[] NOT NULL DEFAULT '{}',
  expected_answer text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_retrieval_eval_queries_category
  ON public.retrieval_eval_queries(category, difficulty);

-- Seed default eval queries (10 queries across 10 categories, 3 difficulty levels)
INSERT INTO public.retrieval_eval_queries (query, category, difficulty) VALUES
  ('什么是知识图谱', '知识工程', 'easy'),
  ('HashMap 和 TreeMap 的区别', 'Java', 'medium'),
  ('解释神经网络的梯度消失问题', '深度学习', 'hard'),
  ('REST API 设计最佳实践', '后端开发', 'easy'),
  ('数据库索引的原理和类型', '数据库', 'medium'),
  ('React Hooks 的使用规则', '前端开发', 'easy'),
  ('CAP 定理及其在分布式系统中的应用', '分布式系统', 'hard'),
  ('Python 装饰器的实现原理', 'Python', 'medium'),
  ('HTTPS 的握手过程', '计算机网络', 'medium'),
  ('如何优化 SQL 查询性能', '数据库', 'medium')
ON CONFLICT DO NOTHING;

-- RPC: get annotated eval queries
CREATE OR REPLACE FUNCTION public.get_eval_queries(
  p_annotated_only boolean DEFAULT false
) RETURNS SETOF public.retrieval_eval_queries
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.retrieval_eval_queries
  WHERE (NOT p_annotated_only OR array_length(relevant_ids, 1) > 0)
  ORDER BY id;
$$;

-- RPC: annotate eval query (update relevant_ids)
CREATE OR REPLACE FUNCTION public.annotate_eval_query(
  p_query_id bigint,
  p_relevant_ids text[]
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.retrieval_eval_queries
  SET relevant_ids = p_relevant_ids, updated_at = now()
  WHERE id = p_query_id;
END;
$$;

-- RPC: self-annotate from search results (auto-populate relevant_ids from top results)
CREATE OR REPLACE FUNCTION public.self_annotate_eval_query(
  p_query_id bigint,
  p_top_k integer DEFAULT 3
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_query text;
  v_user_id uuid;
  v_results record;
  v_ids text[] := '{}';
BEGIN
  -- Get the query text
  SELECT query INTO v_query FROM public.retrieval_eval_queries WHERE id = p_query_id;
  IF v_query IS NULL THEN
    RAISE EXCEPTION 'Query not found: %', p_query_id;
  END IF;

  -- Find a user with knowledge entries
  SELECT user_id INTO v_user_id FROM public.wiki_entries LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No wiki entries found. Upload knowledge first.';
  END IF;

  -- Run hybrid search and collect top K wiki_entry_ids
  FOR v_results IN
    SELECT wiki_entry_id FROM public.hybrid_knowledge_search(
      v_user_id, v_query, NULL, p_top_k
    )
  LOOP
    IF v_results.wiki_entry_id IS NOT NULL THEN
      v_ids := array_append(v_ids, v_results.wiki_entry_id::text);
    END IF;
  END LOOP;

  -- Update the query with self-annotated IDs
  UPDATE public.retrieval_eval_queries
  SET relevant_ids = v_ids, updated_at = now()
  WHERE id = p_query_id;
END;
$$;

-- Grant permissions
GRANT SELECT ON public.retrieval_eval_queries TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_eval_queries TO authenticated;
GRANT EXECUTE ON FUNCTION public.annotate_eval_query TO authenticated;
GRANT EXECUTE ON FUNCTION public.self_annotate_eval_query TO authenticated;

COMMIT;