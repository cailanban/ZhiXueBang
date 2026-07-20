// useAvatarSpeech — LLM 输出 → 数字人讲话串联 Hook
// 职责：接收 LLM 流式文本，按句子分块，排队发送到数字人 speak API
// 支持打断、队列管理、自动续播、降级（没有数字人时静默跳过）

import { useRef, useCallback, useState } from 'react';
import { speak as apiSpeak, interrupt as apiInterrupt } from '@/services/avatarGatewayApi';
import type { AvatarSessionState } from '@/types/digital-human';

// ── 配置 ─────────────────────────────────────────────────────
const MIN_CHUNK_LENGTH = 15; // 最短分块长度（字符）
const MAX_CHUNK_LENGTH = 200; // 最长分块长度
const SENTENCE_BREAKS = /[。！？；\n.!?;]/;
const CHUNK_DELIMITERS = /[，、,，：:]/;

export interface SpeechQueueItem {
  text: string;
  turnId: string;
  sequence: number;
}

interface UseAvatarSpeechOptions {
  sessionId: string | null;
  avatarState: AvatarSessionState;
  enabled?: boolean;
}

interface UseAvatarSpeechReturn {
  // 推送 LLM 文本块（自动分句/排队）
  feedText: (text: string) => void;
  // 推送完整句子（立即发送）
  speakSentence: (sentence: string) => void;
  // 打断当前播放
  interrupt: () => Promise<void>;
  // 清空队列
  clearQueue: () => void;
  // 队列长度
  queueLength: number;
  // 是否正在播放
  isPlaying: boolean;
  // 累计发送字数
  totalCharsSent: number;
}

export function useAvatarSpeech(options: UseAvatarSpeechOptions): UseAvatarSpeechReturn {
  const { sessionId, avatarState, enabled = true } = options;

  const [queueLength, setQueueLength] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalCharsSent, setTotalCharsSent] = useState(0);

  // Refs for async state
  const queueRef = useRef<SpeechQueueItem[]>([]);
  const sequenceRef = useRef(0);
  const bufferRef = useRef(''); // 未完成句子的缓冲区
  const isPlayingRef = useRef(false);
  const sessionIdRef = useRef(sessionId);
  const avatarStateRef = useRef(avatarState);

  // 同步 refs
  sessionIdRef.current = sessionId;
  avatarStateRef.current = avatarState;

  // ── 内部：发送队列中的下一个 ────────────────────────────────
  const processQueue = useCallback(async () => {
    if (queueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      setQueueLength(0);
      return;
    }

    const sid = sessionIdRef.current;
    if (!sid) return;

    const state = avatarStateRef.current;
    if (state !== 'ready' && state !== 'speaking') {
      // 数字人未就绪，暂停处理
      return;
    }

    isPlayingRef.current = true;
    setIsPlaying(true);

    const item = queueRef.current[0];
    try {
      await apiSpeak(sid, {
        text: item.text,
        turnId: item.turnId,
        sequence: item.sequence,
      });
    } catch {
      // 发送失败，跳过当前项
    }

    queueRef.current.shift();
    setQueueLength(queueRef.current.length);
    setTotalCharsSent((prev) => prev + item.text.length);

    // 递归处理下一个
    if (queueRef.current.length > 0) {
      processQueue();
    } else {
      isPlayingRef.current = false;
      setIsPlaying(false);
    }
  }, []);

  // ── 将文本按句子分块后加入队列 ──────────────────────────────
  const enqueueChunks = useCallback((chunks: string[]) => {
    for (const chunk of chunks) {
      const trimmed = chunk.trim();
      if (trimmed.length === 0) continue;

      const turnId = crypto.randomUUID();
      queueRef.current.push({
        text: trimmed,
        turnId,
        sequence: sequenceRef.current++,
      });
    }
    setQueueLength(queueRef.current.length);

    // 如果当前没有在播放，开始处理
    if (!isPlayingRef.current) {
      processQueue();
    }
  }, [processQueue]);

  // ── 分句逻辑 ────────────────────────────────────────────────
  const splitIntoChunks = useCallback((text: string): string[] => {
    const chunks: string[] = [];
    let current = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      current += char;

      // 遇到句子结束符 → 分块
      if (SENTENCE_BREAKS.test(char)) {
        if (current.trim().length >= MIN_CHUNK_LENGTH) {
          chunks.push(current.trim());
          current = '';
        }
      }
      // 遇到分隔符 + 长度足够 → 分块
      else if (CHUNK_DELIMITERS.test(char) && current.trim().length >= MIN_CHUNK_LENGTH) {
        chunks.push(current.trim());
        current = '';
      }
      // 长度超限 → 强制分块
      else if (current.length >= MAX_CHUNK_LENGTH) {
        chunks.push(current.trim());
        current = '';
      }
    }

    // 剩余文本
    if (current.trim().length > 0) {
      chunks.push(current.trim());
    }

    return chunks;
  }, []);

  // ── 公开：推送 LLM 文本块（增量） ───────────────────────────
  const feedText = useCallback((text: string) => {
    if (!enabled || !sessionIdRef.current) return;

    bufferRef.current += text;

    // 检查是否有完整句子
    const chunks = splitIntoChunks(bufferRef.current);

    if (chunks.length > 1) {
      // 有完整句子：发送前面的句子，保留最后一个（可能不完整）
      const toSend = chunks.slice(0, -1);
      bufferRef.current = chunks[chunks.length - 1];
      enqueueChunks(toSend);
    } else if (chunks.length === 1 && chunks[0].length >= MAX_CHUNK_LENGTH) {
      // 单个句子太长
      bufferRef.current = '';
      enqueueChunks(chunks);
    }
  }, [enabled, splitIntoChunks, enqueueChunks]);

  // ── 公开：刷新缓冲区（LLM 结束时调用） ───────────────────────
  const flushBuffer = useCallback(() => {
    if (bufferRef.current.trim().length > 0) {
      enqueueChunks([bufferRef.current.trim()]);
      bufferRef.current = '';
    }
  }, [enqueueChunks]);

  // ── 公开：发送完整句子（立即） ──────────────────────────────
  const speakSentence = useCallback((sentence: string) => {
    if (!enabled || !sessionIdRef.current) return;
    enqueueChunks([sentence]);
  }, [enabled, enqueueChunks]);

  // ── 公开：打断 ──────────────────────────────────────────────
  const interrupt = useCallback(async () => {
    const sid = sessionIdRef.current;
    if (!sid) return;

    // 清空本地队列
    queueRef.current = [];
    bufferRef.current = '';
    setQueueLength(0);
    isPlayingRef.current = false;
    setIsPlaying(false);

    // 调用 API 打断
    try {
      await apiInterrupt(sid);
    } catch {
      // 打断失败不影响
    }
  }, []);

  // ── 公开：清空队列 ──────────────────────────────────────────
  const clearQueue = useCallback(() => {
    queueRef.current = [];
    bufferRef.current = '';
    setQueueLength(0);
    isPlayingRef.current = false;
    setIsPlaying(false);
  }, []);

  // 返回 flushBuffer 作为 feedText 的附加方法（通过对象扩展）
  return {
    feedText,
    speakSentence,
    interrupt,
    clearQueue,
    queueLength,
    isPlaying,
    totalCharsSent,
    // @ts-expect-error flushBuffer is internal but exposed for LLM completion callbacks
    flushBuffer,
  };
}