import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import {
  FileText, GitBranch, ClipboardList, Code, BookOpen, Presentation,
  Search, ChevronDown, ChevronUp, Clock, Star, PackageOpen, ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { renderMessageContent } from '@/components/common/MermaidRenderer';

// ---------------------------------------------------------------------------
// 类型定义
// ---------------------------------------------------------------------------

type ResourceType = 'handout' | 'mindmap' | 'quiz' | 'code' | 'reading' | 'ppt';

interface ResourceAsset {
  id: string;
  user_id: string;
  title: string;
  topic?: string;
  resource_type: ResourceType;
  content?: string;
  knowledge_tags?: string[];
  review_score?: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// 资源类型配置
// ---------------------------------------------------------------------------

const RESOURCE_TYPE_CONFIG: Record<ResourceType, { label: string; icon: React.ComponentType<{ className?: string }>; desc: string }> = {
  handout:    { label: '讲义',     icon: FileText,      desc: '课程讲义' },
  mindmap:    { label: '思维导图', icon: GitBranch,     desc: '知识导图' },
  quiz:       { label: '练习题',   icon: ClipboardList, desc: '练习题库' },
  code:       { label: '代码案例', icon: Code,          desc: '代码示例' },
  reading:    { label: '阅读清单', icon: BookOpen,      desc: '推荐阅读' },
  ppt:        { label: 'PPT课件',  icon: Presentation,  desc: '演示课件' },
};

const ALL_TYPES: ResourceType[] = ['handout', 'mindmap', 'quiz', 'code', 'reading', 'ppt'];

// ---------------------------------------------------------------------------
// 工具函数
// ---------------------------------------------------------------------------

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function scoreColor(score: number | undefined | null): string {
  if (score == null) return 'text-muted-foreground';
  if (score >= 8) return 'text-emerald-400';
  if (score >= 6) return 'text-amber-400';
  return 'text-destructive';
}

// ---------------------------------------------------------------------------
// 组件
// ---------------------------------------------------------------------------

export default function AssetsPage() {
  const { user } = useAuth();

  // 数据
  const [assets, setAssets] = useState<ResourceAsset[]>([]);
  const [loading, setLoading] = useState(true);

  // 筛选 & 搜索
  const [activeType, setActiveType] = useState<ResourceType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 展开
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ---------- 加载数据 ----------
  useEffect(() => {
    if (!user) return;
    loadAssets();
  }, [user]);

  const loadAssets = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('resource_assets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('加载资源失败，请稍后重试');
        console.error('loadAssets error:', error);
        setAssets([]);
      } else {
        setAssets((data || []) as ResourceAsset[]);
      }
    } catch (e) {
      console.error('loadAssets exception:', e);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------- 筛选 ----------
  const filteredAssets = assets.filter(a => {
    const typeMatch = activeType === 'all' || a.resource_type === activeType;
    const q = searchQuery.trim().toLowerCase();
    const searchMatch = !q
      || a.title?.toLowerCase().includes(q)
      || a.topic?.toLowerCase().includes(q);
    return typeMatch && searchMatch;
  });

  // 按类型分组统计
  const typeCounts: Record<string, number> = {};
  for (const a of assets) {
    typeCounts[a.resource_type] = (typeCounts[a.resource_type] || 0) + 1;
  }

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // ---------- 渲染 ----------
  return (
    <div className="max-w-6xl space-y-5">
      {/* 页头 */}
      <div>
        <h1 className="text-xl font-bold text-foreground">资源中心</h1>
        <p className="text-sm text-muted-foreground">浏览和管理您的历史生成资源</p>
      </div>

      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="按标题或主题搜索资源..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* 类型筛选标签栏 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Button
          variant="outline"
          size="sm"
          className={`h-8 text-xs border-border shrink-0 ${activeType === 'all' ? 'gradient-bg text-white border-primary' : ''}`}
          onClick={() => setActiveType('all')}
        >
          全部 ({assets.length})
        </Button>
        {ALL_TYPES.map(type => {
          const cfg = RESOURCE_TYPE_CONFIG[type];
          const Icon = cfg.icon;
          const count = typeCounts[type] || 0;
          return (
            <Button
              key={type}
              variant="outline"
              size="sm"
              className={`h-8 text-xs border-border shrink-0 ${activeType === type ? 'gradient-bg text-white border-primary' : ''}`}
              onClick={() => setActiveType(type)}
            >
              <Icon className="w-3.5 h-3.5 mr-1" />
              {cfg.label} ({count})
            </Button>
          );
        })}
      </div>

      {/* 内容区 */}
      {loading ? (
        // 加载骨架
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredAssets.length === 0 ? (
        // 空状态
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <PackageOpen className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-base font-medium text-foreground/60">暂无生成资源</p>
          <p className="text-sm mt-1">去资源生成页创建第一个资源吧</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-5 border-border text-xs"
            onClick={() => window.location.href = '/resources'}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            前往资源生成
          </Button>
        </div>
      ) : (
        // 资源列表
        <div className="space-y-3">
          <AnimatePresence>
            {filteredAssets.map((asset, idx) => {
              const cfg = RESOURCE_TYPE_CONFIG[asset.resource_type] || RESOURCE_TYPE_CONFIG.handout;
              const TypeIcon = cfg.icon;
              const isExpanded = expandedId === asset.id;
              const hasContent = !!asset.content;

              return (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Card className="border-border overflow-hidden">
                    {/* 卡片头部 —— 可点击展开 */}
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => toggleExpand(asset.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          {/* 左侧：图标 + 标题信息 */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                              <TypeIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <CardTitle className="text-sm font-semibold truncate">
                                  {asset.title || '未命名资源'}
                                </CardTitle>
                                <Badge variant="outline" className="text-[10px] border-border text-muted-foreground h-5 shrink-0">
                                  {cfg.label}
                                </Badge>
                              </div>
                              {asset.topic && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                  主题：{asset.topic}
                                </p>
                              )}
                              {/* 知识点标签 */}
                              {asset.knowledge_tags && asset.knowledge_tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {asset.knowledge_tags.map((tag, i) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="text-[10px] bg-primary/5 text-primary border-primary/15 h-4"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 右侧：评分 + 时间 + 展开箭头 */}
                          <div className="flex items-center gap-3 shrink-0">
                            {/* 审核评分 */}
                            {asset.review_score != null && (
                              <div className="flex items-center gap-1">
                                <Star className={`w-3.5 h-3.5 ${scoreColor(asset.review_score)}`} />
                                <span className={`text-xs font-semibold ${scoreColor(asset.review_score)}`}>
                                  {asset.review_score}
                                </span>
                              </div>
                            )}
                            {/* 时间 */}
                            <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                              <Clock className="w-3 h-3" />
                              {formatTime(asset.created_at)}
                            </span>
                            {/* 展开/收起 */}
                            {hasContent && (
                              <div className="text-muted-foreground">
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </button>

                    {/* 展开内容 */}
                    <AnimatePresence>
                      {isExpanded && hasContent && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <CardContent className="pt-0 pb-4">
                            <div className="border-t border-border pt-4">
                              <div className="overflow-y-auto max-h-[500px]">
                                <div className="prose prose-sm max-w-none text-foreground
                                  [&>*]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground
                                  [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_pre]:bg-muted [&_pre]:p-3
                                  [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_table]:w-full [&_th]:bg-muted [&_th]:p-2
                                  [&_td]:p-2 [&_td]:border-b [&_td]:border-border">
                                  {renderMessageContent(asset.content!)}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
