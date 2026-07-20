import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { getCourses, getLearningProgress, getLearningRecords, getLearningProfile } from '@/services/api';
import type { Course, LearningProgress, LearningRecord, LearningProfile } from '@/types/types';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line,
} from 'recharts';
import {
  BookMarked, Brain, GraduationCap, Sparkles, Map, FileText, BookX, BarChart3,
  ArrowRight, Clock, Target, Cpu, Activity, Layers,
  Zap, ChevronRight, Calendar, CheckCircle2, TrendingUp, RefreshCw, Download, ListTodo,
} from 'lucide-react';
import SmartRecommend from '@/components/SmartRecommend';
import ResourcePosterWall from '@/components/ResourcePosterWall';

// ─── P1 数据接口 ─────────────────────────────────
interface KnowledgeMastery {
  knowledge_point: string;
  category: string;
  mastery_level: number;
  total_attempts: number;
  correct_attempts: number;
  last_attempted_at: string;
}
interface LearningEvent {
  id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}
interface AgentRun {
  run_type: string;
  status: string;
  total_duration_ms: number;
}

// ─── 事件元数据 ──────────────────────────────────
const EVENT_META: Record<string, { label: string; color: string }> = {
  quiz_attempt:     { label: '答题',   color: '#f59e0b' },
  quiz_complete:    { label: '测验',   color: '#10b981' },
  chapter_complete: { label: '完成章节', color: '#6366f1' },
  course_enroll:    { label: '选课',   color: '#8b5cf6' },
  learning_session: { label: '学习',   color: '#06b6d4' },
  note_create:      { label: '笔记',   color: '#ec4899' },
  resource_generate:{ label: '资源生成', color: '#14b8a6' },
  resource_view:    { label: '查看资源', color: '#84cc16' },
  path_replan:      { label: '路径重规划', color: '#f97316' },
  profile_update:   { label: '画像更新', color: '#a855f7' },
  mastery_change:   { label: '掌握度变化', color: '#3b82f6' },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  return new Date(iso).toLocaleDateString('zh-CN');
}

function eventDesc(e: LearningEvent): string {
  const d = e.event_data as Record<string, unknown>;
  switch (e.event_type) {
    case 'quiz_attempt':    return `${d.is_correct ? '答对' : '答错'}「${d.topic || '未知题'}」`;
    case 'quiz_complete':   return `完成测验，得分 ${d.score || '?'}`;
    case 'chapter_complete':return `完成章节学习`;
    case 'learning_session':return `学习 ${d.duration_minutes || '?'} 分钟`;
    case 'resource_generate':return `生成「${d.resource_type || '资源'}」`;
    case 'profile_update':  return `画像更新: ${d.dimension || '未知维度'}`;
    case 'mastery_change':  return `${d.knowledge_point || ''} 掌握度 ${d.old_level || '?'}→${d.new_level || '?'}`;
    case 'path_replan':     return `学习路径重规划`;
    default: return EVENT_META[e.event_type]?.label || e.event_type;
  }
}

