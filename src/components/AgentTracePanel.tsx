// AgentTracePanel — Agent 执行链可视化组件（支持时间轴 + Mermaid DAG）
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, Clock, Bot, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AgentTraceItem {
  agent: string;
  status: 'success' | 'error';
  summary: string;
  duration_ms?: number;
  step?: string;   // '1-串行' | '2-并行' | '3-串行'
  action?: string;
}

interface Props {
  trace: AgentTraceItem[];
  title?: string;
  defaultOpen?: boolean;
}

const AGENT_COLORS: Record<string, string> = {
  CurriculumAgent:  'bg-blue-500/15 border-blue-500/30 text-blue-400',
  HandoutAgent:     'bg-violet-500/15 border-violet-500/30 text-violet-400',
  MindmapAgent:     'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
  QuizAgent:        'bg-amber-500/15 border-amber-500/30 text-amber-400',
  CodeCaseAgent:    'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
  ReadingListAgent: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
  ReviewerAgent:    'bg-orange-500/15 border-orange-500/30 text-orange-400',
  default:          'bg-primary/10 border-primary/20 text-primary',
};

const AGENT_DISPLAY: Record<string, string> = {
  CurriculumAgent:  '课程架构师',
  HandoutAgent:     '讲义编写师',
  MindmapAgent:     '思维导图师',
  QuizAgent:        '题库出题师',
  CodeCaseAgent:    '代码案例师',
  ReadingListAgent: '资源推荐师',
  ReviewerAgent:    '质量审核师',
};

function AgentNode({ item, delay = 0 }: { item: AgentTraceItem; delay?: number }) {
  const colorCls = AGENT_COLORS[item.agent] ?? AGENT_COLORS.default;
  const displayName = AGENT_DISPLAY[item.agent] ?? item.agent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-xl border px-3 py-2 text-xs ${colorCls}`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {item.status === 'success'
          ? <CheckCircle2 className="w-3 h-3 shrink-0" />
          : <XCircle className="w-3 h-3 shrink-0" />}
        <span className="font-semibold">{displayName}</span>
        {item.duration_ms !== undefined && item.duration_ms > 0 && (
          <span className="ml-auto opacity-60 flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />{(item.duration_ms / 1000).toFixed(1)}s
          </span>
        )}
      </div>
      <p className="text-[10px] opacity-75 leading-relaxed line-clamp-2">{item.summary}</p>
    </motion.div>
  );
}

export default function AgentTracePanel({ trace, title = 'Agent 执行链', defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  if (!trace || trace.length === 0) return null;

  // 分组：串行阶段1 → 并行阶段2 → 串行阶段3
  const stage1 = trace.filter(t => t.step === '1-串行' || (!t.step && trace.indexOf(t) === 0));
  const stage2 = trace.filter(t => t.step === '2-并行');
  const stage3 = trace.filter(t => t.step === '3-串行');
  // 没有step信息时展示为扁平列表
  const hasDag = stage2.length > 0;

  const successCount = trace.filter(t => t.status === 'success').length;
  const totalMs = trace.reduce((s, t) => s + (t.duration_ms ?? 0), 0);

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Network className="w-4 h-4 text-primary" />
            {title}
            <Badge variant="outline" className="text-xs ml-1">
              {successCount}/{trace.length} 成功
            </Badge>
            {totalMs > 0 && (
              <span className="text-xs text-muted-foreground font-normal flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />总耗时 {(totalMs / 1000).toFixed(1)}s
              </span>
            )}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(!open)}>
            {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </CardHeader>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <CardContent className="px-4 pb-4">
              {hasDag ? (
                // DAG 可视化：三阶段布局
                <div className="space-y-3">
                  {/* 阶段1：串行 */}
                  {stage1.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />阶段1 · 串行执行
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {stage1.map((item, i) => <AgentNode key={i} item={item} delay={i * 0.05} />)}
                      </div>
                    </div>
                  )}

                  {/* 阶段1 → 阶段2 连接线 */}
                  {stage1.length > 0 && stage2.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <div className="flex-1 h-px bg-border" />
                      <span className="px-2">并行分发</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )}

                  {/* 阶段2：并行 */}
                  {stage2.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />阶段2 · 并行执行（{stage2.length}个智能体同时工作）
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {stage2.map((item, i) => <AgentNode key={i} item={item} delay={i * 0.04} />)}
                      </div>
                    </div>
                  )}

                  {/* 阶段2 → 阶段3 连接线 */}
                  {stage2.length > 0 && stage3.length > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <div className="flex-1 h-px bg-border" />
                      <span className="px-2">汇总审核</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )}

                  {/* 阶段3：串行审核 */}
                  {stage3.length > 0 && (
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />阶段3 · 串行审核
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {stage3.map((item, i) => <AgentNode key={i} item={item} delay={i * 0.05} />)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // 扁平时间轴（没有step信息时）
                <div className="space-y-2">
                  {trace.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex flex-col items-center shrink-0">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${item.status === 'success' ? 'bg-emerald-500' : 'bg-destructive'}`} />
                        {i < trace.length - 1 && <div className="w-px h-6 bg-border mt-1" />}
                      </div>
                      <div className="flex-1 pb-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-foreground">
                            {AGENT_DISPLAY[item.agent] ?? item.agent}
                          </span>
                          {item.action && <span className="text-xs text-muted-foreground">— {item.action}</span>}
                          {item.duration_ms !== undefined && item.duration_ms > 0 && (
                            <span className="text-[10px] text-muted-foreground ml-auto">
                              {(item.duration_ms / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{item.summary}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 总结 Row */}
              <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-3 text-xs text-muted-foreground">
                <Bot className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>多智能体 DAG 编排完成 · {successCount} 个智能体成功 · {trace.filter(t => t.status === 'error').length} 个失败</span>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
