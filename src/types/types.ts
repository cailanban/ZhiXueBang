// 类型定义 - 对应数据库 schema
export interface Profile {
  id: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  role: 'user' | 'teacher' | 'admin';
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  cover_url?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  chapter_count: number;
  created_by?: string;
  created_at: string;
  is_published: boolean;
}

export interface Chapter {
  id: string;
  course_id: string;
  title: string;
  content?: string;
  order_num: number;
  created_at: string;
}

export interface Question {
  id: string;
  chapter_id?: string;
  course_id?: string;
  content: string;
  type: 'choice' | 'fill' | 'coding';
  options?: string[];
  answer: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  // 知识点与IMA增强字段
  topic?: string;
  knowledge_point?: string;
  ima_context?: string;
}

export interface MistakeBook {
  id: string;
  user_id: string;
  question_id?: string;
  user_answer?: string;
  status: 'unmastered' | 'mastered';
  notes?: string;
  added_at: string;
  updated_at: string;
  question?: Question;
  // 静态 JSON 课程题目数据（无 question_id 时使用）
  question_data?: {
    content: string;
    options?: string[];
    answer?: unknown;
    explanation?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    type?: 'choice' | 'fill' | 'coding' | string;
  };
  course_id?: string;
  topic_id?: string;
  topic_title?: string;
  correct_answer?: string;
  explanation?: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  course_id?: string;
  chapter_id?: string;
  created_at: string;
  updated_at: string;
  course?: { title: string };
  chapter?: { title: string };
}

export interface LearningProgress {
  id: string;
  user_id: string;
  course_id: string;
  chapter_id?: string;
  completed_chapters: number;
  total_chapters: number;
  last_studied_at?: string;
  course?: Course;
}

export interface LearningRecord {
  id: string;
  user_id: string;
  course_id?: string;
  chapter_id?: string;
  duration_minutes: number;
  recorded_at: string;
  course?: { title: string };
  chapter?: { title: string };
}

export interface LearningProfile {
  id: string;
  user_id: string;
  knowledge_base: number;
  cognitive_style: number;
  learning_preference: number;
  error_prone: number;
  learning_goal: number;
  learning_pace: number;
  weak_points: string[];
  suggestions: string[];
  updated_at: string;
  // 实时AI画像字段
  profile_data?: Record<string, string>;
  last_analysis_at?: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string; // DeepSeek 推理过程 (thinking/reasoning_content)
  images?: string[];
  created_at: string;
}

export interface KnowledgeFile {
  id: string;
  user_id: string;
  name: string;
  file_url?: string;
  ima_file_id?: string;
  content_text?: string | null;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  attempted_at: string;
}
