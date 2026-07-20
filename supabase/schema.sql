-- ============================================================
-- SECTION: SCHEMA
-- ============================================================

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS "public";


--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";


--
-- Name: EXTENSION "pg_graphql"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "pg_graphql" IS 'pg_graphql: GraphQL support';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";


--
-- Name: EXTENSION "pgcrypto"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "pgcrypto" IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";


--
-- Name: EXTENSION "supabase_vault"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "supabase_vault" IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: difficulty_level; Type: TYPE; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'difficulty_level'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE TYPE "public"."difficulty_level" AS ENUM (
    'easy',
    'medium',
    'hard'
);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: mastery_status; Type: TYPE; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'mastery_status'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE TYPE "public"."mastery_status" AS ENUM (
    'unmastered',
    'mastered'
);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: question_type; Type: TYPE; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'question_type'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE TYPE "public"."question_type" AS ENUM (
    'choice',
    'fill',
    'coding'
);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'user_role'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE TYPE "public"."user_role" AS ENUM (
    'user',
    'teacher',
    'admin'
);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: get_user_role("uuid"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION "public"."get_user_role"("uid" "uuid") RETURNS "public"."user_role"
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$ SELECT role FROM profiles WHERE id = uid; $$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user'::public.user_role);
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;


--
-- Name: upsert_learning_profile("uuid", integer, integer, integer, integer, integer, integer, "text"[], "text"[], "jsonb"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION "public"."upsert_learning_profile"("p_user_id" "uuid", "p_knowledge_base" integer, "p_cognitive_style" integer, "p_learning_preference" integer, "p_error_prone" integer, "p_learning_goal" integer, "p_learning_pace" integer, "p_weak_points" "text"[], "p_suggestions" "text"[], "p_profile_data" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO learning_profiles (
    user_id, knowledge_base, cognitive_style, learning_preference,
    error_prone, learning_goal, learning_pace, weak_points, suggestions,
    profile_data, last_analysis_at, updated_at
  ) VALUES (
    p_user_id, p_knowledge_base, p_cognitive_style, p_learning_preference,
    p_error_prone, p_learning_goal, p_learning_pace, p_weak_points, p_suggestions,
    p_profile_data, now(), now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    knowledge_base = EXCLUDED.knowledge_base,
    cognitive_style = EXCLUDED.cognitive_style,
    learning_preference = EXCLUDED.learning_preference,
    error_prone = EXCLUDED.error_prone,
    learning_goal = EXCLUDED.learning_goal,
    learning_pace = EXCLUDED.learning_pace,
    weak_points = EXCLUDED.weak_points,
    suggestions = EXCLUDED.suggestions,
    profile_data = EXCLUDED.profile_data,
    last_analysis_at = now(),
    updated_at = now();
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: chapters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."chapters" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "course_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text",
    "order_num" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "session_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role" "text" NOT NULL,
    "content" "text" NOT NULL,
    "images" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "agent_type" "text" DEFAULT 'chat'::"text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "chat_messages_agent_type_check" CHECK (("agent_type" = ANY (ARRAY['chat'::"text", 'tutor'::"text"]))),
    CONSTRAINT "chat_messages_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'assistant'::"text"])))
);


--
-- Name: chat_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."chat_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "title" "text" DEFAULT '新对话'::"text" NOT NULL,
    "agent_type" "text" DEFAULT 'chat'::"text" NOT NULL,
    "topic" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chat_sessions_agent_type_check" CHECK (("agent_type" = ANY (ARRAY['chat'::"text", 'tutor'::"text"])))
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "cover_url" "text",
    "category" "text" DEFAULT 'programming'::"text" NOT NULL,
    "difficulty" "public"."difficulty_level" DEFAULT 'medium'::"public"."difficulty_level" NOT NULL,
    "chapter_count" integer DEFAULT 0 NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_published" boolean DEFAULT true NOT NULL
);


--
-- Name: interview_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."interview_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "session_type" "text" DEFAULT 'interview'::"text" NOT NULL,
    "topic" "text" NOT NULL,
    "messages" "jsonb" DEFAULT '[]'::"jsonb",
    "score" integer,
    "feedback" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: knowledge_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."knowledge_files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "name" "text" NOT NULL,
    "file_url" "text",
    "ima_file_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: learning_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."learning_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "knowledge_base" integer DEFAULT 60 NOT NULL,
    "cognitive_style" integer DEFAULT 60 NOT NULL,
    "learning_preference" integer DEFAULT 60 NOT NULL,
    "error_prone" integer DEFAULT 60 NOT NULL,
    "learning_goal" integer DEFAULT 60 NOT NULL,
    "learning_pace" integer DEFAULT 60 NOT NULL,
    "weak_points" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "suggestions" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "profile_data" "jsonb" DEFAULT '{}'::"jsonb",
    "last_analysis_at" timestamp with time zone
);


--
-- Name: learning_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."learning_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "course_id" "uuid" NOT NULL,
    "chapter_id" "uuid",
    "completed_chapters" integer DEFAULT 0 NOT NULL,
    "total_chapters" integer DEFAULT 0 NOT NULL,
    "last_studied_at" timestamp with time zone
);


