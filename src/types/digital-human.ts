// 数字人模块类型定义 — 智学帮 M3/M4

// ── 会话状态机 ──────────────────────────────────────────────
export type AvatarSessionState =
  | 'idle'
  | 'creating'
  | 'connecting'
  | 'ready'
  | 'speaking'
  | 'reconnecting'
  | 'error'
  | 'closed';

// ── ICE 配置 ────────────────────────────────────────────────
export interface IceConfig {
  iceServers: Array<{
    urls: string | string[];
    username?: string;
    credential?: string;
  }>;
  iceTransportPolicy?: 'all' | 'relay';
}

// ── 数字人会话 ──────────────────────────────────────────────
export interface AvatarSession {
  id: string;
  userId: string;
  courseId?: string;
  state: AvatarSessionState;
  createdAt: string;
  expiresAt: string;
  iceConfig: IceConfig;
}

// ── 创建会话请求/响应 ────────────────────────────────────────
export interface CreateSessionRequest {
  courseId?: string;
  avatarId?: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  iceConfig: IceConfig;
  expiresAt: string;
}

// ── SDP Offer/Answer ────────────────────────────────────────
export interface SdpOfferRequest {
  sdp: string;
}

export interface SdpAnswerResponse {
  sdp: string;
}

// ── 讲话请求 ────────────────────────────────────────────────
export interface SpeakRequest {
  text: string;
  turnId?: string;
  sequence?: number;
  voice?: string;
  speed?: number; // 0.5-2.0
}

export interface SpeakResponse {
  turnId: string;
  sequence: number;
  accepted: boolean;
}

// ── 音频数据 ────────────────────────────────────────────────
export interface AudioDataRequest {
  audioData: string; // base64 encoded PCM
  format?: 'pcm' | 'wav';
  sampleRate?: number;
}

// ── 打断请求 ────────────────────────────────────────────────
export interface InterruptResponse {
  cleared: boolean;
  clearedTurnId?: string;
}

// ── 说话状态 ────────────────────────────────────────────────
export interface SpeakingStatus {
  speaking: boolean;
  turnId?: string;
  sequence?: number;
  progress?: number; // 0-1
}

// ── 可视化事件（微课动态绘图） ────────────────────────────────
export type VisualEventType =
  | 'canvas.clear'
  | 'drawPath'
  | 'drawText'
  | 'drawAxis'
  | 'plotFunction'
  | 'highlight'
  | 'slide.show'
  | 'code.highlight'
  | 'quiz.show';

export interface VisualEvent {
  lessonId?: string;
  turnId: string;
  sequence: number;
  atMs: number;
  type: VisualEventType;
  payload: Record<string, unknown>;
}

// ── 降级模式 ────────────────────────────────────────────────
export type DegradationMode = 'full' | 'video_only' | 'audio_only' | 'static';

export interface SessionMetrics {
  // 会话指标
  sessionCreated: boolean;
  iceConnected: boolean;
  turnProtocol: 'udp' | 'tcp' | 'unknown';
  // 延迟指标
  firstFrameMs?: number;
  firstAudioMs?: number;
  ttsLatencyMs?: number;
  inferenceLatencyMs?: number;
  interruptResponseMs?: number;
  // 重连
  reconnectCount: number;
  // 错误
  lastError?: string;
  errorCount: number;
}

// ── 网关错误码 ────────────────────────────────────────────────
export const AVATAR_GATEWAY_ERRORS = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  TOO_MANY_SESSIONS: 'TOO_MANY_SESSIONS',
  RATE_LIMITED: 'RATE_LIMITED',
  TEXT_TOO_LONG: 'TEXT_TOO_LONG',
  GPU_TIMEOUT: 'GPU_TIMEOUT',
  GPU_OVERLOADED: 'GPU_OVERLOADED',
  GPU_ERROR: 'GPU_ERROR',
  TURN_ERROR: 'TURN_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type AvatarGatewayErrorCode = typeof AVATAR_GATEWAY_ERRORS[keyof typeof AVATAR_GATEWAY_ERRORS];

export interface AvatarGatewayError {
  code: AvatarGatewayErrorCode;
  message: string;
  retryable: boolean;
}

// ── 组件 Props ────────────────────────────────────────────────
export interface DigitalHumanPanelProps {
  courseId?: string;
  avatarId?: string;
  className?: string;
  showControls?: boolean;
  autoConnect?: boolean;
  onStateChange?: (state: AvatarSessionState) => void;
  onMetrics?: (metrics: SessionMetrics) => void;
  onVisualEvent?: (event: VisualEvent) => void;
}

export interface AvatarVideoProps {
  stream: MediaStream | null;
  state: AvatarSessionState;
  muted?: boolean;
  demoMode?: boolean;
  isSpeaking?: boolean;
  className?: string;
}

export interface AvatarControlsProps {
  state: AvatarSessionState;
  onSendText: (text: string) => void;
  onInterrupt: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onReconnect: () => void;
  onClose: () => void;
  muted: boolean;
  isFullscreen: boolean;
  textLength: number;
  maxTextLength: number;
  disabled?: boolean;
  demoMode?: boolean;
}