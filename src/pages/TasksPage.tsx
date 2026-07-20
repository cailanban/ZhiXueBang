import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Circle, Clock3, ListTodo, Plus, Route, Trash2 } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface LearningTask {
  id: string; title: string; description: string; status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high'; due_at: string | null; source: string; updated_at: string;
}
interface LearningPlan {
  id: string; title: string; description: string; status: 'draft' | 'active' | 'completed' | 'cancelled';
  start_date: string | null; end_date: string | null; source: string; updated_at: string;
}

const priorityLabel = { low: '低', medium: '中', high: '高' };

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<LearningTask[]>([]);
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [planTitle, setPlanTitle] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const [taskRes, planRes] = await Promise.all([
      supabase.from('learning_tasks').select('*').eq('user_id', user.id).neq('status', 'cancelled').order('created_at', { ascending: false }),
      supabase.from('learning_plans').select('*').eq('user_id', user.id).neq('status', 'cancelled').order('updated_at', { ascending: false }),
    ]);
    if (taskRes.error) toast.error(taskRes.error.message); else setTasks((taskRes.data || []) as LearningTask[]);
    if (planRes.error) toast.error(planRes.error.message); else setPlans((planRes.data || []) as LearningPlan[]);
    setLastUpdated(new Date());
  }, [user]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!user) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => { if (timer) clearTimeout(timer); timer = setTimeout(() => void load(), 250); };
    const channel = supabase.channel(`tasks-plans-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'learning_tasks', filter: `user_id=eq.${user.id}` }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'learning_plans', filter: `user_id=eq.${user.id}` }, refresh)
      .subscribe();
    return () => { if (timer) clearTimeout(timer); void supabase.removeChannel(channel); };
  }, [user, load]);

  const addTask = async () => {
    if (!user || !taskTitle.trim()) return;
    const { error } = await supabase.from('learning_tasks').insert({ user_id: user.id, title: taskTitle.trim(), source: 'manual' });
    if (error) toast.error(error.message); else { setTaskTitle(''); toast.success('学习任务已创建'); }
  };
  const addPlan = async () => {
    if (!user || !planTitle.trim()) return;
    const { error } = await supabase.from('learning_plans').insert({ user_id: user.id, title: planTitle.trim(), description: planDescription.trim(), source: 'manual' });
    if (error) toast.error(error.message); else { setPlanTitle(''); setPlanDescription(''); toast.success('学习计划已创建'); }
  };
  const updateTask = async (id: string, status: LearningTask['status']) => {
    const { error } = await supabase.from('learning_tasks').update({ status, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user!.id);
    if (error) toast.error(error.message);
  };
  const updatePlan = async (id: string, status: LearningPlan['status']) => {
    const { error } = await supabase.from('learning_plans').update({ status, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user!.id);
    if (error) toast.error(error.message);
  };

  const openTasks = tasks.filter(task => task.status !== 'completed').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  return (
    <div className="max-w-7xl space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div><h1 className="text-xl font-bold">任务与计划</h1><p className="text-sm text-muted-foreground">手动管理与 AI 学习管家共用同一份真实数据</p></div>
        <div className="text-xs text-muted-foreground flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" />{lastUpdated ? `实时更新 ${lastUpdated.toLocaleTimeString('zh-CN')}` : '正在加载'}</div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-primary">{openTasks}</p><p className="text-xs text-muted-foreground">待办任务</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-emerald-500">{completedTasks}</p><p className="text-xs text-muted-foreground">已完成任务</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold text-violet-500">{plans.filter(plan => plan.status === 'active').length}</p><p className="text-xs text-muted-foreground">进行中计划</p></CardContent></Card>
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ListTodo className="w-4 h-4 text-primary" />学习任务</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2"><Input value={taskTitle} onChange={event => setTaskTitle(event.target.value)} placeholder="新增一个真实学习任务" onKeyDown={event => event.key === 'Enter' && void addTask()} /><Button onClick={addTask}><Plus className="w-4 h-4" /></Button></div>
            {tasks.length === 0 ? <div className="py-10 text-center text-sm text-muted-foreground">暂无任务，当前统计为 0</div> : tasks.map(task => (
              <div key={task.id} className="rounded-xl border border-border p-3 flex gap-3 items-start">
                <button onClick={() => updateTask(task.id, task.status === 'completed' ? 'pending' : 'completed')} className="mt-0.5 text-primary">{task.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}</button>
                <div className="flex-1 min-w-0"><p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>{task.description && <p className="text-xs text-muted-foreground mt-1">{task.description}</p>}<div className="mt-2 flex gap-2"><Badge variant="outline">优先级 {priorityLabel[task.priority]}</Badge>{task.source === 'ai_butler' && <Badge>AI 管家</Badge>}{task.due_at && <Badge variant="outline"><CalendarDays className="w-3 h-3 mr-1" />{new Date(task.due_at).toLocaleString('zh-CN')}</Badge>}</div></div>
                <Button size="icon" variant="ghost" onClick={() => updateTask(task.id, 'cancelled')}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Route className="w-4 h-4 text-violet-500" />学习计划</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input value={planTitle} onChange={event => setPlanTitle(event.target.value)} placeholder="计划标题" />
            <Textarea value={planDescription} onChange={event => setPlanDescription(event.target.value)} placeholder="计划目标与安排（可选）" />
            <Button onClick={addPlan} disabled={!planTitle.trim()}><Plus className="w-4 h-4 mr-1" />创建计划</Button>
            {plans.length === 0 ? <div className="py-10 text-center text-sm text-muted-foreground">暂无计划，当前统计为 0</div> : plans.map(plan => (
              <div key={plan.id} className="rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium">{plan.title}</p><p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{plan.description || '暂无计划说明'}</p></div><Badge variant={plan.status === 'active' ? 'default' : 'outline'}>{plan.status === 'active' ? '进行中' : plan.status === 'completed' ? '已完成' : '草稿'}</Badge></div>
                <div className="mt-3 flex gap-2"><Button size="sm" variant="outline" onClick={() => updatePlan(plan.id, plan.status === 'completed' ? 'active' : 'completed')}>{plan.status === 'completed' ? '重新启用' : '标记完成'}</Button><Button size="sm" variant="ghost" onClick={() => updatePlan(plan.id, 'cancelled')}>取消计划</Button>{plan.source === 'ai_butler' && <Badge className="self-center">AI 管家创建</Badge>}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
