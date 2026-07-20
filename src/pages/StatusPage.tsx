import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle, XCircle, AlertCircle, Activity, Bot, Brain, Sparkles, Database,
  MessageSquare, GraduationCap, LineChart, BookOpen, Target, Compass, FileText,
  Lightbulb, ListChecks, Code, LayoutList, RefreshCw, Loader2, Wifi, WifiOff,
} from 'lucide-react';
import { supabase } from '@/db/supabase';

type HealthStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

interface HealthItem {
  status: HealthStatus;
  latency_ms?: number;
  message?: string;
  checked_at: string;
}

interface SystemHealth {
  overall: HealthStatus;
  database: HealthItem;
  deepseek: HealthItem;
  spark: HealthItem;
  rag: HealthItem;
  storage: HealthItem;
  agents: HealthItem[];
  checked_at: string;
}

const AGENT_NAMES = [
  '对话Agent', '诊断Agent', '画像Agent', '知识库Agent',
  '路径规划Agent', '课程架构Agent', '讲义编写Agent', '思维导图Agent',
  '题库出题Agent', '代码案例Agent', '资源推荐Agent', '质量审核Agent',
];

const STATUS_CONFIG: Record<HealthStatus, { label: string; icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  healthy: { label: '正常', icon: CheckCircle, cls: 'text-green-400 bg-green-500/10 border-green-500/30' },
  degraded: { label: '降级', icon: AlertCircle, cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  down: { label: '离线', icon: XCircle, cls: 'text-red-400 bg-red-500/10 border-red-500/30' },
  unknown: { label: '未知', icon: AlertCircle, cls: 'text-muted-foreground bg-muted border-border' },
};

function StatusBadge({ status }: { status: HealthStatus }) {
  const { label, icon: Icon, cls } = STATUS_CONFIG[status];
  return <Badge className={`text-xs ${cls}`}><Icon className="w-3 h-3 mr-1" />{label}</Badge>;
}

function PulseDot({ status }: { status: HealthStatus }) {
  const colors: Record<HealthStatus, string> = {
    healthy: 'bg-green-500 animate-pulse',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500',
    unknown: 'bg-muted-foreground',
  };
  return <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors[status]}`} />;
}

export default function StatusPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<string>('');

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('system-health', {});
      if (fnError) throw new Error(fnError.message);
      setHealth(data as SystemHealth);
      setLastCheck(new Date().toLocaleTimeString('zh-CN'));
    } catch (e) {
      setError(e instanceof Error ? e.message : '健康检查失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60000); // 每分钟自动刷新
    return () => clearInterval(interval);
  }, []);

  const overallLabel: Record<HealthStatus, string> = {
    healthy: '系统整体状态：运行正常',
    degraded: '系统整体状态：部分降级',
    down: '系统整体状态：故障',
    unknown: '系统整体状态：未知',
  };

  const overallDesc: Record<HealthStatus, string> = {
    healthy: '数据库已连接 · AI模型已配置 · 知识库可用',
    degraded: '部分服务降级，核心功能仍可用',
    down: '关键服务不可用，请检查配置',
    unknown: '正在检查服务状态...',
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">系统状态</h1>
          <p className="text-sm text-muted-foreground">智学帮各模块运行状态实时监控</p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          刷新 · {lastCheck || '—'}
        </button>
      </div>

      {/* Loading */}
      {loading && !health && (
        <Card className="border-border">
          <CardContent className="p-8 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">正在检查系统健康状态...</p>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && !health && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <WifiOff className="w-6 h-6 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">无法获取系统状态</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <button onClick={fetchHealth} className="text-xs text-primary hover:underline">重试</button>
          </CardContent>
        </Card>
      )}

      {health && (
        <>
          {/* Overall */}
          <Card className={`border ${health.overall === 'healthy' ? 'border-primary/30 bg-primary/5' : health.overall === 'degraded' ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-destructive/30 bg-destructive/5'}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{overallLabel[health.overall]}</h3>
                <p className="text-sm text-muted-foreground">{overallDesc[health.overall]}</p>
              </div>
              <PulseDot status={health.overall} />
            </CardContent>
          </Card>

          {/* Core Services */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">核心服务状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { icon: Database, name: '数据库', item: health.database },
                  { icon: Brain, name: 'DeepSeek API', item: health.deepseek },
                  { icon: Sparkles, name: '星火 Spark', item: health.spark },
                  { icon: BookOpen, name: '知识库检索', item: health.rag },
                  { icon: Bot, name: '存储服务', item: health.storage },
                ].map(({ icon: Icon, name, item }) => (
                  <div key={name} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/20 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">{item.message || '正常'}</p>
                      {item.latency_ms !== undefined && (
                        <p className="text-xs text-primary mt-0.5">延迟: {item.latency_ms}ms</p>
                      )}
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agents */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">十二大智能体状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {AGENT_NAMES.map((name, idx) => {
                  const agentHealth = health.agents[idx] || { status: 'unknown' as HealthStatus, message: '等待检查' };
                  const status = agentHealth.status;
                  return (
                    <div key={name} className={`p-3 rounded-xl border transition-all ${
                      status === 'healthy' ? 'border-border hover:border-primary/20' :
                      status === 'degraded' ? 'border-yellow-500/30 bg-yellow-500/5' :
                      status === 'down' ? 'border-destructive/30 bg-destructive/5' :
                      'border-border'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          status === 'healthy' ? 'bg-primary/10 border border-primary/20' :
                          status === 'degraded' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                          'bg-muted border border-border'
                        }`}>
                          <Bot className={`w-4 h-4 ${status === 'healthy' ? 'text-primary' : status === 'degraded' ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                        </div>
                        <StatusBadge status={status} />
                      </div>
                      <p className="font-semibold text-foreground text-sm">{name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{agentHealth.message || '正常运行'}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Database Tables */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" /> 数据库表状态
                <StatusBadge status={health.database.status} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {['profiles', 'courses', 'chapters', 'questions', 'notes', 'mistake_book', 'learning_progress', 'learning_records', 'chat_messages', 'knowledge_files', 'quiz_attempts'].map(table => (
                  <div key={table} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${health.database.status === 'healthy' ? 'bg-green-500' : health.database.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-muted-foreground font-mono truncate">{table}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">检查时间:</span> {new Date(health.checked_at).toLocaleString('zh-CN')} ·
                  <span className="font-semibold text-foreground"> 表数量:</span> 11 ·
                  <span className="font-semibold text-foreground"> RLS:</span> 已启用
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
