-- Store text extracted from uploaded documents and imported web pages.
-- The column is required by KnowledgePage search, comparison and reparse flows.
ALTER TABLE public.knowledge_files
  ADD COLUMN IF NOT EXISTS content_text text;

COMMENT ON COLUMN public.knowledge_files.content_text IS
  'Plain text extracted from an uploaded document or imported web page.';
