import type { MicroAction } from './action';

export interface CanvasElement {
  id: string;
  type: 'text' | 'shape' | 'line' | 'latex' | 'code';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  style?: Record<string, string>;
}

export interface MicroScene {
  id: string;
  courseId: string;
  order: number;
  title: string;
  type: 'slide' | 'whiteboard' | 'quiz';
  canvas: {
    width: number;   // 1000
    height: number;  // 563
    background: string;
    elements: CanvasElement[];
  };
  actions: MicroAction[];
  durationMs: number;
}
