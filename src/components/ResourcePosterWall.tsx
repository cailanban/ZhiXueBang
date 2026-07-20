import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, CheckCircle, ExternalLink, Eye, Film, FileText, Globe2, Library, Sparkles, Target, ThumbsDown, TrendingUp, X } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ResourceItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source_name: string;
  resource_type: 'blog' | 'website' | 'bilibili' | 'video' | 'course' | 'document';
  topic: string;
  knowledge_points: string[];
  poster_url: string | null;
  /** P1-1: 推荐理由 */
  reason?: string;
  /** P1-1: 推荐理由类型 */
  reasonType?: 'weak_point' | 'topic_match' | 'preferred_type' | 'popular';
}

interface Props {
  topics: string[];
  placement: 'course_chapter' | 'mistake_book' | 'exam_result';
  contextId?: string;
  title?: string;
}

const iconMap = { blog: FileText, website: Globe2, bilibili: Film, video: Film, course: Library, document: FileText };
const colorMap = { blog: '#7c3aed', website: '#0284c7', bilibili: '#fb7299', video: '#ea580c', course: '#059669', document: '#4f46e5' };
const reasonColorMap = { weak_point: '#ef4444', topic_match: '#7c3aed', preferred_type: '#059669', popular: '#f59e0b' };
const reasonLabelMap = { weak_point: '薄弱点', topic_match: '主题匹配', preferred_type: '你偏好的类型', popular: '热门推荐' };

/** P1-1: 从 resource_recommendation_events 加载用户历史反馈 */
async function loadUserFeedback(userId: string): Promise<{
  dismissed: Set<string>;
  saved: Set<string>;
  completed: Set<string>;
  preferredTopics: Map<string, number>;
  preferredTypes: Map<string, number>;
}> {
  const dismissed = new Set<string>();
  const saved = new Set<string>();
  const completed = new Set<string>();
  const preferredTopics = new Map<string, number>();
  const preferredTypes = new Map<string, number>();

  try {
    const { data: events } = await supabase
      .from('resource_recommendation_events')
      .select('resource_id,action')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(200);

    const seenResource = new Set<string>();
    for (const ev of (events || [])) {
      if (seenResource.has(ev.resource_id)) continue;
      seenResource.add(ev.resource_id);

      if (ev.action === 'dismiss') {
        dismissed.add(ev.resource_id);
      } else if (ev.action === 'save') {
        saved.add(ev.resource_id);
      } else if (ev.action === 'complete') {
        completed.add(ev.resource_id);
      }
    }

    // 获取用户偏好：从 save/complete 的资源中提取 topic 和 type
    const preferredIds = [...saved, ...completed];
    if (preferredIds.length > 0) {
      const { data: preferredResources } = await supabase
        .from('recommendation_resources')
        .select('id,topic,resource_type')
        .in('id', preferredIds)
        .limit(50);

      for (const r of (preferredResources || [])) {
        if (r.topic) preferredTopics.set(r.topic, (preferredTopics.get(r.topic) || 0) + 1);
        if (r.resource_type) preferredTypes.set(r.resource_type, (preferredTypes.get(r.resource_type) || 0) + 1);
      }
    }
  } catch { /* feedback fetch is best-effort */ }

  return { dismissed, saved, completed, preferredTopics, preferredTypes };
}

/** P1-1: 加载薄弱知识点，用于推荐理由 */
async function loadWeakPoints(userId: string): Promise<{ point: string; level: number }[]> {
  try {
    const { data } = await supabase
      .from('knowledge_mastery')
      .select('knowledge_point,mastery_level')
      .eq('user_id', userId)
      .lt('mastery_level', 60)
      .order('mastery_level', { ascending: true })
      .limit(8);
    return (data || []).map((m: any) => ({ point: m.knowledge_point, level: Math.round(m.mastery_level) }));
  } catch { return []; }
}

