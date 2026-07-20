// WhiteboardRenderer — 16:9 白板渲染器
// 逻辑坐标系 1000×563，CSS transform 缩放适配

import { motion, AnimatePresence } from 'framer-motion';

interface WhiteboardElement {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

interface Props {
  elements: WhiteboardElement[];
  visible: boolean;
}

const CANVAS_W = 1000;
const CANVAS_H = 563;

export default function WhiteboardRenderer({ elements, visible }: Props) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-20" style={{ background: '#1e293b' }}>
      <div
        className="relative origin-top-left"
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `scale(min(1, calc(100vw / ${CANVAS_W}), calc(100vh / ${CANVAS_H})))`,
        }}
      >
        <AnimatePresence>
          {elements.map((el) => (
            <motion.div
              key={el.id}
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{
                position: 'absolute',
                left: (el.data.x as number) || 0,
                top: (el.data.y as number) || 0,
                width: (el.data.width as number) || 200,
                height: (el.data.height as number) || 60,
              }}
            >
              {renderElement(el)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function renderElement(el: WhiteboardElement) {
  const { data } = el;

  switch (el.type) {
    case 'text':
      return (
        <div
          className="flex items-center justify-center p-2 rounded-lg border border-white/10"
          style={{
            fontSize: (data.fontSize as number) || 18,
            color: (data.color as string) || '#e2e8f0',
            background: 'rgba(255,255,255,0.05)',
            whiteSpace: 'pre-wrap',
            textAlign: 'center',
          }}
        >
          {data.content as string}
        </div>
      );

    case 'shape': {
      const shape = (data.shape as string) || 'rectangle';
      const fill = (data.fillColor as string) || 'rgba(59,130,246,0.3)';
      const stroke = (data.color as string) || '#3b82f6';
      if (shape === 'circle') {
        return (
          <div
            className="rounded-full border-2"
            style={{ width: '100%', height: '100%', background: fill, borderColor: stroke }}
          />
        );
      }
      if (shape === 'triangle') {
        return (
          <div
            style={{
              width: 0, height: 0,
              borderLeft: `${(data.width as number) / 2 || 50}px solid transparent`,
              borderRight: `${(data.width as number) / 2 || 50}px solid transparent`,
              borderBottom: `${data.height as number || 50}px solid ${fill}`,
            }}
          />
        );
      }
      return (
        <div
          className="rounded border-2"
          style={{ width: '100%', height: '100%', background: fill, borderColor: stroke }}
        />
      );
    }

    case 'line': {
      const sx = 0;
      const sy = (data.height as number) / 2 || 0;
      const ex = data.width as number || 100;
      const ey = (data.height as number) / 2 || 0;
      // 箭头标记
      const hasArrow = (data.points as string[])?.includes('arrow');
      return (
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          <defs>
            {hasArrow && (
              <marker id={`arrow-${el.id}`} viewBox="0 0 10 10" refX="9" refY="5"
                markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
              </marker>
            )}
          </defs>
          <line
            x1={sx} y1={sy} x2={ex} y2={ey}
            stroke="#3b82f6" strokeWidth="2"
            markerEnd={hasArrow ? `url(#arrow-${el.id})` : undefined}
          />
        </svg>
      );
    }

    case 'code':
      return (
        <div
          className="overflow-auto rounded-lg p-3 font-mono text-xs"
          style={{
            fontSize: 13,
            background: '#0f172a',
            color: '#e2e8f0',
            whiteSpace: 'pre',
            lineHeight: 1.5,
            width: '100%', height: '100%',
          }}
        >
          {(data.code as string) || ''}
        </div>
      );

    default:
      return <div className="text-white/50 text-xs">[{el.type}]</div>;
  }
}
