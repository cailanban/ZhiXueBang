import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { createNote } from '@/services/api';
import { consumeSse } from '@/lib/sse';
import type { ChatMessage } from '@/types/types';
import { Send, Bot, User, Bookmark, RefreshCw, History, Brain, Plus, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { MermaidBlock, renderMessageContent } from '@/components/common/MermaidRenderer';
import DigitalHumanPanel from '@/components/digital-human/DigitalHumanPanel';
import { useDigitalHuman } from '@/contexts/DigitalHumanContext';

// 浏览器 TTS 降级
function browserSpeakTutor(text: string): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const clean = text.replace(/[*#>`\-\[\]\(\)]/g, '').replace(/\n{3,}/g, '\n').trim();
  const chunks = clean.match(/[^。！？\n]+[。！？\n]?/g) || [clean];
  let i = 0;
  function next() {
    if (i >= chunks.length || !chunks[i]?.trim()) return;
    const u = new SpeechSynthesisUtterance(chunks[i].trim());
    u.lang = 'zh-CN'; u.rate = 1;
    u.onend = () => { i++; next(); };
    window.speechSynthesis.speak(u);
  }
  next();
}

type Mode = 'auto' | 'beginner' | 'normal' | 'advanced';
type Model = 'deepseek' | 'spark';

const MODES: { key: Mode; label: string; desc: string; emoji: string }[] = [
  { key: 'auto', label: 'Auto', desc: '自动判断', emoji: '🤖' },
  { key: 'beginner', label: '零基础', desc: '从头开始', emoji: '🌱' },
  { key: 'normal', label: '普通', desc: '适中深度', emoji: '📘' },
  { key: 'advanced', label: '进阶', desc: '深度剖析', emoji: '🚀' },
];

const MODELS: { key: Model; label: string; badge: string }[] = [
  { key: 'deepseek', label: 'DeepSeek V4', badge: '深度求索' },
  { key: 'spark', label: 'Spark Pro', badge: '讯飞星火' },
];

export default function TutorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('auto');
  const [model, setModel] = useState<Model>('deepseek');
  const [topic, setTopic] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const [showAvatar, setShowAvatar] = useState(false);
  const { speak: dhSpeak, isAvailable: dhAvailable } = useDigitalHuman();
  const bottomRef = useRef<HTMLDivElement>(null);

  const initSession = useCallback(async (sid: string) => {
    if (!user) return;
    const { data: existing } = await supabase.from('chat_sessions').select('id').eq('id', sid).maybeSingle();
    if (!existing) {
      await supabase.from('chat_sessions').insert({
        id: sid, user_id: user.id, title: '诊断辅导', agent_type: 'tutor'
      });
    }
    const { data: msgs } = await supabase
      .from('chat_messages').select('*')
      .eq('session_id', sid).eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (msgs) setMessages(msgs as ChatMessage[]);
  }, [user]);

  useEffect(() => { initSession(sessionId); }, [sessionId, initSession]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const startNewSession = () => {
    setMessages([]);
    setSessionId(crypto.randomUUID());
    setTopic('');
    toast.success('已开启新辅导会话');
  };

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || sending || !user) return;
    setInput('');
    setSending(true);
    // 如果是第一条消息，记录主题
    if (messages.length === 0) setTopic(content.slice(0, 40));

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(), user_id: user.id, session_id: sessionId,
      role: 'user', content, created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    const aiId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: aiId, user_id: user.id, session_id: sessionId,
      role: 'assistant', content: '', created_at: new Date().toISOString()
    }]);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

      // deepseek-tutor SSE 流式输出
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

      const endpoint = model === 'spark' ? 'spark-tutor' : 'deepseek-tutor';
      const res = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          messages: [...history, { role: 'user', content }],
          sessionId,
          topic: topic || content.slice(0, 40),
          mode,
        }),
      });

      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      let fullResponseTutor = '';
      await consumeSse(res.body, ({ data }) => {
        if (data === '[DONE]') return;
        const parsed = JSON.parse(data);
        if (parsed.type === 'agent_trace') return;
        const delta = parsed.choices?.[0]?.delta?.content || '';
        if (delta) {
          fullResponseTutor += delta;
          setMessages(prev => prev.map(m =>
            m.id === aiId ? { ...m, content: m.content + delta } : m
          ));
        }
      });
      if (fullResponseTutor.trim()) {
        if (dhAvailable) dhSpeak(fullResponseTutor.trim());
        else browserSpeakTutor(fullResponseTutor.trim());
      }

      if (messages.length === 0) {
        await supabase.from('chat_sessions')
          .update({ title: content.slice(0, 30), topic: content.slice(0, 50) })
          .eq('id', sessionId);
      }
    } catch (e) {
      console.error('Tutor error:', e);
      toast.error('AI回复失败');
      setMessages(prev => prev.filter(m => m.id !== aiId));
    } finally {
      setSending(false);
    }
  };

  const [saving, setSaving] = useState(false);

  const saveAsNote = async () => {
    if (!user || messages.length === 0) return;
    setSaving(true);
    const aiMsgs = messages.filter(m => m.role === 'assistant').map(m => m.content);
    const content = aiMsgs.join('\n\n---\n\n');
    const title = topic || `辅导笔记 ${new Date().toLocaleDateString('zh-CN')}`;
    const { error } = await createNote(user.id, title, content, ['辅导', model]);
    if (!error) {
      toast.success('笔记已保存');
    } else {
      toast.error('保存失败');
    }
    setSaving(false);
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)] max-w-6xl mx-auto">
      {/* 主辅导区 */}
      <div className="flex flex-col min-w-0 flex-1">
      {/* Header */}
      <div className="shrink-0 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">诊断型AI辅导</h1>
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary h-5">
                <Brain className="w-2.5 h-2.5 mr-1" />诊断辅导智能体
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">教-检-进节奏 · 知识漏洞诊断 · 自适应深度</p>
          </div>
          <div className="flex gap-2 shrink-0">
            {MODELS.map(m => (
              <button key={m.key} onClick={() => setModel(m.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${model === m.key
                  ? 'gradient-bg text-white border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${m.key === 'spark' ? 'bg-orange-400' : 'bg-blue-400'}`} />
                {m.label}
              </button>
            ))}
            <Button
              variant="ghost" size="sm"
              onClick={() => setShowAvatar(v => !v)}
              className={`h-8 text-xs ${showAvatar ? 'text-primary border border-primary/30' : 'text-muted-foreground'}`}>
              <UserRound className="w-3.5 h-3.5 mr-1" />AI教师
            </Button>
            <Button variant="ghost" size="sm" onClick={saveAsNote} disabled={saving || messages.length === 0} className="text-muted-foreground text-xs h-8">
              <Bookmark className="w-3 h-3 mr-1" />
              {saving ? '保存中' : '存笔记'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/history')} className="text-muted-foreground text-xs h-8">
              <History className="w-3 h-3 mr-1" /> 历史
            </Button>
            <Button variant="ghost" size="sm" onClick={startNewSession} className="text-muted-foreground text-xs h-8">
              <Plus className="w-3 h-3 mr-1" /> 新会话
            </Button>
          </div>
        </div>
        {/* Mode selector */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {MODES.map(m => (
            <button key={m.key} onClick={() => setMode(m.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${mode === m.key
                ? 'gradient-bg text-white border-primary'
                : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}>
              <span>{m.emoji}</span> {m.label}
            </button>
          ))}
          <Badge variant="outline" className="text-xs px-3 border-border text-muted-foreground">
            适用: Java · 数学 · 算法 · 英语
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">诊断型AI辅导</h3>
            <p className="text-sm max-w-sm">输入任何学习问题，AI先诊断知识领域，然后按教-检-进节奏逐步讲解</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {['什么是Java多态？', '解释递归算法', 'TCP三次握手原理', 'Java泛型详解'].map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="px-3 py-2 rounded-lg border border-border hover:border-primary/50 text-left text-muted-foreground hover:text-foreground transition-all">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'gradient-bg' : 'bg-muted border border-border'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-primary" />}
              </div>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'gradient-bg text-white' : 'bg-card border border-border text-foreground'}`}>
                {msg.content === '' ? (
                  <div className="flex gap-1">{[0,1,2].map(i => <span key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</div>
                ) : msg.role === 'assistant' ? (
                  <div className="space-y-0">
                    {renderMessageContent(msg.content)}
                  </div>
                ) : msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 pt-4 border-t border-border">
        <div className="flex gap-2 items-end bg-card border border-border rounded-2xl p-3">
          <Textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="输入学习问题，AI将诊断知识领域并开始辅导…"
            className="flex-1 min-h-0 max-h-28 resize-none border-0 bg-transparent focus-visible:ring-0 p-0 text-sm" rows={1} />
          <Button onClick={() => sendMessage()} disabled={!input.trim() || sending}
            className="gradient-bg text-white h-8 w-8 p-0 rounded-xl shrink-0 disabled:opacity-40">
            {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">对话自动保存 · 可在历史记录中随时查看</p>
      </div>
    </div>

      {/* 数字人面板 */}
      {showAvatar && (
        <div className="w-80 shrink-0 hidden lg:block">
          <DigitalHumanPanel
            autoConnect={false}
            showControls={true}
          />
        </div>
      )}
    </div>
  );
}
