import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { getLearningProfile, upsertLearningProfile } from '@/services/api';
import type { LearningProfile } from '@/types/types';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { User, TrendingUp, Target, RefreshCw, AlertTriangle, Brain, DatabaseZap, Clock, Bot, Send, MessageCircle, CheckCircle2, Edit3, ArrowRight, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const DIMENSIONS = [
  { key: 'knowledge_base', label: '知识基础', desc: '基础知识掌握程度' },
  { key: 'cognitive_style', label: '认知风格', desc: '学习和思考模式' },
  { key: 'learning_preference', label: '学习偏好', desc: '偏好学习方式' },
  { key: 'error_prone', label: '易错点', desc: '常见错误掌控' },
  { key: 'learning_goal', label: '学习目标', desc: '目标明确程度' },
  { key: 'learning_pace', label: '学习节奏', desc: '学习效率与节奏' },
];

// ─── OnboardingWizard 类型定义 ───────────────────────────────────────────────
interface WizardMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  extracted?: { field: string; value: string; evidence: string; confidence: number } | null;
}

interface ExtractedField {
  field: string;
  value: string;
  evidence: string;
  confidence: number;
}

const DIMENSION_LABELS: Record<string, string> = {
  learning_goal: '学习目标',
  knowledge_base: '知识基础',
  learning_preference: '学习偏好',
  learning_pace: '学习节奏',
  error_prone: '薄弱点',
  cognitive_style: '认知风格',
};

const INTERVIEW_CONTEXT = `[画像访谈上下文 - 请严格遵循]

你是一位专业的学习画像访谈主持人。你的任务是通过5-8轮自然对话，深入了解学生的学习情况，构建个性化学习画像。

访谈维度（按优先级顺序）：
1. 学习目标：想掌握什么技能或知识？考证书还是找工作？
2. 当前水平：之前学过什么？有无编程基础？数学基础如何？
3. 学习偏好：喜欢看视频教程、阅读文档、还是动手实践？
4. 时间安排：每天能投入多少时间学习？是学生还是上班族？
5. 薄弱点：哪些概念或知识点觉得难？之前学习遇到过什么困难？
6. 认知风格：偏好先理解理论还是先动手实践？喜欢结构化学习还是自由探索？
7. 学习节奏：偏好快速推进还是稳扎稳打？

每轮对话规则：
- 每次只问一个问题，语气友好自然，像朋友聊天
- 根据学生的回答，动态调整后续问题（深入追问或切换到下一维度）
- 5轮后如果信息足够，可以开始总结
- 总共不超过8轮

回复格式：每次回复必须以有效JSON格式返回，放在单独一行，格式如下：
{"extracted":{"field":"维度名","value":"提取值","evidence":"从回答中提取的证据","confidence":0.8},"next_question":"下一轮问题"}

如果这是最后一轮，next_question设为null，并在extracted中汇总所有维度信息。
JSON之前可以有一段自然语言回应（如肯定学生的回答），但JSON必须单独成行。

field可选值：learning_goal, knowledge_base, learning_preference, learning_pace, error_prone, cognitive_style

现在请开始第一轮访谈，友好地打招呼并了解学生的学习目标。`;

// ─── 解析AI回复中的JSON提取 ────────────────────────────────────────────────
function parseAIResponse(content: string): {
  extracted: ExtractedField | null;
  nextQuestion: string | null;
  displayContent: string;
} {
  // 尝试匹配 JSON 块
  const jsonPattern = /\{[\s\S]*"extracted"[\s\S]*"next_question"[\s\S]*\}/;
  const match = content.match(jsonPattern);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      const display = content.replace(match[0], '').trim();
      return {
        extracted: parsed.extracted || null,
        nextQuestion: parsed.next_question ?? null,
        displayContent: display || parsed.next_question || content,
      };
    } catch {
      // JSON 解析失败，回退
    }
  }
  // 尝试更宽松的匹配
  const altPattern = /\{[\s\S]*"field"[\s\S]*"value"[\s\S]*\}/;
  const altMatch = content.match(altPattern);
  if (altMatch) {
    try {
      const parsed = JSON.parse(altMatch[0]);
      return {
        extracted: parsed.extracted || parsed || null,
        nextQuestion: parsed.next_question ?? null,
        displayContent: content.replace(altMatch[0], '').trim() || content,
      };
    } catch { /* ignore */ }
  }
  return { extracted: null, nextQuestion: null, displayContent: content };
}

