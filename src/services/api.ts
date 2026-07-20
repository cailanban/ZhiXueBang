import { supabase } from '@/db/supabase';
import type { Note, MistakeBook, LearningProgress, LearningRecord, LearningProfile, ChatMessage, KnowledgeFile, QuizAttempt, Course, Chapter, Question, Profile } from '@/types/types';

// ---- PROFILES ----
export async function getProfile(userId: string) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  return data as Profile | null;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { error } = await supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', userId);
  return error;
}

// ---- COURSES ----
export async function getCourses(limit = 20, offset = 0) {
  const { data } = await supabase.from('courses').select('*').eq('is_published', true).order('created_at', { ascending: false }).range(offset, offset + limit - 1);
  return Array.isArray(data) ? data as Course[] : [];
}

export interface CourseWithStats extends Course {
  question_count: number;
  topic_count: number;
}

export async function getCoursesWithStats(limit = 20): Promise<CourseWithStats[]> {
  const { data: courses } = await supabase.from('courses').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(limit);
  if (!Array.isArray(courses) || courses.length === 0) return [];

  // 并行获取题目数和知识点数
  const ids = courses.map(c => c.id);
  const [{ data: qData }, { data: chData }] = await Promise.all([
    supabase.from('questions').select('course_id').in('course_id', ids),
    supabase.from('chapters').select('course_id, content').in('course_id', ids),
  ]);

  const qCount: Record<string, number> = {};
  const topicCount: Record<string, number> = {};
  (qData || []).forEach((q: { course_id: string }) => { qCount[q.course_id] = (qCount[q.course_id] || 0) + 1; });
  (chData || []).forEach((ch: { course_id: string; content?: string }) => {
    const matches = (ch.content || '').match(/^## /gm);
    topicCount[ch.course_id] = (topicCount[ch.course_id] || 0) + (matches ? matches.length : 0);
  });

  return courses.map(c => ({
    ...c,
    question_count: qCount[c.id] || 0,
    topic_count: topicCount[c.id] || 0,
  })) as CourseWithStats[];
}

export async function getCourse(id: string) {
  const { data } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
  return data as Course | null;
}

export async function getChapters(courseId: string) {
  const { data } = await supabase.from('chapters').select('*').eq('course_id', courseId).order('order_num', { ascending: true });
  return Array.isArray(data) ? data as Chapter[] : [];
}

export async function getQuestions(chapterId: string) {
  const { data } = await supabase.from('questions').select('*').eq('chapter_id', chapterId).order('created_at', { ascending: true });
  return Array.isArray(data) ? data as Question[] : [];
}

export async function getAllCourseQuestions(courseId: string) {
  const { data } = await supabase.from('questions').select('*').eq('course_id', courseId).order('created_at', { ascending: true });
  return Array.isArray(data) ? data as Question[] : [];
}

// ---- LEARNING PROGRESS ----
export async function getLearningProgress(userId: string) {
  const { data } = await supabase.from('learning_progress').select('*, course:courses(title, category, difficulty, chapter_count)').eq('user_id', userId).order('last_studied_at', { ascending: false }).limit(20);
  return Array.isArray(data) ? data as LearningProgress[] : [];
}

export async function upsertLearningProgress(userId: string, courseId: string, completedChapters: number, totalChapters: number) {
  const { error } = await supabase.from('learning_progress').upsert({
    user_id: userId, course_id: courseId, completed_chapters: completedChapters, total_chapters: totalChapters, last_studied_at: new Date().toISOString()
  }, { onConflict: 'user_id,course_id' });
  return error;
}

export async function getLearningRecords(userId: string, days?: number) {
  let query = supabase.from('learning_records').select('*, course:courses(title), chapter:chapters(title)').eq('user_id', userId).order('recorded_at', { ascending: false }).limit(100);
  if (days) {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    query = query.gte('recorded_at', since);
  }
  const { data } = await query;
  return Array.isArray(data) ? data as LearningRecord[] : [];
}

export async function addLearningRecord(userId: string, courseId: string | null, chapterId: string | null, minutes: number) {
  const { error } = await supabase.from('learning_records').insert({ user_id: userId, course_id: courseId || null, chapter_id: chapterId || null, duration_minutes: minutes });
  return error;
}

// ---- NOTES ----
export async function getNotes(userId: string, limit = 50, offset = 0) {
  const { data } = await supabase.from('notes').select('*, course:courses(title), chapter:chapters(title)').eq('user_id', userId).order('updated_at', { ascending: false }).range(offset, offset + limit - 1);
  return Array.isArray(data) ? data as Note[] : [];
}

export async function createNote(userId: string, title: string, content: string, tags: string[], courseId?: string, chapterId?: string) {
  const { data, error } = await supabase.from('notes').insert({ user_id: userId, title, content, tags, course_id: courseId || null, chapter_id: chapterId || null }).select().maybeSingle();
  return { data, error };
}

export async function updateNote(noteId: string, updates: { title?: string; content?: string; tags?: string[] }) {
  const { error } = await supabase.from('notes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', noteId);
  return error;
}

export async function deleteNote(noteId: string) {
  const { error } = await supabase.from('notes').delete().eq('id', noteId);
  return error;
}

// ---- MISTAKE BOOK ----
export async function getMistakeBook(userId: string, limit = 50, offset = 0) {
  const { data } = await supabase.from('mistake_book').select('*, question:questions(*), question_data, course_id, topic_id, topic_title, correct_answer, explanation').eq('user_id', userId).order('added_at', { ascending: false }).range(offset, offset + limit - 1);
  return Array.isArray(data) ? data as MistakeBook[] : [];
}

export async function addMistake(userId: string, questionId: string, userAnswer: string) {
  const { error } = await supabase.from('mistake_book').upsert({ user_id: userId, question_id: questionId, user_answer: userAnswer, status: 'unmastered', updated_at: new Date().toISOString() }, { onConflict: 'user_id,question_id' });
  return error;
}

// 添加来自静态 JSON 课程的错题（无 question_id，使用 question_data 存储完整题目）
export async function addMistakeFromStatic(userId: string, payload: {
  question_data: Record<string, unknown>;
  user_answer: unknown;
  correct_answer: unknown;
  explanation?: string;
  course_id?: string;
  topic_id?: string;
  topic_title?: string;
}) {
  const { error } = await supabase.from('mistake_book').insert({
    user_id: userId,
    question_id: null,
    question_data: payload.question_data,
    user_answer: JSON.stringify(payload.user_answer),
    correct_answer: payload.correct_answer ? JSON.stringify(payload.correct_answer) : null,
    explanation: payload.explanation,
    course_id: payload.course_id,
    topic_id: payload.topic_id,
    topic_title: payload.topic_title,
    status: 'unmastered',
  });
  return error;
}

export async function updateMistakeStatus(mistakeId: string, status: 'mastered' | 'unmastered') {
  const { error } = await supabase.from('mistake_book').update({ status, updated_at: new Date().toISOString() }).eq('id', mistakeId);
  return error;
}

export async function deleteMistake(mistakeId: string) {
  const { error } = await supabase.from('mistake_book').delete().eq('id', mistakeId);
  return error;
}

// ---- QUIZ ATTEMPTS ----
export async function submitQuizAttempt(userId: string, questionId: string, userAnswer: string, isCorrect: boolean, topicName?: string) {
  const payload: Record<string, unknown> = { user_id: userId, question_id: questionId, user_answer: userAnswer, is_correct: isCorrect };
  if (topicName) payload.topic_name = topicName;
  const { error } = await supabase.from('quiz_attempts').insert(payload);
  return error;
}

// ---- LEARNING PROFILE ----
export async function getLearningProfile(userId: string) {
  const { data } = await supabase.from('learning_profiles').select('*').eq('user_id', userId).maybeSingle();
  return data as LearningProfile | null;
}

export async function upsertLearningProfile(userId: string, updates: Partial<LearningProfile>) {
  const { error } = await supabase.from('learning_profiles').upsert({ user_id: userId, ...updates, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  return error;
}

// ---- CHAT ----
export async function getChatMessages(userId: string, sessionId: string) {
  const { data } = await supabase.from('chat_messages').select('*').eq('user_id', userId).eq('session_id', sessionId).order('created_at', { ascending: true }).limit(200);
  return Array.isArray(data) ? data as ChatMessage[] : [];
}

export async function saveChatMessage(userId: string, sessionId: string, role: 'user' | 'assistant', content: string, images?: string[]) {
  const { error } = await supabase.from('chat_messages').insert({ user_id: userId, session_id: sessionId, role, content, images: images || null });
  return error;
}

// ---- KNOWLEDGE FILES ----
export async function getKnowledgeFiles(userId: string) {
  const { data } = await supabase.from('knowledge_files').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
  return Array.isArray(data) ? data as KnowledgeFile[] : [];
}

export async function addKnowledgeFile(userId: string, name: string, fileUrl?: string, imaFileId?: string) {
  const { error } = await supabase.from('knowledge_files').insert({ user_id: userId, name, file_url: fileUrl || null, ima_file_id: imaFileId || null });
  return error;
}

export async function deleteKnowledgeFile(fileId: string) {
  const { error } = await supabase.from('knowledge_files').delete().eq('id', fileId);
  return error;
}

// ---- ADMIN ----
export async function getAllProfiles(limit = 50, offset = 0) {
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).range(offset, offset + limit - 1);
  return Array.isArray(data) ? data as Profile[] : [];
}
