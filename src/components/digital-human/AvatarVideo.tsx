// AvatarVideo — 数字人视频渲染组件
// 处理：视频播放、加载状态、连接动画、错误降级

import { useRef, useEffect } from 'react';
import type { AvatarVideoProps, AvatarSessionState } from '@/types/digital-human';
import { Loader2, Wifi, WifiOff, AlertTriangle, User } from 'lucide-react';

const STATE_LABELS: Record<AvatarSessionState, string> = {
  idle: '等待连接',
  creating: '创建会话中…',
  connecting: '正在连接数字人…',
  ready: '数字人已就绪',
  speaking: '讲解中',
  reconnecting: '重连中…',
  error: '连接失败',
  closed: '已断开',
};

export default function AvatarVideo({ stream, state, muted = false, demoMode = false, isSpeaking = false, className = '' }: AvatarVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      // 确保不静音，强制播放
      videoRef.current.muted = false;
      videoRef.current.play().catch((e) => {
        console.warn('[AvatarVideo] 自动播放被浏览器阻止，请点击视频区域', e);
      });
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  const isActive = state === 'ready' || state === 'speaking';
  const isLoading = state === 'creating' || state === 'connecting' || state === 'reconnecting';
  const isError = state === 'error';
  // 演示模式：AI 正在说话时显示脉冲动画
  const demoSpeaking = demoMode && isSpeaking;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 ${className}`}
      style={{ aspectRatio: '4/3' }}
    >
      {/* 视频层 */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          isActive && stream ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 状态覆盖层 */}
      {!isActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          {/* 演示模式：AI 教师形象 */}
          {demoMode && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {/* 脉冲环（AI 说话时） */}
                {demoSpeaking && (
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                )}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  demoSpeaking ? 'bg-primary/20 scale-110' : 'bg-primary/10'
                }`}>
                  <svg className={`w-10 h-10 text-primary ${demoSpeaking ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">
                  {demoSpeaking ? 'AI 教师讲解中…' : 'AI 数字人教师'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {demoSpeaking ? '语音播报进行中' : '输入问题开始对话，浏览器语音播报'}
                </p>
              </div>
              {/* 说话波形 */}
              {demoSpeaking && (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary rounded-full animate-pulse"
                      style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 加载动画 */}
          {!demoMode && isLoading && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                {/* 脉冲环 */}
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">{STATE_LABELS[state]}</p>
                {state === 'reconnecting' && (
                  <p className="text-xs text-slate-400 mt-1">网络波动，正在恢复连接…</p>
                )}
              </div>
            </div>
          )}

          {/* 空闲状态 */}
          {!demoMode && state === 'idle' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center">
                <User className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-sm text-slate-400">点击下方按钮连接数字人教师</p>
            </div>
          )}

          {/* 错误状态 */}
          {!demoMode && isError && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-red-400">{STATE_LABELS[state]}</p>
                <p className="text-xs text-slate-400 mt-1">可尝试重新连接或降级为音频模式</p>
              </div>
            </div>
          )}

          {/* 已关闭 */}
          {!demoMode && state === 'closed' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center">
                <WifiOff className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-sm text-slate-400">已断开连接</p>
            </div>
          )}
        </div>
      )}

      {/* 连接状态指示器（右上角） */}
      {isActive && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm">
          <Wifi className="w-3 h-3 text-green-400" />
          <span className="text-[10px] text-green-400 font-medium">
            {state === 'speaking' ? '讲解中' : '在线'}
          </span>
        </div>
      )}

      {/* 说话状态脉冲指示器 */}
      {state === 'speaking' && (
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          <div className="flex gap-0.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-1 bg-primary rounded-full animate-pulse"
                style={{
                  height: `${12 + i * 4}px`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}