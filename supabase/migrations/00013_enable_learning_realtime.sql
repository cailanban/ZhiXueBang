-- Enable the real learning fact tables for Supabase Realtime.
-- The migration is idempotent so it is safe on projects where a table was
-- already added to the publication manually.

DO $$
DECLARE
  table_name text;
  realtime_tables text[] := ARRAY[
    'learning_records',
    'learning_progress',
    'learning_events',
    'knowledge_mastery',
    'learning_profiles',
    'agent_runs'
  ];
BEGIN
  FOREACH table_name IN ARRAY realtime_tables LOOP
    IF to_regclass(format('public.%I', table_name)) IS NOT NULL THEN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = table_name
      ) THEN
        EXECUTE format(
          'ALTER PUBLICATION supabase_realtime ADD TABLE public.%I',
          table_name
        );
      END IF;

      -- Required for filtered DELETE events to retain user_id in the old row.
      EXECUTE format(
        'ALTER TABLE public.%I REPLICA IDENTITY FULL',
        table_name
      );
    END IF;
  END LOOP;
END
$$;
