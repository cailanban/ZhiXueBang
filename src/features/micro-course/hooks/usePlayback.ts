// usePlayback — 微课播放器 Hook
import { useState, useRef, useCallback, useEffect } from 'react';
import { PlaybackEngine } from '../engine/PlaybackEngine';
import type { MicroScene } from '../types/scene';
import type { PlaybackState, PlaybackMode } from '../engine/PlaybackEngine';

export interface PlaybackControls {
  state: PlaybackState;
  play: () => void;
  pause: () => void;
  resume: () => void;
  togglePlayPause: () => void;
  setSpeed: (s: number) => void;
  nextScene: () => void;
  prevScene: () => void;
  seekToScene: (i: number) => void;
}

export function usePlayback(scenes: MicroScene[]): PlaybackControls {
  const [pbState, setPbState] = useState<PlaybackState>({
    mode: 'idle',
    sceneIndex: 0,
    actionIndex: 0,
    currentTimeMs: 0,
    totalTimeMs: scenes.reduce((s, sc) => s + sc.durationMs, 0),
    speed: 1,
    currentSubtitle: '',
    whiteboardVisible: false,
    whiteboardElements: [],
  });

  const engineRef = useRef<PlaybackEngine | null>(null);

  useEffect(() => {
    if (engineRef.current) engineRef.current.destroy();
    const engine = new PlaybackEngine(scenes, {
      onStateChange: (s) => setPbState({ ...s }),
      onSubtitleChange: () => {},
      onSpeechStart: () => {},
      onSpeechEnd: () => {},
      onSceneChange: () => {},
      onComplete: () => {},
    });
    engineRef.current = engine;
    return () => { engineRef.current?.destroy(); };
  }, [scenes]);

  const play = useCallback(() => engineRef.current?.play(), []);
  const pause = useCallback(() => engineRef.current?.pause(), []);
  const resume = useCallback(() => engineRef.current?.resume(), []);
  const togglePlayPause = useCallback(() => engineRef.current?.togglePlayPause(), []);
  const setSpeed = useCallback((s: number) => engineRef.current?.setSpeed(s), []);
  const nextScene = useCallback(() => engineRef.current?.nextScene(), []);
  const prevScene = useCallback(() => engineRef.current?.prevScene(), []);
  const seekToScene = useCallback((i: number) => engineRef.current?.seekToScene(i), []);

  return {
    state: pbState,
    play, pause, resume, togglePlayPause, setSpeed,
    nextScene, prevScene, seekToScene,
  };
}
