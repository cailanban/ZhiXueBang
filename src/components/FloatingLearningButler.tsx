import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot, Check, Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ButlerAction {
  id: string;
  action_type: 'create_task' | 'update_plan' | 'mark_mistake_status';
  summary: string;
  payload: Record<string, unknown>;
  status: 'proposed' | 'executed' | 'rejected' | 'failed' | 'undone';
  undo_expires_at?: string | null;
}

interface ButlerMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: ButlerAction | null;
}

const PAGE_LABELS: Record<string, string> = {
  '/dashboard': '学习中心', '/courses': '课程中心', '/mistakes': '错题本',
  '/path': '学习路径', '/exam-cram': '极速备考', '/knowledge': '知识库',
};

export default function FloatingLearningButler() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ButlerMessage[]>([
    { id: 'welcome', role: 'assistant', content: '我是常驻学习管家。可以帮你创建学习任务、调整现有计划，或更新错题状态；任何修改都会先请你确认。' },
  ]);
  const pageLabel = useMemo(() => PAGE_LABELS[location.pathname] || '当前模块', [location.pathname]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMessage: ButlerMessage = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('learning-butler', {
      body: { mode: 'chat', message: `[当前页面：${pageLabel} ${location.pathname}] ${text}` },
    });
    setLoading(false);
    if (error || data?.error) {
      const statusMsg = (error as any)?.status ? `[HTTP ${(error as any).status}] ` : '';
      const detail = data?.message || data?.error || (error as any)?.context?.status || error?.message || '服务暂时不可用';
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: `请求失败：${statusMsg}${detail}` }]);
      return;
    }
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: data.message, action: data.action }]);
  };

  const decide = async (messageId: string, action: ButlerAction, decision: 'confirm' | 'reject' | 'undo') => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('learning-butler', {
      body: { mode: 'execute', request_id: action.id, decision },
    });
    setLoading(false);
    if (error || data?.error) {
      toast.error(data?.message || data?.error || error?.message || '操作失败');
      return;
    }
    setMessages(prev => prev.map(message => message.id === messageId
      ? { ...message, action: message.action ? { ...message.action, ...data.action } : null }
      : message));
    toast.success(decision === 'confirm' ? '操作已执行，可在 10 分钟内撤销' : decision === 'undo' ? '已撤销并恢复原状态' : '已取消本次操作');
  };

  return (
    <div className="fixed z-50 bottom-5 right-5">
      {open && (
        <section className="mb-3 w-[min(390px,calc(100vw-2rem))] h-[min(620px,calc(100vh-7rem))] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden">
          <header className="gradient-bg text-white px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center"><Bot className="w-5 h-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">智学管家 · Spark Lite</div>
              <div className="text-xs text-white/75 truncate">正在协助：{pageLabel}</div>
            </div>
            <Button size="icon" variant="ghost" className="text-white hover:bg-white/15" onClick={() => setOpen(false)}><X className="w-4 h-4" /></Button>
          </header>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/25">
            {messages.map(message => (
              <div key={message.id} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${message.role === 'user' ? 'gradient-bg text-white rounded-br-md' : 'bg-card border border-border rounded-bl-md'}`}>
                  <p className="whitespace-pre-wrap leading-6">{message.content}</p>
                  {message.action && (
                    <div className="mt-3 rounded-xl border border-primary/25 bg-primary/5 p-3 text-foreground">
                      <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1"><Sparkles className="w-3.5 h-3.5" />待确认操作</div>
                      <p className="text-sm">{message.action.summary}</p>
                      {message.action.status === 'proposed' ? (
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" disabled={loading} onClick={() => decide(message.id, message.action!, 'confirm')}><Check className="w-3.5 h-3.5 mr-1" />确认执行</Button>
                          <Button size="sm" variant="outline" disabled={loading} onClick={() => decide(message.id, message.action!, 'reject')}>取消</Button>
                        </div>
                      ) : message.action.status === 'executed' ? (
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="text-xs text-muted-foreground">✓ 已执行并留痕</p>
                          <Button size="sm" variant="ghost" disabled={loading || (!!message.action.undo_expires_at && new Date(message.action.undo_expires_at).getTime() < Date.now())}
                            onClick={() => decide(message.id, message.action!, 'undo')}>撤销</Button>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-muted-foreground">{message.action.status === 'undone' ? '↶ 已撤销并恢复' : '已取消'}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />学习管家处理中…</div>}
          </div>

          <footer className="border-t border-border bg-card p-3">
            <div className="text-[11px] text-muted-foreground mb-2 flex items-center justify-between gap-2">
              <span>写操作需确认 · 可审计 · 不自动修改学习数据</span>
              <Link to="/butler-audit" onClick={() => setOpen(false)} className="text-primary hover:underline shrink-0">操作记录</Link>
            </div>
            <div className="flex items-end gap-2">
              <Textarea value={input} onChange={event => setInput(event.target.value)} placeholder="例如：帮我创建明晚复习 Java 多态的任务"
                className="min-h-[42px] max-h-28 resize-none" onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } }} />
              <Button size="icon" disabled={!input.trim() || loading} onClick={send}><Send className="w-4 h-4" /></Button>
            </div>
          </footer>
        </section>
      )}
      <button onClick={() => setOpen(value => !value)} aria-label="打开常驻 AI 学习管家"
        className="ml-auto w-14 h-14 rounded-full gradient-bg text-white shadow-xl flex items-center justify-center hover:scale-105 transition-transform relative">
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full" />}
      </button>
    </div>
  );
}
