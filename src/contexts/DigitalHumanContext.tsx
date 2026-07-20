/**
 * DigitalHumanContext - 数字人上下文提供者
 *
 * 桥接 Spark AI 输出流到数字人语音合成
 * 按 MD P1-4 要求：把数字人会话接入现有登录用户、学习上下文和 Spark 输出流
 *
 * 使用方式：
 *   DigitalHumanProvider 包裹 ChatPage，
 *   内部通过 useDigitalHuman() 获取 speak/stop
 *
 * ChatPage 中：
 *   const { speak, isAvailable } = useDigitalHuman();
 *   // 当 AI 流式输出完成一段话后:
 *   if (isAvailable && message.role === 'assistant') {
 *     speak(message.content);
 *   }
 */
import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { useGPUAvailability } from '@/hooks/useGPUAvailability';
import { speak as apiSpeak, interrupt as apiInterrupt } from '@/services/avatarGatewayApi';

interface DigitalHumanContextValue {
  /** GPU 是否在线，数字人是否可用 */
  isAvailable: boolean;
  /** 降级模式 */
  degradation: 'full' | 'audio_only' | 'offline';
  /** 当前会话 ID */
  sessionId: string | null;
  /** 是否正在说话 */
  isSpeaking: boolean;
  /** 设置会话 ID（由 DigitalHumanPanel 连接成功后调用） */
  setSessionId: (id: string | null) => void;
  /** 让数字人说一段话（自动分段，每段 ≤500 字） */
  speak: (text: string) => Promise<void>;
  /** 打断当前说话 */
  stop: () => Promise<void>;
  /** 当前学习主题（上下文） */
  topic: string | null;
  /** 设置当前学习主题 */
  setTopic: (topic: string | null) => void;
}

const DigitalHumanContext = createContext<DigitalHumanContextValue | null>(null);

export function useDigitalHuman(): DigitalHumanContextValue {
  const ctx = useContext(DigitalHumanContext);
  if (!ctx) {
    // 未包裹 Provider 时返回安全默认值（不抛错，优雅降级）
    return {
      isAvailable: false,
      degradation: 'offline',
      sessionId: null,
      isSpeaking: false,
      setSessionId: () => {},
      speak: async () => {},
      stop: async () => {},
      topic: null,
      setTopic: () => {},
    };
  }
  return ctx;
}

export function DigitalHumanProvider({ children }: { children: ReactNode }) {
  const { showDigitalHuman, degradation } = useGPUAvailability();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [topic, setTopic] = useState<string | null>(null);
  const speakingRef = useRef(false);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // 按句子分段，每段不超过 500 字
    const sentences = text.match(/[^。！？\n]+[。！？\n]?/g) || [text];
    const segments: string[] = [];
    let current = '';

    for (const s of sentences) {
      if ((current + s).length > 450) {
        if (current) segments.push(current.trim());
        current = s;
      } else {
        current += s;
      }
    }
    if (current.trim()) segments.push(current.trim());

    // 无 GPU/WebRTC 会话时，降级为浏览器 TTS
    if (!sessionId) {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      speakingRef.current = true;
      setIsSpeaking(true);
      for (const segment of segments) {
        if (!speakingRef.current) break;
        await new Promise<void>((resolve) => {
          const u = new SpeechSynthesisUtterance(segment);
          u.lang = 'zh-CN';
          u.rate = 1;
          u.onend = () => resolve();
          u.onerror = () => resolve();
          window.speechSynthesis.speak(u);
        });
      }
      setIsSpeaking(false);
      speakingRef.current = false;
      return;
    }

    speakingRef.current = true;
    setIsSpeaking(true);

    for (const segment of segments) {
      if (!speakingRef.current) break; // 被打断
      try {
        await apiSpeak(sessionId, {
          text: segment,
          turnId: crypto.randomUUID(),
          sequence: 0,
        });
        // 等待说话完成（估算：中文约 3 字/秒）
        await new Promise((r) => setTimeout(r, Math.max(segment.length * 300, 2000)));
      } catch {
        // 说话失败，继续下一段
      }
    }

    setIsSpeaking(false);
    speakingRef.current = false;
  }, [sessionId]);

  const stop = useCallback(async () => {
    speakingRef.current = false;
    if (sessionId) {
      await apiInterrupt(sessionId).catch(() => {});
    }
    setIsSpeaking(false);
  }, [sessionId]);

  return (
    <DigitalHumanContext.Provider
      value={{
        isAvailable: showDigitalHuman,
        degradation,
        sessionId,
        isSpeaking,
        setSessionId,
        speak,
        stop,
        topic,
        setTopic,
      }}
    >
      {children}
    </DigitalHumanContext.Provider>
  );
}