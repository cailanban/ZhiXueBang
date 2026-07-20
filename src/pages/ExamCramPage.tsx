import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Upload, RefreshCw, Loader2, Zap, BookOpen, Brain, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import ReactMarkdown from 'react-markdown';
import { consumeSse } from '@/lib/sse';
import ResourcePosterWall from '@/components/ResourcePosterWall';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface ExamMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sourceLabels?: { text: string; label: string }[];
}

export default function ExamCramPage() {
  const [messages, setMessages] = useState<ExamMessage[]>([{
    id: 'intro',
    role: 'system',
    content: '👋 我是**极速备考教练**。\n\n告诉我你要备考的科目，上传复习资料（大纲/教材/重点），我会帮你：\n1. 📅 拆解复习计划\n2. 📖 按章节逐章授课\n3. ✍️ 关卡测验与判分\n4. 📊 进度追踪与错题复盘\n\n准备好了就开始吧！',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(0);
  const [mode, setMode] = useState<'full' | 'quiz'>('full');
  const [studyMaterial, setStudyMaterial] = useState('');
  const [uploading, setUploading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamAbortRef = useRef<AbortController | null>(null);

  useEffect(() => () => streamAbortRef.current?.abort(), []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // 文件上传
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const texts: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const text = await file.text();
        texts.push(`[${file.name}]\n${text.slice(0, 3000)}`);
      }
      const materialText = texts.join('\n\n---\n\n');
      setStudyMaterial(materialText);
      toast.success(`已读取 ${files.length} 个文件`);
    } catch {
      toast.error('文件读取失败，请尝试 txt/md 格式');
    } finally {
      setUploading(false);
    }
  }, []);

  // 发送消息
  const sendMessage = async (overrideMsg?: string) => {
    const content = overrideMsg || input.trim();
    if (!content || loading) return;

    const userMsg: ExamMessage = { id: Date.now().toString(), role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      streamAbortRef.current?.abort();
      const abortController = new AbortController();
      streamAbortRef.current = abortController;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('登录状态已失效，请重新登录');

      const streamUrl = `${SUPABASE_URL}/functions/v1/deepseek-exam-cram`;
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

      const res = await fetch(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          message: content,
          history,
          studyMaterial,
          phase,
          mode,
        }),
        signal: abortController.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`请求失败: ${errText}`);
      }

      let fullContent = '';
      if (!res.body) throw new Error('无响应体');
      await consumeSse(res.body, ({ data }) => {
        const parsed = JSON.parse(data);
        if (parsed.error) throw new Error(parsed.error);
        if (!parsed.delta) return;
        fullContent += parsed.delta;
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: fullContent } : m
        ));
      });
    } catch (e: any) {
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: `❌ 请求失败: ${e.message || '请重试'}` } : m
      ));
    } finally {
      streamAbortRef.current = null;
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (<>
    <div style={{ display: 'flex', gap: 14, height: 'calc(100vh - 140px)' }}>
      {/* 左侧聊天区 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* 顶部工具栏 */}
        <div className="card" style={{ marginBottom: 12, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <label className="btn ghost" style={{ cursor: 'pointer', gap: 6, display: 'flex', alignItems: 'center' }}>
            <Upload className="w-3.5 h-3.5" />
            {uploading ? '读取中...' : studyMaterial ? `已上传 (${studyMaterial.length}字)` : '上传资料'}
            <input type="file" multiple accept=".txt,.md,.json,.csv" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
          <button className="btn ghost" onClick={() => setMode(mode === 'quiz' ? 'full' : 'quiz')}>
            <Zap className={`w-3.5 h-3.5 ${mode === 'quiz' ? 'text-orange-500' : ''}`} />
            {mode === 'quiz' ? '测验模式' : '授课模式'}
          </button>
          {phase > 0 && <span className="chip">第 {phase} 阶段</span>}
          <button className="btn ghost" onClick={() => { setMessages([messages[0]]); setPhase(0); setStudyMaterial(''); }}>
            <RefreshCw className="w-3.5 h-3.5" /> 重置
          </button>
        </div>

        {/* 聊天消息 */}
        <div className="card" ref={chatRef} style={{ flex: 1, overflow: 'auto', padding: 16, marginBottom: 12 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ marginBottom: 20 }}>
              {msg.role === 'system' && (
                <div style={{ background: 'var(--primary-muted, rgba(79,70,229,0.08))', borderRadius: 10, padding: '12px 16px' }}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              )}
              {msg.role === 'user' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{
                    background: 'var(--primary, #4f46e5)', color: '#fff',
                    borderRadius: '10px 10px 0 10px', padding: '10px 16px',
                    maxWidth: '75%', wordBreak: 'break-word',
                  }}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              )}
              {msg.role === 'assistant' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'var(--primary, #4f46e5)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, flexShrink: 0,
                  }}>🎓</div>
                  <div style={{
                    background: 'var(--bg-card, #f8fafc)', borderRadius: '0 10px 10px 10px',
                    padding: '10px 16px', maxWidth: '85%', wordBreak: 'break-word',
                  }}>
                    {msg.content ? (
                      <ReactMarkdown
                        components={{
                          strong: ({ children }) => {
                            const text = String(children);
                            if (text.includes('🟢') || text.includes('🟡') || text.includes('⚠️')) {
                              return <strong style={{ color: 'var(--primary, #4f46e5)' }}>{children}</strong>;
                            }
                            return <strong>{children}</strong>;
                          },
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0' }}>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>极速备考教练正在思考...</span>
            </div>
          )}
        </div>

        {/* 输入框 */}
        <div className="card" style={{ padding: 10, display: 'flex', gap: 8 }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题，或上传复习资料后发送「开始复习」..."
            rows={2}
            disabled={loading}
            style={{
              flex: 1, resize: 'none', border: 'none', outline: 'none',
              background: 'transparent', fontSize: 14, fontFamily: 'inherit',
              padding: '6px 4px',
            }}
          />
          <button className="btn primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 右侧快速操作 */}
      <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="card" style={{ padding: 14 }}>
          <div className="card-title" style={{ fontSize: 13, marginBottom: 10 }}>快速开始</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {studyMaterial ? (
              <>
                <button className="btn ghost" onClick={() => sendMessage('开始复习，请先生成复习计划')}>
                  <ChevronRight className="w-3 h-3" /> 生成备考计划
                </button>
                <button className="btn ghost" onClick={() => sendMessage('从第一章开始授课')}>
                  <BookOpen className="w-3 h-3" /> 开始第一章
                </button>
                <button className="btn ghost" onClick={() => { setMode('quiz'); sendMessage('出这一章的测验题'); }}>
                  <Brain className="w-3 h-3" /> 本章测验
                </button>
              </>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                先上传复习资料（txt/md），或直接输入科目名开始
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 14 }}>
          <div className="card-title" style={{ fontSize: 13, marginBottom: 10 }}>提示</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            • 支持 txt/md 格式复习资料<br />
            • 可直接粘贴文字到输入框<br />
            • 回复「跳过」跳过当前题<br />
            • 回复「复盘」进入错题复习<br />
            • 进度面板自动跟踪
          </div>
        </div>
      </div>
    </div>
    <div style={{ marginTop: 14 }}>
      <ResourcePosterWall
        topics={[input, ...messages.filter(message => message.role === 'user').slice(-3).map(message => message.content)].filter(Boolean).slice(0, 4)}
        placement="exam_result"
        contextId={phase ? `phase-${phase}` : 'exam-cram'}
        title="备考强化资源"
      />
    </div>
  </>
  );
}
