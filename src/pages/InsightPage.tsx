import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import { motion, useInView, useAnimation } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import {
  Sparkles, Clock, Target, TrendingUp, TrendingDown, Brain,
  BookX, CheckCircle2, RefreshCw, Download, Flame, Zap, Star,
} from 'lucide-react';

// ── 数字滚动动画组件 ───────────────────────────────────────────────
function CountUp({ to, suffix = '', duration = 1.5 }: { to: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(timer); }
      else setVal(Math.floor(start * 10) / 10);
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, to, duration]);
  return <span ref={ref}>{Number.isInteger(to) ? Math.round(val) : val.toFixed(1)}{suffix}</span>;
}

// ── 叙事卡片（带渐入动画）─────────────────────────────────────────
function NarrativeCard({ children, delay = 0, gradient }: {
  children: React.ReactNode; delay?: number; gradient?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={`rounded-2xl p-5 border border-border/40 ${gradient || 'bg-card'} shadow-sm`}>
      {children}
    </motion.div>
  );
}

type ReportStats = {
  totalHours: number;
  prevHours: number;
  growth: number;
  accuracy: number;
  activeDays: number;
  pendingMistakes: number;
  topCourses: { id: string; hours: number }[];
  dailyData: { date: string; minutes: number; hours: number }[];
  weakPoints: string[];
  totalQuestions: number;
  correctQuestions: number;
  period: string;
};

type Range = '7' | '30';

const RANGE_LABEL: Record<Range, string> = { '7': '本周', '30': '近30天' };

// 雷达图维度（用固定数据模拟五维）
function buildRadar(stats: ReportStats) {
  return [
    { subject: '学习时长', value: Math.min(100, Math.round(stats.totalHours * 10)) },
    { subject: '答题正确率', value: stats.accuracy },
    { subject: '活跃天数', value: Math.min(100, Math.round((stats.activeDays / 7) * 100)) },
    { subject: '错题清零', value: stats.pendingMistakes === 0 ? 100 : Math.max(0, 100 - stats.pendingMistakes * 5) },
    { subject: '专注度', value: Math.min(100, Math.round(stats.totalHours > 0 ? 60 + stats.activeDays * 5 : 40)) },
  ];
}

