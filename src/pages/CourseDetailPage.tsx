import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getCourse, getChapters, getQuestions, upsertLearningProgress, submitQuizAttempt, addMistake, addLearningRecord } from '@/services/api';
import type { Course, Chapter, Question } from '@/types/types';
import { ArrowLeft, RefreshCw, Loader2, Brain, DatabaseZap, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import ReactMarkdown from 'react-markdown';
import DigitalHumanPanel from '@/components/digital-human/DigitalHumanPanel';
import { useActiveLearningTimer } from '@/hooks/useActiveLearningTimer';
import ResourcePosterWall from '@/components/ResourcePosterWall';

// ── 解析章节 markdown → 知识点列表 ──────────────────────────────────
interface TopicSection {
  title: string;
  content: string;
  idx: number;
}

function parseTopics(md: string): TopicSection[] {
  if (!md) return [];
  const sections = md.split(/^---\s*$/m);
  return sections.map((sec, idx) => {
    const lines = sec.trim().split('\n');
    const titleLine = lines.find(l => l.startsWith('## '));
    const title = titleLine ? titleLine.replace(/^## /, '').trim() : `知识点 ${idx + 1}`;
    const content = lines.filter(l => !l.startsWith('## ')).join('\n').trim();
    return { title, content, idx };
  }).filter(s => s.title && s.content);
}

// 每个知识点的分节（按 ## 标题拆成 lesson-section 卡片）
interface LessonSection { title: string; body: string; }

function splitLessonSections(raw: string): LessonSection[] {
  if (!raw) return [{ title: '学习说明', body: '暂无知识点内容。' }];
  const parts: LessonSection[] = [];
  let cur: LessonSection = { title: '核心导读', body: '' };
  raw.split('\n').forEach(line => {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) { if (cur.body.trim()) parts.push(cur); cur = { title: m[1].trim(), body: '' }; }
    else cur.body += line + '\n';
  });
  if (cur.body.trim()) parts.push(cur);
  const rank = (t: string) => {
    if (/概念|理解|导读/.test(t)) return 10;
    if (/原理|机制|剖析/.test(t)) return 20;
    if (/应用|场景|易错/.test(t)) return 30;
    if (/实例|案例|代码|演示/.test(t)) return 90;
    return 50;
  };
  return (parts.length ? parts : [{ title: '知识点详解', body: raw }])
    .map(p => ({ title: p.title.replace(/[一二三四五六七八九十、.]/g, '').trim() || '知识点详解', body: p.body.trim() }))
    .filter(p => p.body)
    .sort((a, b) => rank(a.title) - rank(b.title))
    .slice(0, 6);
}

function sectionClass(sec: LessonSection): string {
  if (/实例|案例|代码|演示/.test(sec.title)) return 'lesson-section example';
  if (/应用|场景|总结|复盘/.test(sec.title)) return 'lesson-section full';
  return 'lesson-section';
}

function questionTypeName(type: string): string {
  const map: Record<string, string> = {
    choice: '选择题', fill: '填空题', coding: '编程题',
    single_choice: '单选题', true_false: '判断题', fill_blank: '填空题', comprehensive: '综合题',
  };
  return map[type] || '练习题';
}

function formatAnswer(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined || value === '') return '未作答';
  if (typeof value === 'boolean') return value ? '正确' : '错误';
  if (typeof value === 'number') return String.fromCharCode(65 + value);
  return String(value);
}

// ── 错题本条目类型 ──────────────────────────────────────────────────
interface MistakeEntry {
  id: string;
  question_id: string;
  user_answer: string;
  correct_answer?: string;
  question?: Question;
  topic_title?: string;
}

type InternalView = 'content' | 'quiz' | 'mistakes';

