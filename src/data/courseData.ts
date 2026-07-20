// 课程静态数据 —— 完全照搬 ZIP backend/data/courses/*.json
import javaOop from './courses/java_oop.json';
import dataStructure from './courses/data_structure.json';
import cLang from './courses/c_lang.json';
import cet4 from './courses/cet4.json';

export interface QuizQuestion {
  type: 'single_choice' | 'true_false' | 'fill_blank' | 'comprehensive';
  question: string;
  options?: string[];
  answer?: number | boolean | string;
  explanation?: string;
}

export interface CommonMistake {
  mistake: string;
  reason: string;
  fix: string;
  memory_tip?: string;
}

export interface Topic {
  id: string;
  title: string;
  explanation?: string;
  illustration_hint?: string;
  mind_map?: string;
  common_mistakes?: CommonMistake[];
  keywords?: string[];
  questions?: QuizQuestion[];
  questions_count?: number;
}

export interface Chapter {
  id: string;
  title: string;
  topics: Topic[];
  topics_count?: number;
}

export interface CourseData {
  course_id: string;
  name: string;
  icon?: string;
  description?: string;
  level?: string;
  duration?: string;
  chapters: Chapter[];
  chapters_count?: number;
  topics_count?: number;
}

// 兜底题目（与 ZIP course_service.py _fallback_questions 完全一致）
function fallbackQuestions(topic: Topic): QuizQuestion[] {
  const title = topic.title ?? '当前知识点';
  const keywords = topic.keywords ?? [];
  const key = keywords[0] ?? title;
  const key2 = keywords[1] ?? '核心概念';
  return [
    {
      type: 'single_choice',
      question: `学习"${title}"时，最应该先确认哪一项？`,
      options: [
        `${key} 的定义、作用和使用边界`,
        '只记住一段固定代码，不理解含义',
        '跳过基础概念直接背结论',
        '只关注运行结果，不分析过程',
      ],
      answer: 0,
      explanation: `先理解 ${key} 的定义、作用和边界，后续代码和题目才有依据。`,
    },
    {
      type: 'single_choice',
      question: `关于"${title}"的学习方式，哪一种更适合形成长期掌握？`,
      options: [
        '概念梳理、代码实验、题目反馈、错题复盘结合',
        '只看答案，不动手写代码',
        '只背关键词，不看应用场景',
        '遇到报错直接跳过',
      ],
      answer: 0,
      explanation: '结构化学习需要把理解、实践和反馈串起来，单纯背答案很容易遗忘。',
    },
    {
      type: 'true_false',
      question: `判断：学习"${title}"时，只要记住关键词"${key}"即可，不需要结合代码或例子。`,
      answer: false,
      explanation: '关键词只能帮助定位，真正掌握还需要结合例子、代码和错误场景。',
    },
    {
      type: 'fill_blank',
      question: `填空："${title}"的复习可以按"概念理解 -> ______ -> 错题复盘"的顺序推进。`,
      answer: '代码实践',
      explanation: '代码实践能把抽象概念落到具体行为，再通过错题复盘补薄弱点。',
    },
    {
      type: 'comprehensive',
      question: `结合"${title}"写一个学习说明：请说明它和"${key2}"的关系、一个常见易错点，并给出一段可以用于课堂讲解的小例子。`,
      answer: `参考方向：先解释 ${title} 的作用，再说明它与 ${key2} 的联系，最后用代码或生活例子说明易错点。`,
      explanation: '综合题重点看是否能说清概念关系、易错点和应用场景。',
    },
  ];
}

function topicQuestions(topic: Topic): QuizQuestion[] {
  return topic.questions?.length ? (topic.questions as QuizQuestion[]) : fallbackQuestions(topic);
}

// 处理原始 JSON，注入 course_id / topics_count / questions_count
function processCourse(raw: Record<string, unknown>, courseId: string): CourseData {
  const chapters = (raw.chapters as Chapter[]) ?? [];
  let topicsTotal = 0;
  const processedChapters = chapters.map((ch) => {
    const topics = (ch.topics ?? []).map((tp) => ({
      ...tp,
      questions_count: topicQuestions(tp).length,
    }));
    topicsTotal += topics.length;
    return { ...ch, topics, topics_count: topics.length };
  });
  return {
    course_id: courseId,
    name: raw.name as string,
    icon: raw.icon as string | undefined,
    description: raw.description as string | undefined,
    level: raw.level as string | undefined,
    duration: raw.duration as string | undefined,
    chapters: processedChapters,
    chapters_count: processedChapters.length,
    topics_count: topicsTotal,
  };
}

export const COURSES: CourseData[] = [
  processCourse(javaOop as Record<string, unknown>, 'java_oop'),
  processCourse(dataStructure as Record<string, unknown>, 'data_structure'),
  processCourse(cLang as Record<string, unknown>, 'c_lang'),
  processCourse(cet4 as Record<string, unknown>, 'cet4'),
];

export function getCourse(courseId: string): CourseData | undefined {
  return COURSES.find((c) => c.course_id === courseId);
}

