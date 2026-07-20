-- 00023: PPT generation version history, job queue, and retry tracking
BEGIN;

CREATE TABLE IF NOT EXISTS public.ppt_generation_jobs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic text NOT NULL,
  template text NOT NULL DEFAULT 'lecture',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  slide_count integer,
  pptx_url text,
  html_url text,
  notes_url text,
  error_message text,
  retry_count integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_ppt_jobs_user_status
  ON public.ppt_generation_jobs(user_id, status);

CREATE TABLE IF NOT EXISTS public.ppt_version_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  job_id bigint NOT NULL REFERENCES public.ppt_generation_jobs(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  pptx_url text,
  html_url text,
  notes_url text,
  slide_count integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ppt_versions_job
  ON public.ppt_version_history(job_id, version);

-- RPC: get latest PPT jobs for user
CREATE OR REPLACE FUNCTION public.get_ppt_jobs(
  p_user_id uuid,
  p_limit integer DEFAULT 20
) RETURNS SETOF public.ppt_generation_jobs
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.ppt_generation_jobs
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT p_limit;
$$;

-- RPC: increment retry count
CREATE OR REPLACE FUNCTION public.increment_ppt_retry(
  p_job_id bigint
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.ppt_generation_jobs
  SET retry_count = retry_count + 1, updated_at = now()
  WHERE id = p_job_id;
END;
$$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.ppt_generation_jobs TO authenticated;
GRANT SELECT ON public.ppt_version_history TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ppt_jobs TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_ppt_retry TO authenticated;

COMMIT;