export default function CourseDetailPage() {
  const consumeActiveMinutes = useActiveLearningTimer();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [activeTopicIdx, setActiveTopicIdx] = useState(0);
  const [internalView, setInternalView] = useState<InternalView>('content');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>([]);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<{ score: number; feedback: string } | null>(null);

  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [mistakesLoading, setMistakesLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [completedChapters, setCompletedChapters] = useState(new Set<string>());
  const [chapterAiContent, setChapterAiContent] = useState<Record<string, string>>({});
  const [regenerating, setRegenerating] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [topicMastery, setTopicMastery] = useState(0);


  const activeChapter = chapters.find(c => c.id === activeChapterId) ?? null;

  const topics = useMemo<TopicSection[]>(() => {
    if (!activeChapter?.content) return [];
    return parseTopics(activeChapter.content);
  }, [activeChapter]);

  const activeTopic = topics[activeTopicIdx] ?? null;

  useEffect(() => {
    if (!profile || !activeTopic?.title) { setTopicMastery(0); return; }
    let cancelled = false;
    supabase.from('knowledge_mastery').select('mastery_level')
      .eq('user_id', profile.id).eq('knowledge_point', activeTopic.title).maybeSingle()
      .then(({ data }) => { if (!cancelled) setTopicMastery(Number(data?.mastery_level || 0)); });
    return () => { cancelled = true; };
  }, [profile, activeTopic?.title]);

  const topicQuestions = useMemo<Question[]>(() => {
    if (!activeTopic) return questions;
    const t = activeTopic.title.trim().toLowerCase();
    const filtered = questions.filter(q => q.topic?.trim().toLowerCase() === t);
    return filtered.length > 0 ? filtered : questions;
  }, [activeTopic, questions]);

  const lessonSections = useMemo<LessonSection[]>(() => {
    const raw = activeTopic?.content || activeChapter?.content || chapterAiContent[activeChapterId || ''] || '';
    return splitLessonSections(raw);
  }, [activeTopic, activeChapter, chapterAiContent, activeChapterId]);

  // 加载课程 + 章节
  useEffect(() => {
    if (!id) return;
    (async () => {
      const [c, chs] = await Promise.all([getCourse(id), getChapters(id)]);
      setCourse(c);
      setChapters(chs);
      if (chs.length > 0) setActiveChapterId(chs[0].id);
      setLoading(false);
    })();
  }, [id]);

  // 切换章节时加载题目
  useEffect(() => {
    if (!activeChapterId) return;
    setActiveTopicIdx(0);
    setInternalView('content');
    setQuizResult(null);
    getQuestions(activeChapterId).then(qs => {
      setQuestions(qs);
      setQuizAnswers(qs.map(() => null));
    });
  }, [activeChapterId]);

  // 切换知识点时重置答题
  useEffect(() => {
    setQuizResult(null);
    setInternalView('content');
    setQuizAnswers(topicQuestions.map(() => null));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTopicIdx]);

  // 章节无内容时 AI 生成
  const ensureContent = useCallback(async (chapter: Chapter) => {
    if (chapter.content || chapterAiContent[chapter.id]) return;
    try {
      const { data } = await supabase.functions.invoke('deepseek-resources', {
        body: { topic: chapter.title, resourceType: 'course_document' }
      });
      if (data?.content) setChapterAiContent(prev => ({ ...prev, [chapter.id]: data.content }));
    } catch { /* ignore */ }
  }, [chapterAiContent]);

  useEffect(() => {
    if (activeChapter) ensureContent(activeChapter);
  }, [activeChapter, ensureContent]);

  // 加载错题本
  const loadMistakes = useCallback(async () => {
    if (!profile) return;
    setMistakesLoading(true);
    try {
      const { data } = await supabase
        .from('mistake_book')
        .select('*, question:questions(*)')
        .eq('user_id', profile.id)
        .order('added_at', { ascending: false })
        .limit(40);
      setMistakes((data || []).map((m: MistakeEntry & { question?: Question }) => ({
        id: m.id,
        question_id: m.question_id,
        user_answer: m.user_answer,
        correct_answer: m.correct_answer,
        question: m.question,
        topic_title: m.question?.topic || '知识点',
      })));
    } catch { setMistakes([]); }
    finally { setMistakesLoading(false); }
  }, [profile]);

  // 提交全部练习
  const handleSubmitQuiz = async () => {
    if (!profile || quizSubmitting) return;
    setQuizSubmitting(true);
    try {
      let correct = 0;
      const results: string[] = [];
      await Promise.all(topicQuestions.map(async (q, i) => {
        const userAns = quizAnswers[i] ?? '';
        const isCorrect = userAns.trim().toUpperCase() === q.answer.trim().toUpperCase();
        if (isCorrect) correct++;
        results.push(`**${i + 1}.** ${isCorrect ? '✓ 正确' : '✗ 需复盘'}：${q.explanation || formatAnswer(q.answer) || ''}`);
        await submitQuizAttempt(profile.id, q.id, userAns, isCorrect, activeTopic?.title);
        if (!isCorrect) await addMistake(profile.id, q.id, userAns);
      }));
      const score = topicQuestions.length > 0 ? Math.round(correct / topicQuestions.length * 100) : 0;
      setQuizResult({
        score,
        feedback: `正确 ${correct}/${topicQuestions.length}。\n\n${results.join('\n\n')}`,
      });
      if (user && id && activeChapterId) {
        const weakTopics = topicQuestions
          .filter((q, i) => (quizAnswers[i] ?? '').trim().toUpperCase() !== q.answer.trim().toUpperCase())
          .map(q => q.topic || activeChapter?.title || '未知');
        supabase.functions.invoke('deepseek-profile', {
          body: { quizStats: { total: topicQuestions.length, correct, wrong: topicQuestions.length - correct, weakTopics } }
        }).catch(() => {});
        const activeMinutes = consumeActiveMinutes();
        if (activeMinutes > 0) {
          await addLearningRecord(profile.id, id, activeChapterId, activeMinutes);
        }
      }
      toast.success(`练习完成，得分 ${score} 分`);
    } catch { setQuizResult({ score: 0, feedback: '提交失败，请重试。' }); }
    finally { setQuizSubmitting(false); }
  };

  const handleCompleteChapter = async () => {
    if (!profile || !id || !activeChapterId) return;
    const newCompleted = new Set([...completedChapters, activeChapterId]);
    setCompletedChapters(newCompleted);
    await upsertLearningProgress(profile.id, id, newCompleted.size, chapters.length);
    const activeMinutes = consumeActiveMinutes();
    if (activeMinutes > 0) {
      await addLearningRecord(profile.id, id, activeChapterId, activeMinutes);
    }
    toast.success('章节完成！学习记录已保存');
    const idx = chapters.findIndex(c => c.id === activeChapterId);
    if (idx < chapters.length - 1) setActiveChapterId(chapters[idx + 1].id);
  };

  const handleRegenerate = async () => {
    if (!activeChapter || regenerating) return;
    setRegenerating(true);
    try {
      const { data } = await supabase.functions.invoke('deepseek-resources', {
        body: { topic: activeChapter.title, resourceType: 'course_document' }
      });
      if (data?.content) setChapterAiContent(prev => ({ ...prev, [activeChapter.id]: data.content }));
      toast.success('内容已重新生成');
    } catch { toast.error('内容生成失败'); }
    finally { setRegenerating(false); }
  };

  const handleViewMistakes = () => {
    loadMistakes();
    setInternalView('mistakes');
  };

  const handleRemoveMistake = async (mistakeId: string) => {
    if (!profile) return;
    try {
      await supabase.from('mistake_book').delete().eq('id', mistakeId).eq('user_id', profile.id);
      setMistakes(prev => prev.filter(m => m.id !== mistakeId));
    } catch { toast.error('移除失败'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
      <span className="spinner" />
    </div>
  );
  if (!course) return <div className="empty">课程不存在</div>;

  // ── 练习视图 ────────────────────────────────────────────────────────
  if (internalView === 'quiz') {
    return (
      <div className="view">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">{activeTopic?.title || activeChapter?.title} 练习</div>
              <div className="card-note">提交后自动进入评估链路和错题本</div>
            </div>
            <button className="btn ghost" onClick={() => setInternalView('content')}>返回课程</button>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: 12 }}>
            {topicQuestions.length === 0 ? (
              <div className="empty">当前知识点暂无练习题，请返回课程后重新进入。</div>
            ) : (
              topicQuestions.map((q, i) => (
                <div key={q.id} className="question-card">
                  <div className="question-top">
                    <div className="question-index">第 {i + 1} 题</div>
                    <span className="label">{questionTypeName(q.type)}</span>
                  </div>
                  <div className="question-body prose">{q.content}</div>
                  {q.type === 'choice' && Array.isArray(q.options) ? (
                    <div className="question-options">
                      {(q.options as string[]).map((opt, j) => {
                        const letter = String.fromCharCode(65 + j);
                        return (
                          <label key={j} className="preset option-row">
                            <input
                              type="radio"
                              name={`q${i}`}
                              value={letter}
                              checked={quizAnswers[i] === letter}
                              onChange={() => {
                                const next = [...quizAnswers];
                                next[i] = letter;
                                setQuizAnswers(next);
                              }}
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <textarea
                      className={`textarea${q.type === 'coding' ? ' code-answer' : ''}`}
                      value={quizAnswers[i] || ''}
                      onChange={e => {
                        const next = [...quizAnswers];
                        next[i] = e.target.value;
                        setQuizAnswers(next);
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
                onClick={handleSubmitQuiz}
                disabled={quizSubmitting || topicQuestions.length === 0}
              >
                {quizSubmitting ? <><Loader2 className="inline w-3 h-3 mr-1 animate-spin" />提交中…</> : '提交练习'}
              </button>
              <button className="btn ghost" onClick={handleViewMistakes}>查看错题本</button>
            </div>

            {quizResult && (
              <div className="card">
                <div className="card-head">
                  <div className="card-title">答题结果 {quizResult.score} 分</div>
                </div>
                <div className="card-body">
                  <div className="prose">
                    <ReactMarkdown>{quizResult.feedback}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── 错题本视图 ──────────────────────────────────────────────────────
  if (internalView === 'mistakes') {
    return (
      <div className="view">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">错题本</div>
              <div className="card-note">按当前账号保存，完成练习后未掌握的题目自动进入</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="label ok">{mistakes.length} 题</span>
              <button className="btn ghost" onClick={loadMistakes}>刷新</button>
              <button className="btn ghost" onClick={() => setInternalView('content')}>返回课程</button>
            </div>
          </div>
          <div className="card-body">
            {mistakesLoading ? (
              <div className="empty"><span className="spinner" /></div>
            ) : mistakes.length === 0 ? (
              <div className="empty">暂时没有错题。完成练习后，未掌握的题目会自动进入这里。</div>
            ) : (
              <div className="mistake-grid">
                {mistakes.map(m => (
                  <article key={m.id} className="mistake-card">
                    <div className="mistake-meta">
                      <span className="label">{m.topic_title || '知识点'}</span>
                      <button className="btn ghost" onClick={() => handleRemoveMistake(m.id)}>移除</button>
                    </div>
                    <div className="question-body prose">{m.question?.content || '题目加载中…'}</div>
                    <div className="mistake-answer">
        <div className="answer-box"><strong>我的答案</strong><br />{formatAnswer(m.user_answer)}</div>
                      <div className="answer-box"><strong>参考答案</strong><br />{formatAnswer(m.question?.answer || m.correct_answer)}</div>
                    </div>
                    {m.question?.explanation && (
                      <div className="trace-summary" style={{ borderTop: '1px solid var(--line-soft)', paddingTop: 8, marginTop: 4 }}>
                        {m.question.explanation}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── 课程内容主视图 ──────────────────────────────────────────────────
  return (
    <div className="view">
      {/* 顶部返回栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button className="btn ghost" onClick={() => navigate('/courses')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft className="w-3.5 h-3.5" />课程库
        </button>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{course.title}</span>
        <button
          onClick={() => setShowAvatar(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
            borderRadius: 8, border: '1px solid var(--line-soft)', fontSize: 12,
            color: showAvatar ? 'var(--accent)' : 'var(--muted)',
            background: showAvatar ? 'var(--accent-soft)' : 'transparent',
          }}
        >
          <UserRound style={{ width: 14, height: 14 }} />
          AI教师
        </button>
        <span className="label" style={{ marginLeft: 'auto' }}>{completedChapters.size}/{chapters.length} 章完成</span>
      </div>

      {/* course-layout: 左章节列表 | 右 topic-grid | 数字人面板 */}
      <div style={{ display: 'grid', gridTemplateColumns: showAvatar ? '260px minmax(0,1fr) 280px' : '280px minmax(0,1fr)', gap: 14 }}>

        {/* 左栏：章节列表 */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">{course.title}</div>
              <div className="card-note">选择章节查看知识点</div>
            </div>
            <button className="btn ghost" onClick={handleRegenerate} disabled={regenerating}>
              {regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            </button>
          </div>
          <div className="card-body course-list">
            {chapters.map((ch) => {
              const done = completedChapters.has(ch.id);
              const active = ch.id === activeChapterId;
              return (
                <button
                  key={ch.id}
                  className={`course-item${active ? ' active' : ''}`}
                  onClick={() => setActiveChapterId(ch.id)}
                >
                  <div className="preset-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {done && <span className="label ok" style={{ fontSize: 10, padding: '2px 5px' }}>✓</span>}
                    {ch.title}
                  </div>
                  <div className="preset-desc">
                    {(() => {
                      const ts = parseTopics(ch.content || '');
                      return ts.length > 0 ? `${ts.length} 个知识点` : '点击查看章节内容';
                    })()}
                  </div>
                </button>
              );
            })}
          </div>
          {activeChapterId && (
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--line-soft)' }}>
              <button className="btn primary" style={{ width: '100%' }} onClick={handleCompleteChapter}
                disabled={completedChapters.has(activeChapterId)}>
                {completedChapters.has(activeChapterId) ? '已完成本章' : '标记本章完成'}
              </button>
            </div>
          )}
        </div>

        {/* 右栏：topic-grid */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">{activeChapter?.title || '课程详情'}</div>
              <div className="card-note">知识点内容按成熟课程模板拆分，避免堆砌</div>
            </div>
          </div>
          <div className="card-body">
            {!activeChapter ? (
              <div className="empty">选择左侧章节查看知识点、题库和掌握度。</div>
            ) : topics.length === 0 ? (
              <div className="empty">
                <Brain className="inline w-5 h-5 mr-2 animate-pulse" style={{ color: 'var(--accent)' }} />
                正在加载知识点内容…
              </div>
            ) : (
              <div className="topic-grid">
                {/* 知识点导航 */}
                <div className="topic-nav">
                  <div className="topic-group">
                    <div className="topic-group-title">{activeChapter.title}</div>
                    {topics.map((t, i) => {
                      const tQs = questions.filter(q => q.topic?.trim().toLowerCase() === t.title.trim().toLowerCase());
                      return (
                        <button
                          key={i}
                          className={`topic-btn${i === activeTopicIdx ? ' active' : ''}`}
                          onClick={() => setActiveTopicIdx(i)}
                        >
                          {t.title}
                          {tQs.length > 0 && (
                            <span style={{ float: 'right', fontSize: 11, color: 'var(--accent)', marginLeft: 6 }}>{tQs.length}题</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 内容区 */}
                <div style={{ display: 'grid', gap: 12, minWidth: 0 }}>
                  {activeTopic && (
                    <div className="card">
                      <div className="card-head">
                        <div>
                          <div className="card-title">{activeTopic.title}</div>
                          <div className="card-note">
                            {topicQuestions.length} 道题
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <button className="btn primary" onClick={() => {
                            setQuizAnswers(topicQuestions.map(() => null));
                            setQuizResult(null);
                            setInternalView('quiz');
                          }}>
                            开始答题
                          </button>
                        </div>
                      </div>
                      <div className="card-body lesson-sections">
                        {lessonSections.map((sec, si) => (
                          <div key={si} className={sectionClass(sec)}>
                            <div className="section-title">{sec.title}</div>
                            <div className="prose">
                              <ReactMarkdown>{sec.body}</ReactMarkdown>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 易错点 + 掌握度 */}
                  {activeTopic && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="card">
                        <div className="card-head"><div className="card-title">易错点</div></div>
                        <div className="card-body trace-list">
                          {topicQuestions.length > 0 ? (
                            topicQuestions.slice(0, 3).map((q, qi) => (
                              <div key={qi} className="trace">
                                <div className="trace-name">题型：{questionTypeName(q.type)}</div>
                                <div className="trace-summary">{q.content.slice(0, 60)}{q.content.length > 60 ? '…' : ''}</div>
                              </div>
                            ))
                          ) : (
                            <div style={{ fontSize: 12, color: 'var(--muted)', padding: '8px 0' }}>暂无易错点数据。完成练习后会自动更新。</div>
                          )}
                        </div>
                      </div>
                      <div className="card">
                        <div className="card-head"><div className="card-title">掌握度</div></div>
                        <div className="card-body">
                          <div style={{ display: 'grid', gap: 8 }}>
                            {['当前知识点掌握度'].map((dim) => {
                              const val = Math.round(topicMastery);
                              return (
                                <div key={dim}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>
                                    <span>{dim}</span><span>{val}%</span>
                                  </div>
                                  <div style={{ height: 5, background: 'var(--line-soft)', borderRadius: 999 }}>
                                    <div style={{ height: '100%', width: `${val}%`, background: 'linear-gradient(90deg,#089981,#0ea5e9)', borderRadius: 999 }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ marginTop: 12, fontSize: 11, color: 'var(--muted)' }}>
                            <DatabaseZap className="inline w-3 h-3 mr-1" style={{ color: 'var(--accent)' }} />
                            完成练习后画像将实时更新
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTopic && (
                    <ResourcePosterWall
                      topics={[activeTopic.title, activeChapter?.title || ''].filter(Boolean)}
                      placement="course_chapter"
                      contextId={activeChapterId || undefined}
                      title="继续学习这些精选资源"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 数字人面板 */}
      {showAvatar && (
        <div className="card" style={{ height: 'fit-content', position: 'sticky', top: 14 }}>
          <div className="card-head">
            <div className="card-title">AI教师讲解</div>
            <div className="card-note">实时语音+口型同步</div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <DigitalHumanPanel
              courseId={id}
              autoConnect={false}
              showControls={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
