import { useCallback, useEffect, useRef } from 'react';

/**
 * 只统计页面可见且用户近期有操作的真实学习时间。
 * 调用 consumeMinutes 后仅消费完整分钟，余下秒数保留到下一次提交。
 */
export function useActiveLearningTimer(idleAfterMs = 60_000) {
  const activeSecondsRef = useRef(0);
  const lastActivityAtRef = useRef(Date.now());

  useEffect(() => {
    const markActive = () => { lastActivityAtRef.current = Date.now(); };
    const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, markActive, { passive: true }));

    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastActivityAtRef.current > idleAfterMs) return;
      activeSecondsRef.current += 1;
    }, 1_000);

    return () => {
      window.clearInterval(timer);
      events.forEach(event => window.removeEventListener(event, markActive));
    };
  }, [idleAfterMs]);

  return useCallback(() => {
    const minutes = Math.floor(activeSecondsRef.current / 60);
    activeSecondsRef.current -= minutes * 60;
    return minutes;
  }, []);
}
