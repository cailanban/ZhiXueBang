import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, AlertCircle, Bot, CheckCircle2, Clock3, RotateCcw, ShieldCheck, XCircle } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type ActionStatus = 'proposed' | 'executed' | 'rejected' | 'failed' | 'undone';
interface ActionRequest {
  id: string;
  action_type: 'create_task' | 'update_plan' | 'mark_mistake_status';
  summary: string;
  status: ActionStatus;
  error_message: string | null;
  created_at: string;
  decided_at: string | null;
  undone_at: string | null;
  undo_expires_at: string | null;
}
interface AuditEvent {
  id: string;
  request_id: string;
  event_type: ActionStatus;
  created_at: string;
}

const ACTION_LABELS = {
  create_task: '创建学习任务', update_plan: '调整学习计划', mark_mistake_status: '更新错题状态',
};
const ACTION_RISK = {
  create_task: '中风险', update_plan: '中风险', mark_mistake_status: '低风险',
};
const STATUS_META: Record<ActionStatus, { label: string; className: string; icon: typeof Clock3 }> = {
  proposed: { label: '待确认', className: 'border-amber-500/40 text-amber-600', icon: Clock3 },
  executed: { label: '已执行', className: 'border-emerald-500/40 text-emerald-600', icon: CheckCircle2 },
  rejected: { label: '已拒绝', className: 'border-muted-foreground/40 text-muted-foreground', icon: XCircle },
  failed: { label: '执行失败', className: 'border-destructive/40 text-destructive', icon: AlertCircle },
  undone: { label: '已撤销', className: 'border-blue-500/40 text-blue-600', icon: RotateCcw },
};

export default function ButlerAuditPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ActionRequest[]>([]);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | ActionStatus>('all');

  const load = useCallback(async () => {
    if (!user) return;
    const [requestResult, auditResult] = await Promise.all([
      supabase.from('assistant_action_requests')
        .select('id,action_type,summary,status,error_message,created_at,decided_at,undone_at,undo_expires_at')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
      supabase.from('assistant_action_audit').select('id,request_id,event_type,created_at')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(300),
    ]);
    setRequests((requestResult.data || []) as ActionRequest[]);
    setEvents((auditResult.data || []) as AuditEvent[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    load();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const refresh = () => { if (timer) clearTimeout(timer); timer = setTimeout(load, 250); };
    const channel = supabase.channel(`butler-audit-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assistant_action_requests', filter: `user_id=eq.${user.id}` }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assistant_action_audit', filter: `user_id=eq.${user.id}` }, refresh)
      .subscribe();
    return () => { if (timer) clearTimeout(timer); supabase.removeChannel(channel); };
  }, [load, user]);

  const visible = useMemo(() => requests.filter(item => filter === 'all' || item.status === filter), [filter, requests]);
  const counts = useMemo(() => requests.reduce<Record<string, number>>((all, item) => {
    all[item.status] = (all[item.status] || 0) + 1; return all;
  }, {}), [requests]);
  const eventCount = (requestId: string) => events.filter(event => event.request_id === requestId).length;

  return (
    <div className="max-w-6xl space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div><h1 className="text-xl font-bold">AI 管家操作记录</h1><p className="text-sm text-muted-foreground">这里只展示当前账号的真实提议、决策、执行与撤销记录</p></div>
        <Button variant="outline" size="sm" onClick={load}><Activity className="w-4 h-4 mr-2" />刷新记录</Button>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <Card><CardContent className="pt-5 flex gap-3"><ShieldCheck className="w-5 h-5 text-emerald-500" /><div><p className="font-medium">服务端权限白名单</p><p className="text-xs text-muted-foreground mt-1">仅允许任务、计划、错题三类工具；全部写操作必须确认</p></div></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-2xl font-bold">{requests.length}</p><p className="text-xs text-muted-foreground">累计操作请求</p></CardContent></Card>
        <Card><CardContent className="pt-5"><p className="text-2xl font-bold">{counts.executed || 0}</p><p className="text-xs text-muted-foreground">当前已执行记录</p></CardContent></Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'proposed', 'executed', 'rejected', 'failed', 'undone'] as const).map(value => (
          <Button key={value} size="sm" variant={filter === value ? 'default' : 'outline'} onClick={() => setFilter(value)}>
            {value === 'all' ? `全部 ${requests.length}` : `${STATUS_META[value].label} ${counts[value] || 0}`}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">操作时间线</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {loading ? <div className="h-28 rounded-xl bg-muted animate-pulse" /> : visible.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground"><Bot className="w-9 h-9 mx-auto mb-3 opacity-40" />暂无对应操作记录</div>
          ) : visible.map(item => {
            const meta = STATUS_META[item.status]; const Icon = meta.icon;
            return <div key={item.id} className="rounded-xl border border-border p-4 flex gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-primary" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium">{ACTION_LABELS[item.action_type]}</p>
                  <Badge variant="outline" className={meta.className}>{meta.label}</Badge>
                  <Badge variant="secondary">{ACTION_RISK[item.action_type]}</Badge>
                </div>
                <p className="text-sm mt-2">{item.summary}</p>
                {item.error_message && <p className="text-xs text-destructive mt-2">失败原因：{item.error_message}</p>}
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(item.created_at).toLocaleString('zh-CN')} · {eventCount(item.id)} 条审计事件
                  {item.status === 'executed' && item.undo_expires_at ? ` · 可撤销至 ${new Date(item.undo_expires_at).toLocaleTimeString('zh-CN')}` : ''}
                </p>
              </div>
            </div>;
          })}
        </CardContent>
      </Card>
    </div>
  );
}
