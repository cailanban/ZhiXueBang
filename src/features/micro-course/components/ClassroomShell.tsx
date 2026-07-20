// ClassroomShell — 微课课堂主界面
// 布局：左侧场景列表 | 中央16:9舞台+白板 | 底部控制栏

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MicroCourse } from '../types/course';
import type { PlaybackControls } from '../hooks/usePlayback';
import WhiteboardRenderer from './WhiteboardRenderer';
import {
  Play, Pause, SkipForward, SkipBack,
  Maximize, Minimize, X, ChevronLeft, ChevronRight,
} from 'lucide-react';

interface Props {
  course: MicroCourse;
  playback: PlaybackControls;
  onBack: () => void;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export default function ClassroomShell({ course, playback, onBack }: Props) {
  const { state, togglePlayPause, setSpeed, nextScene, prevScene, seekToScene } = playback;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const scene = course.scenes[state.sceneIndex];
  const isPlaying = state.mode === 'playing';
  const isCompleted = state.mode === 'completed';

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white">
      {/* 顶栏 */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-white/10 shrink-0">
        <button onClick={onBack} className="p-1 hover:bg-white/10 rounded">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-medium truncate">{course.title}</h1>
          <p className="text-xs text-white/40">{course.description}</p>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/40">
          <span>场景 {state.sceneIndex + 1}/{course.scenes.length}</span>
          <span className="mx-1">|</span>
          <span>{Math.round(state.currentTimeMs / 1000)}s / {Math.round(state.totalTimeMs / 1000)}s</span>
        </div>
        <div className="flex items-center gap-1">
          {SPEEDS.map((s) => (
            <button key={s}
              onClick={() => setSpeed(s)}
              className={`px-1.5 py-0.5 text-xs rounded ${state.speed === s ? 'bg-blue-500/30 text-blue-300' : 'text-white/40 hover:text-white'}`}
            >
              {s}×
            </button>
          ))}
        </div>
        <button onClick={toggleFullscreen} className="p-1 hover:bg-white/10 rounded">
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </header>

      {/* 主体 */}
      <div className="flex-1 flex min-h-0">
        {/* 场景侧栏 */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-white/10 overflow-y-auto shrink-0"
            >
              <div className="p-2">
                <p className="text-xs text-white/30 uppercase tracking-wider mb-2 px-2">场景列表</p>
                {course.scenes.map((s, i) => (
                  <button key={s.id}
                    onClick={() => seekToScene(i)}
                    className={`w-full text-left px-2 py-2 rounded-lg text-xs transition mb-1 ${
                      i === state.sceneIndex
                        ? 'bg-blue-500/20 text-blue-300 font-medium'
                        : 'text-white/50 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-white/30 mr-1">{String(i + 1).padStart(2, '0')}</span>
                    {s.title}
                  </button>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* 按钮切换侧栏 */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="shrink-0 px-0.5 hover:bg-white/5 text-white/30 hover:text-white/60 transition"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* 中央舞台 */}
        <div className="flex-1 flex items-center justify-center p-4 min-w-0">
          <div
            className="relative w-full overflow-hidden rounded-xl"
            style={{ aspectRatio: '16/9', maxHeight: 'calc(100vh - 140px)' }}
          >
            {/* 幻灯片背景 */}
            {scene && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
                style={{ background: scene.canvas.background }}
              >
                {scene.canvas.elements.map((el) => (
                  <div key={el.id}
                    style={{
                      position: 'absolute',
                      left: el.x, top: el.y, width: el.width, height: el.height,
                      fontSize: el.style?.fontSize ? parseInt(el.style.fontSize) : 24,
                      color: el.style?.color || '#e2e8f0',
                      fontWeight: el.style?.fontWeight === 'bold' ? 700 : 400,
                    }}
                  >
                    {el.content}
                  </div>
                ))}
              </div>
            )}

            {/* 白板覆盖层 */}
            <WhiteboardRenderer
              elements={state.whiteboardElements}
              visible={state.whiteboardVisible}
            />

            {/* 空闲/完成覆盖层 */}
            {!isPlaying && !isCompleted && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-30">
                <button onClick={togglePlayPause}
                  className="w-16 h-16 rounded-full bg-blue-500/80 flex items-center justify-center hover:bg-blue-500 transition"
                >
                  <Play className="w-8 h-8 text-white ml-1" />
                </button>
              </div>
            )}
            {isCompleted && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-30 gap-3">
                <p className="text-lg font-medium">微课播放完毕</p>
                <button onClick={togglePlayPause}
                  className="px-6 py-2 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600"
                >
                  重新播放
                </button>
              </div>
            )}

            {/* 字幕 */}
            {state.currentSubtitle && (
              <div className="absolute bottom-4 left-4 right-4 z-30">
                <p className="text-center text-sm bg-black/60 rounded-lg px-4 py-2 text-white/90 max-w-2xl mx-auto">
                  {state.currentSubtitle}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部控制栏 */}
      <footer className="flex items-center justify-center gap-4 px-4 py-3 border-t border-white/10 shrink-0">
        <button onClick={prevScene} disabled={state.sceneIndex <= 0}
          className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30">
          <SkipBack className="w-5 h-5" />
        </button>
        <button onClick={togglePlayPause}
          className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 transition">
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
        <button onClick={nextScene} disabled={state.sceneIndex >= course.scenes.length - 1}
          className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30">
          <SkipForward className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}
