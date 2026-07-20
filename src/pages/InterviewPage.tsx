import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  GraduationCap, Swords, Send, RefreshCw, Bot, User,
  Star, Trophy, MessageSquare, Lightbulb, ChevronRight,
} from 'lucide-react';

type SessionType = 'interview' | 'debate';
type DebateSide = 'pro' | 'con';

interface Msg { role: 'user' | 'ai'; content: string; }

const INTERVIEW_TOPICS = [
  'Java 泛型与集合框架',
  'HashMap 底层原理与扩容机制',
  'Java 多线程与并发控制',
  'JVM 内存模型与 GC 机制',
  'Spring IoC 与 AOP 原理',
  '数据库索引与事务隔离',
  '操作系统进程与线程',
];

const DEBATE_TOPICS = [
  '并发一定比串行快吗？',
  '面向对象比面向过程更好？',
  '微服务一定优于单体架构？',
  'Java 比 Python 更适合大型项目？',
  '代码注释越多越好？',
];

// 从 AI 回复提取分数
function extractScore(text: string): number | null {
  const m = text.match(/【评分[：:](\d+)分?】/);
  return m ? parseInt(m[1]) : null;
}

function ScoreRing({ score }: { score: number }) {
  const r = 36, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <motion.circle cx="44" cy="44" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 44 44)"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${dash} ${circ}` }}
          transition={{ duration: 1.2, ease: 'easeOut' }} />
        <text x="44" y="50" textAnchor="middle" fontSize="18" fontWeight="700" fill={color}>{score}</text>
      </svg>
      <span className="text-xs text-muted-foreground">综合评分</span>
    </div>
  );
}

