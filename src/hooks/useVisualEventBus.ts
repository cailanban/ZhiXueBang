// useVisualEventBus — 微课动态绘图事件总线
// 职责：监听 DataChannel 的 visual-events，分发到画布/幻灯片/代码高亮等渲染器
// 与数字人讲解时间轴同步，支持 Canvas 绘图、公式标注、代码高亮、知识卡片

import { useEffect, useRef, useCallback } from 'react';
import type { VisualEvent, VisualEventType } from '@/types/digital-human';

// ── 渲染器接口 ────────────────────────────────────────────────
export interface VisualRenderer {
  type: VisualEventType[];
  render: (event: VisualEvent) => void;
  clear: () => void;
}

interface UseVisualEventBusOptions {
  onVisualEvent?: (event: VisualEvent) => void;
  renderers?: VisualRenderer[];
}

interface UseVisualEventBusReturn {
  // 注册/移除渲染器
  registerRenderer: (renderer: VisualRenderer) => void;
  unregisterRenderer: (renderer: VisualRenderer) => void;
  // 手动触发事件（用于本地 LLM 驱动的可视化）
  emitEvent: (event: VisualEvent) => void;
  // 清除所有渲染器
  clearAll: () => void;
}

export function useVisualEventBus(options: UseVisualEventBusOptions = {}): UseVisualEventBusReturn {
  const { onVisualEvent } = options;
  const renderersRef = useRef<VisualRenderer[]>(options.renderers || []);

  // ── 分发事件到匹配的渲染器 ──────────────────────────────────
  const dispatchEvent = useCallback((event: VisualEvent) => {
    // 通知外部回调
    onVisualEvent?.(event);

    // 分发给匹配的渲染器
    for (const renderer of renderersRef.current) {
      if (renderer.type.includes(event.type)) {
        try {
          renderer.render(event);
        } catch {
          // 渲染器错误不影响其他渲染器
        }
      }
    }
  }, [onVisualEvent]);

  // ── 注册渲染器 ──────────────────────────────────────────────
  const registerRenderer = useCallback((renderer: VisualRenderer) => {
    if (!renderersRef.current.includes(renderer)) {
      renderersRef.current.push(renderer);
    }
  }, []);

  // ── 移除渲染器 ──────────────────────────────────────────────
  const unregisterRenderer = useCallback((renderer: VisualRenderer) => {
    renderersRef.current = renderersRef.current.filter((r) => r !== renderer);
  }, []);

  // ── 手动触发事件 ────────────────────────────────────────────
  const emitEvent = useCallback((event: VisualEvent) => {
    dispatchEvent(event);
  }, [dispatchEvent]);

  // ── 清除所有 ────────────────────────────────────────────────
  const clearAll = useCallback(() => {
    for (const renderer of renderersRef.current) {
      try {
        renderer.clear();
      } catch {
        // 忽略
      }
    }
  }, []);

  return {
    registerRenderer,
    unregisterRenderer,
    emitEvent,
    clearAll,
  };
}

// ── 预设渲染器：Canvas 绘图 ───────────────────────────────────
export class CanvasRenderer implements VisualRenderer {
  type: VisualEventType[] = ['canvas.clear', 'drawPath', 'drawText', 'drawAxis', 'plotFunction', 'highlight'];
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  render(event: VisualEvent): void {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const p = event.payload as Record<string, unknown>;

    switch (event.type) {
      case 'canvas.clear':
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        break;

      case 'drawPath': {
        const points = p.points as Array<{ x: number; y: number }>;
        if (!points || points.length === 0) return;
        ctx.beginPath();
        ctx.strokeStyle = (p.color as string) || '#3b82f6';
        ctx.lineWidth = (p.lineWidth as number) || 2;
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        break;
      }

      case 'drawText': {
        ctx.font = (p.font as string) || '16px sans-serif';
        ctx.fillStyle = (p.color as string) || '#1e293b';
        ctx.fillText(
          (p.text as string) || '',
          (p.x as number) || 0,
          (p.y as number) || 0,
        );
        break;
      }

      case 'drawAxis': {
        const x = (p.x as number) || 0;
        const y = (p.y as number) || 0;
        const w = (p.width as number) || 200;
        const h = (p.height as number) || 200;
        ctx.strokeStyle = (p.color as string) || '#94a3b8';
        ctx.lineWidth = 1;
        // X 轴
        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.stroke();
        // Y 轴
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + h);
        ctx.stroke();
        break;
      }

      case 'highlight': {
        ctx.fillStyle = (p.color as string) || 'rgba(59,130,246,0.15)';
        ctx.fillRect(
          (p.x as number) || 0,
          (p.y as number) || 0,
          (p.width as number) || 100,
          (p.height as number) || 30,
        );
        break;
      }

      case 'plotFunction': {
        // 预留：函数绘图需要解析表达式
        break;
      }
    }
  }

  clear(): void {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
  }
}