export default function ResourcePosterWall({ topics = [], placement = 'course_chapter' as const, contextId, title = '为你推荐' }: Partial<Props> & { title?: string }) {
  const { user } = useAuth();
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<ResourceItem | null>(null);
  const impressedRef = useRef(new Set<string>());
  const topicKey = topics.map(t => t.trim().toLowerCase()).filter(Boolean).sort().join('|');
  const normalizedTopics = useMemo(() => topicKey.split('|').filter(Boolean), [topicKey]);

  const track = useCallback(async (item: ResourceItem, action: 'impression' | 'preview' | 'open' | 'save' | 'complete' | 'dismiss') => {
    if (!user) return;
    await supabase.from('resource_recommendation_events').insert({
      user_id: user.id, resource_id: item.id, action, placement,
      context_type: placement, context_id: contextId || null, context_topics: topics,
    });
  }, [user, placement, contextId, topics]);

  useEffect(() => {
    let cancelled = false;
    if (!user) { setItems([]); setLoading(false); return; }
    setLoading(true);

    (async () => {
      // P1-1: 加载用户反馈 + 薄弱知识点
      const [feedback, weakPoints] = await Promise.all([
        loadUserFeedback(user.id),
        loadWeakPoints(user.id),
      ]);
      if (cancelled) return;

      const { data, error } = await supabase
        .from('recommendation_resources')
        .select('id,title,summary,url,source_name,resource_type,topic,knowledge_points,poster_url')
        .eq('status', 'approved')
        .limit(30);

      if (cancelled) return;
      if (error) { setItems([]); setLoading(false); return; }

      const resources = (data || []) as ResourceItem[];

      // P1-1: 过滤用户已 dismiss 的资源
      const filtered = resources.filter(r => !feedback.dismissed.has(r.id));

      // P1-1: 计算加权分数（topic 匹配 + 反馈偏好 + 薄弱点关联）
      const ranked = filtered.map(item => {
        const haystack = [item.topic, item.title, ...(item.knowledge_points || [])].join(' ').toLowerCase();

        // 基础 topic 匹配分
        let score = normalizedTopics.reduce((sum, topic) =>
          sum + (haystack.includes(topic) || topic.includes(item.topic.toLowerCase()) ? 2 : 0), 0
        );

        // P1-1: 偏好 topic 加权（用户 save/complete 过的同一 topic）
        if (feedback.preferredTopics.has(item.topic)) {
          score += (feedback.preferredTopics.get(item.topic) || 0) * 1.5;
        }

        // P1-1: 偏好类型加权
        if (feedback.preferredTypes.has(item.resource_type)) {
          score += (feedback.preferredTypes.get(item.resource_type) || 0) * 1.0;
        }

        // P1-1: 薄弱点关联加权
        const matchedWeakPoint = weakPoints.find(wp =>
          haystack.includes(wp.point.toLowerCase()) || item.topic.toLowerCase().includes(wp.point.toLowerCase())
        );

        // P1-1: 生成推荐理由
        let reason: string | undefined;
        let reasonType: ResourceItem['reasonType'] | undefined;

        if (matchedWeakPoint) {
          reason = `薄弱点: ${matchedWeakPoint.point} (${matchedWeakPoint.level}%)`;
          reasonType = 'weak_point';
          score += 3;
        } else if (feedback.preferredTopics.has(item.topic)) {
          reason = `你曾收藏过 ${item.topic} 相关资源`;
          reasonType = 'preferred_type';
          score += 2;
        } else if (score > 0) {
          reason = `与当前学习主题匹配`;
          reasonType = 'topic_match';
        } else {
          reason = '热门推荐';
          reasonType = 'popular';
        }

        return { item: { ...item, reason, reasonType }, score };
      });

      // P1-1: 按加权分数排序，topic 匹配为零的放到后面
      const sorted = ranked
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(x => x.item);

      if (cancelled) return;
      setItems(sorted);
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user, topicKey, normalizedTopics]);

  useEffect(() => {
    items.forEach(item => {
      if (impressedRef.current.has(item.id)) return;
      impressedRef.current.add(item.id);
      void track(item, 'impression');
    });
  }, [items, track]);

  const openPreview = (item: ResourceItem) => { setPreview(item); void track(item, 'preview'); };
  const openExternal = (item: ResourceItem) => { void track(item, 'open'); window.open(item.url, '_blank', 'noopener,noreferrer'); };
  const dismiss = (item: ResourceItem) => { void track(item, 'dismiss'); setItems(prev => prev.filter(value => value.id !== item.id)); if (preview?.id === item.id) setPreview(null); };

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4 text-amber-500" />{title}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            基于知识点和反馈智能排序，仅展示审核通过的资源
          </p>
        </div>
        <span className="text-xs text-muted-foreground">{items.length} 项</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          暂无匹配当前学习情况的资源
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.map((item, index) => {
            const Icon = iconMap[item.resource_type] || Globe2;
            const color = colorMap[item.resource_type] || '#4f46e5';
            const rColor = item.reasonType ? reasonColorMap[item.reasonType] : '#7c3aed';
            const rLabel = item.reasonType ? reasonLabelMap[item.reasonType] : '';
            const RIcon = item.reasonType === 'weak_point' ? Target : item.reasonType === 'popular' ? TrendingUp : Sparkles;

            return (
              <button
                key={item.id}
                onClick={() => openPreview(item)}
                className={`group relative overflow-hidden rounded-xl border border-border text-left transition hover:-translate-y-1 hover:shadow-xl ${index === 0 ? 'col-span-2 row-span-2 min-h-64' : 'min-h-40'}`}
              >
                {item.poster_url ? (
                  <img src={item.poster_url} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0" style={{ background: `linear-gradient(145deg,${color},#111827)` }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

                {/* P1-1: 推荐理由徽章 */}
                {item.reason && (
                  <div
                    className="absolute left-2 top-2 z-10 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                    style={{ background: `${rColor}cc`, backdropFilter: 'blur(4px)' }}
                  >
                    <RIcon className="h-2.5 w-2.5" />
                    {item.reason}
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                  <div className="mb-2 flex items-center gap-1 text-[10px] opacity-80">
                    <Icon className="h-3 w-3" />{item.source_name}
                  </div>
                  <div className={`${index === 0 ? 'text-lg' : 'text-sm'} font-semibold leading-snug`}>
                    {item.title}
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] text-white/70">{item.summary}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreview(null)}>
          <div className="flex h-[82vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-background shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border p-3">
              <div>
                <div className="flex items-center gap-2 font-semibold">
                  {preview.title}
                  {preview.reason && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                      {preview.reason}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">站内预览 · {preview.source_name}</div>
              </div>
              <div className="flex gap-2">
                <button className="btn ghost" onClick={() => openExternal(preview)}>
                  <ExternalLink className="mr-1 inline h-4 w-4" />新窗口打开
                </button>
                <button className="btn ghost" onClick={() => setPreview(null)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <iframe
              title={preview.title}
              src={preview.url}
              className="min-h-0 flex-1 bg-white"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
            />
            <div className="flex flex-wrap items-center gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />若目标网站禁止嵌入，请使用"新窗口打开"
              <span className="flex-1" />
              <button className="btn ghost" onClick={() => void track(preview, 'save')}>
                <Bookmark className="mr-1 inline h-3.5 w-3.5" />收藏
              </button>
              <button className="btn ghost" onClick={() => void track(preview, 'complete')}>
                <CheckCircle className="mr-1 inline h-3.5 w-3.5" />标记学完
              </button>
              <button className="btn ghost" onClick={() => dismiss(preview)}>
                <ThumbsDown className="mr-1 inline h-3.5 w-3.5" />不感兴趣
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
