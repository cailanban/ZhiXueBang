// AvatarControls — 数字人控制面板
// 包含：文字输入、发送、打断、麦克风、静音、全屏、重连、关闭

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { AvatarControlsProps } from '@/types/digital-human';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RefreshCw,
  X,
  AlertCircle,
} from 'lucide-react';

export default function AvatarControls({
  state,
  onSendText,
  onInterrupt,
  onToggleMute,
  onToggleFullscreen,
  onReconnect,
  onClose,
  muted,
  isFullscreen,
  textLength,
  maxTextLength,
  disabled = false,
  demoMode = false,
}: AvatarControlsProps) {
  const [input, setInput] = useState('');

  const isConnected = state === 'ready' || state === 'speaking';
  const isSpeaking = state === 'speaking';
  const isError = state === 'error';
  const isReconnecting = state === 'reconnecting';
  // 演示模式下无需 WebRTC 连接，输入框可直接使用
  const canSend = (isConnected || demoMode) && input.trim().length > 0 && textLength <= maxTextLength && !disabled;
  const canInterrupt = isSpeaking && !disabled;
  const inputEnabled = (isConnected || demoMode) && !disabled;

  const handleSend = useCallback(() => {
    const text = input.trim();
    console.log('[AvatarControls] handleSend 触发:', { text: text.substring(0, 30), canSend, isConnected, inputLen: input.trim().length, disabled, state });
    if (!text || !canSend) return;
    onSendText(text);
    setInput('');
  }, [input, canSend, onSendText, isConnected, disabled, state]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl border border-border bg-card">
      {/* 状态栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* 状态指示点 */}
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? 'bg-green-400'
                : isReconnecting
                  ? 'bg-yellow-400 animate-pulse'
                  : isError
                    ? 'bg-red-400'
                    : 'bg-slate-400'
            }`}
          />
          <span className="text-xs text-muted-foreground">
            {isConnected ? (isSpeaking ? 'AI教师讲解中' : 'AI教师在线') :
             isReconnecting ? '重连中…' :
             isError ? '连接失败' : (demoMode ? '演示模式就绪' : '未连接')}
          </span>
        </div>

        {/* 操作按钮组 */}
        <div className="flex items-center gap-1">
          {/* 重连 */}
          {(isError || isReconnecting) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReconnect}
              disabled={isReconnecting}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
              title="重新连接"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReconnecting ? 'animate-spin' : ''}`} />
            </Button>
          )}

          {/* 静音切换 */}
          {isConnected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMute}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
              title={muted ? '取消静音' : '静音'}
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </Button>
          )}

          {/* 全屏切换 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFullscreen}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
            title={isFullscreen ? '退出全屏' : '全屏'}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </Button>

          {/* 关闭 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
            title="关闭数字人"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* 输入区域 */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isConnected || demoMode
                ? '输入文字让AI教师讲解…（Enter发送）'
                : '请先连接数字人…'
            }
            disabled={!inputEnabled}
            className="flex-1 min-h-0 max-h-24 resize-none bg-muted/50 border-border text-sm pr-16"
            rows={1}
          />
          {/* 字数统计 */}
          <span
            className={`absolute right-2 bottom-2 text-[10px] ${
              textLength > maxTextLength * 0.9 ? 'text-red-400' : 'text-muted-foreground'
            }`}
          >
            {textLength}/{maxTextLength}
          </span>
        </div>

        {/* 打断按钮 */}
        {canInterrupt && (
          <Button
            onClick={onInterrupt}
            variant="outline"
            size="sm"
            className="h-9 px-3 border-red-400/30 text-red-400 hover:bg-red-400/10 shrink-0"
          >
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            打断
          </Button>
        )}

        {/* 发送按钮 */}
        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="sm"
          className="h-9 w-9 p-0 gradient-bg text-white shrink-0 disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* 快捷提示 */}
      {(isConnected || demoMode) && !isSpeaking && (
        <div className="flex gap-2 flex-wrap">
          {['请解释这个概念', '能举个例子吗', '这个知识点怎么记'].map((hint) => (
            <button
              key={hint}
              onClick={() => {
                setInput(hint);
              }}
              className="px-2.5 py-1 rounded-full text-[10px] border border-border text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              {hint}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}