--
-- Name: learning_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."learning_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "course_id" "uuid",
    "chapter_id" "uuid",
    "duration_minutes" integer DEFAULT 0 NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: learning_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."learning_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "week_start" "date" NOT NULL,
    "week_end" "date" NOT NULL,
    "report_type" "text" DEFAULT 'weekly'::"text" NOT NULL,
    "narrative" "text",
    "stats" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: mistake_book; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."mistake_book" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "question_id" "uuid" NOT NULL,
    "user_answer" "text",
    "status" "public"."mastery_status" DEFAULT 'unmastered'::"public"."mastery_status" NOT NULL,
    "notes" "text",
    "added_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "quiz_session_id" "uuid",
    "correct_answer" "text",
    "explanation" "text"
);


--
-- Name: notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "title" "text" DEFAULT '未命名笔记'::"text" NOT NULL,
    "content" "text" DEFAULT ''::"text" NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "course_id" "uuid",
    "chapter_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "username" "text",
    "avatar_url" "text",
    "role" "public"."user_role" DEFAULT 'user'::"public"."user_role" NOT NULL,
    "bio" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "chapter_id" "uuid",
    "course_id" "uuid",
    "content" "text" NOT NULL,
    "type" "public"."question_type" DEFAULT 'choice'::"public"."question_type" NOT NULL,
    "options" "jsonb",
    "answer" "text" NOT NULL,
    "explanation" "text",
    "difficulty" "public"."difficulty_level" DEFAULT 'medium'::"public"."difficulty_level" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "knowledge_point" "text",
    "ima_context" "text",
    "topic" "text"
);


--
-- Name: quiz_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."quiz_attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "question_id" "uuid" NOT NULL,
    "user_answer" "text" NOT NULL,
    "is_correct" boolean DEFAULT false NOT NULL,
    "attempted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "course_id" "uuid",
    "chapter_id" "uuid",
    "time_spent_seconds" integer DEFAULT 0,
    "topic_name" "text",
    "score" integer DEFAULT 0,
    "total" integer DEFAULT 0
);


--
-- Name: quiz_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE IF NOT EXISTS "public"."quiz_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "course_id" "uuid",
    "chapter_id" "uuid",
    "topic" "text",
    "total_q" integer DEFAULT 0 NOT NULL,
    "correct_q" integer DEFAULT 0 NOT NULL,
    "score" numeric(5,2) DEFAULT 0,
    "completed" boolean DEFAULT false NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "finished_at" timestamp with time zone
);


