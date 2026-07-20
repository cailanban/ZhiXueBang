import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getLearningRecords, getLearningProgress } from '@/services/api';
import type { LearningRecord, LearningProgress } from '@/types/types';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, BarChart3, Clock, BookCheck, Target, TrendingUp, Brain, RefreshCw, DatabaseZap, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';

type Range = '7d' | '30d' | 'all';

interface WeakPoint { topic_name: string; wrong: number; total: number; rate: number; }

export default function EvaluationPage() {
  const { user, profile } = useAuth();
  const [records, setRecords] = useState<LearningRecord[]>([]);
  const [progress, setProgress] = useState<LearningProgress[]>([]);
  const [range, setRange] = useState<Range>('30d');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [weakPoints, setWeakPoints] = useState<WeakPoint[]>([]);
  const [aiEval, setAiEval] = useState<{
    scores?: Record<string, number>;
    summary?: string;
    strengths?: string[];
    weaknesses?: string[];
    suggestions?: string[];
    chartData?: { date: string; minutes: number }[];
    agent_trace?: { agent: string; action: string; result: string }[];
  } | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);

  const loadWeakPoints = async (userId: string) => {
    // 先从 Supabase quiz_attempts 读取
    const { data } = await supabase
      .from('quiz_attempts')
      .select('topic_name, is_correct')
      .eq('user_id', userId)
      .not('topic_name', 'is', null);
    
    const map: Record<string, { wrong: number; total: number }> = {};
    (data || []).forEach(row => {
      const t = row.topic_name as string;
      if (!map[t]) map[t] = { wrong: 0, total: 0 };
      map[t].total++;
      if (!row.is_correct) map[t].wrong++;
    });

    // 补充从 localStorage 读取课程答题记录
    const keys = Object.keys(localStorage).filter(k => k.startsWith(`zhixuebang_quiz_${userId}`));
    keys.forEach(key => {
      try {
        const record = JSON.parse(localStorage.getItem(key) || '{}');
        if (!record.results) return;
        record.results.forEach((r: { is_correct: boolean }) => {
          const t = record.topic_title || '课程练习';
          if (!map[t]) map[t] = { wrong: 0, total: 0 };
          map[t].total++;
          if (!r.is_correct) map[t].wrong++;
        });
      } catch {}
    });

    const sorted = Object.entries(map)
      .map(([topic_name, { wrong, total }]) => ({ topic_name, wrong, total, rate: wrong / total }))
      .filter(w => w.total >= 2)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5);
    setWeakPoints(sorted);
  };

  const loadData = useCallback(async () => {
    if (!user || !profile) return;
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 365;
    const [r, p] = await Promise.all([getLearningRecords(profile.id, days), getLearningProgress(profile.id)]);
    setRecords(r);
    setProgress(p);
    loadWeakPoints(user.id);
  }, [user, profile, range]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  // 切回页面时自动刷新
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') loadData(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [loadData]);

  // 触发AI实时评估
  const runAiEvaluation = async () => {
    if (!user) return;
    setEvalLoading(true);
    try {
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 365;
      const { data, error } = await supabase.functions.invoke('deepseek-evaluate', {
        body: { days }
      });
      if (error) throw error;
      setAiEval(data);
      toast.success('AI评估分析完成');
    } catch (e) {
      console.error(e);
      toast.error('AI评估失败，请稍后重试');
    } finally {
      setEvalLoading(false);
    }
  };

  // Stats from real data
  const totalMinutes = records.reduce((s, r) => s + r.duration_minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const avgDaily = records.length > 0 ? Math.round(totalMinutes / (range === '7d' ? 7 : range === '30d' ? 30 : 365)) : 0;
  const completed = progress.filter(p => p.completed_chapters === p.total_chapters && p.total_chapters > 0).length;
  const inProgress = progress.filter(p => p.completed_chapters > 0 && p.completed_chapters < p.total_chapters).length;

  // Daily chart from real data
  const dailyData = (() => {
    const map: Record<string, number> = {};
    records.forEach(r => {
      const d = r.recorded_at?.slice(5, 10) || '';
      if (d) map[d] = (map[d] || 0) + r.duration_minutes;
    });
    return Object.entries(map).slice(-14).map(([date, min]) => ({ date, min, hours: +(min / 60).toFixed(1) }));
  })();

  // Radar: prefer AI result, fallback to computed
  const radarData = aiEval?.scores ? [
    { dim: '知识掌握', score: aiEval.scores.knowledge ?? 0 },
    { dim: '学习投入', score: aiEval.scores.engagement ?? 0 },
    { dim: '学习进度', score: aiEval.scores.progress ?? 0 },
    { dim: '学习方法', score: aiEval.scores.method ?? 0 },
    { dim: '目标达成', score: aiEval.scores.goal ?? 0 },
  ] : [
    { dim: '学习时长', score: Math.min(100, Math.round(totalMinutes / 10)) },
    { dim: '课程完成', score: progress.length > 0 ? Math.round(completed / progress.length * 100) : 0 },
    { dim: '持续天数', score: Math.min(100, new Set(records.map(r => r.recorded_at?.slice(0, 10))).size * 5) },
    { dim: '进度达成', score: progress.length > 0 ? Math.round(progress.reduce((s, p) => s + (p.total_chapters > 0 ? p.completed_chapters / p.total_chapters * 100 : 0), 0) / progress.length) : 0 },
    { dim: '知识积累', score: Math.min(100, records.length * 3) },
  ];

  const exportCSV = () => {
    const header = ['日期', '课程', '章节', '学习时长(min)'];
    const rows = records.map(r => [r.recorded_at?.slice(0, 10) || '', r.course?.title || '未知', r.chapter_id || '-', String(r.duration_minutes)]);
    const csv = [header, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = '学习记录.csv'; a.click();
    toast.success('CSV已导出');
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const evalSummary = aiEval?.summary || '暂无AI评估';
      const content = `智学帮 - 学习记录报告\n===================\n生成时间: ${new Date().toLocaleString('zh-CN')}\n时间范围: ${range === '7d' ? '最近7天' : range === '30d' ? '最近30天' : '全部'}\n\nAI评估摘要\n----------\n${evalSummary}\n\n学习概况\n--------\n累计学习时长: ${totalHours}小时\n日均学习: ${avgDaily}分钟\n已完成课程: ${completed}门\n进行中课程: ${inProgress}门\n\n学习记录详情\n-----------\n${records.map(r => `${r.recorded_at?.slice(0, 10) || ''} | ${r.course?.title || '未知课程'} | ${r.duration_minutes}分钟`).join('\n')}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = '学习报告.txt'; a.click();
      toast.success('报告已导出');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">学习评估</h1>
            <Badge variant="outline" className="text-[10px] border-primary/30 text-primary h-5">
              <Brain className="w-2.5 h-2.5 mr-1" />评估分析师
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">基于真实学习数据的多维评估，由DeepSeek实时分析</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={range} onValueChange={v => setRange(v as Range)}>
            <SelectTrigger className="w-28 h-8 bg-card border-border text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">最近7天</SelectItem>
              <SelectItem value="30d">最近30天</SelectItem>
              <SelectItem value="all">全部</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={runAiEvaluation} disabled={evalLoading} className="h-8 text-xs border-border">
            {evalLoading ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Brain className="w-3 h-3 mr-1" />}
            {evalLoading ? 'AI分析中…' : 'AI评估'}
          </Button>
          <Button variant="outline" size="sm" onClick={exportCSV} className="h-8 text-xs border-border">
            <Download className="w-3 h-3 mr-1" /> CSV
          </Button>
          <Button size="sm" onClick={exportPDF} disabled={exporting} className="gradient-bg text-white h-8 text-xs">
            <FileText className="w-3 h-3 mr-1" /> {exporting ? '…' : '报告'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: '学习时长', value: `${totalHours}h`, color: '#4F46E5' },
          { icon: TrendingUp, label: '日均学习', value: `${avgDaily}min`, color: '#7C3AED' },
          { icon: BookCheck, label: '已完成', value: `${completed}门`, color: '#10B981' },
          { icon: Target, label: '进行中', value: `${inProgress}门`, color: '#F59E0B' },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{loading ? '–' : value}</p>
                </div>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI evaluation summary */}
      {aiEval && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-primary">
              <Brain className="w-4 h-4" /> AI评估摘要
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary ml-auto">
                <DatabaseZap className="w-2.5 h-2.5 mr-1" />实时分析
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiEval.summary && <p className="text-sm text-foreground">{aiEval.summary}</p>}
            <div className="grid md:grid-cols-2 gap-3">
              {aiEval.strengths && aiEval.strengths.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-green-400 mb-1">优势</p>
                  {aiEval.strengths.map((s, i) => <p key={i} className="text-xs text-muted-foreground">• {s}</p>)}
                </div>
              )}
              {aiEval.suggestions && aiEval.suggestions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-primary mb-1">建议</p>
                  {aiEval.suggestions.map((s, i) => <p key={i} className="text-xs text-muted-foreground">• {s}</p>)}
                </div>
              )}
            </div>
            {aiEval.agent_trace && aiEval.agent_trace.length > 0 && (
              <div className="flex gap-2 flex-wrap pt-1">
                {aiEval.agent_trace.map((t, i) => (
                  <Badge key={i} variant="outline" className="text-[10px] border-border text-muted-foreground">
                    {t.agent}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> 每日学习时长
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dailyData} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} unit="h" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} labelStyle={{ color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {dailyData.map((_, i) => <Cell key={i} fill={i === dailyData.length - 1 ? '#4F46E5' : '#7C3AED60'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> 综合能力评估
              {aiEval?.scores && <Badge variant="outline" className="text-[10px] border-primary/30 text-primary ml-auto">AI生成</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="dim" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Radar dataKey="score" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 知识薄弱点标签云 */}
      {weakPoints.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> 知识薄弱点
              <Badge variant="outline" className="text-[10px] border-amber-400/30 text-amber-400 ml-auto">基于答题记录</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {weakPoints.map((w, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/5">
                  <span className="text-sm text-foreground">{w.topic_name}</span>
                  <span className="text-xs text-amber-400 font-semibold">{Math.round(w.rate * 100)}%错误率</span>
                  <span className="text-xs text-muted-foreground">({w.wrong}/{w.total})</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">建议重点复习以上知识点，进入课程页面完成相关练习题以降低错误率。</p>
          </CardContent>
        </Card>
      )}

      {/* Course progress */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">课程完成情况</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {progress.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">暂无课程进度数据</p>
            ) : progress.map(p => {
              const pct = p.total_chapters > 0 ? Math.round(p.completed_chapters / p.total_chapters * 100) : 0;
              return (
                <div key={p.id} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground truncate">{p.course?.title || '未知课程'}</span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">{p.completed_chapters}/{p.total_chapters} 章</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                  <span className="text-sm font-bold shrink-0 w-10 text-right" style={{ color: pct === 100 ? '#10B981' : '#4F46E5' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
