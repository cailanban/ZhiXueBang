/**
 * MermaidRenderer — 共享 Mermaid 图表渲染组件
 * 支持：mindmap / flowchart / sequenceDiagram / classDiagram / pie / gantt 等所有 mermaid 语法
 * 特性：主题自适应（dark/light）、加载动画、错误降级展示原始代码
 */
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import ReactMarkdown from 'react-markdown';

// 全局初始化（只执行一次）
let initialized = false;
function ensureInit() {
  if (initialized) return;
  initialized = true;
  const isDark = document.documentElement.classList.contains('dark');
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? 'dark' : 'default',
    securityLevel: 'loose',
    fontFamily: 'inherit',
    mindmap: { padding: 16, useMaxWidth: true },
    flowchart: { useMaxWidth: true, htmlLabels: true },
  });
}

/** 单个 mermaid 图表块 — 使用 ref 直接操作 DOM，避免条件渲染导致 ref 为 null 的死循环 */
export function MermaidBlock({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const idRef = useRef(`mmd-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    ensureInit();
    if (!ref.current || !chart) return;
    const el = ref.current;
    setLoading(true);
    mermaid.render(idRef.current, chart)
      .then(({ svg }) => {
        if (el) {
          el.innerHTML = svg;
          const svgEl = el.querySelector('svg');
          if (svgEl) { svgEl.style.maxWidth = '100%'; svgEl.style.height = 'auto'; }
        }
        setLoading(false);
      })
      .catch(() => {
        if (el) el.innerHTML = `<pre style="font-size:11px;color:var(--muted-foreground);padding:12px;overflow:auto;white-space:pre-wrap">${chart}</pre>`;
        setLoading(false);
      });
    return () => { if (el) el.innerHTML = ''; };
  }, [chart]);

  return (
    <div className="relative my-3">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-muted-foreground text-sm bg-muted/40 rounded-xl z-10 min-h-[80px]">
          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          图表渲染中…
        </div>
      )}
      <div
        ref={ref}
        className="mermaid-container p-4 bg-muted/40 rounded-xl border border-border/40 overflow-x-auto
          [&_svg]:max-w-full [&_svg]:h-auto
          [&_.node_rect]:fill-primary/15 [&_.node_rect]:stroke-primary/40
          [&_.label]:font-sans [&_text]:fill-foreground"
        style={{ minHeight: loading ? 80 : undefined }}
      />
    </div>
  );
}

/**
 * 解析消息内容，将 ```mermaid 代码块渲染为图表，其余部分用 ReactMarkdown 渲染
 */
export function renderMessageContent(content: string) {
  const parts = content.split(/(```mermaid\n[\s\S]*?```)/g);
  return parts.map((part, i) => {
    const mermaidMatch = part.match(/^```mermaid\n([\s\S]*?)```$/);
    if (mermaidMatch) {
      return <MermaidBlock key={i} chart={mermaidMatch[1].trim()} />;
    }
    if (!part.trim()) return null;
    return (
      <div
        key={i}
        className="prose prose-sm max-w-none text-foreground
          [&_h1]:text-foreground [&_h1]:text-base [&_h1]:font-bold
          [&_h2]:text-foreground [&_h2]:text-sm [&_h2]:font-semibold
          [&_h3]:text-foreground [&_h3]:text-sm [&_h3]:font-semibold
          [&_h4]:text-foreground [&_p]:text-foreground [&_li]:text-foreground
          [&_strong]:text-foreground [&_a]:text-primary
          [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[12px]
          [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto
          [&_table]:w-full [&_th]:bg-muted [&_th]:p-2 [&_th]:text-left
          [&_td]:p-2 [&_td]:border-b [&_td]:border-border"
      >
        <ReactMarkdown>{part}</ReactMarkdown>
      </div>
    );
  });
}