--
-- Name: chapters chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'chapters_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'chapters'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."chapters"
    ADD CONSTRAINT "chapters_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'chat_messages_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'chat_messages'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: chat_sessions chat_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'chat_sessions_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'chat_sessions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."chat_sessions"
    ADD CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'courses_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'courses'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: interview_sessions interview_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'interview_sessions_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'interview_sessions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."interview_sessions"
    ADD CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: knowledge_files knowledge_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'knowledge_files_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'knowledge_files'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."knowledge_files"
    ADD CONSTRAINT "knowledge_files_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_profiles learning_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_profiles_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_profiles"
    ADD CONSTRAINT "learning_profiles_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_profiles learning_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_profiles_user_id_key'
      AND n.nspname = 'public'
      AND c.relname = 'learning_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_profiles"
    ADD CONSTRAINT "learning_profiles_user_id_key" UNIQUE ("user_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_progress learning_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_progress_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_progress'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_progress"
    ADD CONSTRAINT "learning_progress_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_progress learning_progress_user_id_course_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_progress_user_id_course_id_key'
      AND n.nspname = 'public'
      AND c.relname = 'learning_progress'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_progress"
    ADD CONSTRAINT "learning_progress_user_id_course_id_key" UNIQUE ("user_id", "course_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_records learning_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_records_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_records'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_records"
    ADD CONSTRAINT "learning_records_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_reports learning_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_reports_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_reports'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_reports"
    ADD CONSTRAINT "learning_reports_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: mistake_book mistake_book_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'mistake_book_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'mistake_book'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."mistake_book"
    ADD CONSTRAINT "mistake_book_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: mistake_book mistake_book_user_id_question_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'mistake_book_user_id_question_id_key'
      AND n.nspname = 'public'
      AND c.relname = 'mistake_book'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."mistake_book"
    ADD CONSTRAINT "mistake_book_user_id_question_id_key" UNIQUE ("user_id", "question_id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'notes_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'notes'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'profiles_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'questions_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'questions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'quiz_attempts_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'quiz_attempts'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: quiz_sessions quiz_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'quiz_sessions_pkey'
      AND n.nspname = 'public'
      AND c.relname = 'quiz_sessions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."quiz_sessions"
    ADD CONSTRAINT "quiz_sessions_pkey" PRIMARY KEY ("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: chat_sessions trg_chat_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE OR REPLACE TRIGGER "trg_chat_sessions_updated_at" BEFORE UPDATE ON "public"."chat_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();


--
-- Name: chapters chapters_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'chapters_course_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'chapters'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."chapters"
    ADD CONSTRAINT "chapters_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: chat_messages chat_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'chat_messages_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'chat_messages'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: chat_sessions chat_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'chat_sessions_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'chat_sessions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."chat_sessions"
    ADD CONSTRAINT "chat_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: courses courses_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'courses_created_by_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'courses'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id");
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: interview_sessions interview_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'interview_sessions_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'interview_sessions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."interview_sessions"
    ADD CONSTRAINT "interview_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: knowledge_files knowledge_files_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'knowledge_files_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'knowledge_files'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."knowledge_files"
    ADD CONSTRAINT "knowledge_files_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_profiles learning_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_profiles_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_profiles"
    ADD CONSTRAINT "learning_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_progress learning_progress_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_progress_chapter_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_progress'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_progress"
    ADD CONSTRAINT "learning_progress_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE SET NULL;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_progress learning_progress_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_progress_course_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_progress'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_progress"
    ADD CONSTRAINT "learning_progress_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_progress learning_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_progress_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_progress'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_progress"
    ADD CONSTRAINT "learning_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_records learning_records_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_records_chapter_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_records'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_records"
    ADD CONSTRAINT "learning_records_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE SET NULL;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_records learning_records_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_records_course_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_records'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_records"
    ADD CONSTRAINT "learning_records_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_records learning_records_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_records_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_records'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_records"
    ADD CONSTRAINT "learning_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_reports learning_reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'learning_reports_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'learning_reports'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."learning_reports"
    ADD CONSTRAINT "learning_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: mistake_book mistake_book_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'mistake_book_question_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'mistake_book'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."mistake_book"
    ADD CONSTRAINT "mistake_book_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: mistake_book mistake_book_quiz_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'mistake_book_quiz_session_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'mistake_book'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."mistake_book"
    ADD CONSTRAINT "mistake_book_quiz_session_id_fkey" FOREIGN KEY ("quiz_session_id") REFERENCES "public"."quiz_sessions"("id") ON DELETE SET NULL;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: mistake_book mistake_book_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'mistake_book_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'mistake_book'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."mistake_book"
    ADD CONSTRAINT "mistake_book_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: notes notes_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'notes_chapter_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'notes'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE SET NULL;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: notes notes_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'notes_course_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'notes'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: notes notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'notes_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'notes'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'profiles_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: questions questions_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'questions_chapter_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'questions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: questions questions_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'questions_course_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'questions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: quiz_attempts quiz_attempts_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'quiz_attempts_chapter_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'quiz_attempts'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE SET NULL;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: quiz_attempts quiz_attempts_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'quiz_attempts_course_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'quiz_attempts'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: quiz_attempts quiz_attempts_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'quiz_attempts_question_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'quiz_attempts'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: quiz_attempts quiz_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'quiz_attempts_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'quiz_attempts'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: quiz_sessions quiz_sessions_chapter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'quiz_sessions_chapter_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'quiz_sessions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."quiz_sessions"
    ADD CONSTRAINT "quiz_sessions_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE SET NULL;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: quiz_sessions quiz_sessions_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'quiz_sessions_course_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'quiz_sessions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."quiz_sessions"
    ADD CONSTRAINT "quiz_sessions_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: quiz_sessions quiz_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE con.conname = 'quiz_sessions_user_id_fkey'
      AND n.nspname = 'public'
      AND c.relname = 'quiz_sessions'
  ) THEN
    EXECUTE $pg_schema_sql$
ALTER TABLE ONLY "public"."quiz_sessions"
    ADD CONSTRAINT "quiz_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: profiles admins full access profiles; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'admins full access profiles'
      AND n.nspname = 'public'
      AND c.relname = 'profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "admins full access profiles" ON "public"."profiles" TO "authenticated" USING (("public"."get_user_role"("auth"."uid"()) = 'admin'::"public"."user_role"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: chapters admins full chapters; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'admins full chapters'
      AND n.nspname = 'public'
      AND c.relname = 'chapters'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "admins full chapters" ON "public"."chapters" TO "authenticated" USING (("public"."get_user_role"("auth"."uid"()) = 'admin'::"public"."user_role"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: courses admins full courses; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'admins full courses'
      AND n.nspname = 'public'
      AND c.relname = 'courses'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "admins full courses" ON "public"."courses" TO "authenticated" USING (("public"."get_user_role"("auth"."uid"()) = 'admin'::"public"."user_role"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: questions admins full questions; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'admins full questions'
      AND n.nspname = 'public'
      AND c.relname = 'questions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "admins full questions" ON "public"."questions" TO "authenticated" USING (("public"."get_user_role"("auth"."uid"()) = 'admin'::"public"."user_role"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_progress admins read progress; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'admins read progress'
      AND n.nspname = 'public'
      AND c.relname = 'learning_progress'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "admins read progress" ON "public"."learning_progress" FOR SELECT TO "authenticated" USING (("public"."get_user_role"("auth"."uid"()) = 'admin'::"public"."user_role"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_records admins read records; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'admins read records'
      AND n.nspname = 'public'
      AND c.relname = 'learning_records'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "admins read records" ON "public"."learning_records" FOR SELECT TO "authenticated" USING (("public"."get_user_role"("auth"."uid"()) = 'admin'::"public"."user_role"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: chapters all read chapters; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'all read chapters'
      AND n.nspname = 'public'
      AND c.relname = 'chapters'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "all read chapters" ON "public"."chapters" FOR SELECT USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: questions all read questions; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'all read questions'
      AND n.nspname = 'public'
      AND c.relname = 'questions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "all read questions" ON "public"."questions" FOR SELECT USING (true);
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: courses anyone reads published courses; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'anyone reads published courses'
      AND n.nspname = 'public'
      AND c.relname = 'courses'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "anyone reads published courses" ON "public"."courses" FOR SELECT USING (("is_published" = true));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: chapters; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."chapters" ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."chat_sessions" ENABLE ROW LEVEL SECURITY;

--
-- Name: courses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;

--
-- Name: interview_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."interview_sessions" ENABLE ROW LEVEL SECURITY;

--
-- Name: knowledge_files; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."knowledge_files" ENABLE ROW LEVEL SECURITY;

--
-- Name: learning_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."learning_profiles" ENABLE ROW LEVEL SECURITY;

--
-- Name: learning_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."learning_progress" ENABLE ROW LEVEL SECURITY;

--
-- Name: learning_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."learning_records" ENABLE ROW LEVEL SECURITY;

--
-- Name: learning_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."learning_reports" ENABLE ROW LEVEL SECURITY;

--
-- Name: mistake_book; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."mistake_book" ENABLE ROW LEVEL SECURITY;

--
-- Name: notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."notes" ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

--
-- Name: questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."questions" ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."quiz_attempts" ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."quiz_sessions" ENABLE ROW LEVEL SECURITY;

--
-- Name: quiz_attempts users own attempts; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'users own attempts'
      AND n.nspname = 'public'
      AND c.relname = 'quiz_attempts'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "users own attempts" ON "public"."quiz_attempts" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: chat_messages users own chat; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'users own chat'
      AND n.nspname = 'public'
      AND c.relname = 'chat_messages'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "users own chat" ON "public"."chat_messages" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: knowledge_files users own kfiles; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'users own kfiles'
      AND n.nspname = 'public'
      AND c.relname = 'knowledge_files'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "users own kfiles" ON "public"."knowledge_files" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_profiles users own lprofile; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'users own lprofile'
      AND n.nspname = 'public'
      AND c.relname = 'learning_profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "users own lprofile" ON "public"."learning_profiles" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: mistake_book users own mistake book; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'users own mistake book'
      AND n.nspname = 'public'
      AND c.relname = 'mistake_book'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "users own mistake book" ON "public"."mistake_book" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: notes users own notes; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'users own notes'
      AND n.nspname = 'public'
      AND c.relname = 'notes'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "users own notes" ON "public"."notes" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_progress users own progress; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'users own progress'
      AND n.nspname = 'public'
      AND c.relname = 'learning_progress'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "users own progress" ON "public"."learning_progress" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_records users own records; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'users own records'
      AND n.nspname = 'public'
      AND c.relname = 'learning_records'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "users own records" ON "public"."learning_records" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: profiles users update own profile; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'users update own profile'
      AND n.nspname = 'public'
      AND c.relname = 'profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "users update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK ((NOT ("role" IS DISTINCT FROM "public"."get_user_role"("auth"."uid"()))));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: profiles users view own profile; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'users view own profile'
      AND n.nspname = 'public'
      AND c.relname = 'profiles'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "users view own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: quiz_sessions users_own_quiz_sessions; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'users_own_quiz_sessions'
      AND n.nspname = 'public'
      AND c.relname = 'quiz_sessions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "users_own_quiz_sessions" ON "public"."quiz_sessions" USING (("user_id" = "auth"."uid"()));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: learning_reports users_own_reports; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'users_own_reports'
      AND n.nspname = 'public'
      AND c.relname = 'learning_reports'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "users_own_reports" ON "public"."learning_reports" USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: chat_sessions users_own_sessions; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'users_own_sessions'
      AND n.nspname = 'public'
      AND c.relname = 'chat_sessions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "users_own_sessions" ON "public"."chat_sessions" USING (("user_id" = "auth"."uid"()));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- Name: interview_sessions users_own_sessions; Type: POLICY; Schema: public; Owner: -
--

DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE pol.polname = 'users_own_sessions'
      AND n.nspname = 'public'
      AND c.relname = 'interview_sessions'
  ) THEN
    EXECUTE $pg_schema_sql$
CREATE POLICY "users_own_sessions" ON "public"."interview_sessions" USING (("auth"."uid"() = "user_id"));
$pg_schema_sql$;
  END IF;
END
$pg_schema_restore$;


--
-- PostgreSQL database dump complete
--




-- ============================================================
-- SECTION: DIFF FILTER OBJECTS
-- ============================================================
-- Objects that match diff-filter.json but cannot be represented
-- precisely by pg_dump --filter.

-- auth.users trigger: on_auth_user_created
DO $pg_schema_restore$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE NOT t.tgisinternal
      AND t.tgname = 'on_auth_user_created'
      AND n.nspname = 'auth'
      AND c.relname = 'users'
  ) THEN
    EXECUTE 'CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();';
  END IF;
END
$pg_schema_restore$;

-- ============================================================
-- SECTION: STORAGE BUCKETS DATA
-- ============================================================