// ─── 迷你日历 ────────────────────────────────────
function MiniCalendar() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = `${year}年${month + 1}月`;
  const dayHeaders = ['日', '一', '二', '三', '四', '五', '六'];
  const cells: { day: number; isToday: boolean; isFuture: boolean }[] = [];
  for (let i = 0; i < firstDay; i++) cells.push({ day: 0, isToday: false, isFuture: false });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, isToday: d === today.getDate(), isFuture: d > today.getDate() });
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-foreground">{monthLabel}</h3>
        <span className="text-[10px] text-muted-foreground">今日</span>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {dayHeaders.map(d => (
          <span key={d} className="text-[10px] text-muted-foreground/60 font-medium">{d}</span>
        ))}
        {cells.map((c, i) => (
          <span key={i} className={`text-[11px] h-5 flex items-center justify-center rounded ${
            c.day === 0 ? '' :
            c.isToday ? 'bg-primary text-white font-bold' :
            c.isFuture ? 'text-muted-foreground/30' : 'text-foreground/80'
          }`}>
            {c.day || ''}
          </span>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>本周 {today.getDay()}/7</span>
        <span className="text-primary font-semibold">· {today.getDate()}日</span>
      </div>
    </div>
  );
}

// ─── KPI 卡片 ────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, trend, color }: {
  icon: typeof BookMarked; label: string; value: string | number;
  sub?: string; trend?: { value: string; up: boolean }; color: string;
}) {

  return (
    <Card className="border-border hover:border-primary/20 transition-all duration-300 h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-[64px] opacity-[0.06]" style={{ background: color }} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: `${color}18` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          {trend && (
            <span className={`flex items-center gap-0.5 text-xs font-medium ${trend.up ? 'text-emerald-400' : 'text-red-400'}`}>
              <TrendingUp className={`w-3 h-3 ${trend.up ? '' : 'rotate-180'}`} />
              {trend.value}
            </span>
          )}
        </div>
        <p className="text-[22px] font-bold text-foreground tabular-nums tracking-tight leading-none">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── 主页面 ──────────────────────────────────────
export default function DashboardPage() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<LearningProgress[]>([]);
  const [records, setRecords] = useState<LearningRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [masteryData, setMasteryData] = useState<KnowledgeMastery[]>([]);
  const [events, setEvents] = useState<LearningEvent[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [learningProfile, setLearningProfile] = useState<LearningProfile | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [taskSummary, setTaskSummary] = useState({ pending: 0, activePlans: 0 });

  const now = new Date();

  const loadData = useCallback(async () => {
    if (!profile) return;
    const [c, p, r] = await Promise.all([
      getCourses(8), getLearningProgress(profile.id), getLearningRecords(profile.id, 30),
    ]);
    setCourses(c); setProgress(p); setRecords(r);
    try {
      const [mRes, eRes, arRes, lpRes, tasksRes, plansRes] = await Promise.allSettled([
        supabase.from('knowledge_mastery').select('*').eq('user_id', profile.id).order('mastery_level', { ascending: false }),
        supabase.from('learning_events').select('id,event_type,event_data,created_at').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('agent_runs').select('run_type,status,total_duration_ms').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(10),
        getLearningProfile(profile.id),
        supabase.from('learning_tasks').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).in('status', ['pending', 'in_progress']),
        supabase.from('learning_plans').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).eq('status', 'active'),
      ]);
      if (mRes.status === 'fulfilled' && mRes.value.data) setMasteryData(mRes.value.data as KnowledgeMastery[]);
      if (eRes.status === 'fulfilled' && eRes.value.data) setEvents(eRes.value.data as LearningEvent[]);
      if (arRes.status === 'fulfilled' && arRes.value.data) setAgentRuns(arRes.value.data as AgentRun[]);
      if (lpRes.status === 'fulfilled' && lpRes.value) setLearningProfile(lpRes.value);
      setTaskSummary({
        pending: tasksRes.status === 'fulfilled' ? tasksRes.value.count || 0 : 0,
        activePlans: plansRes.status === 'fulfilled' ? plansRes.value.count || 0 : 0,
      });
    } catch (_) { /* P1 tables may not exist */ }
    setLastUpdatedAt(new Date());
    setLoading(false);
  }, [profile]);

  useEffect(() => { setLoading(true); loadData(); }, [loadData]);

  useEffect(() => {
    if (!profile) return;

    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => { void loadData(); }, 250);
    };

    const channel = supabase.channel(`dashboard-live-${profile.id}`);
    for (const table of [
      'learning_records',
      'learning_progress',
      'learning_events',
      'knowledge_mastery',
      'learning_profiles',
      'agent_runs',
      'learning_tasks',
      'learning_plans',
    ]) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `user_id=eq.${profile.id}`,
        },
        scheduleRefresh,
      );
    }
    channel.subscribe();
  return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, [profile, loadData]);

  // ─── 指标计算 ──────────────────────────────────
  const activeDays = new Set(records.map(r => r.recorded_at.slice(0, 10))).size;
  const inProgress = progress.filter(p => p.completed_chapters > 0 && p.completed_chapters < p.total_chapters).length;
  const totalChapters = progress.reduce((s, p) => s + p.total_chapters, 0);
  const completedChapters = progress.reduce((s, p) => s + p.completed_chapters, 0);
  const overallPct = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  const avgMastery = masteryData.length > 0
    ? Math.round(masteryData.reduce((s, m) => s + m.mastery_level, 0) / masteryData.length) : 0;
  const masteredCount = masteryData.filter(m => m.mastery_level >= 80).length;
  const weakCount = masteryData.filter(m => m.mastery_level < 60).length;

  const agentSuccess = agentRuns.filter(a => a.status === 'success').length;
  const agentTotal = agentRuns.length;
  const avgAgentDuration = agentTotal > 0
    ? Math.round(agentRuns.reduce((s, a) => s + a.total_duration_ms, 0) / agentTotal / 100) / 10 : 0;

  // ─── 本周节奏 ──────────────────────────────────
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(); dt.setDate(dt.getDate() - (6 - i));
    const ds = dt.toISOString().slice(0, 10);
    const minutes = records.filter(r => r.recorded_at.slice(0, 10) === ds).reduce((s, r) => s + r.duration_minutes, 0);
    return { day: ['一','二','三','四','五','六','日'][i], date: ds.slice(5), minutes };
  });
  const avgMinutes = Math.round(weeklyData.reduce((s, d) => s + d.minutes, 0) / 7);

  // ─── 学习画像雷达 ──────────────────────────────
  const radarData = learningProfile ? [
    { subject: '知识基础', value: learningProfile.knowledge_base || 0, fullMark: 100 },
    { subject: '认知风格', value: learningProfile.cognitive_style || 0, fullMark: 100 },
    { subject: '学习偏好', value: learningProfile.learning_preference || 0, fullMark: 100 },
    { subject: '错误掌控', value: learningProfile.error_prone || 0, fullMark: 100 },
    { subject: '学习目标', value: learningProfile.learning_goal || 0, fullMark: 100 },
    { subject: '学习节奏', value: learningProfile.learning_pace || 0, fullMark: 100 },
  ] : [
    { subject: '知识基础', value: 0, fullMark: 100 },
    { subject: '认知风格', value: 0, fullMark: 100 },
    { subject: '学习偏好', value: 0, fullMark: 100 },
    { subject: '错误掌控', value: 0, fullMark: 100 },
    { subject: '学习目标', value: 0, fullMark: 100 },
    { subject: '学习节奏', value: 0, fullMark: 100 },
  ];

  const quickLinks = [
    { to: '/chat', icon: Brain, label: '智能对话', desc: 'AI学习助手', color: '#6366f1' },
    { to: '/tutor', icon: GraduationCap, label: '诊断辅导', desc: '深度教学', color: '#8b5cf6' },
    { to: '/notes', icon: FileText, label: '学习笔记', desc: '记录心得', color: '#06b6d4' },
    { to: '/mistakes', icon: BookX, label: '错题本', desc: '查漏补缺', color: '#f59e0b' },
    { to: '/resources', icon: Sparkles, label: '资源生成', desc: 'AI智能生成', color: '#10b981' },
    { to: '/path', icon: Map, label: '学习路径', desc: '四阶段规划', color: '#ec4899' },
  ];
  return (
    <div className="space-y-4 max-w-7xl">
      {/* ═══ 页面头部：面包屑 + 标题 + 操作栏 ═══ */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Link to="/dashboard" className="hover:text-foreground transition-colors">学习中心</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium">数据概览</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">数据中台</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {lastUpdatedAt
              ? `数据更新于 ${lastUpdatedAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
              : `${now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })} ${now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`}
          </span>
          <button onClick={loadData} className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors" title="刷新数据">
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* ═══ KPI 指标行 ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <KpiCard icon={BookMarked} label="参与课程" value={loading ? '–' : courses.length}
          sub="累计选课" color="#6366f1" />
        <KpiCard icon={Target} label="知识点掌握" value={loading ? '–' : `${masteredCount}/${masteryData.length}`}
          sub={masteryData.length > 0 ? `均值 ${avgMastery}%` : '暂无数据'}
          color={avgMastery >= 80 ? '#10b981' : avgMastery >= 60 ? '#f59e0b' : '#ef4444'} />
        <KpiCard icon={Layers} label="已学章节" value={loading ? '–' : completedChapters}
          sub={`共 ${totalChapters} 章`} color="#06b6d4" />
        <KpiCard icon={Activity} label="进行中" value={loading ? '–' : inProgress}
          sub={inProgress > 0 ? `${inProgress} 门课程` : '暂无'} color="#f59e0b" />
        <KpiCard icon={CheckCircle2} label="完成率" value={loading ? '–' : `${overallPct}%`}
          sub="整体进度" color="#10b981"
          trend={overallPct >= 50 ? { value: '良好', up: true } : undefined} />
        <KpiCard icon={Cpu} label="Agent执行" value={loading ? '–' : `${agentSuccess}/${agentTotal}`}
          sub={agentTotal > 0 ? `均 ${avgAgentDuration}s` : '暂无'} color="#8b5cf6" />
        <KpiCard icon={Calendar} label="学习天数" value={loading ? '–' : activeDays}
          sub="近30天" color="#ec4899"
          trend={activeDays >= 15 ? { value: '活跃', up: true } : activeDays > 0 ? { value: '偏低', up: false } : undefined} />
        <KpiCard icon={ListTodo} label="学习任务" value={loading ? '–' : taskSummary.pending}
          sub={`${taskSummary.activePlans} 个进行中计划`} color="#0ea5e9" />
      </div>

      {/* ═══ 主体三栏：课程进度 + 图表 + 右侧栏（日历+Agent+时长） ═══ */}
      <div className="grid lg:grid-cols-4 gap-4">
        {/* 左侧：课程进度 + 掌握度分布 + 事件 + 智能推荐 */}
        <div className="lg:col-span-3 space-y-4">
          {/* 课程进度 */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-primary" />
                  课程进度
                </CardTitle>
                <Link to="/courses" className="text-xs text-primary hover:underline flex items-center gap-1">
                  全部课程 <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">{Array(3).fill(0).map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}</div>
              ) : progress.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookMarked className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">暂无课程数据</p>
                  <p className="text-xs mt-1">前往课程中心开始学习</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2.5 px-3 text-xs font-medium text-muted-foreground">课程名称</th>
                        <th className="text-center py-2.5 px-3 text-xs font-medium text-muted-foreground w-20">进度</th>
                        <th className="text-center py-2.5 px-3 text-xs font-medium text-muted-foreground w-20">已学/总章</th>
                        <th className="text-center py-2.5 px-3 text-xs font-medium text-muted-foreground w-20">状态</th>
                        <th className="text-right py-2.5 px-3 text-xs font-medium text-muted-foreground w-14">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {progress.slice(0, 6).map(p => {
                        const course = courses.find(c => c.id === p.course_id);
                        const pct = p.total_chapters > 0 ? Math.round((p.completed_chapters / p.total_chapters) * 100) : 0;
                        const isDone = pct >= 100;
                        const isActive = pct > 0 && pct < 100;

  return (
                          <tr key={p.course_id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                  style={{ background: isDone ? '#10b98120' : isActive ? '#6366f120' : '#6b728020' }}>
                                  <BookMarked className="w-3 h-3" style={{ color: isDone ? '#10b981' : isActive ? '#6366f1' : '#6b7280' }} />
                                </div>
                                <span className="font-medium text-foreground truncate max-w-[200px]">{course?.title || p.course_id}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${pct}%`, background: isDone ? '#10b981' : '#6366f1' }} />
                                </div>
                                <span className="text-xs font-medium tabular-nums w-9 text-right">{pct}%</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center text-xs text-muted-foreground">{p.completed_chapters}/{p.total_chapters}</td>
                            <td className="py-2.5 px-3 text-center">
                              {isDone ? (
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] h-5">已完成</Badge>
                              ) : isActive ? (
                                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] h-5">学习中</Badge>
                              ) : (
                                <Badge className="bg-muted text-muted-foreground border-border text-[10px] h-5">未开始</Badge>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <Link to={`/courses/${p.course_id}`} className="text-xs text-primary hover:underline">进入</Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 知识点掌握度分布 */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  知识点掌握度分布
                </CardTitle>
                <span className="text-xs text-muted-foreground">{masteryData.length} 个知识点</span>
              </div>
            </CardHeader>
            <CardContent>
              {masteryData.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Target className="w-6 h-6 mx-auto mb-1.5 opacity-20" />
                  <p className="text-sm">暂无掌握度数据</p>
                  <p className="text-xs mt-1">前往「学习路径」开始学习，系统将自动追踪掌握度</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {masteryData.slice(0, 8).map(m => {
                    const color = m.mastery_level >= 80 ? '#10b981' : m.mastery_level >= 60 ? '#f59e0b' : '#ef4444';

  return (
                      <div key={m.knowledge_point} className="flex items-center gap-3">
                        <span className="w-28 text-xs text-muted-foreground truncate shrink-0">{m.knowledge_point}</span>
                        <div className="flex-1 h-5 bg-muted/40 rounded-sm overflow-hidden relative">
                          <div className="h-full rounded-sm transition-all duration-500"
                            style={{ width: `${m.mastery_level}%`, background: `linear-gradient(90deg, ${color}dd, ${color})` }} />
                        </div>
                        <span className="text-xs font-semibold tabular-nums w-10 text-right" style={{ color }}>{Math.round(m.mastery_level)}%</span>
                        <span className="text-[10px] text-muted-foreground w-8 text-right">{m.total_attempts}次</span>
                      </div>
                    );
                  })}
                  {masteryData.length > 8 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">+{masteryData.length - 8} 个知识点</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 最近学习事件 */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                最近学习事件
              </CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Activity className="w-6 h-6 mx-auto mb-1.5 opacity-20" />
                  <p className="text-sm">暂无学习事件</p>
                  <p className="text-xs mt-1">开始学习后，系统将自动记录所有学习行为</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {events.slice(0, 8).map((e, i) => {
                    const meta = EVENT_META[e.event_type] || { label: e.event_type, color: '#6b7280' };

  return (
                      <div key={e.id} className={`flex items-center gap-3 py-2 ${i !== 0 ? 'border-t border-border/30' : ''}`}>
                        <span className="text-[10px] px-2 py-0.5 rounded font-medium shrink-0"
                          style={{ color: meta.color, background: `${meta.color}15` }}>
                          {meta.label}
                        </span>
                        <span className="text-xs text-foreground flex-1 truncate">{eventDesc(e)}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{relativeTime(e.created_at)}</span>
                      </div>
                    );
                  })}
                  {events.length > 8 && <p className="text-xs text-muted-foreground text-center pt-1">+{events.length - 8} 条</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 智能推荐 */}
          <SmartRecommend embedIn="dashboard" />
        </div>

        {/* 右侧栏：日历 + Agent + 时长 + 掌握度 */}
        <div className="lg:col-span-1 space-y-4">
          <MiniCalendar />

          {/* Agent 运行概览 */}
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                Agent 运行概览
              </CardTitle>
            </CardHeader>
            <CardContent>
              {agentRuns.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Cpu className="w-5 h-5 mx-auto mb-1 opacity-20" />
                  <p className="text-xs">暂无运行记录</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {agentRuns.slice(0, 6).map((a, i) => {
                    const sc = a.status === 'success' ? '#10b981' : a.status === 'running' ? '#3b82f6' : '#ef4444';
                    const sl = a.status === 'success' ? '完成' : a.status === 'running' ? '运行中' : '失败';

  return (
                      <div key={i} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sc }} />
                          <span className="text-foreground truncate">{a.run_type}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-muted-foreground">{Math.round(a.total_duration_ms / 100) / 10}s</span>
                          <span className="text-[10px] font-medium" style={{ color: sc }}>{sl}</span>
                        </div>
                      </div>
                    );
                  })}
                  {agentRuns.length > 6 && <p className="text-[10px] text-muted-foreground text-center pt-1">+{agentRuns.length - 6} 条</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 日均使用时长 */}
          <Card className="border-border">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                日均使用时长
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-xl font-bold tabular-nums text-foreground">{avgMinutes}</span>
                <span className="text-xs text-muted-foreground">分钟/天</span>
              </div>
              <ResponsiveContainer width="100%" height={70}>
                <LineChart data={weeklyData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 11 }}
                    formatter={(v: number) => [`${v}min`, '时长']} />
                  <Line type="monotone" dataKey="minutes" stroke="#f59e0b" strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 2 }} activeDot={{ r: 3, fill: '#f59e0b' }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 border-t border-border/50 mt-1.5">
                <span>7天趋势</span>
                <span className={activeDays >= 4 ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                  {activeDays >= 4 ? '持续学习' : '需加强'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 掌握度概览 */}
          {masteryData.length > 0 && (
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  掌握度概览
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <svg width={64} height={64} viewBox="0 0 64 64" className="shrink-0">
                    <circle cx={32} cy={32} r={27} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
                    <circle cx={32} cy={32} r={27} fill="none" stroke={avgMastery >= 80 ? '#10b981' : avgMastery >= 60 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="5" strokeDasharray={2 * Math.PI * 27}
                      strokeDashoffset={2 * Math.PI * 27 - (avgMastery / 100) * 2 * Math.PI * 27}
                      strokeLinecap="round" transform="rotate(-90 32 32)"
                      style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
                    <text x={32} y={32} textAnchor="middle" dominantBaseline="central" className="text-xs font-bold" fill="currentColor">{avgMastery}%</text>
                  </svg>
                  <div className="flex-1 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">已掌握</span>
                      <span className="text-emerald-400 font-semibold">{masteredCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">学习中</span>
                      <span className="text-amber-400 font-semibold">{masteryData.length - masteredCount - weakCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">薄弱</span>
                      <span className="text-red-400 font-semibold">{weakCount}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ═══ 图表行：学习画像 + 本周节奏 ═══ */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                学习画像
              </CardTitle>
              <Link to="/profile" className="text-xs text-primary hover:underline flex items-center gap-1">
                详情 <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-muted-foreground mb-2">
              {learningProfile ? '六维能力评估（基于真实学习数据）' : '尚未建立画像，前往「学习画像」完成对话式建档'}
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {radarData.slice(0, 6).map(d => (
                <div key={d.subject} className="text-center">
                  <p className="text-[10px] text-muted-foreground">{d.subject}</p>
                  <p className="text-sm font-bold tabular-nums text-foreground">{d.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              本周学习节奏
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-lg font-bold tabular-nums text-foreground">{avgMinutes}min</span>
              <span className="text-xs text-muted-foreground">日均学习时长</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeklyData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 12 }}
                  formatter={(v: number) => [`${v}min`, '学习时长']} />
                <Bar dataKey="minutes" fill="#6366f1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/50 mt-2">
              <span>{activeDays}/7 天活跃</span>
              <span className={activeDays >= 4 ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                {activeDays >= 4 ? '活跃' : '待提升'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══ 快捷入口 ═══ */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          快捷功能
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickLinks.map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to}>
              <Card className="border-border hover:border-primary/20 transition-all duration-300 cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${color}15` }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-[10px] text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <ResourcePosterWall />
    </div>
  );
}
