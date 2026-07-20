/**
 * KnowledgeGraph — WVK 知识图谱可视化
 * 显示 wiki_entries 节点和 wiki_relations 边，支持交互式浏览
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { GitCompare, X, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

interface WikiEntry {
  id: string;
  title: string;
  summary: string;
  depth: number;
  content: string;
}

interface WikiRelation {
  id: string;
  source_entry_id: string;
  target_entry_id: string;
  relation_type: 'parent' | 'prerequisite' | 'related' | 'example' | 'contrast';
  weight: number;
}

interface SelectedNode {
  id: string;
  title: string;
  summary: string;
  content: string;
}

const RELATION_COLORS: Record<string, string> = {
  parent: '#6366f1',      // indigo
  prerequisite: '#f59e0b', // amber
  related: '#3b82f6',     // blue
  example: '#10b981',     // emerald
  contrast: '#ef4444',    // red
};

const RELATION_LABELS: Record<string, string> = {
  parent: '父级',
  prerequisite: '先修',
  related: '相关',
  example: '示例',
  contrast: '对比',
};

export default function KnowledgeGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<WikiEntry[]>([]);
  const [relations, setRelations] = useState<WikiRelation[]>([]);
  const [selected, setSelected] = useState<SelectedNode | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [entriesRes, relationsRes] = await Promise.all([
        supabase.from('wiki_entries')
          .select('id,title,summary,depth,content')
          .eq('user_id', user.id)
          .eq('status', 'published')
          .limit(200),
        supabase.from('wiki_relations')
          .select('id,source_entry_id,target_entry_id,relation_type,weight')
          .eq('user_id', user.id)
          .limit(500),
      ]);
      if (entriesRes.error) throw entriesRes.error;
      if (relationsRes.error) throw relationsRes.error;
      setEntries(entriesRes.data || []);
      setRelations(relationsRes.data || []);
    } catch (e) {
      console.error('图谱加载失败', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // 初始化 cytoscape
  useEffect(() => {
    if (loading || entries.length === 0 || !containerRef.current) return;

    const loadCytoscape = async () => {
      try {
        // cytoscape 由 mermaid 间接引入，动态导入
        const cytoscape = (await import('cytoscape')).default;

        // 销毁旧实例
        if (cyRef.current) { cyRef.current.destroy(); cyRef.current = null; }

        const nodes = entries.map((e) => ({
          data: {
            id: e.id,
            label: e.title.length > 12 ? e.title.slice(0, 12) + '…' : e.title,
            fullTitle: e.title,
            summary: e.summary,
            content: e.content,
            depth: e.depth,
          },
          classes: e.depth === 0 ? 'root' : 'entry',
        }));

        const edges = relations.map((r) => ({
          data: {
            id: r.id,
            source: r.source_entry_id,
            target: r.target_entry_id,
            type: r.relation_type,
            weight: r.weight,
          },
          classes: `relation-${r.relation_type}`,
        }));

        const cy = cytoscape({
          container: containerRef.current!,
          elements: [...nodes, ...edges],
          style: [
            {
              selector: 'node',
              style: {
                'background-color': '#6366f1',
                'label': 'data(label)',
                'font-size': '10px',
                'color': '#e2e8f0',
                'text-valign': 'center',
                'text-halign': 'center',
                'width': 40,
                'height': 40,
                'border-width': 2,
                'border-color': '#818cf8',
                'text-wrap': 'wrap',
                'text-max-width': '80px',
              },
            },
            {
              selector: 'node.root',
              style: {
                'background-color': '#f59e0b',
                'border-color': '#fbbf24',
                'width': 50,
                'height': 50,
                'font-size': '11px',
                'font-weight': 'bold',
              },
            },
            {
              selector: 'edge',
              style: {
                'width': 2,
                'line-color': '#475569',
                'target-arrow-color': '#475569',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'label': '',
                'font-size': '8px',
                'color': '#94a3b8',
              },
            },
            {
              selector: 'edge.relation-parent',
              style: { 'line-color': '#6366f1', 'target-arrow-color': '#6366f1', 'width': 3 },
            },
            {
              selector: 'edge.relation-prerequisite',
              style: { 'line-color': '#f59e0b', 'target-arrow-color': '#f59e0b', 'line-style': 'dashed' },
            },
            {
              selector: 'edge.relation-contrast',
              style: { 'line-color': '#ef4444', 'target-arrow-color': '#ef4444', 'line-style': 'dotted' },
            },
            {
              selector: 'edge.relation-example',
              style: { 'line-color': '#10b981', 'target-arrow-color': '#10b981' },
            },
          ],
          layout: {
            name: 'cose',
            animate: true,
            animationDuration: 800,
            nodeRepulsion: () => 4000,
            idealEdgeLength: () => 120,
            gravity: 0.3,
            fit: true,
            padding: 40,
          },
          minZoom: 0.3,
          maxZoom: 3,
        });

        cy.on('tap', 'node', (evt: any) => {
          const node = evt.target;
          setSelected({
            id: node.id(),
            title: node.data('fullTitle'),
            summary: node.data('summary'),
            content: node.data('content'),
          });
          setDetailOpen(true);
        });

        cy.on('tap', (evt: any) => {
          if (evt.target === cy) {
            setSelected(null);
            setDetailOpen(false);
          }
        });

        cyRef.current = cy;
      } catch (e) {
        console.error('Cytoscape 初始化失败', e);
      }
    };

    loadCytoscape();

    return () => {
      if (cyRef.current) { cyRef.current.destroy(); cyRef.current = null; }
    };
  }, [loading, entries, relations]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.2);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit(undefined, 40);
  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <GitCompare className="w-10 h-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">暂无知识图谱数据</p>
        <p className="text-xs text-muted-foreground/70 mt-1">上传文件并建立 WVK 索引后，词条关系将在此可视化</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 图例 */}
      <div className="flex flex-wrap gap-2 mb-3 px-2">
        {Object.entries(RELATION_COLORS).map(([type, color]) => (
          <Badge key={type} variant="outline" className="text-[10px] gap-1.5"
            style={{ borderColor: color, color }}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
            {RELATION_LABELS[type] || type}
          </Badge>
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground">
          {entries.length} 词条 · {relations.length} 关系
        </span>
      </div>

      {/* 图谱画布 */}
      <div className="relative rounded-xl border border-border bg-muted/30 overflow-hidden"
        style={{ height: 'min(70vh, 600px)' }}>
        <div ref={containerRef} className="w-full h-full" />

        {/* 工具栏 */}
        <div className="absolute bottom-3 right-3 flex gap-1">
          <Button variant="secondary" size="icon" className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur"
            onClick={handleZoomIn} title="放大">
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button variant="secondary" size="icon" className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur"
            onClick={handleZoomOut} title="缩小">
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <Button variant="secondary" size="icon" className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur"
            onClick={handleFit} title="适应画布">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button variant="secondary" size="icon" className="h-7 w-7 rounded-lg bg-background/80 backdrop-blur"
            onClick={handleFullscreen} title="全屏">
            <Maximize2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* 详情面板 */}
      {detailOpen && selected && (
        <Card className="mt-3 border-border animate-in slide-in-from-bottom-2">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">{selected.title}</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 -mt-1"
                onClick={() => { setDetailOpen(false); setSelected(null); }}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
            {selected.summary && (
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">{selected.summary}</p>
            )}
            {selected.content && (
              <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-4">{selected.content}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}