-- One-time recovery for failed 00017 attempts only.
-- This removes only the four new WVK/RAG tables. It does not touch
-- knowledge_files, profiles, learning data, uploaded files, or auth users.
BEGIN;

DROP TABLE IF EXISTS public.wiki_relations CASCADE;
DROP TABLE IF EXISTS public.knowledge_chunks CASCADE;
DROP TABLE IF EXISTS public.knowledge_index_jobs CASCADE;
DROP TABLE IF EXISTS public.wiki_entries CASCADE;

DROP FUNCTION IF EXISTS public.hybrid_knowledge_search(uuid,text,extensions.vector,integer);
DROP FUNCTION IF EXISTS public.refresh_wiki_entry_search_vector();
DROP FUNCTION IF EXISTS public.refresh_knowledge_chunk_search_vector();
DROP FUNCTION IF EXISTS public.build_wiki_search_vector(text,text,text,text[],text[]);
DROP FUNCTION IF EXISTS public.immutable_text_array_to_string(text[],text);

COMMIT;

SELECT
  to_regclass('public.wiki_entries') AS wiki_entries,
  to_regclass('public.wiki_relations') AS wiki_relations,
  to_regclass('public.knowledge_chunks') AS knowledge_chunks,
  to_regclass('public.knowledge_index_jobs') AS knowledge_index_jobs;
