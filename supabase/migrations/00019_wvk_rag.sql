-- 个人知识库 WVK + RAG 双引擎第一批
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.wiki_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_file_id uuid NOT NULL REFERENCES public.knowledge_files(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  summary text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  aliases text[] NOT NULL DEFAULT '{}',
  keywords text[] NOT NULL DEFAULT '{}',
  parent_title text,
  depth smallint NOT NULL DEFAULT 0 CHECK (depth BETWEEN 0 AND 8),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, source_file_id, title)
);

CREATE TABLE IF NOT EXISTS public.wiki_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_entry_id uuid NOT NULL REFERENCES public.wiki_entries(id) ON DELETE CASCADE,
  target_entry_id uuid NOT NULL REFERENCES public.wiki_entries(id) ON DELETE CASCADE,
  relation_type text NOT NULL CHECK (relation_type IN ('parent','prerequisite','related','example','contrast')),
  weight real NOT NULL DEFAULT 1 CHECK (weight BETWEEN 0 AND 10),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(source_entry_id, target_entry_id, relation_type),
  CHECK (source_entry_id <> target_entry_id)
);

CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_file_id uuid NOT NULL REFERENCES public.knowledge_files(id) ON DELETE CASCADE,
  wiki_entry_id uuid REFERENCES public.wiki_entries(id) ON DELETE SET NULL,
  chunk_index integer NOT NULL CHECK (chunk_index >= 0),
  content text NOT NULL CHECK (char_length(content) > 0),
  token_estimate integer NOT NULL DEFAULT 0,
  embedding extensions.vector(1024),
  embedding_model text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, source_file_id, chunk_index)
);

-- Recover safely from earlier partially-applied generated-column versions.
-- These tables are new in this migration; dropping only the derived search
-- column does not remove source content, relations, chunks, or embeddings.
ALTER TABLE public.wiki_entries DROP COLUMN IF EXISTS search_vector CASCADE;
ALTER TABLE public.wiki_entries ADD COLUMN search_vector tsvector;
ALTER TABLE public.knowledge_chunks DROP COLUMN IF EXISTS search_vector CASCADE;
ALTER TABLE public.knowledge_chunks ADD COLUMN search_vector tsvector;

CREATE OR REPLACE FUNCTION public.refresh_wiki_entry_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.search_vector := to_tsvector(
    'simple'::regconfig,
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.summary, '') || ' ' ||
    coalesce(NEW.content, '') || ' ' ||
    coalesce(array_to_string(NEW.aliases, ' '), '') || ' ' ||
    coalesce(array_to_string(NEW.keywords, ' '), '')
  );
  RETURN NEW;
END
$$;

CREATE OR REPLACE FUNCTION public.refresh_knowledge_chunk_search_vector()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple'::regconfig, coalesce(NEW.content, ''));
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_wiki_entry_search_vector ON public.wiki_entries;
CREATE TRIGGER trg_wiki_entry_search_vector
BEFORE INSERT OR UPDATE OF title, summary, content, aliases, keywords
ON public.wiki_entries FOR EACH ROW
EXECUTE FUNCTION public.refresh_wiki_entry_search_vector();

DROP TRIGGER IF EXISTS trg_knowledge_chunk_search_vector ON public.knowledge_chunks;
CREATE TRIGGER trg_knowledge_chunk_search_vector
BEFORE INSERT OR UPDATE OF content
ON public.knowledge_chunks FOR EACH ROW
EXECUTE FUNCTION public.refresh_knowledge_chunk_search_vector();

UPDATE public.wiki_entries
SET search_vector = to_tsvector(
  'simple'::regconfig,
  coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' ||
  coalesce(content, '') || ' ' || coalesce(array_to_string(aliases, ' '), '') || ' ' ||
  coalesce(array_to_string(keywords, ' '), '')
);
UPDATE public.knowledge_chunks
SET search_vector = to_tsvector('simple'::regconfig, coalesce(content, ''));

DROP FUNCTION IF EXISTS public.build_wiki_search_vector(text,text,text,text[],text[]);
DROP FUNCTION IF EXISTS public.immutable_text_array_to_string(text[],text);

CREATE TABLE IF NOT EXISTS public.knowledge_index_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_file_id uuid NOT NULL REFERENCES public.knowledge_files(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  wiki_count integer NOT NULL DEFAULT 0,
  chunk_count integer NOT NULL DEFAULT 0,
  vector_count integer NOT NULL DEFAULT 0,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wiki_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wiki_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_index_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users own wiki entries" ON public.wiki_entries;
CREATE POLICY "users own wiki entries" ON public.wiki_entries FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
DROP POLICY IF EXISTS "users own wiki relations" ON public.wiki_relations;
CREATE POLICY "users own wiki relations" ON public.wiki_relations FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
DROP POLICY IF EXISTS "users own knowledge chunks" ON public.knowledge_chunks;
CREATE POLICY "users own knowledge chunks" ON public.knowledge_chunks FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
DROP POLICY IF EXISTS "users own knowledge jobs" ON public.knowledge_index_jobs;
CREATE POLICY "users own knowledge jobs" ON public.knowledge_index_jobs FOR SELECT TO authenticated USING (auth.uid()=user_id);

CREATE INDEX IF NOT EXISTS idx_wiki_entries_user_source ON public.wiki_entries(user_id,source_file_id);
CREATE INDEX IF NOT EXISTS idx_wiki_entries_search ON public.wiki_entries USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_wiki_relations_source ON public.wiki_relations(user_id,source_entry_id);
CREATE INDEX IF NOT EXISTS idx_wiki_relations_target ON public.wiki_relations(user_id,target_entry_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_user_source ON public.knowledge_chunks(user_id,source_file_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_search ON public.knowledge_chunks USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_knowledge_jobs_user_time ON public.knowledge_index_jobs(user_id,created_at DESC);

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
    FROM wiki_entries w,q WHERE w.user_id=p_user_id AND (w.search_vector @@ q.query OR w.title ILIKE '%'||p_query||'%' OR w.summary ILIKE '%'||p_query||'%' OR w.content ILIKE '%'||p_query||'%')
  ), chunks AS (
    SELECT c.id result_id, 'chunk'::text result_type, coalesce(w.title,'资料片段') title, c.content,
      c.source_file_id, c.wiki_entry_id,
      (greatest(ts_rank_cd(c.search_vector,q.query), similarity(c.content, p_query)) + CASE WHEN p_query_embedding IS NULL OR c.embedding IS NULL THEN 0 ELSE (1-(c.embedding <=> p_query_embedding)) END)::double precision score
    FROM knowledge_chunks c CROSS JOIN q LEFT JOIN wiki_entries w ON w.id=c.wiki_entry_id
    WHERE c.user_id=p_user_id AND (c.search_vector @@ q.query OR c.content ILIKE '%'||p_query||'%' OR (p_query_embedding IS NOT NULL AND c.embedding IS NOT NULL))
  )
  SELECT * FROM (SELECT * FROM wiki UNION ALL SELECT * FROM chunks) r
  ORDER BY score DESC LIMIT greatest(1,least(p_limit,30));
$$;
REVOKE ALL ON FUNCTION public.hybrid_knowledge_search(uuid,text,extensions.vector,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hybrid_knowledge_search(uuid,text,extensions.vector,integer) TO service_role;

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.knowledge_index_jobs;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
