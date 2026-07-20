import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import type { ChatMessage } from '@/types/types';
import { Send, Bot, User, Sparkles, Map, BarChart3, BookOpen, RefreshCw, History, Brain, DatabaseZap, Plus, Globe, GitBranch, ExternalLink, UserRound } from 'lucide-react';
import DigitalHumanPanel from '@/components/digital-human/DigitalHumanPanel';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import { consumeSse } from '@/lib/sse';
import { motion, AnimatePresence } from 'framer-motion';
import { renderMessageContent } from '@/components/common/MermaidRenderer';
import mermaid from 'mermaid';
import { useNavigate } from 'react-router-dom';
import { useDigitalHuman } from '@/contexts/DigitalHumanContext';

// 浏览器 TTS 降级播报（GPU/数字人不可用时）
function browserSpeak(text: string): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const clean = text.replace(/[*#>`\-\[\]\(\)!\[\]`]/g, '').replace(/\n{3,}/g, '\n').trim();
  const chunks = clean.match(/[^。！？\n]+[。！？\n]?/g) || [clean];
  let i = 0;
  function next() {
    if (i >= chunks.length || !chunks[i]?.trim()) return;
    const u = new SpeechSynthesisUtterance(chunks[i].trim());
    u.lang = 'zh-CN'; u.rate = 1;
    u.onend = () => { i++; next(); };
    u.onerror = () => { i++; next(); };
    window.speechSynthesis.speak(u);
  }
  next();
}

interface ImaSource { title: string; content: string; source: string; }

// 扩展消息类型，附带IMA来源 + 可视化图表数据
interface ChatMessageWithSources extends ChatMessage {
  sources?: ImaSource[];
  visualData?: { content: string; visualType: string; topic: string; upgrading?: boolean };
}

// ── 前端内置 FALLBACK 图表（与 deepseek-visual 后端保持一致，零延迟先渲染）──
const FRONTEND_FALLBACK: Record<string, (t: string) => string> = {
  mind_map: (t) => `mindmap\n  root((${t}))\n    基础概念\n      定义与特点\n      核心语法\n      使用场景\n    关键机制\n      运行原理\n      生命周期\n      内存管理\n    代码实践\n      典型案例\n      常用API\n      最佳实践\n    易错点\n      常见误区\n      调试技巧`,
  flowchart: (t) => `flowchart TD\n  subgraph 输入条件\n    A[主题: ${t}]\n    B[触发事件]\n  end\n  subgraph 核心机制\n    C[初始化]\n    D[执行主流程]\n    E[状态更新]\n  end\n  subgraph 关键判断\n    F{条件检查}\n    G{异常处理}\n  end\n  subgraph 输出反馈\n    H[返回结果]\n    I[记录日志]\n  end\n  A --> C --> D --> E --> F\n  F -->|满足| H\n  F -->|不满足| G --> D\n  H --> I`,
  sequence: (_t) => `sequenceDiagram\n  participant U as 用户\n  participant P as 画像智能体\n  participant C as 课程架构智能体\n  participant G as 资源生成智能体\n  participant R as 质量审核智能体\n  participant E as 评估智能体\n  U->>P: 输入学习目标\n  P->>C: 提供基础与薄弱点\n  C->>G: 输出知识结构\n  G->>R: 提交资源和图解\n  R->>E: 通过后进入练习评估\n  E-->>U: 返回建议与下一步路径`,
  concept: (t) => `graph TD\n  A[前置知识] --> B[${t}基础]\n  A --> C[相关概念]\n  B --> D[核心原理]\n  B --> E[关键特性]\n  D --> F[代码实践]\n  E --> F\n  F --> G[评估反馈]`,
  class_diagram: (_t) => `classDiagram\n  class Learner {\n    学习目标\n    基础水平\n    薄弱知识点\n  }\n  class Resource {\n    讲解文档\n    代码案例\n    练习题\n  }\n  class Agent {\n    画像分析\n    路径规划\n    质量审核\n  }\n  Learner --> Agent : 提供画像\n  Agent --> Resource : 生成资源\n  Resource --> Learner : 支撑训练`,
  state_diagram: (_t) => `stateDiagram-v2\n  [*] --> 输入目标\n  输入目标 --> 构建画像\n  构建画像 --> 检索知识\n  检索知识 --> 生成图解\n  生成图解 --> 路径规划\n  路径规划 --> 练习评估\n  练习评估 --> 调整建议\n  调整建议 --> [*]`,
  er_diagram: (_t) => `erDiagram\n  LEARNER ||--o{ PROFILE : owns\n  PROFILE ||--o{ GOAL : describes\n  GOAL ||--o{ KNOWLEDGE_POINT : maps\n  KNOWLEDGE_POINT ||--o{ RESOURCE : produces\n  RESOURCE ||--o{ QUIZ : supports\n  QUIZ ||--o{ EVALUATION : creates`,
  gantt: (_t) => '',
  pie: (_t) => '',
  architecture: (_t) => `flowchart LR\n  U[学生端] --> FE[前端工作台]\n  FE --> API[Edge Functions]\n  API --> RAG[个人知识库]\n  API --> LLM[DeepSeek]\n  LLM --> A1[画像智能体]\n  LLM --> A2[资源生成智能体]\n  LLM --> A3[质量审核智能体]\n  A1 --> OUT[个性化学习闭环]\n  A2 --> OUT\n  A3 --> OUT\n  RAG --> OUT`,
  compare: (t) => `graph TB\n  subgraph 方案A\n    A1[概念定义]\n    A2[适用场景]\n    A3[代码提示]\n  end\n  subgraph 方案B\n    B1[概念定义]\n    B2[适用场景]\n    B3[代码提示]\n  end\n  T[${t}对比] --> 方案A\n  T --> 方案B`,
  roadmap: (t) => `flowchart LR\n  A[基础理解] --> B[专题突破]\n  B --> C[项目实战]\n  C --> D[复盘评估]\n  A --> A1[${t}概念]\n  A --> A2[核心语法]\n  B --> B1[机制原理]\n  C --> C1[代码案例]\n  D --> D1[错题归因]`,
  journey: (_t) => `sequenceDiagram\n  participant S as 学生\n  participant P as 画像智能体\n  participant G as 资源生成智能体\n  participant E as 评估智能体\n  S->>P: 提交学习目标\n  P-->>S: 返回个性化画像\n  S->>G: 请求学习资源\n  G-->>S: 生成图解与练习\n  S->>E: 完成测评\n  E-->>S: 输出改进建议`,
};

function getFallbackChart(visualType: string, topic: string): string {
  const fn = FRONTEND_FALLBACK[visualType] || FRONTEND_FALLBACK.mind_map;
  return fn(topic);
}
// ── FastMermaidChart：直接用 ref + mermaid.render() 避免 React state 延迟循环 ──
function FastMermaidChart({ chart }: { chart: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(`mm-chat-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!divRef.current || !chart) return;
    const el = divRef.current;
    mermaid.render(idRef.current, chart).then(({ svg }) => {
      if (el) el.innerHTML = svg;
    }).catch(() => {
      if (el) el.innerHTML = `<pre style="font-size:10px;color:#888;padding:8px;overflow:auto">${chart}</pre>`;
    });
    return () => { el.innerHTML = ''; };
  }, [chart]);

  return (
    <div
      ref={divRef}
      className="w-full overflow-x-auto [&>svg]:max-w-full [&>svg]:h-auto py-2 px-2"
    />
  );
}

const VISUAL_INTENT_MAP: { keywords: string[]; visualType: string; label: string }[] = [
  { keywords: ['思维导图', 'mind map', 'mindmap', '脑图', '知识图谱'], visualType: 'mind_map', label: '思维导图' },
  { keywords: ['流程图', '流程', '步骤图', '执行流程', '处理流程'], visualType: 'flowchart', label: '流程图' },
  { keywords: ['时序图', '序列图', '交互图', 'sequence'], visualType: 'sequence', label: '时序图' },
  { keywords: ['概念图', '知识点关系', '依赖关系图', '概念关系'], visualType: 'concept', label: '概念图' },
  { keywords: ['类图', 'UML', '类关系', '继承关系图', 'class diagram'], visualType: 'class_diagram', label: '类图' },
  { keywords: ['状态图', '状态机', '状态转换', 'state diagram'], visualType: 'state_diagram', label: '状态图' },
  { keywords: ['甘特图', '学习计划图', '进度图', '时间表'], visualType: 'gantt', label: '甘特图' },
  { keywords: ['饼图', '占比图', '比例图', '分布图'], visualType: 'pie', label: '饼图' },
  { keywords: ['架构图', '系统架构', '系统图', '技术架构'], visualType: 'architecture', label: '系统架构图' },
  { keywords: ['对比图', '比较图', '对比分析', '横向对比'], visualType: 'compare', label: '对比分析' },
  { keywords: ['学习路线图', '路线图', '路径图', 'roadmap'], visualType: 'roadmap', label: '学习路线图' },
  { keywords: ['旅程图', '学习旅程', '体验地图', 'journey'], visualType: 'journey', label: '学习旅程图' },
  { keywords: ['ER图', 'ER关系', '数据库关系图', 'entity'], visualType: 'er_diagram', label: 'ER关系图' },
  { keywords: ['甘特图', '计划表'], visualType: 'gantt', label: '甘特图' },
];

// 通用图表触发词（需结合其他上下文）
const GENERIC_VISUAL_KEYWORDS = ['画个图', '生成图', '图解', '可视化', '画一张', '生成一张', '做一个图', '给我图'];

function detectVisualIntent(message: string): { visualType: string; label: string } | null {
  const lower = message.toLowerCase();
  for (const { keywords, visualType, label } of VISUAL_INTENT_MAP) {
    if (keywords.some(k => lower.includes(k.toLowerCase()))) {
      return { visualType, label };
    }
  }
  if (GENERIC_VISUAL_KEYWORDS.some(k => lower.includes(k))) {
    return { visualType: 'mind_map', label: '思维导图' };
  }
  return null;
}

// 从消息中提取主题（去除图表意图关键词后的核心内容）
function extractTopic(message: string): string {
  const cleaned = message
    .replace(/帮(我|我生成|我画|我做)?|请|生成(一(个|张|份))?|画(一(张|个))?|做(一(个|张))?|给我/g, '')
    .replace(/思维导图|流程图|时序图|概念图|类图|状态图|甘特图|饼图|架构图|对比图|学习路线图|旅程图|ER图|图解|可视化|学习计划|学习路径/g, '')
    .replace(/关于|针对|有关|的|，|,/g, ' ')
    .trim();
  return cleaned.length > 2 ? cleaned.slice(0, 40) : message.slice(0, 40);
}

const QUICK_PROMPTS = [
  { icon: Map, label: '生成学习路径', prompt: '请帮我生成一个Java从入门到精通的学习路径，包含具体的学习步骤和资源推荐。' },
  { icon: BarChart3, label: '构建学习画像', prompt: '请根据我的学习情况帮我分析构建一个学习画像，评估我在Java知识基础、学习风格、易错点等方面的情况。' },
  { icon: Sparkles, label: '生成练习题', prompt: '请为我生成5道Java面向对象编程（继承与多态）的练习题，包含选择题和填空题。' },
  { icon: BookOpen, label: '知识点解析', prompt: '请深入讲解Java中泛型的概念、使用方法和常见应用场景。' },
];

const AGENT_LABELS: Record<string, string> = {
  '画像分析师': '画像分析师',
  '课程架构师': '课程架构师',
  '资源生成师': '资源生成师',
  '路径规划师': '路径规划师',
  '评估分析师': '评估分析师',
  '质量审核师': '质量审核师',
};

function ThinkingDots() {
  return (
    <div className="flex gap-1 items-center px-1">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-2 h-2 rounded-full gradient-bg animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

function AgentTag({ content }: { content: string }) {
  const match = content.match(/\*\*\[(.+?)\]\*\*/);
  const agentName = match?.[1] || '';
  if (!agentName || !AGENT_LABELS[agentName]) return null;
  return (
    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary mb-1 h-5">
      <Brain className="w-2.5 h-2.5 mr-1" />{agentName}
    </Badge>
  );
}

export default function ChatPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessageWithSources[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const [useRag, setUseRag] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { speak: dhSpeak, isAvailable: dhAvailable, stop: dhStop } = useDigitalHuman();
  const bottomRef = useRef<HTMLDivElement>(null);

  // 朗读最后一条 AI 回复（数字人在线走 WebRTC，离线/演示模式走浏览器 TTS）
  const speakLastAssistantMessage = useCallback(() => {
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
    if (!lastAssistant?.content.trim()) return;
    const text = lastAssistant.content.trim();
    setIsSpeaking(true);
    const done = () => setIsSpeaking(false);
    if (dhAvailable) {
      dhSpeak(text).then(done).catch(done);
    } else {
      browserSpeak(text);
      // 浏览器 TTS 没有精确完成回调，按字数估算
      setTimeout(done, Math.max(text.length * 300, 2000));
    }
  }, [messages, dhAvailable, dhSpeak]);

  // 切换朗读开关：开启时立即朗读最后一条 AI 消息，关闭时停止
  const toggleAutoSpeak = useCallback(() => {
    const next = !autoSpeak;
    setAutoSpeak(next);
    if (next) {
      speakLastAssistantMessage();
    } else {
      window.speechSynthesis?.cancel();
      dhStop?.().catch(() => {});
      setIsSpeaking(false);
    }
  }, [autoSpeak, speakLastAssistantMessage, dhStop]);

  // 加载已有的会话消息或初始化会话
  const initSession = useCallback(async (sid: string) => {
    if (!user) return;
    // 创建或取已有 chat_sessions 记录
    const { data: existing } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sid)
      .maybeSingle();
    if (!existing) {
      await supabase.from('chat_sessions').insert({
        id: sid, user_id: user.id, title: '新对话', agent_type: 'chat'
      });
    }
    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sid)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (msgs) setMessages(msgs as ChatMessage[]);
  }, [user]);

  useEffect(() => { initSession(sessionId); }, [sessionId, initSession]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const startNewSession = () => {
    setMessages([]);
    setSessionId(crypto.randomUUID());
    toast.success('已开启新对话');
  };

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || sending || !user) return;
    setInput('');
    setSending(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(), user_id: user.id, session_id: sessionId,
      role: 'user', content, created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: assistantId, user_id: user.id, session_id: sessionId,
      role: 'assistant', content: '', created_at: new Date().toISOString()
    }]);

    try {
      // ── 图表意图检测：先用本地 fallback 即刻显示，后台静默升级 ─────────
      const visualIntent = detectVisualIntent(content);
      if (visualIntent) {
        const topic = extractTopic(content);
        const fallbackChart = getFallbackChart(visualIntent.visualType, topic);

        // 立即展示 fallback 图表（零延迟，无需网络）
        setMessages(prev => prev.map(m => m.id === assistantId ? {
          ...m,
          content: `**[资源生成师]** 已为「${topic}」生成${visualIntent.label}`,
          visualData: {
            content: fallbackChart,
            visualType: visualIntent.visualType,
            topic,
            upgrading: true, // 标记升级中
          },
        } : m));

        // 后台静默调用 deepseek-visual 升级为 AI 生成版本
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
        const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
        fetch(`${SUPABASE_URL}/functions/v1/deepseek-visual`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUPABASE_ANON}` },
          body: JSON.stringify({ topic, visualType: visualIntent.visualType, visualStyle: 'teaching' }),
        }).then(r => r.json()).then(data => {
          const raw: string = data?.content || '';
          const m = raw.match(/```mermaid\n([\s\S]*?)```/);
          const upgraded = m ? m[1].trim() : raw.trim();
          if (upgraded && upgraded !== fallbackChart) {
            setMessages(prev => prev.map(msg => msg.id === assistantId ? {
              ...msg,
              visualData: { content: upgraded, visualType: visualIntent.visualType, topic, upgrading: false },
            } : msg));
          } else {
            setMessages(prev => prev.map(msg => msg.id === assistantId
              ? { ...msg, visualData: { ...msg.visualData!, upgrading: false } }
              : msg));
          }
        }).catch(() => {
          // 升级失败，标记为 fallback 以便前端展示预览模式提示
          setMessages(prev => prev.map(msg => msg.id === assistantId
            ? { ...msg, visualData: { ...msg.visualData!, upgrading: false, fallback: true } }
            : msg));
        });

        if (messages.length === 0) {
          await supabase.from('chat_sessions').update({ title: content.slice(0, 30) }).eq('id', sessionId);
        }
        setSending(false);
        return;
      }

      // ── 常规 SSE 流式对话 ──────────────────────────────────────────────
      const historyMsgs = messages.slice(-12).map(m => ({ role: m.role, content: m.content }));

      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
      const streamUrl = `${SUPABASE_URL}/functions/v1/deepseek-chat-stream`;

      let usedStream = false;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error('登录会话已失效');
        const res = await fetch(streamUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: content,
            history: historyMsgs,
            sessionId,

            useRag,
          }),
        });

        if (res.ok && res.headers.get('content-type')?.includes('text/event-stream')) {
          usedStream = true;
          let sources: ImaSource[] = [];

          let fullResponse = '';
          let fullReasoning = '';
          await consumeSse(res.body!, ({ event: sseEvent, data }) => {
            if (data === '[DONE]') return;
            const parsed = JSON.parse(data);
            // 推理过程事件 (DeepSeek thinking/reasoning_content)
            if (sseEvent === 'reasoning' && parsed.delta) {
              fullReasoning += parsed.delta;
              setMessages(prev => prev.map(m => m.id === assistantId
                ? { ...m, reasoning: (m.reasoning || '') + parsed.delta }
                : m));
              return;
            }
            if (parsed.delta !== undefined) {
              fullResponse += parsed.delta;
              setMessages(prev => prev.map(m => m.id === assistantId
                ? { ...m, content: m.content + parsed.delta }
                : m));
            }
            if (parsed.sources) sources = parsed.sources;
          });
          // AI 回答完成 → 自动播报（数字人在线走 WebRTC，离线/演示模式走浏览器 TTS）
          if (autoSpeak && fullResponse.trim()) {
            setIsSpeaking(true);
            const done = () => setIsSpeaking(false);
            if (dhAvailable) dhSpeak(fullResponse.trim()).then(done).catch(done);
            else { browserSpeak(fullResponse.trim()); setTimeout(done, Math.max(fullResponse.length * 300, 2000)); }
          }
          if (sources.length) {
            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, sources } : m));
          }
        }
      } catch { /* stream 失败，降级到普通调用 */ }

      // 降级：普通 invoke
      if (!usedStream) {
        const { data, error } = await supabase.functions.invoke('deepseek-chat', {
          body: {
            messages: [...historyMsgs, { role: 'user', content }],
            sessionId, saveHistory: true, useRag,
          }
        });
        if (error) throw error;
        const reply = data?.content || '抱歉，获取回复失败，请重试。';
        setMessages(prev => prev.map(m => m.id === assistantId
          ? { ...m, content: reply, sources: data?.sources || [] }
          : m));
        if (autoSpeak && reply.trim()) {
          setIsSpeaking(true);
          const done = () => setIsSpeaking(false);
          if (dhAvailable) dhSpeak(reply.trim()).then(done).catch(done);
          else { browserSpeak(reply.trim()); setTimeout(done, Math.max(reply.length * 300, 2000)); }
        }
      }

      if (messages.length === 0) {
        await supabase.from('chat_sessions').update({ title: content.slice(0, 30) }).eq('id', sessionId);
      }
    } catch (e) {
      console.error('Chat error:', e);
      toast.error('AI回复失败，请检查网络');
      setMessages(prev => prev.filter(m => m.id !== assistantId));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)] max-w-6xl mx-auto">
      {/* 主对话区 */}
      <div className={`flex flex-col min-w-0 ${showAvatar ? 'flex-1' : 'flex-1'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">智能对话</h1>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary h-5">
              <Brain className="w-2.5 h-2.5 mr-1" />多智能体
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">协调12大智能体，支持知识问答、路径规划、资源生成</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost" size="sm"
            onClick={() => setShowAvatar(v => !v)}
            className={`h-8 text-xs ${showAvatar ? 'text-primary border border-primary/30' : 'text-muted-foreground'}`}>
            <UserRound className="w-3.5 h-3.5 mr-1" />AI教师
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={toggleAutoSpeak}
            className={`h-8 text-xs ${autoSpeak ? 'text-green-400 border border-green-400/30' : 'text-muted-foreground'}`}
            title={autoSpeak ? 'AI回答自动朗读中，点击停止' : '点击朗读最后一条AI回复并开启自动朗读'}>
            {isSpeaking ? '📢 朗读中' : (autoSpeak ? '🔊 朗读中' : '🔊 朗读')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/history')} className="text-muted-foreground h-8 text-xs">
            <History className="w-3.5 h-3.5 mr-1" /> 历史
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={() => setUseRag(v => !v)}
            className={`h-8 text-xs ${useRag ? 'text-primary border border-primary/30' : 'text-muted-foreground'}`}>
            <DatabaseZap className="w-3.5 h-3.5 mr-1" />知识库
          </Button>
          <Button variant="ghost" size="sm" onClick={startNewSession} className="text-muted-foreground h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />新对话
          </Button>
        </div>
      </div>

      {/* Quick prompts */}
      {messages.length === 0 && (
        <div className="shrink-0 mb-4">
          <p className="text-xs text-muted-foreground mb-2">快捷指令</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
              <button key={label} onClick={() => sendMessage(prompt)}
                className="flex items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-muted text-left transition-all">
                <Icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pr-2">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'gradient-bg' : 'bg-muted border border-border'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-primary" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'gradient-bg text-white' : 'bg-card border border-border text-foreground'}`}>
                {msg.content === '' && msg.role === 'assistant' ? <ThinkingDots /> : (
                  msg.role === 'assistant' ? (
                    <div>
                      <AgentTag content={msg.content} />
                      {/* 可视化图表卡片（来自 deepseek-visual） */}
                      {msg.visualData ? (
                        <div className="mt-1">
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                            <GitBranch className="w-3 h-3 text-primary" />
                            来自「可视化生成工具」· {msg.visualData.topic}
                            {msg.visualData.upgrading && (
                              <span className="flex items-center gap-1 text-[10px] text-primary/60">
                                <span className="w-2.5 h-2.5 border border-primary/50 border-t-transparent rounded-full animate-spin" />
                                AI优化中…
                              </span>
                            )}
                          </p>
                          <div className="rounded-xl border border-primary/20 bg-muted/30 overflow-hidden">
                            <FastMermaidChart chart={msg.visualData.content} />
                          </div>
                          <button
                            onClick={() => navigate('/visualization')}
                            className="mt-2 flex items-center gap-1 text-[11px] text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            在可视化工具中查看更多图解
                          </button>
                        </div>
                      ) : (
                        <div>{renderMessageContent(msg.content)}</div>
                      )}
                      {/* 个人知识库来源标注 */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-border/50">
                          <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5" />知识来源（个人知识库）
                          </p>
                          <div className="space-y-1.5">
                            {msg.sources.map((s, i) => (
                              <div key={i} className="px-2.5 py-1.5 rounded-lg bg-primary/8 border border-primary/15">
                                <p className="text-[10px] font-semibold text-primary truncate">{s.title}</p>
                                <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed mt-0.5">{s.content}</p>
                                <p className="text-[9px] text-muted-foreground/60 mt-0.5">{s.source}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : msg.content
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 pt-4 border-t border-border">
        {useRag && (
          <div className="flex items-center gap-1.5 mb-2 text-xs text-primary">
            <DatabaseZap className="w-3 h-3" />
            <span>已开启知识库增强，回答将参考IMA知识库内容</span>
          </div>
        )}
        <div className="flex gap-2 items-end bg-card border border-border rounded-2xl p-3">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入学习问题，按 Enter 发送，Shift+Enter 换行…"
            className="flex-1 min-h-0 max-h-32 resize-none border-0 bg-transparent focus-visible:ring-0 p-0 text-sm"
            rows={1}
          />
          <Button onClick={() => sendMessage()} disabled={!input.trim() || sending}
            className="gradient-bg text-white h-8 w-8 p-0 rounded-xl shrink-0 disabled:opacity-40">
            {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">AI回复仅供参考，重要决策请多方核实 · 对话自动保存</p>
      </div>
      </div>

      {/* 数字人面板 */}
      {showAvatar && (
        <div className="w-80 shrink-0 hidden lg:block">
          <DigitalHumanPanel
            autoConnect={false}
            showControls={true}
            onStateChange={(s) => {/* 可接入状态追踪 */}}
          />
        </div>
      )}
    </div>
  );
}
