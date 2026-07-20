import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sparkles, FileText, Code, BookOpen, Download, Copy, Check, Brain,
  Presentation, CheckCircle2, XCircle, AlertTriangle, Loader2, Bot,
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { renderMessageContent } from '@/components/common/MermaidRenderer';
import AgentTracePanel, { AgentTraceItem } from '@/components/AgentTracePanel';

// v19: 已移除 illustrationData / mindmap，仅保留 code/quiz/reading/explanation/ppt 五种类型
type ResourceType = 'code' | 'quiz' | 'reading' | 'explanation' | 'ppt';

const RESOURCE_TYPES: { key: ResourceType; icon: React.ComponentType<{ className?: string }>; label: string; desc: string }[] = [
  { key: 'code', icon: Code, label: '代码案例', desc: '实用代码示例' },
  { key: 'quiz', icon: FileText, label: '练习题', desc: '巩固知识练习' },
  { key: 'reading', icon: BookOpen, label: '阅读清单', desc: '推荐学习资源' },
  { key: 'explanation', icon: Brain, label: '课程讲解', desc: 'AI深度讲解' },
  { key: 'ppt', icon: Presentation, label: 'PPT课件', desc: '一键生成PPT' },
];

const TYPE_MAP: Record<ResourceType, string> = {
  code: 'code_example', quiz: 'exercises',
  reading: 'reading_list', explanation: 'course_document', ppt: 'ppt',
};

interface ReviewResult {
  score: number;
  verdict: 'pass' | 'warn' | 'reject';
  hallucination_risk: string;
  issues: string[];
  suggestions: string[];
  summary?: string;
}

interface PptSlide { index: number; type: string; title: string; bullets: string[]; notes?: string; code?: string; }