export function getTopicDetail(courseId: string, topicId: string) {
  const course = getCourse(courseId);
  if (!course) return null;
  for (const ch of course.chapters) {
    for (const tp of ch.topics) {
      if (tp.id === topicId) {
        return {
          ...tp,
          topic_id: tp.id,
          course_id: courseId,
          course_name: course.name,
          chapter_id: ch.id,
          chapter_title: ch.title,
          questions: topicQuestions(tp),
          questions_count: topicQuestions(tp).length,
        };
      }
    }
  }
  return null;
}

export { topicQuestions, fallbackQuestions };

// ── 错题本（localStorage，照搬 ZIP mistakes 存储逻辑）──
export interface MistakeEntry {
  course_id: string;
  topic_id: string;
  topic_title: string;
  question: string;
  user_answer: unknown;
  correct_answer: unknown;
  explanation: string;
  type: string;
  timestamp: string;
}

const MISTAKES_KEY = (userId: string) => `zhixuebang_mistakes_${userId}`;

export function getMistakes(userId = 'default'): MistakeEntry[] {
  try {
    const raw = localStorage.getItem(MISTAKES_KEY(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMistakes(userId = 'default', mistakes: MistakeEntry[]) {
  localStorage.setItem(MISTAKES_KEY(userId), JSON.stringify(mistakes));
}

export function addMistakes(userId = 'default', newEntries: MistakeEntry[]) {
  const existing = getMistakes(userId);
  for (const entry of newEntries) {
    if (!existing.some((e) => e.question === entry.question && e.topic_id === entry.topic_id)) {
      existing.push(entry);
    }
  }
  saveMistakes(userId, existing);
}

export function removeMistake(userId = 'default', index: number) {
  const existing = getMistakes(userId);
  existing.splice(index, 1);
  saveMistakes(userId, existing);
}

// ── 答题记录 / 掌握度（localStorage）──
interface QuizRecord {
  course_id: string;
  topic_id: string;
  score: number;
  correct: number;
  total: number;
  results: { type: string; is_correct: boolean }[];
  timestamp: string;
}

const QUIZ_KEY = (userId: string, topicId: string) =>
  `zhixuebang_quiz_${userId}_${topicId}`;

export function saveQuizRecord(userId = 'default', record: QuizRecord) {
  localStorage.setItem(QUIZ_KEY(userId, record.topic_id), JSON.stringify(record));
}

export function getQuizRecord(userId = 'default', topicId: string): QuizRecord | null {
  try {
    const raw = localStorage.getItem(QUIZ_KEY(userId, topicId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export interface MasteryDimensions {
  [key: string]: number;
  概念理解: number;
  应用能力: number;
  分析能力: number;
  综合能力: number;
  记忆准确度: number;
}

export function getMastery(userId = 'default', topicId: string): MasteryDimensions {
  const record = getQuizRecord(userId, topicId);
  const dims: MasteryDimensions = { 概念理解: 0, 应用能力: 0, 分析能力: 0, 综合能力: 0, 记忆准确度: 0 };
  if (!record) return dims;

  const typeScores: Record<string, { correct: number; total: number }> = {};
  for (const r of record.results) {
    if (!typeScores[r.type]) typeScores[r.type] = { correct: 0, total: 0 };
    typeScores[r.type].total++;
    if (r.is_correct) typeScores[r.type].correct++;
  }

  const pct = (t: string) =>
    typeScores[t] ? Math.round((typeScores[t].correct / typeScores[t].total) * 100) : 0;

  dims.概念理解 = pct('single_choice');
  dims.记忆准确度 = Math.max(pct('single_choice'), pct('true_false'));
  dims.应用能力 = pct('fill_blank');
  dims.分析能力 = pct('comprehensive');
  dims.综合能力 = pct('comprehensive');

  // 总分兜底
  const overall = record.score;
  (Object.keys(dims) as (keyof MasteryDimensions)[]).forEach((k) => {
    dims[k] = Math.max(dims[k], overall);
  });

  return dims;
}

// ── 答案检查（照搬 _check_answer 逻辑）──
export function checkAnswer(userAns: unknown, correctAns: unknown, qType: string): boolean {
  if (userAns === null || userAns === undefined || userAns === '') return false;
  if (qType === 'single_choice') {
    if (typeof correctAns === 'number') {
      if (typeof userAns === 'number') return userAns === correctAns;
      if (typeof userAns === 'string')
        return userAns.trim().toUpperCase() === String.fromCharCode(65 + correctAns);
    }
    return String(userAns).trim().toUpperCase() === String(correctAns).trim().toUpperCase();
  }
  if (qType === 'true_false') {
    if (typeof userAns === 'boolean') return userAns === correctAns;
    if (typeof userAns === 'string') {
      const ua = userAns.trim().toLowerCase();
      return correctAns
        ? ['true', '对', '正确', 't'].includes(ua)
        : ['false', '错', '错误', 'f'].includes(ua);
    }
    return false;
  }
  if (qType === 'fill_blank') {
    const ua = String(userAns).trim().toLowerCase().replace(/\s/g, '');
    const ca = String(correctAns).trim().toLowerCase().replace(/\s/g, '');
    return ua === ca || ca.includes(ua) || ua.includes(ca);
  }
  if (qType === 'comprehensive') {
    return typeof userAns === 'string' && userAns.trim().length > 10;
  }
  return false;
}