export default function InsightPage() {
  const { user, profile } = useAuth();
  const [range, setRange] = useState<Range>('7');
  const [loading, setLoading] = useState(false);
  const [narrative, setNarrative] = useState('');
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const controls = useAnimation();

  const generate = async () => {
    if (!user) return;
    setLoading(true);
    setHasGenerated(false);
    try {
      const { data, error } = await supabase.functions.invoke('deepseek-report', {
        body: { days: parseInt(range) }
      });
      if (error) throw error;
      setNarrative(data.narrative || '');
      setStats(data.stats || null);
      setHasGenerated(true);
      controls.start({ opacity: 1, y: 0 });
      toast.success('学习报告生成完成');
    } catch (e) {
      toast.error(`报告生成失败：${e instanceof Error ? e.message : '请稍后重试'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!narrative || !stats) return;
    const content = `# 智学帮学习报告（${RANGE_LABEL[range]}）\n\n生成时间：${new Date().toLocaleString()}\n\n---\n\n## AI 学习分析\n\n${narrative}\n\n---\n\n## 数据摘要\n\n- 学习时长：${stats.totalHours}h（${stats.growth >= 0 ? '↑' : '↓'}${Math.abs(stats.growth)}%）\n- 答题正确率：${stats.accuracy}%\n- 活跃天数：${stats.activeDays}天\n- 待复习错题：${stats.pendingMistakes}道\n\n## 主要课程\n\n${stats.topCourses.map(c => `- ${c.id}：${c.hours}h`).join('\n')}\n\n## 薄弱知识点\n\n${stats.weakPoints.map(w => `- ${w}`).join('\n') || '暂无'}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `智学帮学习报告_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    toast.success('报告已下载（Markdown 格式）');
  };

  const radarData = stats ? buildRadar(stats) : [];
  const growthPositive = (stats?.growth ?? 0) >= 0;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 页头 */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">学习仪表盘 2.0</h1>
            <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px]">
              <Sparkles className="w-2.5 h-2.5 mr-1" />Wrapped 风格
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">AI 叙事分析 · 数据动画 · 学习周报</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Select value={range} onValueChange={v => setRange(v as Range)}>
            <SelectTrigger className="h-8 w-28 text-xs bg-muted border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">本周（7天）</SelectItem>
              <SelectItem value="30">近30天</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generate} disabled={loading} size="sm" className="h-8 text-xs gradient-bg text-white">
            {loading ? <><RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />生成中...</> : <><Sparkles className="w-3.5 h-3.5 mr-1.5" />生成报告</>}
          </Button>
          {hasGenerated && (
            <Button onClick={handleDownload} variant="outline" size="sm" className="h-8 text-xs">
              <Download className="w-3.5 h-3.5 mr-1.5" />下载
            </Button>
          )}
        </div>
      </div>

      {/* 未生成时的引导区 */}
      {!hasGenerated && !loading && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-10 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Star className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">生成你的学习故事</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-5">
            AI 分析你的真实学习数据，用 Spotify Wrapped 风格讲述你的学习历程，包含时长、正确率、薄弱点和个性化建议。
          </p>
          <Button onClick={generate} disabled={loading} className="gradient-bg text-white px-6">
            <Sparkles className="w-4 h-4 mr-2" />立即生成{RANGE_LABEL[range]}报告
          </Button>
        </motion.div>
      )}

      {/* 加载骨架 */}
      {loading && (
        <div className="space-y-4">
          {[140, 100, 200, 120].map((h, i) => (
            <div key={i} className="rounded-2xl bg-muted animate-pulse" style={{ height: h }} />
          ))}
        </div>
      )}

      {/* 生成结果 */}
      {hasGenerated && stats && (
        <div className="space-y-4">
          {/* AI 叙事段落 */}
          <NarrativeCard delay={0} gradient="bg-gradient-to-br from-primary/10 via-primary/5 to-card border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shrink-0 mt-0.5">
                <Brain className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI 学习分析</span>
                  <Badge className="text-[9px] bg-primary/15 text-primary border-primary/20 h-4">DeepSeek</Badge>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{narrative}</p>
              </div>
            </div>
          </NarrativeCard>

          {/* 数字卡片行 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                icon: Clock, label: '学习时长', value: stats.totalHours, suffix: 'h',
                sub: stats.growth !== 0 ? `较上期 ${growthPositive ? '+' : ''}${stats.growth}%` : '与上期持平',
                subColor: growthPositive ? 'text-emerald-500' : 'text-red-400',
                SubIcon: growthPositive ? TrendingUp : TrendingDown,
                gradient: 'from-blue-500/10 to-blue-500/5',
              },
              {
                icon: Target, label: '答题正确率', value: stats.accuracy, suffix: '%',
                sub: `共 ${stats.totalQuestions} 道题`, subColor: 'text-muted-foreground', SubIcon: CheckCircle2,
                gradient: 'from-emerald-500/10 to-emerald-500/5',
              },
              {
                icon: Flame, label: '活跃天数', value: stats.activeDays, suffix: '天',
                sub: `距满${range}天还差${Math.max(0, parseInt(range) - stats.activeDays)}天`,
                subColor: stats.activeDays >= parseInt(range) ? 'text-orange-500' : 'text-muted-foreground',
                SubIcon: Flame,
                gradient: 'from-orange-500/10 to-orange-500/5',
              },
              {
                icon: BookX, label: '待复习错题', value: stats.pendingMistakes, suffix: '道',
                sub: stats.pendingMistakes === 0 ? '🎉 全部掌握！' : '点击去复习',
                subColor: stats.pendingMistakes === 0 ? 'text-emerald-500' : 'text-amber-500', SubIcon: BookX,
                gradient: 'from-violet-500/10 to-violet-500/5',
              },
            ].map(({ icon: Icon, label, value, suffix, sub, subColor, SubIcon, gradient }, i) => (
              <NarrativeCard key={label} delay={0.1 + i * 0.08} gradient={`bg-gradient-to-br ${gradient} border-border/50`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <Icon className="w-3.5 h-3.5 text-muted-foreground/60" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  <CountUp to={value} suffix={suffix} />
                </div>
                <div className={`text-xs mt-1 flex items-center gap-1 ${subColor}`}>
                  <SubIcon className="w-3 h-3" />{sub}
                </div>
              </NarrativeCard>
            ))}
          </div>

          {/* 每日时长折线图 */}
          {stats.dailyData.length > 0 && (
            <NarrativeCard delay={0.3} gradient="bg-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">每日学习时长</p>
                  <p className="text-xs text-muted-foreground">{RANGE_LABEL[range]}趋势</p>
                </div>
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={stats.dailyData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} unit="m" />
                  <Tooltip formatter={(v: number) => [`${v}分钟`, '时长']} labelFormatter={l => l} />
                  <Area type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" fill="url(#areaGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </NarrativeCard>
          )}

          {/* 主要课程 + 雷达图 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 课程分布 */}
            <NarrativeCard delay={0.4} gradient="bg-card">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />主要投入课程
              </p>
              {stats.topCourses.length === 0
                ? <p className="text-xs text-muted-foreground py-6 text-center">本期暂无学习记录</p>
                : <div className="space-y-3">
                  {stats.topCourses.map((c, i) => {
                    const maxH = stats.topCourses[0]?.hours || 1;
                    return (
                      <div key={c.id} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-foreground truncate">{c.id}</span>
                          <span className="text-primary font-medium shrink-0 ml-2">{c.hours}h</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(c.hours / maxH) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                            className={`h-full rounded-full ${i === 0 ? 'gradient-bg' : i === 1 ? 'bg-primary/60' : 'bg-primary/30'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              }
            </NarrativeCard>

            {/* 5维雷达图 */}
            <NarrativeCard delay={0.45} gradient="bg-card">
              <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />学习能力雷达
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Radar name="能力" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </NarrativeCard>
          </div>

          {/* 薄弱知识点 */}
          {stats.weakPoints.length > 0 && (
            <NarrativeCard delay={0.5} gradient="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                  <BookX className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1.5">需要重点关注的知识点</p>
                  <div className="flex flex-wrap gap-2">
                    {stats.weakPoints.map(w => (
                      <Badge key={w} className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs">{w}</Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">建议每个知识点安排 20-30 分钟专项复习</p>
                </div>
              </div>
            </NarrativeCard>
          )}

          {/* 下载提示 */}
          <NarrativeCard delay={0.55} gradient="bg-muted/40 border-dashed">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">保存学习周报</p>
                  <p className="text-xs text-muted-foreground">导出为 Markdown 文件，可粘贴至个人知识库或发送给老师</p>
                </div>
              </div>
              <Button onClick={handleDownload} variant="outline" size="sm" className="shrink-0 text-xs h-8">
                <Download className="w-3.5 h-3.5 mr-1" />下载报告
              </Button>
            </div>
          </NarrativeCard>
        </div>
      )}
    </div>
  );
}
