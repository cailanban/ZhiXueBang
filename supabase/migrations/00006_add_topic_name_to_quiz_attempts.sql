ALTER TABLE quiz_attempts
  ADD COLUMN IF NOT EXISTS topic_name text,
  ADD COLUMN IF NOT EXISTS score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total integer DEFAULT 0;