// 前端用 pptxgenjs 生成PPT下载
async function downloadPpt(pptData: { title: string; subtitle?: string; slides: PptSlide[] }) {
  // 动态导入（若未安装则友好提示）
  // deno-lint-ignore no-explicit-any
  let pptxgen: { default: new () => any } | null = null;
  try { pptxgen = await import('pptxgenjs' as never); } catch { /* 下面处理 */ }
  if (!pptxgen) {
    toast.error('PPT 生成库未安装，正在以 Markdown 下载...');
    const md = `# ${pptData.title}\n\n` +
      pptData.slides.map(s => `## ${s.title}\n${s.bullets.map(b => `- ${b}`).join('\n')}`).join('\n\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
    a.download = `${pptData.title}.md`;
    a.click();
    return;
  }
  const pres = new pptxgen.default();
  pres.title = pptData.title;
  // 封面
  const cover = pres.addSlide();
  cover.addText(pptData.title, { x: 0.5, y: 2, w: 9, h: 1.5, fontSize: 32, bold: true, align: 'center', color: '2563EB' });
  if (pptData.subtitle) cover.addText(pptData.subtitle, { x: 0.5, y: 4, w: 9, h: 0.8, fontSize: 18, align: 'center', color: '666666' });
  // 内容页
  for (const slide of pptData.slides.slice(0, 20)) {
    const s = pres.addSlide();
    s.addText(slide.title, { x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 24, bold: true, color: '1e293b' });
    if (slide.bullets?.length) {
      const bulletText = slide.bullets.map(b => ({ text: b, options: { bullet: { type: 'bullet' } } }));
      s.addText(bulletText, { x: 0.5, y: 1.3, w: 9, h: 4.5, fontSize: 16, color: '334155' });
    }
    if (slide.code) {
      s.addText(slide.code, { x: 0.3, y: 1.2, w: 9.4, h: 4.5, fontSize: 12, fontFace: 'Courier New', color: '1e293b', fill: { color: 'f1f5f9' }, valign: 'top' });
    }
    if (slide.notes) s.addNotes(slide.notes);
  }
  await pres.writeFile({ fileName: `${pptData.title}.pptx` });
  toast.success('PPT 已下载');
}

export default function ResourcesPage() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<ResourceType>('code');
  const [topic, setTopic] = useState('');
  const [detail, setDetail] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [agentTrace, setAgentTrace] = useState<AgentTraceItem[]>([]);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [pptData, setPptData] = useState<{ title: string; subtitle?: string; slides: PptSlide[] } | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [profileSnapshot, setProfileSnapshot] = useState<{ version?: number; scores?: any; weak_points?: any; suggestions?: any } | null>(null);

  const generate = async () => {
    if (!topic.trim()) { toast.error('请输入学习主题'); return; }
    setGenerating(true);
    setResult('');
    setAgentTrace([]);
    setReview(null);
    setPptData(null);
    setProfileSnapshot(null);

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://pnmjgxsemgldncqbimbt.supabase.co';
      // 获取用户画像（可选）
      let profileData: Record<string, unknown> | null = null;
      let knowledgePoints: string[] = [];
      try {
        const [profileRes, masteryRes] = await Promise.all([
          supabase.functions.invoke('deepseek-profile', { body: {} }),
          user ? supabase.from('knowledge_mastery').select('*').eq('user_id', (user as Record<string, unknown>).id as string).order('mastery_level') : Promise.resolve({ data: [], error: null }),
        ]);
        if (!profileRes.error && profileRes.data) profileData = profileRes.data as Record<string, unknown>;
        if (!masteryRes.error && masteryRes.data) knowledgePoints = (masteryRes.data as Array<{ topic: string }>).map(item => item.topic);
      } catch { /* 画像获取失败不影响主流程 */ }

      // 所有资源类型统一走 fetch+JWT
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { toast.error('请先登录'); return; }

      if (selectedType === 'ppt') {
        // PPT 走单独 Edge Function
        const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-ppt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            topic: detail ? `${topic}（${detail}）` : topic,
            outline: [topic, detail || '', '核心概念', '关键机制', '代码示例', '总结回顾'].filter(Boolean),
            template: 'lecture', slideCount: 8, formats: ['pptx', 'html', 'notes'],
          }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({ error: `HTTP ${res.status}` }))).error);
        const data = await res.json();
        setPptData(data);
        setResult(`## ${data.topic ?? topic}\n\n已生成 ${data.slideCount ?? 0} 张幻灯片。` +
          (data.notes_url ? `\n\n📝 [教师讲稿](${data.notes_url})` : '') +
          (data.html_url ? `\n\n🌐 [HTML课件](${data.html_url})` : '') +
          `\n\n点击下方按钮下载 PPTX 文件。`);
        toast.success('PPT生成成功');
        return;
      }

      // 其他 4 种资源 → deepseek-resources
      const topicFull = detail ? `${topic}（${detail}）` : topic;
      const res = await fetch(`${SUPABASE_URL}/functions/v1/deepseek-resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          topic: topicFull,
          resourceType: TYPE_MAP[selectedType],
          mode: 'full',
          ...(profileData ? { profile: profileData } : {}),
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errBody.error || errBody.message || '资源生成失败');
      }
      const data = await res.json();

      // 取对应类型内容
      const resourceKey: Record<string, string> = { code: 'code', quiz: 'quiz', reading: 'reading', explanation: 'handout' };
      const content: string = (data.resources?.[resourceKey[selectedType]]) || data.content || '';
      if (!content) throw new Error('AI 未返回有效内容，请重试');
      setResult(content);
      if (data.agent_trace) setAgentTrace(data.agent_trace);
      if (data.review) setReview(data.review);
      toast.success('资源生成完成');

      // 写入 resource_generate 事件（可选，不影响主流程）
      try {
        supabase.functions.invoke('learning-event', {
          body: {
            action: 'resource_generate',
            resource_type: selectedType,
            topic: detail ? `${topic}（${detail}）` : topic,
            quality_score: data.review?.score
          }
        });
      } catch (e) { console.warn('写入学习事件失败', e); }
    } catch (e) {
      toast.error(`生成失败：${e instanceof Error ? e.message : '请稍后重试'}`);
    } finally {
      setGenerating(false);
    }
  };

  const runReview = async () => {
    if (!result) return;
    setReviewLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const baseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pnmjgxsemgldncqbimbt.supabase.co';
      const res = await fetch(`${baseUrl}/functions/v1/deepseek-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: result, topic, type: selectedType === 'code' ? 'code' : 'general' }),
      });
      if (!res.ok) throw new Error(`审核服务异常 (${res.status})`);
      const data = await res.json();
      setReview(data as ReviewResult);
      const newTrace = data?.agent_trace || [];
      if (newTrace.length) setAgentTrace(prev => [...prev, ...newTrace]);
    } catch { toast.error('审核失败'); }
    finally { setReviewLoading(false); }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success('已复制到剪贴板');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (pptData) { downloadPpt(pptData); return; }
    const blob = new Blob([result], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${topic}-${RESOURCE_TYPES.find(t => t.key === selectedType)?.label}.md`;
    a.click();
    toast.success('已下载');
  };

  const verdictConfig = {
    pass: { cls: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', icon: CheckCircle2, label: '审核通过' },
    warn: { cls: 'text-amber-400 border-amber-500/30 bg-amber-500/10', icon: AlertTriangle, label: '需人工复核' },
    reject: { cls: 'text-destructive border-destructive/30 bg-destructive/10', icon: XCircle, label: '质量不足' },
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">资源生成</h1>
        <p className="text-sm text-muted-foreground">十二智能体协同编排，资源生成模块由七子智能体（课程架构/讲义/导图/题库/代码/资源推荐/质量审核）并行协作</p>
      </div>

      {/* Type selector */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {RESOURCE_TYPES.map(({ key, icon: Icon, label, desc }) => (
          <button key={key} onClick={() => setSelectedType(key)}
            className={`p-3 rounded-xl border text-center transition-all ${selectedType === key
              ? 'gradient-bg text-white border-primary shadow-md'
              : 'border-border bg-card hover:border-primary/40 text-muted-foreground hover:text-foreground'}`}>
            <Icon className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xs font-medium">{label}</p>
            <p className={`text-xs mt-0.5 ${selectedType === key ? 'text-white/70' : 'text-muted-foreground'}`}>{desc}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">生成设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">学习主题 *</label>
                <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="如：Java多态、递归算法" className="bg-muted border-border h-9" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">补充说明（可选）</label>
                <Textarea value={detail} onChange={e => setDetail(e.target.value)}
                  placeholder="如：面向初学者，重点讲解原理..." className="bg-muted border-border text-sm min-h-24 resize-none" />
              </div>
              <Button onClick={generate} disabled={generating || !topic.trim()} className="w-full gradient-bg text-white h-10 font-semibold">
                {generating ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />多智能体生成中...</span>
                ) : (
                  <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" />生成{RESOURCE_TYPES.find(t => t.key === selectedType)?.label}</span>
                )}
              </Button>
              {generating && (
                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                  <Bot className="w-3 h-3 text-primary" />
                  多智能体并行工作中，请稍候（约15-30秒）...
                </p>
              )}
            </CardContent>
          </Card>

          {/* Review panel */}
          {review && (
            <Card className="border-border">
              <CardHeader className="pb-2 pt-3 px-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  防幻觉审核结果
                  <Badge variant="outline" className={`text-xs ${verdictConfig[review.verdict].cls}`}>
                    {(() => { const VC = verdictConfig[review.verdict]; return <VC.icon className="w-2.5 h-2.5 mr-1" />; })()}
                    {verdictConfig[review.verdict].label}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">质量评分</span>
                  <div className="flex-1 bg-muted rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${review.score * 10}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{review.score}/10</span>
                </div>
                <p className="text-xs text-muted-foreground">幻觉风险：<span className={review.hallucination_risk === 'low' ? 'text-emerald-400' : review.hallucination_risk === 'medium' ? 'text-amber-400' : 'text-destructive'}>{review.hallucination_risk}</span></p>
                {review.issues?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1">发现问题</p>
                    {review.issues.map((issue, i) => (
                      <p key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                        <XCircle className="w-2.5 h-2.5 text-destructive shrink-0 mt-0.5" />{issue}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {result && !review && (
            <Button variant="outline" size="sm" onClick={runReview} disabled={reviewLoading}
              className="w-full border-border text-xs h-8">
              {reviewLoading ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />审核中...</> : '🔍 运行防幻觉审核'}
            </Button>
          )}
        </div>

        {/* Result panel */}
        <div className="lg:col-span-3">
          <Card className="border-border h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">生成结果</CardTitle>
                {result && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy} className="h-7 text-xs border-border">
                      {copied ? <Check className="w-3 h-3 mr-1 text-emerald-500" /> : <Copy className="w-3 h-3 mr-1" />} 复制
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDownload} className="h-7 text-xs border-border">
                      <Download className="w-3 h-3 mr-1" /> {pptData ? '下载 PPT' : '下载 MD'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="overflow-y-auto max-h-[500px]">
                  <div className="prose prose-sm max-w-none text-foreground
                        [&>*]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground
                        [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_pre]:bg-muted [&_pre]:p-3
                        [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_table]:w-full [&_th]:bg-muted [&_th]:p-2
                        [&_td]:p-2 [&_td]:border-b [&_td]:border-border">
                    {renderMessageContent(result)}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">选择资源类型，输入主题，点击生成</p>
                  <p className="text-xs mt-1 opacity-60">多智能体并行协作，生成全套学习资源</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Agent Trace Panel */}
      {agentTrace.length > 0 && (
        <AgentTracePanel trace={agentTrace} title="资源生成 Agent 执行链（DAG 并行编排）" defaultOpen={true} />
      )}

      {/* 画像版本信息 */}
      {profileSnapshot && (
        <p className="text-xs text-muted-foreground text-center -mt-4">
          基于画像版本 v{profileSnapshot.version ?? '?'} 生成
        </p>
      )}
    </div>
  );
}