// ─── OnboardingWizard 组件 ───────────────────────────────────────────────────
function OnboardingWizard({
  userId,
  onComplete,
}: {
  userId: string;
  onComplete: () => void;
}) {
  const [messages, setMessages] = useState<WizardMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);
  const [round, setRound] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [generatingProfile, setGeneratingProfile] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initializedRef = useRef(false);

  // 启动访谈
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    startInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 聚焦输入框
  useEffect(() => {
    if (!sending && !completed) {
      inputRef.current?.focus();
    }
  }, [sending, completed]);

  const startInterview = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('deepseek-chat', {
        body: {
          messages: [{ role: 'user', content: INTERVIEW_CONTEXT }],
          sessionId: `onboarding-${userId}`,
          saveHistory: false,
        },
      });
      if (error) throw error;

      const reply = data?.content || '';
      const { extracted, nextQuestion, displayContent } = parseAIResponse(reply);

      const aiMsg: WizardMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: displayContent || '你好！让我们开始了解你的学习情况吧。首先，能告诉我你想学习什么技能或知识吗？',
        extracted,
      };
      setMessages([aiMsg]);
      setRound(1);
    } catch (e) {
      console.error('OnboardingWizard start error:', e);
      // 回退：使用默认开场白
      setMessages([{
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '你好！我是你的AI学习画像助手。让我们通过几轮轻松的对话，了解你的学习情况，为你量身打造学习画像。\n\n首先，能告诉我你想掌握什么技能或知识吗？有什么具体的学习目标？',
        extracted: null,
      }]);
      setRound(1);
    } finally {
      setSending(false);
    }
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending || completed) return;
    setInput('');

    const userMsg: WizardMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setSending(true);

    // 添加空的 AI 消息占位
    const aiId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: aiId,
      role: 'assistant',
      content: '',
      extracted: null,
    }]);

    try {
      // 构建对话历史
      const history = newMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      // 如果已经收集了多个字段，添加总结指令
      const isLateRound = round >= 5;
      const instruction = isLateRound
        ? `${INTERVIEW_CONTEXT}\n\n当前已进行${round}轮访谈。如果信息已经足够（至少覆盖了4个维度），请在下一轮将next_question设为null并汇总所有维度。`
        : INTERVIEW_CONTEXT;

      const apiMessages = [
        { role: 'user', content: instruction },
        ...history,
      ];

      const { data, error } = await supabase.functions.invoke('deepseek-chat', {
        body: {
          messages: apiMessages,
          sessionId: `onboarding-${userId}`,
          saveHistory: false,
        },
      });
      if (error) throw error;

      const reply = data?.content || '';
      const { extracted, nextQuestion, displayContent } = parseAIResponse(reply);

      const newRound = round + 1;
      setRound(newRound);

      // 更新提取的字段
      let updatedFields = [...extractedFields];
      if (extracted?.field && extracted?.value) {
        // 检查是否已存在同维度字段，存在则更新
        const existingIdx = updatedFields.findIndex(f => f.field === extracted.field);
        if (existingIdx >= 0) {
          updatedFields[existingIdx] = extracted;
        } else {
          updatedFields.push(extracted);
        }
        setExtractedFields(updatedFields);
      }

      const isLastRound = nextQuestion === null || newRound >= 8;
      const displayText = displayContent || (isLastRound
        ? '感谢你的分享！我已经收集了足够的信息，正在为你生成学习画像…'
        : nextQuestion || '请继续…');

      setMessages(prev => prev.map(m =>
        m.id === aiId
          ? { ...m, content: displayText, extracted }
          : m
      ));

      // 如果是最后一轮，自动触发画像生成
      if (isLastRound) {
        await generateProfileFromFields(updatedFields);
      }
    } catch (e) {
      console.error('OnboardingWizard send error:', e);
      setMessages(prev => prev.map(m =>
        m.id === aiId
          ? { ...m, content: '抱歉，网络出了点问题，请重试。' }
          : m
      ));
      toast.error('发送失败，请重试');
    } finally {
      setSending(false);
    }
  };

  const generateProfileFromFields = async (fields: ExtractedField[]) => {
    setGeneratingProfile(true);
    try {
      // 构建访谈摘要
      const fieldSummary = fields
        .map(f => `[${DIMENSION_LABELS[f.field] || f.field}] ${f.value} (证据: ${f.evidence}, 置信度: ${f.confidence})`)
        .join('\n');

      const conversationSummary = messages
        .filter(m => m.role === 'user')
        .map(m => `学生: ${m.content.slice(0, 200)}`)
        .join('\n')
        .slice(0, 3000);

      const { data, error } = await supabase.functions.invoke('deepseek-profile', {
        body: {
          conversation: `[访谈式画像数据]\n${fieldSummary}\n\n[对话记录]\n${conversationSummary}`,
          quizStats: { total: 0, correct: 0, wrong: 0, weakTopics: [] },
          studyStats: { totalMinutes: 0, courseList: '', recentDays: 30 },
        },
      });
      if (error) throw error;

      if (data?.profile) {
        // 更新学习画像到数据库
        await upsertLearningProfile(userId, {
          profile_data: data.profile,
          last_analysis_at: new Date().toISOString(),
        } as Partial<LearningProfile>);
      }

      setCompleted(true);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '学习画像已生成完毕！根据我们的对话，AI已经为你构建了专属的学习画像。你可以在下方查看完整的六维分析。',
        extracted: null,
      }]);
      toast.success('学习画像已生成！');
    } catch (e) {
      console.error('Profile generation error:', e);
      toast.error('画像生成失败，请稍后重试');
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '画像生成遇到了一些问题，但不影响你继续。你可以稍后点击「AI实时更新」按钮重新生成。',
        extracted: null,
      }]);
      setCompleted(true);
    } finally {
      setGeneratingProfile(false);
    }
  };

  const handleCorrectField = (index: number) => {
    setEditingIndex(index);
    setEditValue(extractedFields[index].value);
  };

  const handleSaveCorrection = (index: number) => {
    if (!editValue.trim()) return;
    setExtractedFields(prev => prev.map((f, i) =>
      i === index ? { ...f, value: editValue.trim() } : f
    ));
    setEditingIndex(null);
    setEditValue('');
    toast.success('字段已更新');
  };

  const handleCancelCorrection = () => {
    setEditingIndex(null);
    setEditValue('');
  };

  const handleFinish = () => {
    onComplete();
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            对话式画像建档
          </CardTitle>
          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
            第 {round} 轮
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          通过5-8轮自然对话，AI将了解你的学习情况并生成个性化画像
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 已提取字段面板 */}
        {extractedFields.length > 0 && (
          <div className="bg-muted/50 rounded-xl p-3 border border-border">
            <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              已收集的画像维度 ({extractedFields.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {extractedFields.map((field, idx) => (
                <div
                  key={field.field}
                  className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs"
                >
                  {editingIndex === idx ? (
                    <div className="flex items-center gap-1">
                      <input
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="w-32 bg-transparent border-b border-primary text-foreground outline-none text-xs px-1"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveCorrection(idx);
                          if (e.key === 'Escape') handleCancelCorrection();
                        }}
                      />
                      <button onClick={() => handleSaveCorrection(idx)} className="text-green-500 hover:text-green-400">
                        <CheckCircle2 className="w-3 h-3" />
                      </button>
                      <button onClick={handleCancelCorrection} className="text-muted-foreground hover:text-foreground">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-primary font-medium">
                        {DIMENSION_LABELS[field.field] || field.field}
                      </span>
                      <span className="text-muted-foreground">:</span>
                      <span className="text-foreground max-w-[120px] truncate">{field.value}</span>
                      <button
                        onClick={() => handleCorrectField(idx)}
                        className="text-muted-foreground hover:text-primary transition-colors ml-0.5"
                        title="纠正"
                      >
                        <Edit3 className="w-2.5 h-2.5" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 对话消息区 */}
        <div className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
          <AnimatePresence>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                    msg.role === 'user' ? 'gradient-bg' : 'bg-muted border border-border'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'gradient-bg text-white'
                      : 'bg-card border border-border text-foreground'
                  }`}
                >
                  {msg.content === '' ? (
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <span
                          key={i}
                          className="w-2 h-2 rounded-full bg-primary animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                  )}
                  {/* 显示提取信息 */}
                  {msg.extracted && msg.role === 'assistant' && (
                    <div className="mt-2 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Edit3 className="w-2.5 h-2.5" />
                        提取: {DIMENSION_LABELS[msg.extracted.field] || msg.extracted.field} = {msg.extracted.value}
                        <span className="ml-1 text-primary/60">
                          (置信度: {Math.round(msg.extracted.confidence * 100)}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* 完成状态 */}
        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center"
          >
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">画像建档完成！</p>
            <p className="text-xs text-muted-foreground mb-3">
              AI已根据对话内容生成了你的学习画像，点击下方按钮查看。
            </p>
            <Button onClick={handleFinish} className="gradient-bg text-white text-sm" size="sm">
              <ArrowRight className="w-4 h-4 mr-1.5" />
              查看我的画像
            </Button>
          </motion.div>
        )}

        {/* 输入区 */}
        {!completed && (
          <div className="shrink-0 pt-2 border-t border-border">
            <div className="flex gap-2 items-end bg-card border border-border rounded-2xl p-3">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="输入你的回答..."
                className="flex-1 min-h-0 max-h-28 resize-none border-0 bg-transparent focus-visible:ring-0 p-0 text-sm"
                rows={1}
                disabled={sending}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending}
                className="gradient-bg text-white h-8 w-8 p-0 rounded-xl shrink-0 disabled:opacity-40"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            {generatingProfile && (
              <p className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                正在生成学习画像…
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── ProfilePage 主组件 ──────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<LearningProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, string>>({});
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const p = await getLearningProfile(user.id);
      setProfile(p);
      if (p?.profile_data) setProfileData(p.profile_data as Record<string, string>);
      setLoading(false);
    }
    load();
  }, [user]);

  // 实时更新画像：调用 deepseek-profile Edge Function（传入真实对话+课程+答题数据）
  const generateProfile = async () => {
    if (!user) return;
    setAnalyzing(true);
    try {
      // 并行拉取：最近20条对话、答题记录、学习记录、学习进度
      const [{ data: msgs }, { data: attempts }, { data: records }, { data: progress }] = await Promise.all([
        supabase.from('chat_messages').select('role, content').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('quiz_attempts').select('is_correct, question_id, attempted_at').eq('user_id', user.id).order('attempted_at', { ascending: false }).limit(100),
        supabase.from('learning_records').select('duration_minutes, recorded_at, course:courses(title)').eq('user_id', user.id).order('recorded_at', { ascending: false }).limit(50),
        supabase.from('learning_progress').select('completed_chapters, total_chapters, last_studied_at, course:courses(title)').eq('user_id', user.id).order('last_studied_at', { ascending: false }).limit(10),
      ]);

      const total = attempts?.length || 0;
      const correct = attempts?.filter((a: { is_correct: boolean }) => a.is_correct).length || 0;

      // 汇总学习时长
      const totalMinutes = (records || []).reduce((s: number, r: { duration_minutes: number }) => s + (r.duration_minutes || 0), 0);

      // 最近对话摘要
      const conversation = (msgs || []).reverse()
        .map((m: { role: string; content: string }) => `${m.role === 'user' ? '学生' : 'AI'}: ${m.content.slice(0, 120)}`)
        .join('\n').slice(0, 3000);

      // 在学课程列表
      const courseList = (progress || [])
        .map((p: { course?: { title?: string } | { title?: string }[]; completed_chapters: number; total_chapters: number }) => {
          const t = Array.isArray(p.course) ? p.course[0]?.title : p.course?.title;
          return `${t || '未知课程'}(${p.completed_chapters}/${p.total_chapters}章)`;
        })
        .join('、');

      const { data, error } = await supabase.functions.invoke('deepseek-profile', {
        body: {
          conversation,
          quizStats: { total, correct, wrong: total - correct, weakTopics: [] },
          studyStats: { totalMinutes, courseList, recentDays: 30 },
        }
      });
      if (error) throw error;
      if (data?.profile) {
        setProfileData(data.profile);
        const p = await getLearningProfile(user.id);
        if (p) { setProfile(p); if (p.profile_data) setProfileData(p.profile_data as Record<string, string>); }
        toast.success('学习画像已由AI实时更新');
      }
    } catch (e) {
      console.error(e);
      toast.error('画像分析失败，请稍后重试');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleWizardComplete = async () => {
    setShowWizard(false);
    // 重新加载画像
    if (user) {
      const p = await getLearningProfile(user.id);
      setProfile(p);
      if (p?.profile_data) setProfileData(p.profile_data as Record<string, string>);
    }
  };

  const radarData = profile ? DIMENSIONS.map(d => ({
    dimension: d.label,
    score: (profile[d.key as keyof LearningProfile] as number) || 0,
    fullMark: 100,
  })) : [];

  const avgScore = profile ? Math.round(
    DIMENSIONS.reduce((s, d) => s + ((profile[d.key as keyof LearningProfile] as number) || 0), 0) / DIMENSIONS.length
  ) : 0;

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">学习画像</h1>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary h-5">
              <Brain className="w-2.5 h-2.5 mr-1" />画像分析师
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">六维能力分析，基于真实学习数据实时生成，不含硬编码</p>
        </div>
        <div className="flex items-center gap-2">
          {profile?.last_analysis_at && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              上次更新：{new Date(profile.last_analysis_at as string).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <Button onClick={generateProfile} disabled={analyzing} variant="outline" size="sm" className="border-border h-8 text-xs">
            {analyzing ? <RefreshCw className="w-3 h-3 mr-1.5 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1.5" />}
            {analyzing ? 'AI分析中…' : 'AI实时更新'}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">{[0,1,2,3].map(i => <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />)}</div>
      ) : !profile ? (
        <>
          {/* 对话式画像建档向导 */}
          {showWizard ? (
            <OnboardingWizard userId={user?.id || ''} onComplete={handleWizardComplete} />
          ) : (
            <div className="text-center py-16">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">暂无学习画像</p>
              <div className="flex flex-col items-center gap-3">
                <Button onClick={() => setShowWizard(true)} className="gradient-bg text-white">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  对话式画像建档
                </Button>
                <span className="text-xs text-muted-foreground">或</span>
                <Button onClick={generateProfile} disabled={analyzing} variant="outline" size="sm">
                  {analyzing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Brain className="w-4 h-4 mr-2" />}
                  {analyzing ? 'AI分析中…' : '基于已有数据生成'}
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* 6-dimension score cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {DIMENSIONS.map((d, i) => {
              const val = (profile[d.key as keyof LearningProfile] as number) || 0;
              const color = val >= 80 ? '#10B981' : val >= 60 ? '#F59E0B' : '#EF4444';
              const desc = profileData[d.label] || '';
              return (
                <motion.div key={d.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="border-border glow-card h-full">
                    <CardContent className="p-3 text-center">
                      <div className="text-2xl font-bold mb-1" style={{ color }}>{val}</div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                        <div className="h-full rounded-full transition-all" style={{ width: `${val}%`, background: color }} />
                      </div>
                      <p className="text-xs font-medium text-foreground">{d.label}</p>
                      {desc ? (
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-tight">{desc}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-0.5">{d.desc}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Radar */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> 六维雷达图
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold gradient-text">{avgScore}</span>
                  <span className="text-sm text-muted-foreground">/ 100 综合得分</span>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary ml-auto">
                    <DatabaseZap className="w-2.5 h-2.5 mr-1" />实时数据
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Radar name="能力" dataKey="score" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* AI描述 */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> AI画像描述
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(profileData).length > 0 ? (
                  <div className="space-y-3">
                    {DIMENSIONS.map(d => {
                      const desc = profileData[d.label];
                      if (!desc) return null;
                      return (
                        <div key={d.key} className="flex gap-2">
                          <span className="text-xs font-semibold text-primary shrink-0 w-16">{d.label}</span>
                          <span className="text-xs text-muted-foreground leading-relaxed">{desc}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-8 text-center">点击「AI实时更新」生成画像描述</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Weak points & suggestions */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" /> 薄弱点
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(profile.weak_points || []).map((wp, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                      <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center text-xs font-bold text-destructive shrink-0">{i + 1}</div>
                      <span className="text-sm text-foreground">{wp}</span>
                    </div>
                  ))}
                  {!profile.weak_points?.length && <p className="text-sm text-muted-foreground py-4 text-center">暂无薄弱点数据，完成答题后自动更新</p>}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-primary">
                  <Target className="w-4 h-4" /> AI改进建议
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(profile.suggestions || []).map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
                      <div className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center text-xs font-bold text-white shrink-0">{i + 1}</div>
                      <span className="text-sm text-foreground">{s}</span>
                    </div>
                  ))}
                  {!profile.suggestions?.length && <p className="text-sm text-muted-foreground py-4 text-center">暂无建议，点击更新后自动生成</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}