// PlaybackEngine — 微课播放状态机
// 管理：场景切换、动作队列、语音播放、白板状态

import type { MicroAction, SpeechAction } from '../types/action';
import type { MicroScene } from '../types/scene';
import { isBlockingAction, getActionDuration } from '../types/action';

export type PlaybackMode = 'idle' | 'playing' | 'paused' | 'completed';

export interface PlaybackState {
  mode: PlaybackMode;
  sceneIndex: number;
  actionIndex: number;
  currentTimeMs: number;
  totalTimeMs: number;
  speed: number;
  currentSubtitle: string;
  whiteboardVisible: boolean;
  whiteboardElements: Array<{
    id: string;
    type: string;
    data: Record<string, unknown>;
  }>;
}

export interface PlaybackCallbacks {
  onStateChange: (state: PlaybackState) => void;
  onSubtitleChange: (text: string) => void;
  onSpeechStart: (action: SpeechAction) => void;
  onSpeechEnd: () => void;
  onSceneChange: (sceneIndex: number) => void;
  onComplete: () => void;
}

export class PlaybackEngine {
  static cachedVoices: SpeechSynthesisVoice[] = [];
  private static voicesLoaded = false;

  // 预加载语音列表（Chrome 异步加载，首次 getVoices 返回空）
  static preloadVoices() {
    if (PlaybackEngine.voicesLoaded) return;
    PlaybackEngine.voicesLoaded = true;
    const load = () => {
      PlaybackEngine.cachedVoices = window.speechSynthesis?.getVoices() || [];
      if (PlaybackEngine.cachedVoices.length > 0) {
        console.log('[Playback] voices loaded:', PlaybackEngine.cachedVoices.length);
      }
    };
    load();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', load, { once: true });
    }
  }

  private scenes: MicroScene[];
  private state: PlaybackState;
  private callbacks: PlaybackCallbacks;
  private speechTimer: ReturnType<typeof setTimeout> | null = null;
  private blockTimer: ReturnType<typeof setTimeout> | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private destroyed = false;

  constructor(scenes: MicroScene[], callbacks: PlaybackCallbacks) {
    PlaybackEngine.preloadVoices();
    this.scenes = scenes;
    this.callbacks = callbacks;
    this.state = {
      mode: 'idle',
      sceneIndex: 0,
      actionIndex: 0,
      currentTimeMs: 0,
      totalTimeMs: scenes.reduce((sum, s) => sum + s.durationMs, 0),
      speed: 1,
      currentSubtitle: '',
      whiteboardVisible: false,
      whiteboardElements: [],
    };
  }

  get currentScene(): MicroScene | undefined {
    return this.scenes[this.state.sceneIndex];
  }

  get currentAction(): MicroAction | undefined {
    return this.currentScene?.actions[this.state.actionIndex];
  }

  private emit() {
    this.callbacks.onStateChange({ ...this.state });
  }

  private emitSubtitle(text: string) {
    this.state.currentSubtitle = text;
    this.callbacks.onSubtitleChange(text);
  }

  // ── 控制接口 ──────────────────────────────────────────────

  play() {
    if (this.state.mode === 'playing') return;
    this.state.mode = 'playing';
    this.emit();
    // 预热 speechSynthesis：Chrome 要求用户手势上下文内首次调用
    // 空语音瞬间结束，但激活了后续 speak() 的权限
    if ('speechSynthesis' in window) {
      const warm = new SpeechSynthesisUtterance('');
      warm.volume = 0;
      warm.lang = 'zh-CN';
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(warm);
    }
    this.processNext();
  }

  pause() {
    this.state.mode = 'paused';
    if (this.speechTimer) { clearTimeout(this.speechTimer); this.speechTimer = null; }
    if (this.blockTimer) { clearTimeout(this.blockTimer); this.blockTimer = null; }
    if (this.audioElement) { this.audioElement.pause(); }
    this.emit();
  }

  resume() {
    if (this.state.mode !== 'paused') return;
    this.state.mode = 'playing';
    this.emit();
    this.processNext();
  }

  togglePlayPause() {
    if (this.state.mode === 'playing') this.pause();
    else if (this.state.mode === 'paused') this.resume();
    else this.play();
  }

  setSpeed(speed: number) {
    this.state.speed = speed;
    if (this.audioElement) {
      this.audioElement.playbackRate = speed;
    }
    this.emit();
  }

  nextScene() {
    if (this.state.sceneIndex >= this.scenes.length - 1) return;
    this.clearTimers();
    this.state.sceneIndex++;
    this.state.actionIndex = 0;
    this.state.whiteboardElements = [];
    this.state.whiteboardVisible = false;
    this.callbacks.onSceneChange(this.state.sceneIndex);
    this.emit();
    if (this.state.mode === 'playing') this.processNext();
  }

  prevScene() {
    if (this.state.sceneIndex <= 0) return;
    this.clearTimers();
    this.state.sceneIndex--;
    this.state.actionIndex = 0;
    this.state.whiteboardElements = [];
    this.state.whiteboardVisible = false;
    this.callbacks.onSceneChange(this.state.sceneIndex);
    this.emit();
    if (this.state.mode === 'playing') this.processNext();
  }

  seekToScene(index: number) {
    if (index < 0 || index >= this.scenes.length) return;
    this.clearTimers();
    this.state.sceneIndex = index;
    this.state.actionIndex = 0;
    this.state.whiteboardElements = [];
    this.state.whiteboardVisible = false;
    this.callbacks.onSceneChange(index);
    this.emit();
    // 静默重放白板动作到当前位置（简化版：仅重建 static 元素）
    this.rebuildWhiteboard();
  }

  destroy() {
    this.destroyed = true;
    this.state.mode = 'idle';
    this.clearTimers();
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }
    // 停止所有正在播放的 TTS
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  // ── 内部逻辑 ──────────────────────────────────────────────

  private clearTimers() {
    if (this.speechTimer) { clearTimeout(this.speechTimer); this.speechTimer = null; }
    if (this.blockTimer) { clearTimeout(this.blockTimer); this.blockTimer = null; }
  }

  private processNext() {
    if (this.destroyed || this.state.mode !== 'playing') return;

    const scene = this.currentScene;
    if (!scene) {
      this.state.mode = 'completed';
      this.callbacks.onComplete();
      this.emit();
      return;
    }

    const action = this.currentAction;
    if (!action) {
      // 当前场景结束，切到下一个场景
      if (this.state.sceneIndex < this.scenes.length - 1) {
        this.state.sceneIndex++;
        this.state.actionIndex = 0;
        this.state.whiteboardElements = [];
        this.state.whiteboardVisible = false;
        this.callbacks.onSceneChange(this.state.sceneIndex);
        this.emit();
        this.processNext();
      } else {
        this.state.mode = 'completed';
        this.callbacks.onComplete();
        this.emit();
      }
      return;
    }

    this.executeAction(action);
  }

  private executeAction(action: MicroAction) {
    switch (action.type) {
      case 'speech':
        this.executeSpeech(action);
        break;
      case 'spotlight':
      case 'laser':
        // 非阻塞：立即执行并继续下一个
        this.state.actionIndex++;
        this.emit();
        this.processNext();
        break;
      case 'wb_open':
        this.state.whiteboardVisible = true;
        this.state.whiteboardElements = [];
        this.state.actionIndex++;
        this.emit();
        this.waitBlock(getActionDuration(action));
        break;
      case 'wb_close':
        this.state.whiteboardVisible = false;
        this.state.actionIndex++;
        this.emit();
        this.waitBlock(getActionDuration(action));
        break;
      case 'wb_clear':
        this.state.whiteboardElements = [];
        this.state.actionIndex++;
        this.emit();
        this.waitBlock(getActionDuration(action));
        break;
      case 'wb_delete':
        this.state.whiteboardElements = this.state.whiteboardElements.filter(
          (el) => el.id !== action.elementId
        );
        this.state.actionIndex++;
        this.emit();
        this.waitBlock(getActionDuration(action));
        break;
      case 'wb_draw_text':
        this.addWhiteboardElement('text', action);
        this.state.actionIndex++;
        this.emit();
        this.waitBlock(getActionDuration(action));
        break;
      case 'wb_draw_shape':
        this.addWhiteboardElement('shape', action);
        this.state.actionIndex++;
        this.emit();
        this.waitBlock(getActionDuration(action));
        break;
      case 'wb_draw_line':
        this.addWhiteboardElement('line', action);
        this.state.actionIndex++;
        this.emit();
        this.waitBlock(getActionDuration(action));
        break;
      case 'wb_draw_latex':
        this.addWhiteboardElement('latex', action);
        this.state.actionIndex++;
        this.emit();
        this.waitBlock(getActionDuration(action));
        break;
      case 'wb_draw_code':
        this.addWhiteboardElement('code', action);
        this.state.actionIndex++;
        this.emit();
        this.waitBlock(getActionDuration(action));
        break;
    }
  }

  private executeSpeech(action: SpeechAction) {
    this.emitSubtitle(action.text);
    this.callbacks.onSpeechStart(action);

    const durationMs = Math.round(getActionDuration(action) / this.state.speed);
    console.log('[Playback] speak:', action.text.substring(0, 50) + '...', `(${durationMs}ms)`);

    // 定时器兜底：确保即使 TTS 静默失败也继续播放
    let ttsFired = false;
    const fallback = () => {
      if (ttsFired) return;
      ttsFired = true;
      this.speechTimer = null;
      console.log('[Playback] speech done (via ' + (window.speechSynthesis?.speaking ? 'TTS' : 'timer') + ')');
      this.state.actionIndex++;
      this.emit();
      this.callbacks.onSpeechEnd();
      this.processNext();
    };
    this.speechTimer = setTimeout(fallback, durationMs + 2000);

    // 尝试使用浏览器 TTS
    if ('speechSynthesis' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(action.text);
        utterance.lang = '';  // 空 = 系统默认语音，避免 zh-CN 语音未安装
        utterance.rate = this.state.speed;
        utterance.volume = 1;

        utterance.onstart = () => console.log('[Playback] TTS started speaking');
        utterance.onboundary = (e) => console.log('[Playback] TTS boundary:', e.charIndex); // 音频实际在播时才触发
        utterance.onend = () => {
          console.log('[Playback] TTS ended');
          if (this.speechTimer) clearTimeout(this.speechTimer);
          this.speechTimer = null;
          fallback();
        };
        utterance.onerror = (e) => {
          console.warn('[Playback] TTS error:', e.error);
        };
        // Chrome bug: paused状态导致立即onend。先resume再speak
        window.speechSynthesis.resume();
        // 小延迟防止 Chrome 队列冲突
        setTimeout(() => window.speechSynthesis.speak(utterance), 50);
      } catch (e) {
        console.warn('[Playback] TTS exception:', e);
      }
    } else {
      console.log('[Playback] No speechSynthesis API');
    }
    // 纯计时器兜底已在上方设置
  }

  private waitBlock(durationMs: number) {
    const adjusted = Math.round(durationMs / this.state.speed);
    this.blockTimer = setTimeout(() => {
      this.processNext();
    }, adjusted);
  }

  private addWhiteboardElement(type: string, action: Record<string, unknown>) {
    this.state.whiteboardElements.push({
      id: (action.elementId as string) || `el-${Date.now()}`,
      type,
      data: action,
    });
  }

  private rebuildWhiteboard() {
    // 重放到当前位置之前的所有白板动作
    const scene = this.currentScene;
    if (!scene) return;
    this.state.whiteboardElements = [];
    this.state.whiteboardVisible = false;

    for (let i = 0; i < this.state.actionIndex; i++) {
      const a = scene.actions[i];
      if (!a) continue;
      switch (a.type) {
        case 'wb_open':
          this.state.whiteboardVisible = true;
          this.state.whiteboardElements = [];
          break;
        case 'wb_close':
          this.state.whiteboardVisible = false;
          break;
        case 'wb_clear':
          this.state.whiteboardElements = [];
          break;
        case 'wb_delete':
          this.state.whiteboardElements = this.state.whiteboardElements.filter(
            (el) => el.id !== a.elementId
          );
          break;
        default:
          if (a.type.startsWith('wb_draw_')) {
            this.state.whiteboardElements.push({
              id: (a as { elementId: string }).elementId || `el-${i}`,
              type: a.type.replace('wb_draw_', ''),
              data: a as unknown as Record<string, unknown>,
            });
          }
      }
    }
  }
}
