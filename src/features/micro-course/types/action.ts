// 微课 Action DSL — 基于 OpenMAIC 协议思想
// 参考: https://github.com/THU-MAIC/OpenMAIC/blob/main/packages/%40openmaic/dsl/src/action.ts

export type MicroAction =
  | SpeechAction
  | SpotlightAction
  | LaserAction
  | WbOpenAction
  | WbDrawTextAction
  | WbDrawShapeAction
  | WbDrawLineAction
  | WbDrawLatexAction
  | WbDrawCodeAction
  | WbDeleteAction
  | WbClearAction
  | WbCloseAction;

interface BaseAction {
  id: string;
}

export interface SpeechAction extends BaseAction {
  type: 'speech';
  text: string;
  audioUrl?: string;
  durationMs?: number;
}

export interface SpotlightAction extends BaseAction {
  type: 'spotlight';
  elementId: string;
  dimOpacity?: number;
}

export interface LaserAction extends BaseAction {
  type: 'laser';
  elementId: string;
  color?: string;
}

export interface WbOpenAction extends BaseAction {
  type: 'wb_open';
}

export interface WbDrawTextAction extends BaseAction {
  type: 'wb_draw_text';
  elementId: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  color?: string;
}

export interface WbDrawShapeAction extends BaseAction {
  type: 'wb_draw_shape';
  elementId: string;
  shape: 'rectangle' | 'circle' | 'triangle';
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor?: string;
}

export interface WbDrawLineAction extends BaseAction {
  type: 'wb_draw_line';
  elementId: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  points?: ['', 'arrow'];
}

export interface WbDrawLatexAction extends BaseAction {
  type: 'wb_draw_latex';
  elementId: string;
  latex: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WbDrawCodeAction extends BaseAction {
  type: 'wb_draw_code';
  elementId: string;
  language: string;
  code: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WbDeleteAction extends BaseAction {
  type: 'wb_delete';
  elementId: string;
}

export interface WbClearAction extends BaseAction {
  type: 'wb_clear';
}

export interface WbCloseAction extends BaseAction {
  type: 'wb_close';
}

// 阻塞动作：需要等待完成后才能继续下一个
const BLOCKING_ACTIONS = new Set([
  'speech', 'wb_open', 'wb_close', 'wb_clear',
  'wb_draw_text', 'wb_draw_shape', 'wb_draw_line',
  'wb_draw_latex', 'wb_draw_code', 'wb_delete',
]);

export function isBlockingAction(action: MicroAction): boolean {
  return BLOCKING_ACTIONS.has(action.type);
}

// 动画时长参考（OpenMAIC timing）
export const ACTION_TIMING: Record<string, number> = {
  wb_open: 2000,
  wb_draw_text: 800,
  wb_draw_shape: 800,
  wb_draw_line: 800,
  wb_draw_latex: 800,
  wb_draw_code: 1500,
  wb_delete: 300,
  wb_clear: 800,
  wb_close: 700,
  laser: 5000,
  spotlight: 5000,
};

export function getActionDuration(action: MicroAction): number {
  if (action.type === 'speech') {
    return action.durationMs ?? estimateSpeechDuration(action.text);
  }
  return ACTION_TIMING[action.type] ?? 300;
}

function estimateSpeechDuration(text: string): number {
  // 中文约 4 字/秒，加停顿
  return Math.max(text.length * 250, 1500);
}