export default function InterviewPage() {
  const { user } = useAuth();
  const [sessionType, setSessionType] = useState<SessionType>('interview');
  const [topic, setTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [debateSide, setDebateSide] = useState<DebateSide>('pro');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeTopic = customTopic.trim() || topic;
  const presetTopics = sessionType === 'interview' ? INTERVIEW_TOPICS : DEBATE_TOPICS;

  const scrollToBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

  const startSession = async () => {
    if (!activeTopic) { toast.error('请选择或输入主题'); return; }
    if (!user) return;
    setStarted(true);
    setMessages([]);
    setFinalScore(null);
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('deepseek-interview', {
        body: { sessionId, sessionType, topic: activeTopic, messages: [], side: debateSide }
      });
      if (error) throw error;
      const aiMsg: Msg = { role: 'ai', content: data.reply || '' };
      setMessages([aiMsg]);
      scrollToBottom();
    } catch (e) {
      toast.error(`启动失败：${e instanceof Error ? e.message : '请重试'}`);
      setStarted(false);
    } finally {
      setSending(false);
    }
  };

  const sendReply = useCallback(async () => {
    const content = input.trim();
    if (!content || sending || !user) return;
    setInput('');
    setSending(true);
    const userMsg: Msg = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    scrollToBottom();
    try {
      const { data, error } = await supabase.functions.invoke('deepseek-interview', {
        body: { sessionId, sessionType, topic: activeTopic, messages: newMessages, side: debateSide }
      });
      if (error) throw error;
      const reply = data.reply || '';
      const score = extractScore(reply);
      setMessages(prev => [...prev, { role: 'ai', content: reply }]);
      if (score !== null) setFinalScore(score);
      scrollToBottom();
    } catch {
      toast.error('AI 回复失败，请重试');
    } finally {
      setSending(false);
    }
  }, [input, sending, user, messages, sessionId, sessionType, activeTopic, debateSide]);

  const reset = () => {
    setStarted(false);
    setMessages([]);
    setFinalScore(null);
    setInput('');
  };

  return (
    <div className="max-w-3xl space-y-4">
      {/* 页头 */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">AI 互动评测</h1>
            <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">
              <GraduationCap className="w-2.5 h-2.5 mr-1" />新功能
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">模拟面试 · AI 辩论赛 · 自然语言评分</p>
        </div>
        {started && (
          <Button variant="outline" size="sm" onClick={reset} className="h-8 text-xs shrink-0">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />重新开始
          </Button>
        )}
      </div>

      {/* 配置面板（未开始时显示）*/}
      <AnimatePresence>
        {!started && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="rounded-2xl border border-border bg-card p-5 space-y-5">
            {/* 模式选择 */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">评测模式</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: 'interview', icon: GraduationCap, label: 'AI 模拟面试', desc: '面试官提问，你用自然语言回答，最后AI给分+解析' },
                  { key: 'debate', icon: Swords, label: 'AI 辩论赛', desc: 'AI扮演正/反方辩手，你参与辩论，思辨能力得到锻炼' },
                ] as const).map(({ key, icon: Icon, label, desc }) => (
                  <button key={key} onClick={() => setSessionType(key)}
                    className={`p-4 rounded-xl border text-left transition-all ${sessionType === key
                      ? 'border-primary bg-primary/8 shadow-sm'
                      : 'border-border hover:border-primary/40 hover:bg-muted/50'}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${sessionType === key ? 'gradient-bg' : 'bg-muted'}`}>
                        <Icon className={`w-3.5 h-3.5 ${sessionType === key ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 辩论方选择 */}
            <AnimatePresence>
              {sessionType === 'debate' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">AI 扮演立场</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: 'pro', label: '正方（AI支持）', color: 'text-emerald-500' },
                      { key: 'con', label: '反方（AI反对）', color: 'text-red-400' },
                    ] as const).map(({ key, label, color }) => (
                      <button key={key} onClick={() => setDebateSide(key)}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${debateSide === key
                          ? 'border-primary bg-primary/8' : 'border-border hover:bg-muted/50'}`}>
                        <span className={debateSide === key ? 'text-primary' : color}>{label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">AI 将持选定立场参与辩论，你持相对立场</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 主题选择 */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                {sessionType === 'interview' ? '面试知识点' : '辩论主题'}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {presetTopics.map(t => (
                  <button key={t} onClick={() => { setTopic(t); setCustomTopic(''); }}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${topic === t && !customTopic
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <Input
                placeholder="或自定义输入主题..."
                value={customTopic}
                onChange={e => { setCustomTopic(e.target.value); if (e.target.value) setTopic(''); }}
                className="h-9 text-sm bg-muted border-border"
              />
            </div>

            <Button onClick={startSession} disabled={!activeTopic || sending}
              className="w-full gradient-bg text-white h-10">
              {sending
                ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />启动中...</>
                : <><ChevronRight className="w-4 h-4 mr-2" />
                  {sessionType === 'interview' ? '开始模拟面试' : '开始辩论赛'}</>
              }
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 对话区域 */}
      <AnimatePresence>
        {started && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col"
            style={{ minHeight: 480 }}>
            {/* 顶部信息 */}
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center shrink-0">
                  {sessionType === 'interview' ? <GraduationCap className="w-3.5 h-3.5 text-white" /> : <Swords className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{activeTopic}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {sessionType === 'interview' ? 'AI 面试官 · 自然语言评分' : `AI ${debateSide === 'pro' ? '正方' : '反方'} · 思辨对话`}
                  </p>
                </div>
              </div>
              {finalScore !== null && <ScoreRing score={finalScore} />}
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 480 }}>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'gradient-bg' : 'bg-primary/15 border border-primary/20'}`}>
                    {msg.role === 'ai'
                      ? <Bot className="w-3.5 h-3.5 text-white" />
                      : <User className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'ai'
                      ? 'bg-muted text-foreground'
                      : 'bg-primary/10 border border-primary/20 text-foreground'
                  }`}>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {/* 如果AI消息含评分，突出显示 */}
                    {msg.role === 'ai' && extractScore(msg.content) !== null && (
                      <div className="mt-2 pt-2 border-t border-border flex items-center gap-2">
                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs text-amber-500 font-medium">面试结束，已生成评分</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {sending && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3 flex gap-1 items-center">
                    {[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* 输入区 */}
            <div className="p-3 border-t border-border bg-muted/20">
              <div className="flex gap-2 items-end">
                <Textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder={sessionType === 'interview' ? '输入你的回答（Enter 发送，Shift+Enter 换行）' : '输入你的辩论观点...'}
                  rows={2}
                  className="resize-none text-sm bg-background border-border flex-1 min-h-[52px]"
                />
                <Button onClick={sendReply} disabled={!input.trim() || sending}
                  size="icon" className="h-[52px] w-10 gradient-bg text-white shrink-0">
                  {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Lightbulb className="w-3 h-3 text-muted-foreground shrink-0" />
                <p className="text-[10px] text-muted-foreground">
                  {sessionType === 'interview'
                    ? '面试官会根据你的回答追问或换题，约5-6轮后给出综合评分'
                    : 'AI 辩手会针对你的观点反驳，约4-5轮后总结陈词'}
                </p>
                <Badge variant="outline" className="text-[9px] h-4 ml-auto shrink-0">
                  <MessageSquare className="w-2.5 h-2.5 mr-1" />{messages.filter(m => m.role === 'user').length} 轮
                </Badge>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
