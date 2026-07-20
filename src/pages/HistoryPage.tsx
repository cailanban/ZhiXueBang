import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { MessageSquare, GraduationCap, Clock, ChevronRight, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface ChatSession {
  id: string;
  title: string;
  agent_type: 'chat' | 'tutor';
  topic: string | null;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message?: string;
}

interface ChatMessageRow {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'chat' | 'tutor'>('all');

  useEffect(() => {
    if (!user) return;
    loadSessions();
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!data) { setLoading(false); return; }

    // 获取每个会话的消息数和最后一条消息
    const enriched = await Promise.all(data.map(async (s) => {
      const { count } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', s.id);
      const { data: lastMsg } = await supabase
        .from('chat_messages')
        .select('content, role')
        .eq('session_id', s.id)
        .eq('role', 'assistant')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return {
        ...s,
        message_count: count || 0,
        last_message: lastMsg?.content?.slice(0, 80) || '',
      };
    }));

    setSessions(enriched);
    setLoading(false);
  };

  const loadMessages = async (session: ChatSession) => {
    setSelectedSession(session);
    setMsgLoading(true);
    const { data } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });
    setMessages((data || []) as ChatMessageRow[]);
    setMsgLoading(false);
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase.from('chat_sessions').delete().eq('id', sessionId);
    if (error) { toast.error('删除失败'); return; }
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (selectedSession?.id === sessionId) { setSelectedSession(null); setMessages([]); }
    toast.success('会话已删除');
  };

  const continueSession = (session: ChatSession) => {
    const path = session.agent_type === 'tutor' ? '/tutor' : '/chat';
    navigate(path);
    toast.info('请在对话页开启新会话，历史记录仍可在此查看');
  };

  const filteredSessions = sessions.filter(s => {
    const matchType = filter === 'all' || s.agent_type === filter;
    const matchSearch = !searchQuery || s.title.includes(searchQuery) || s.topic?.includes(searchQuery);
    return matchType && matchSearch;
  });

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-6xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">对话历史</h1>
          <p className="text-sm text-muted-foreground">智能对话与诊断辅导的完整历史记录</p>
        </div>
        <div className="flex gap-2 items-center">
          {(['all', 'chat', 'tutor'] as const).map(f => (
            <Button key={f} variant="outline" size="sm"
              className={`h-7 text-xs border-border ${filter === f ? 'gradient-bg text-white border-primary' : ''}`}
              onClick={() => setFilter(f)}>
              {f === 'all' ? '全部' : f === 'chat' ? '智能对话' : '诊断辅导'}
            </Button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="搜索对话标题或主题…"
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Session list */}
        <div className="lg:col-span-2">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {filteredSessions.length} 条记录
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1 max-h-[calc(100vh-22rem)] overflow-y-auto">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                ))
              ) : filteredSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {searchQuery ? '未找到匹配的对话' : '暂无历史记录'}
                </div>
              ) : (
                <AnimatePresence>
                  {filteredSessions.map((s, i) => (
                    <motion.button
                      key={s.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => loadMessages(s)}
                      className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-all group ${selectedSession?.id === s.id ? 'gradient-bg' : 'hover:bg-muted'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${selectedSession?.id === s.id ? 'bg-white/20' : 'bg-primary/10'}`}>
                        {s.agent_type === 'tutor'
                          ? <GraduationCap className={`w-4 h-4 ${selectedSession?.id === s.id ? 'text-white' : 'text-primary'}`} />
                          : <MessageSquare className={`w-4 h-4 ${selectedSession?.id === s.id ? 'text-white' : 'text-primary'}`} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-sm font-medium truncate ${selectedSession?.id === s.id ? 'text-white' : 'text-foreground'}`}>
                            {s.title || '新对话'}
                          </p>
                          <span className={`text-[10px] shrink-0 ${selectedSession?.id === s.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                            {formatTime(s.updated_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className={`text-xs truncate ${selectedSession?.id === s.id ? 'text-white/70' : 'text-muted-foreground'}`}>
                            {s.last_message || s.topic || '暂无消息'}
                          </p>
                          <div className="flex items-center gap-1 shrink-0">
                            <Badge variant="outline" className={`text-[10px] h-4 px-1 ${selectedSession?.id === s.id ? 'border-white/40 text-white/80' : 'border-border text-muted-foreground'}`}>
                              {s.message_count}条
                            </Badge>
                            <button
                              onClick={(e) => deleteSession(s.id, e)}
                              className={`opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded ${selectedSession?.id === s.id ? 'hover:bg-white/20' : 'hover:bg-destructive/20'}`}>
                              <Trash2 className={`w-3 h-3 ${selectedSession?.id === s.id ? 'text-white/70' : 'text-muted-foreground hover:text-destructive'}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message detail */}
        <div className="lg:col-span-3">
          {!selectedSession ? (
            <Card className="border-border h-full min-h-64">
              <CardContent className="flex flex-col items-center justify-center h-full py-16 text-muted-foreground">
                <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">点击左侧对话查看详情</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border flex flex-col max-h-[calc(100vh-18rem)]">
              <CardHeader className="pb-2 shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {selectedSession.agent_type === 'tutor'
                      ? <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                      : <MessageSquare className="w-4 h-4 text-primary shrink-0" />}
                    <CardTitle className="text-sm truncate">{selectedSession.title}</CardTitle>
                    <Badge variant="outline" className="text-[10px] border-border text-muted-foreground shrink-0">
                      {selectedSession.agent_type === 'tutor' ? '诊断辅导' : '智能对话'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(selectedSession.created_at).toLocaleDateString('zh-CN')}
                    </span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={() => continueSession(selectedSession)}>
                      继续 <ChevronRight className="w-3 h-3 ml-0.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto min-h-0 space-y-3 p-4">
                {msgLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`flex gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="w-7 h-7 rounded-full bg-muted animate-pulse shrink-0" />
                      <div className="h-12 bg-muted rounded-xl animate-pulse flex-1 max-w-[70%]" />
                    </div>
                  ))
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">该会话暂无消息记录</p>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 ${msg.role === 'user' ? 'gradient-bg text-white' : 'bg-muted border border-border text-primary'}`}>
                        {msg.role === 'user' ? '我' : 'AI'}
                      </div>
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.role === 'user' ? 'gradient-bg text-white' : 'bg-muted border border-border text-foreground'}`}>
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-sm max-w-none text-foreground [&_code]:bg-background [&_code]:px-1 [&_code]:rounded [&_pre]:bg-background [&_pre]:p-2 [&_pre]:rounded [&_p]:text-foreground [&_li]:text-foreground [&_strong]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground text-xs">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p>{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
