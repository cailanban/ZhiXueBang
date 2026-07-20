/**
 * 课程学习页 —— 完全照搬 ZIP frontend/index.html 课程学习模块
 * 包含三个视图：courses（课程+知识点）、quiz（答题）、mistakes（错题本）
 */
import { useState, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { addLearningRecord, upsertLearningProgress, addMistakeFromStatic } from '@/services/api';
import { supabase } from '@/db/supabase';
import {
  COURSES, getTopicDetail, topicQuestions,
  getMistakes, addMistakes, removeMistake as removeMistakeStore,
  getMastery, saveQuizRecord, checkAnswer,
} from '@/data/courseData';
import type { CourseData, Topic, QuizQuestion, MistakeEntry } from '@/data/courseData';
import { useActiveLearningTimer } from '@/hooks/useActiveLearningTimer';

// ── 工具函数（照搬 ZIP 逻辑）──────────────────────────────────────────────────

type ViewType = 'courses' | 'quiz' | 'mistakes';

const QUESTION_TYPE_NAME: Record<string, string> = {
  single_choice: '单选题',
  true_false: '判断题',
  fill_blank: '填空题',
  comprehensive: '综合题',
};

const questionTypeName = (type: string) => QUESTION_TYPE_NAME[type] ?? '练习题';

const isCodeQuestion = (q: QuizQuestion) =>
  /代码|程序|class\s|public\s|#include|struct\s|main\s*\(/.test(String(q?.question ?? ''));

function formatAnswer(value: unknown): string {
  if (value === null || value === undefined || value === '') return '未作答';
  if (typeof value === 'boolean') return value ? '正确' : '错误';
  if (typeof value === 'number') return String.fromCharCode(65 + value);
  if (Array.isArray(value)) return value.map(formatAnswer).join('、');
  return String(value);
}

interface Section { title: string; body: string }
const SECTION_RANK: Record<string, number> = {
  概念理解: 1, 原理剖析: 2, 实例演示: 3, 应用场景: 4,
};
function rankSection(title: string) {
  for (const [k, v] of Object.entries(SECTION_RANK)) if (title.includes(k)) return v;
  return 5;
}

/** 照搬 ZIP splitTopicSections */
function splitTopicSections(raw: string): Section[] {
  if (!raw) return [];
  const parts: Section[] = [];
  const re = /^#{1,3}\s+(.+)$/gm;
  let match: RegExpExecArray | null;
  let last = 0;
  let lastTitle = '';

  while ((match = re.exec(raw)) !== null) {
    if (last > 0 || lastTitle) {
      parts.push({ title: lastTitle, body: raw.slice(last, match.index).trim() });
    }
    lastTitle = match[1];
    last = match.index + match[0].length;
  }
  if (lastTitle) parts.push({ title: lastTitle, body: raw.slice(last).trim() });

  const cleaned = parts
    .map((p) => ({
      title: p.title.replace(/[一二三四五六七八九十、.]/g, '').trim() || '知识点详解',
      body: p.body.trim(),
    }))
    .filter((p) => p.body)
    .sort((a, b) => rankSection(a.title) - rankSection(b.title))
    .slice(0, 6);

  return cleaned.length ? cleaned : [{ title: '知识点详解', body: raw }];
}

function sectionClass(section: Section): string {
  const title = section.title;
  if (/实例|案例|代码|演示/.test(title)) return 'lesson-section example full';
  if (/应用|场景|总结|复盘/.test(title)) return 'lesson-section full';
  return 'lesson-section';
}

// ── Markdown 渲染（react-markdown）───────────────────────────────────────────
function MarkdownProse({ content }: { content: string }) {
  return (
    <div className="prose">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}


// ── 掌握度雷达图（Recharts，照搬 ZIP Chart.js 雷达）──────────────────────
function MasteryRadar({ dims }: { dims: Record<string, number> }) {
  const data = Object.entries(dims).map(([subject, value]) => ({ subject, value }));
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid gridType="polygon" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
        <Radar dataKey="value" stroke="#0aaea1" fill="rgba(10,174,161,0.13)" dot={{ fill: '#0aaea1', r: 3 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── 主组件 ────────────────────────────────────────────────────────────────────
export default function CoursesPage() {
  const consumeActiveMinutes = useActiveLearningTimer();
  const { profile } = useAuth();
  const userId = profile?.id ?? 'default';

  // 视图状态（照搬 ZIP currentView）
  const [view, setView] = useState<ViewType>('courses');

  // 课程状态
  const [selCourse, setSelCourse] = useState<CourseData | null>(() => {
    const java = COURSES.find((c) => c.name.includes('Java')) ?? COURSES[0];
    return java ?? null;
  });
  const [selTopic, setSelTopic] = useState<ReturnType<typeof getTopicDetail> | null>(null);

  // 答题状态
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<(unknown)[]>([]);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<{ score: number; feedback: string } | null>(null);

  // 掌握度刷新计数器（提交答题后 +1，强制 useMemo 重新读 localStorage）
  const [masteryRefresh, setMasteryRefresh] = useState(0);

  // 错题本
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [mistakesLoaded, setMistakesLoaded] = useState(false);

  // ── loadMistakes（照搬 ZIP）──
  const loadMistakes = useCallback(() => {
    setMistakes(getMistakes(userId));
    setMistakesLoaded(true);
  }, [userId]);

  // ── openCourse（照搬 ZIP）──
  const openCourse = useCallback((course: CourseData) => {
    setSelCourse(course);
    setSelTopic(null);
    // 自动选中第一个知识点
    const firstCh = course.chapters?.[0];
    const firstTp = firstCh?.topics?.[0];
    if (firstTp) {
      const detail = getTopicDetail(course.course_id, firstTp.id);
      setSelTopic(detail);
    }
  }, []);

  // ── selectTopic（照搬 ZIP）──
  const selectTopic = useCallback((_ch: unknown, tp: Topic) => {
    if (!selCourse) return;
    const detail = getTopicDetail(selCourse.course_id, tp.id);
    setSelTopic(detail);
  }, [selCourse]);

  // ── startQuiz（照搬 ZIP）──
  const startQuiz = useCallback(() => {
    if (!selCourse || !selTopic) return;
    const fullTopic = COURSES
      .find((c) => c.course_id === selCourse.course_id)
      ?.chapters.flatMap((ch) => ch.topics)
      .find((t) => t.id === selTopic.topic_id);
    const qs = fullTopic ? topicQuestions(fullTopic) : [];
    // 隐藏答案（照搬 ZIP get_topic_quiz，不返回 answer/explanation）
    const quizOnly: QuizQuestion[] = qs.map((q) => ({
      type: q.type,
      question: q.question,
      options: q.options,
    }));
    setQuizQuestions(quizOnly);
    setQuizAnswers(quizOnly.map(() => null));
    setQuizResult(null);
    setView('quiz');
  }, [selCourse, selTopic]);

  // ── submitQuiz（照搬 ZIP）──
  const submitQuiz = useCallback(async () => {
    if (!selCourse || !selTopic) return;
    setQuizSubmitting(true);
    try {
      // 取完整题目（含答案），照搬 ZIP submit_quiz 逻辑
      const fullTopic = COURSES
        .find((c) => c.course_id === selCourse.course_id)
        ?.chapters.flatMap((ch) => ch.topics)
        .find((t) => t.id === selTopic.topic_id);
      const fullQs = fullTopic ? topicQuestions(fullTopic) : [];
      const total = fullQs.length;
      let correct = 0;
      const results: { type: string; is_correct: boolean; explanation: string; correct_answer: unknown }[] = [];
      const newMistakes: MistakeEntry[] = [];

      fullQs.forEach((q, i) => {
        const userAns = quizAnswers[i];
        const isCorrect = checkAnswer(userAns, q.answer, q.type);
        if (isCorrect) correct++;
        results.push({ type: q.type, is_correct: isCorrect, explanation: q.explanation ?? '', correct_answer: q.answer ?? null });
        if (!isCorrect) {
          newMistakes.push({
            course_id: selCourse.course_id,
            topic_id: selTopic.topic_id,
            topic_title: selTopic.title,
            question: q.question,
            user_answer: userAns,
            correct_answer: q.answer ?? null,
            explanation: q.explanation ?? '建议回到课程页复习对应知识点，再重新完成练习。',
            type: q.type,
            timestamp: new Date().toISOString(),
          });
        }
      });

      const score = total > 0 ? Math.round((correct / total) * 100) : 0;
      // 保存答题记录（掌握度用）
      saveQuizRecord(userId, {
        course_id: selCourse.course_id,
        topic_id: selTopic.topic_id,
        score,
        correct,
        total,
        results,
        timestamp: new Date().toISOString(),
      });
      // 保存错题
      if (newMistakes.length) addMistakes(userId, newMistakes);

      // 同步错题到 Supabase mistake_book（供独立错题本页使用）
      if (profile?.id && newMistakes.length) {
        try {
          for (const m of newMistakes) {
            await addMistakeFromStatic(profile.id, {
              question_data: {
                content: m.question,
                type: m.type,
                options: fullQs.find(q => q.question === m.question)?.options,
                answer: m.correct_answer,
                explanation: m.explanation,
              },
              user_answer: m.user_answer,
              correct_answer: m.correct_answer,
              explanation: m.explanation,
              course_id: m.course_id,
              topic_id: m.topic_id,
              topic_title: m.topic_title,
            });
          }
        } catch (e) {
          console.warn('同步错题到 Supabase 失败', e);
        }
      }

      // 同步写入 Supabase（供仪表盘 & 评估页使用）
      if (profile?.id) {
        try {
          const activeMinutes = consumeActiveMinutes();
          if (activeMinutes > 0) {
            await addLearningRecord(profile.id, null, null, activeMinutes);
          }
        } catch (e) {
          console.warn('Supabase sync skipped');
        }
      }

      const feedback = `正确 ${correct}/${total}。\n\n${results
        .map((r, i) => `**${i + 1}.** ${r.is_correct ? '正确' : '需复盘'}：${r.explanation || formatAnswer(r.correct_answer) || ''}`)
        .join('\n\n')}`;
      setQuizResult({ score, feedback });
      // 强制刷新掌握度雷达图
      setMasteryRefresh((n) => n + 1);
    } catch {
      setQuizResult({ score: 0, feedback: '提交失败，可返回课程页重新答题。' });
    } finally {
      setQuizSubmitting(false);
    }
  }, [selCourse, selTopic, quizAnswers, userId]);

  // ── removeMistake（照搬 ZIP）──
  const handleRemoveMistake = useCallback((index: number) => {
    removeMistakeStore(userId, index);
    setMistakes(getMistakes(userId));
  }, [userId]);

  // ── 切换视图（照搬 ZIP watch currentView）──
  const gotoView = (v: ViewType) => {
    if (v === 'mistakes') loadMistakes();
    setView(v);
  };

  // ── topic sections（照搬 ZIP topicSections computed）──
  const topicSections = useMemo(
    () => splitTopicSections(selTopic?.explanation ?? ''),
    [selTopic],
  );

  // ── mastery dims —— masteryRefresh 变化时强制重新读 localStorage ──
  const masteryDims = useMemo(
    () => selTopic ? getMastery(userId, selTopic.topic_id) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, selTopic?.topic_id, masteryRefresh],
  );
  // 是否有真实答题数据（非全零）
  const hasMasteryData = masteryDims
    ? Object.values(masteryDims).some((v) => v > 0)
    : false;

  // ────────────────────────────────────────────────────────────────────────────
  // 视图渲染
  // ────────────────────────────────────────────────────────────────────────────
  if (view === 'quiz') {
    return (
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">{selTopic?.title} 练习</div>
            <div className="card-note">提交后自动进入评估链路和错题本</div>
          </div>
          <button className="btn ghost" onClick={() => gotoView('courses')}>返回课程</button>
        </div>
        <div className="card-body" style={{ display: 'grid', gap: 12 }}>
          {!quizQuestions.length ? (
            <div className="empty">当前知识点正在生成练习题，请返回课程后重新进入。</div>
          ) : (
            quizQuestions.map((q, i) => (
              <div key={i} className="question-card">
                <div className="question-top">
                  <div className="question-index">第 {i + 1} 题</div>
                  <span className="label">{questionTypeName(q.type)}</span>
                </div>
                <div className="question-body">
                  <MarkdownProse content={q.question} />
                </div>
                {q.options ? (
                  <div className="question-options">
                    {q.options.map((opt, j) => (
                      <label key={j} className="preset option-row">
                        <input
                          type="radio"
                          name={`q${i}`}
                          value={j}
                          checked={quizAnswers[i] === j}
                          onChange={() => {
                            const a = [...quizAnswers];
                            a[i] = j;
                            setQuizAnswers(a);
                          }}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : q.type === 'true_false' ? (
                  <div className="question-options">
                    {[true, false].map((v) => (
                      <label key={String(v)} className="preset option-row">
                        <input
                          type="radio"
                          name={`q${i}`}
                          checked={quizAnswers[i] === v}
                          onChange={() => {
                            const a = [...quizAnswers];
                            a[i] = v;
                            setQuizAnswers(a);
                          }}
                        />
                        <span>{v ? '正确' : '错误'}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    className={`textarea${isCodeQuestion(q) ? ' code-answer' : ''}`}
                    value={quizAnswers[i] as string ?? ''}
                    onChange={(e) => {
                      const a = [...quizAnswers];
                      a[i] = e.target.value;
                      setQuizAnswers(a);
                    }}
                    placeholder="输入答案"
                  />
                )}
              </div>
            ))
          )}
          <div className="quiz-actions">
            <button
              className="btn primary"
              onClick={submitQuiz}
              disabled={quizSubmitting || !quizQuestions.length}
            >
              {quizSubmitting ? <><span className="spinner" style={{ marginRight: 6 }} />提交中…</> : '提交练习'}
            </button>
            <button className="btn ghost" onClick={() => gotoView('mistakes')}>查看错题本</button>
          </div>
          {quizResult && (
            <div className="card">
              <div className="card-head">
                <div className="card-title">答题结果 {quizResult.score} 分</div>
              </div>
              <div className="card-body">
                <MarkdownProse content={quizResult.feedback} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'mistakes') {
    return (
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">错题本</div>
            <div className="card-note">按当前账号保存，切换账号后互不影响</div>
          </div>
          <div className="top-actions">
            <span className="label ok">{mistakes.length} 题</span>
            <button className="btn ghost" onClick={loadMistakes}>刷新</button>
            <button className="btn ghost" onClick={() => gotoView('courses')}>返回课程</button>
          </div>
        </div>
        <div className="card-body">
          {!mistakesLoaded ? (
            <div className="empty"><span className="spinner" /></div>
          ) : mistakes.length === 0 ? (
            <div className="empty">暂时没有错题。完成练习后，未掌握的题目会自动进入这里。</div>
          ) : (
            <div className="mistake-grid">
              {mistakes.map((m, i) => (
                <article key={i} className="mistake-card">
                  <div className="mistake-meta">
                    <span className="label">{m.topic_title || '知识点'}</span>
                    <button className="btn ghost" onClick={() => handleRemoveMistake(i)}>移除</button>
                  </div>
                  <div className="question-body">
                    <MarkdownProse content={m.question} />
                  </div>
                  <div className="mistake-answer">
                    <div className="answer-box">
                      <strong>我的答案</strong><br />{formatAnswer(m.user_answer)}
                    </div>
                    <div className="answer-box">
                      <strong>参考答案</strong><br />{formatAnswer(m.correct_answer)}
                    </div>
                  </div>
                  <div className="trace-summary">
                    {m.explanation || '建议回到课程页复习对应知识点，再重新完成练习。'}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── courses view（照搬 ZIP v-if="currentView==='courses'"）──
  return (
    <div className="course-layout">
      {/* 左栏：课程库 */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">课程库</div>
            <div className="card-note">保留 Java 主线，也可展示其他课程</div>
          </div>
        </div>
        <div className="card-body course-list">
          {COURSES.map((course) => (
            <button
              key={course.course_id}
              className={`course-item${selCourse?.course_id === course.course_id ? ' active' : ''}`}
              onClick={() => openCourse(course)}
            >
              <div className="preset-title">{course.icon} {course.name}</div>
              <div className="preset-desc">{course.description}</div>
              <div className="chip-row" style={{ marginTop: 8 }}>
                <span className="chip">{course.level}</span>
                <span className="chip">{course.topics_count} 知识点</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 右栏：课程详情 */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">{selCourse?.name ?? '课程详情'}</div>
            <div className="card-note">知识点内容按成熟课程模板拆分，避免堆砌</div>
          </div>
          <button className="btn ghost" onClick={() => gotoView('mistakes')}>错题本</button>
        </div>
        <div className="card-body">
          {!selCourse ? (
            <div className="empty">选择左侧课程查看知识点、思维导图、题库和掌握度。</div>
          ) : (
            <div className="topic-grid">
              {/* 章节 / 知识点导航 */}
              <div className="topic-nav">
                {selCourse.chapters.map((ch) => (
                  <div key={ch.id} className="topic-group">
                    <div className="topic-group-title">{ch.title}</div>
                    {ch.topics.map((tp) => (
                      <button
                        key={tp.id}
                        className={`topic-btn${selTopic?.topic_id === tp.id ? ' active' : ''}`}
                        onClick={() => selectTopic(ch, tp)}
                      >
                        {tp.title}
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* 知识点详情区 */}
              <div style={{ display: 'grid', gap: 12, minWidth: 0 }}>
                {selTopic && (
                  <div className="card">
                    <div className="card-head">
                      <div>
                        <div className="card-title">{selTopic.title}</div>
                        <div className="card-note">
                          {selTopic.questions_count ?? 0} 道题 · {(selTopic.keywords ?? []).join(' / ')}
                        </div>
                      </div>
                      <button className="btn primary" onClick={startQuiz}>开始答题</button>
                    </div>
                    <div className="card-body lesson-sections">
                      {topicSections.map((section) => (
                        <div key={section.title} className={sectionClass(section)}>
                          <div className="section-title">{section.title}</div>
                          <MarkdownProse content={section.body} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* 易错点 + 掌握度 */}
                {selTopic && (
                  <div className="grid two">
                    <div className="card">
                      <div className="card-head"><div className="card-title">易错点</div></div>
                      <div className="card-body trace-list">
                        {(selTopic.common_mistakes ?? []).map((m, i) => (
                          <div key={i} className="trace">
                            <div className="trace-name">{m.mistake}</div>
                            <div className="trace-summary">原因：{m.reason}；正确做法：{m.fix}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="card">
                      <div className="card-head"><div className="card-title">掌握度</div></div>
                      <div className="card-body">
                        {hasMasteryData && masteryDims ? (
                          <MasteryRadar dims={masteryDims} />
                        ) : (
                          <div className="empty" style={{ minHeight: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>完成答题后实时更新</span>
                            <button className="btn ghost" style={{ fontSize: 12 }} onClick={startQuiz}>立即答题</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
