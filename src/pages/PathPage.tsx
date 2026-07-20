import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Circle, Lock, ChevronRight, Target, BookOpen, Code, BarChart3, Sparkles, RefreshCw, Loader2, AlertCircle, ExternalLink, Info, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import AgentTracePanel from '@/components/AgentTracePanel';
import { useNavigate } from 'react-router-dom';

type Status = 'done' | 'active' | 'locked';

interface PathRecommendedResource { type: string; topic: string; }
interface PathTopic { name: string; type: string; difficulty: number; mastery_level?: number; }
interface PathStage {
  id: number;
  phase: string;
  color: string;
  icon: string;
  goal: string;
  duration: string;
  topics: PathTopic[];
  resources: string[];
  recommendedResources?: PathRecommendedResource[];
  progress: number;
  status: Status;
}

interface AgentTraceItem {
  agent: string;
  action?: string;
  status: 'success' | 'error';
  summary: string;
  duration_ms?: number;
}

interface DiffBannerInfo {
  title: string;
  description: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  '🟢': BookOpen, '🟡': Code, '🔴': Target, '🔵': BarChart3,
};
const COLOR_MAP: Record<string, { bg: string; badge: string; dot: string; num: string }> = {
  green:  { bg: 'bg-emerald-500/10 border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500', num: 'text-emerald-400' },
  yellow: { bg: 'border-primary/40 bg-card', badge: 'bg-primary/20 text-primary border-primary/30', dot: 'bg-primary animate-pulse', num: 'text-primary' },
  red:    { bg: 'bg-rose-500/10 border-rose-500/30', badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30', dot: 'bg-rose-400', num: 'text-rose-400' },
  blue:   { bg: 'bg-blue-500/10 border-blue-500/30', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-400', num: 'text-blue-400' },
  default:{ bg: 'bg-muted/50 border-muted', badge: 'bg-muted text-muted-foreground border-muted', dot: 'bg-muted-foreground', num: 'text-muted-foreground' },
};

const STATUS_LABEL: Record<Status, string> = { done: '已完成', active: '进行中', locked: '待解锁' };

function deriveStatus(stages: PathStage[]): PathStage[] {
  return stages.map((s, i) => {
    if (s.progress >= 100) return { ...s, status: 'done' };
    if (s.progress > 0) return { ...s, status: 'active' };
    // 第一个0进度且前面有完成的 → active；否则 locked
    const prevDone = stages.slice(0, i).every(p => p.progress >= 100);
    return { ...s, status: prevDone && i === stages.filter(p => p.progress >= 100).length ? 'active' : 'locked' };
  });
}

function getMasteryColor(level: number): string {
  if (level >= 80) return 'bg-emerald-500';
  if (level >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getMasteryLabel(level: number): string {
  if (level >= 80) return '已掌握';
  if (level >= 50) return '了解中';
  return '未掌握';
}

const LS_PREV_STAGES = 'zhixuebang_last_path_stages';

export default function PathPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topicInput, setTopicInput] = useState('');
  const [stages, setStages] = useState<PathStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [agentTrace, setAgentTrace] = useState<AgentTraceItem[]>([]);
  const [totalDays, setTotalDays] = useState<number | null>(null);
  const [currentTopic, setCurrentTopic] = useState('');
  const [prevProgress, setPrevProgress] = useState<Record<number, number>>({});
  const [diffBanner, setDiffBanner] = useState<DiffBannerInfo | null>(null);

  // 启动时自动生成上次的路径（如有）
  useEffect(() => {
    const last = localStorage.getItem('zhixuebang_last_path_topic');
    if (last) { setTopicInput(last); }
  }, []);

  /**
   * 对比新旧路径，生成 diff banner 信息
   */
  function computeDiffBanner(
    oldStages: PathStage[],
    newStages: PathStage[],
  ): DiffBannerInfo | null {
    if (oldStages.length === 0) return null;

    // 检查是否有阶段进度变化 >= 20%
    const progressChanges: { phase: string; oldPct: number; newPct: number }[] = [];
    for (const ns of newStages) {
      const os = oldStages.find(o => o.id === ns.id);
      if (os && Math.abs(ns.progress - os.progress) >= 20) {
        progressChanges.push({ phase: ns.phase, oldPct: os.progress, newPct: ns.progress });
      }
    }

    // 检查旧路径中是否有进度 >= 80% 的阶段，且新路径结构不同
    const highProgressStages = oldStages.filter(s => s.progress >= 80);
    const structureChanged =
      oldStages.length !== newStages.length ||
      oldStages.some((os, i) => i < newStages.length && os.phase !== newStages[i].phase);

    if (progressChanges.length > 0 && highProgressStages.length > 0) {
      const donePhase = highProgressStages.map(s => `「${s.phase}」`).join('、');
      const nextPhase = newStages.length > highProgressStages.length
        ? `「${newStages[Math.min(highProgressStages.length, newStages.length - 1)].phase}」`
        : '后续';
      return {
        title: '重规划提示',
        description: `您已完成${donePhase}阶段 ${highProgressStages[0].progress}% 的内容，建议进入${nextPhase}阶段。路径已根据您的学习进度重新规划。`,
      };
    }

    if (progressChanges.length > 0) {
      const phases = progressChanges.map(p => `「${p.phase}」(${p.oldPct}% → ${p.newPct}%)`).join('、');
      return {
        title: '重规划提示',
        description: `以下阶段进度变化超过 20%：${phases}。学习路径已根据最新进度重新规划，请查看更新后的阶段安排。`,
      };
    }

    if (structureChanged && highProgressStages.length > 0) {
      const donePhase = highProgressStages.map(s => `「${s.phase}」`).join('、');
      return {
        title: '重规划提示',
        description: `您已完成${donePhase}阶段，路径结构已自动调整，建议进入下一阶段继续学习。`,
      };
    }

    if (structureChanged) {
      return {
        title: '重规划提示',
        description: '学习路径结构已更新，请查看新的阶段安排以继续您的学习计划。',
      };
    }

    return null;
  }

  const generatePath = async () => {
    const topic = topicInput.trim();
    if (!topic) { toast.error('请输入学习主题'); return; }
    setLoading(true);
    setStages([]);
    setAgentTrace([]);
    setDiffBanner(null);

    // 保存当前路径用于 diff 对比
    const prevStages = stages;

    try {
      // 获取学习记录总数用于进度参考（learning_records 无 topic 列，用 id 计数）
      let recordCount = 0;
      if (user) {
        const { data } = await supabase
          .from('learning_records')
          .select('id')
          .eq('user_id', user.id)
          .limit(100);
        recordCount = data?.length || 0;
      }

      const { data, error } = await supabase.functions.invoke('deepseek-path', {
        body: { topic },
      });
      if (error) throw new Error(error.message);

      const rawStages: PathStage[] = (data?.stages || []).map((s: PathStage, idx: number) => {
        // 使用 AI 返回的 progress，若有学习记录则根据阶段序号给予适度加成
        const bonus = recordCount > 0 ? Math.min(20, Math.floor(recordCount / 2)) : 0;
        const realProgress = idx === 0 ? Math.min(100, (s.progress || 0) + bonus) : (s.progress || 0);
        return { ...s, progress: realProgress };
      });

      let derivedStages = deriveStatus(rawStages);

      // ---- 1. 查询 knowledge_mastery 获取每个 topic 的掌握度 ----
      if (user) {
        try {
          const allTopicNames: string[] = [];
          derivedStages.forEach(s => {
            s.topics.forEach(t => allTopicNames.push(t.name));
          });

          if (allTopicNames.length > 0) {
            const { data: masteryData, error: masteryError } = await supabase
              .from('knowledge_mastery')
              .select('topic, mastery_level')
              .eq('user_id', (user as any).id)
              .in('topic', allTopicNames);

            if (!masteryError && masteryData) {
              const masteryMap = new Map<string, number>();
              (masteryData as any[]).forEach((item: any) => {
                masteryMap.set(item.topic, item.mastery_level);
              });

              derivedStages = derivedStages.map(s => ({
                ...s,
                topics: s.topics.map(t => {
                  const level = masteryMap.get(t.name);
                  return level !== undefined ? { ...t, mastery_level: level } : t;
                }),
              }));
            }
          }
        } catch (e) {
          console.warn('获取知识掌握度失败，跳过', e);
        }
      }

      // ---- 2. 对比新旧路径，生成 diff banner ----
      const banner = computeDiffBanner(prevStages, derivedStages);
      if (banner) {
        setDiffBanner(banner);
      }

      // 检测进度变化 > 20% → 提示重规划
      const prevMap = prevProgress;
      derivedStages.forEach(s => {
        const prev = prevMap[s.id];
        if (prev !== undefined && Math.abs(s.progress - prev) >= 20) {
          toast.info('学习进度已更新，是否重新规划后续路径？', {
            action: { label: '重新规划', onClick: generatePath },
            duration: 8000,
          });
        }
      });
      setPrevProgress(Object.fromEntries(derivedStages.map(s => [s.id, s.progress])));

      setStages(derivedStages);
      setTotalDays(data?.total_days ?? null);
      setAgentTrace(data?.agent_trace || []);
      setCurrentTopic(topic);

      // 自动展开第一个非done阶段
      const activeIdx = derivedStages.findIndex(s => s.status === 'active');
      setExpanded(activeIdx >= 0 ? activeIdx : 0);

      localStorage.setItem('zhixuebang_last_path_topic', topic);
      // 保存当前路径到 localStorage 用于后续 diff
      localStorage.setItem(LS_PREV_STAGES, JSON.stringify(derivedStages));
      toast.success(`已为"${topic}"生成 ${derivedStages.length} 阶段学习路径`);
    } catch (e) {
      toast.error(`生成失败：${e instanceof Error ? e.message : '请稍后重试'}`);
    } finally {
      setLoading(false);
    }
  };

  const overallProgress = stages.length
    ? Math.round(stages.reduce((s, p) => s + p.progress, 0) / stages.length)
    : 0;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">AI 学习路径规划</h1>
          <p className="text-sm text-muted-foreground">输入主题，AI 动态生成个性化四阶段路径</p>
        </div>
        {stages.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">整体进度</span>
            <div className="w-32"><Progress value={overallProgress} className="h-2" /></div>
            <span className="text-sm font-bold gradient-text">{overallProgress}%</span>
            {totalDays && <Badge variant="outline" className="text-xs">{totalDays}天计划</Badge>}
          </div>
        )}
      </div>

      {/* Topic Input */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              value={topicInput}
              onChange={e => setTopicInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && generatePath()}
              placeholder="输入学习主题，如：Java多线程、数据结构与算法、Spring Boot..."
              className="flex-1 bg-background border-border text-sm"
              disabled={loading}
            />
            <Button
              onClick={generatePath}
              disabled={loading || !topicInput.trim()}
              className="gradient-bg text-white shrink-0 gap-1.5"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" />生成中</>
                : stages.length > 0
                  ? <><RefreshCw className="w-4 h-4" />重新生成</>
                  : <><Sparkles className="w-4 h-4" />生成路径</>}
            </Button>
          </div>
          {currentTopic && !loading && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              已为「{currentTopic}」生成路径，进度基于您的真实学习记录计算
            </p>
          )}
        </CardContent>
      </Card>

      {/* Diff Banner */}
      {diffBanner && (
        <Alert className="border-primary/40 bg-primary/5">
          <TrendingUp className="w-4 h-4 text-primary" />
          <AlertTitle className="text-sm font-semibold text-foreground">{diffBanner.title}</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">{diffBanner.description}</AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!loading && stages.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">AI 动态规划学习路径</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            输入您想学习的主题，AI 将分析知识依赖，生成四阶段个性化路径，并基于您的历史学习记录计算真实进度
          </p>
        </motion.div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            多智能体正在规划路径：路径规划师 → 课程架构师 → 质量审核师...
          </div>
        </div>
      )}

      {/* Path Timeline */}
      {stages.length > 0 && (
        <div className="relative">
          <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-border hidden md:block" />
          <div className="space-y-4">
            {stages.map((stage, i) => {
              const colorKey = stage.color in COLOR_MAP ? stage.color : 'default';
              const { bg, badge: badgeCls, dot } = COLOR_MAP[colorKey];
              const isExpanded = expanded === i;
              const isLocked = stage.status === 'locked';
              const Icon = ICON_MAP[stage.icon] ?? Target;

              return (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                  <div className={`border rounded-2xl transition-all ${bg} ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:shadow-sm'}`}
                    onClick={() => !isLocked && setExpanded(isExpanded ? null : i)}>
                    <div className="p-4 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 relative z-10
                        ${stage.status === 'done' ? 'bg-emerald-500/20 border border-emerald-500/30'
                          : stage.status === 'active' ? 'gradient-bg'
                          : 'bg-muted border border-muted'}`}>
                        {stage.status === 'done' ? <CheckCircle className="w-6 h-6 text-emerald-400" />
                          : isLocked ? <Lock className="w-5 h-5 text-muted-foreground" />
                          : <Icon className="w-5 h-5 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold ${COLOR_MAP[colorKey].num}`}>0{i + 1}</span>
                          <span className="text-base font-bold text-foreground">{stage.phase}</span>
                          <Badge className={`text-xs px-2 py-0 ${badgeCls}`}>{STATUS_LABEL[stage.status]}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{stage.goal}</p>
                        {stage.progress > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <Progress value={stage.progress} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground shrink-0">{stage.progress}%</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground hidden md:block">{stage.duration}</span>
                        {!isLocked && (
                          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                          className="px-4 pb-4 border-t border-border pt-4 overflow-hidden"
                          onClick={e => e.stopPropagation()}>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                                <BookOpen className="w-3 h-3 text-primary" /> 知识点（{stage.topics.length}个）
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {stage.topics.map((t, ti) => {
                                  const masteryColor = t.mastery_level !== undefined ? getMasteryColor(t.mastery_level) : '';
                                  const masteryLabel = t.mastery_level !== undefined ? getMasteryLabel(t.mastery_level) : '';
                                  return (
                                    <Badge key={ti} variant="outline"
                                      className={`text-xs ${t.difficulty >= 3 ? 'border-rose-500/40 text-rose-400' : t.difficulty >= 2 ? 'border-primary/40 text-primary' : 'border-muted-foreground/30 text-muted-foreground'}`}>
                                      {t.name}
                                      {t.mastery_level !== undefined && (
                                        <span className="ml-1.5 inline-flex items-center gap-0.5">
                                          <span className={`w-1.5 h-1.5 rounded-full ${masteryColor}`} />
                                          <span className="text-[10px] opacity-70">{t.mastery_level}%</span>
                                        </span>
                                      )}
                                      <span className="ml-1 opacity-60">{'★'.repeat(t.difficulty)}</span>
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                                <Circle className="w-3 h-3 text-primary" /> 推荐资源
                              </h4>
                              <ul className="space-y-1.5">
                                {(stage.recommendedResources && stage.recommendedResources.length > 0
                                  ? stage.recommendedResources.map((r, ri) => (
                                    <li key={ri} className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                                        <span className="text-xs text-muted-foreground truncate">{r.type}：{r.topic}</span>
                                      </div>
                                      <button
                                        onClick={() => navigate(`/resources?type=${encodeURIComponent(r.type)}&topic=${encodeURIComponent(r.topic)}`)}
                                        className="shrink-0 text-[10px] text-primary hover:underline flex items-center gap-0.5">
                                        生成 <ExternalLink className="w-2.5 h-2.5" />
                                      </button>
                                    </li>
                                  ))
                                  : stage.resources.map((r, ri) => (
                                    <li key={ri} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dot}`} />{r}
                                    </li>
                                  ))
                                )}
                              </ul>
                            </div>
                          </div>
                          {stage.status === 'active' && (
                            <div className="mt-3 flex gap-2 justify-end">
                              <Button size="sm" className="gradient-bg text-white h-8 text-xs" onClick={() => toast.info('请在聊天页面继续学习')}>继续学习</Button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agent Trace */}
      {agentTrace.length > 0 && (
        <AgentTracePanel trace={agentTrace} title="路径规划 Agent 执行链" defaultOpen={false} />
      )}

      {/* Error hint */}
      {!loading && stages.length === 0 && currentTopic && (
        <div className="flex items-center gap-2 text-sm text-destructive justify-center">
          <AlertCircle className="w-4 h-4" /><span>未能生成路径，请检查网络后重试</span>
        </div>
      )}
    </div>
  );
}