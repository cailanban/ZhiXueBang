import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { Sparkles, ArrowRight, BookOpen, Target, Lightbulb, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecommendItem {
  type: 'weak_point' | 'next_step' | 'suggestion' | 'popular';
  title: string;
  desc: string;
  action?: string;
  link?: string;
  icon: typeof Sparkles;
  color: string;
}

export default function SmartRecommend({ embedIn }: { embedIn?: string }) {
  const { profile } = useAuth();
  const [items, setItems] = useState<RecommendItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) { setLoading(false); return; }
    (async () => {
      try {
        const [masteryResult, profileResult] = await Promise.allSettled([
          supabase.from('knowledge_mastery').select('knowledge_point,mastery_level').eq('user_id', profile.id).order('mastery_level', { ascending: true }).limit(5),
          supabase.from('learning_profiles').select('weak_points,suggestions').eq('user_id', profile.id).maybeSingle(),
        ]);

        const recs: RecommendItem[] = [];

        if (masteryResult.status === 'fulfilled' && masteryResult.value.data) {
          const weak = masteryResult.value.data.filter((m: any) => m.mastery_level < 60);
          weak.forEach((m: any) => {
            recs.push({
              type: 'weak_point', title: `强化「${m.knowledge_point}」`,
              desc: `当前掌握度 ${Math.round(m.mastery_level)}%，建议重点复习`,
              icon: Target, color: '#ef4444',
              link: '/tutor',
            });
          });
        }

        if (profileResult.status === 'fulfilled' && profileResult.value.data) {
          const pd = profileResult.value.data as any;
          (pd.suggestions || []).slice(0, 2).forEach((s: string) => {
            recs.push({
              type: 'suggestion', title: s,
              desc: '基于学习画像的智能建议',
              icon: Lightbulb, color: '#f59e0b',
              link: '/profile',
            });
          });
        }

        if (recs.length === 0) {
          recs.push({
            type: 'next_step', title: '开始你的学习之旅',
            desc: '完成一次智能诊断，获取个性化学习路径',
            icon: BookOpen, color: '#6366f1',
            link: '/tutor',
          });
          recs.push({
            type: 'popular', title: '探索课程中心',
            desc: '浏览丰富的课程资源，找到适合你的内容',
            icon: Sparkles, color: '#10b981',
            link: '/courses',
          });
          recs.push({
            type: 'suggestion', title: '建立学习画像',
            desc: '完成对话式建档，让AI更懂你',
            icon: TrendingUp, color: '#8b5cf6',
            link: '/profile',
          });
        }

        setItems(recs.slice(0, 4));
      } catch (_) {}
      setLoading(false);
    })();
  }, [profile]);

  if (embedIn === 'dashboard' && items.length === 0 && !loading) return null;

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          智能推荐
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Sparkles className="w-6 h-6 mx-auto mb-1.5 opacity-20" />
            <p className="text-sm">暂无推荐</p>
            <p className="text-xs mt-1">完成学习画像后将获得个性化推荐</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${item.color}15` }}>
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Badge className="text-[10px] h-4 px-1.5" style={{ color: item.color, background: `${item.color}15`, border: 'none' }}>
                      {item.type === 'weak_point' ? '薄弱点' : item.type === 'next_step' ? '下一步' : item.type === 'suggestion' ? '建议' : '推荐'}
                    </Badge>
                    <span className="text-xs font-medium text-foreground truncate">{item.title}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
                {item.link && (
                  <Link to={item.link} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
