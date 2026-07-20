-- 00018: WVK 事务化原子发布（snapshot_id 版本隔离）
-- 增量迁移，不破坏已有数据。旧行 snapshot_id 为 NULL，被视为已发布。

BEGIN;

-- 1. 为 wiki_entries 和 wiki_relations 增加 snapshot_id
ALTER TABLE public.wiki_entries
  ADD COLUMN IF NOT EXISTS snapshot_id uuid;

ALTER TABLE public.wiki_relations
  ADD COLUMN IF NOT EXISTS snapshot_id uuid;

-- 2. 为 wiki_entries 增加 status 列（已发布/草稿）
ALTER TABLE public.wiki_entries
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published'
  CHECK (status IN ('published', 'staging', 'archived'));

-- 3. 创建索引加速按 snapshot 查询和清理
CREATE INDEX IF NOT EXISTS idx_wiki_entries_snapshot
  ON public.wiki_entries(user_id, source_file_id, snapshot_id)
  WHERE snapshot_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_wiki_relations_snapshot
  ON public.wiki_relations(user_id, snapshot_id)
  WHERE snapshot_id IS NOT NULL;

-- 4. 原子发布函数：将 staging 行切换为 published，同时归档旧行
CREATE OR REPLACE FUNCTION public.atomic_publish_wiki_snapshot(
  p_user_id uuid,
  p_source_file_id uuid,
  p_snapshot_id uuid
) RETURNS TABLE(
  published_entries integer,
  published_relations integer,
  archived_entries integer
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_entries integer;
  v_relations integer;
  v_archived integer;
BEGIN
  -- 检查 staging 数据存在
  SELECT count(*) INTO v_entries
  FROM wiki_entries
  WHERE user_id = p_user_id
    AND source_file_id = p_source_file_id
    AND snapshot_id = p_snapshot_id
    AND status = 'staging';

  IF v_entries = 0 THEN
    RAISE EXCEPTION 'SNAPSHOT_NOT_FOUND: 没有找到待发布的 staging 数据';
  END IF;

  -- 归档当前已发布的行
  UPDATE wiki_entries
  SET status = 'archived', updated_at = now()
  WHERE user_id = p_user_id
    AND source_file_id = p_source_file_id
    AND status = 'published';

  GET DIAGNOSTICS v_archived = ROW_COUNT;

  -- 原子切换 staging → published
  UPDATE wiki_entries
  SET status = 'published', snapshot_id = NULL, updated_at = now()
  WHERE user_id = p_user_id
    AND source_file_id = p_source_file_id
    AND snapshot_id = p_snapshot_id
    AND status = 'staging';

  SELECT count(*) INTO v_relations
  FROM wiki_relations
  WHERE user_id = p_user_id
    AND snapshot_id = p_snapshot_id;

  -- 清理旧的已归档行（保留最近 2 个版本）
  DELETE FROM wiki_entries
  WHERE user_id = p_user_id
    AND source_file_id = p_source_file_id
    AND status = 'archived'
    AND id NOT IN (
      SELECT id FROM wiki_entries
      WHERE user_id = p_user_id
        AND source_file_id = p_source_file_id
        AND status = 'archived'
      ORDER BY updated_at DESC
      LIMIT 2
    );

  published_entries := v_entries;
  published_relations := v_relations;
  archived_entries := v_archived;
  RETURN NEXT;
END;
$$;

-- 5. 清理 staging 快照函数（回滚用）
CREATE OR REPLACE FUNCTION public.rollback_wiki_snapshot(
  p_user_id uuid,
  p_source_file_id uuid,
  p_snapshot_id uuid
) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_count integer;
BEGIN
  -- 删除 staging 状态的词条
  DELETE FROM wiki_entries
  WHERE user_id = p_user_id
    AND source_file_id = p_source_file_id
    AND snapshot_id = p_snapshot_id
    AND status = 'staging';
  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- 删除关联的 staging 关系
  DELETE FROM wiki_relations
  WHERE user_id = p_user_id
    AND snapshot_id = p_snapshot_id;

  RETURN v_count;
END;
$$;

-- 6. 给 service_role 授予执行权限
GRANT EXECUTE ON FUNCTION public.atomic_publish_wiki_snapshot(uuid,uuid,uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.rollback_wiki_snapshot(uuid,uuid,uuid) TO service_role;

-- 7. 更新 hybrid_knowledge_search：只返回已发布的词条 (status = 'published')
CREATE OR REPLACE FUNCTION public.hybrid_knowledge_search(
  p_user_id uuid,
  p_query text,
  p_query_embedding extensions.vector(1024) DEFAULT NULL,
  p_limit integer DEFAULT 12
) RETURNS TABLE (
  result_id uuid, result_type text, title text, content text,
  source_file_id uuid, wiki_entry_id uuid, score double precision
) LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public,extensions AS $$
  WITH q AS (SELECT websearch_to_tsquery('simple', p_query) query),
  wiki AS (
    SELECT w.id result_id, 'wiki'::text result_type, w.title, w.content,
      w.source_file_id, w.id wiki_entry_id,
      (greatest(ts_rank_cd(w.search_vector,q.query), similarity(w.title || ' ' || w.summary, p_query)) * 1.25)::double precision score
    FROM wiki_entries w,q
    WHERE w.user_id=p_user_id
      AND w.status = 'published'
      AND (w.search_vector @@ q.query OR w.title ILIKE '%'||p_query||'%' OR w.summary ILIKE '%'||p_query||'%' OR w.content ILIKE '%'||p_query||'%')
  ), chunks AS (
    SELECT c.id result_id, 'chunk'::text result_type, coalesce(w.title,'资料片段') title, c.content,
      c.source_file_id, c.wiki_entry_id,
      (greatest(ts_rank_cd(c.search_vector,q.query), similarity(c.content, p_query)) + CASE WHEN p_query_embedding IS NULL OR c.embedding IS NULL THEN 0 ELSE (1-(c.embedding <=> p_query_embedding)) END)::double precision score
    FROM knowledge_chunks c CROSS JOIN q LEFT JOIN wiki_entries w ON w.id=c.wiki_entry_id AND w.status = 'published'
    WHERE c.user_id=p_user_id AND (c.search_vector @@ q.query OR c.content ILIKE '%'||p_query||'%' OR (p_query_embedding IS NOT NULL AND c.embedding IS NOT NULL))
  )
  SELECT * FROM (SELECT * FROM wiki UNION ALL SELECT * FROM chunks) r
  ORDER BY score DESC LIMIT greatest(1,least(p_limit,30));
$$;
REVOKE ALL ON FUNCTION public.hybrid_knowledge_search(uuid,text,extensions.vector,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hybrid_knowledge_search(uuid,text,extensions.vector,integer) TO service_role;

COMMIT;