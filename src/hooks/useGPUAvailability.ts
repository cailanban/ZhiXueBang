/**
 * useGPUAvailability — 数字人 GPU 健康检测 Hook
 *
 * 用途：轮询 avatar-gateway 健康检查，决定是否显示数字人入口。
 * 按 MD P1-4 要求："常态使用轻量 AI 助手；仅检测到 GPU 服务在线
 * 或演示开关开启时展示数字人入口"
 *
 * 检测逻辑：
 * - 每 30 秒轮询一次 /health/ready
 * - 连续 3 次失败 → 标记 offline
 * - 恢复 1 次成功 → 标记 online
 * - 支持 demo_mode 强制开启（VITE_DEMO_DIGITAL_HUMAN=true）
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { healthCheck } from '@/services/avatarGatewayApi';

const POLL_INTERVAL_MS = 30_000;
const FAIL_THRESHOLD = 3;

interface GPUAvailability {
  /** GPU 是否在线（视频+音频可用） */
  gpuOnline: boolean;
  /** 是否正在检查中 */
  checking: boolean;
  /** 数字人入口是否应该显示 */
  showDigitalHuman: boolean;
  /** 降级模式：full=完整 / audio_only=仅音频+静态形象 / offline=不可用 */
  degradation: 'full' | 'audio_only' | 'offline';
  /** 上次成功检查时间 */
  lastSeen: number | null;
  /** 手动刷新 */
  refresh: () => void;
}

export function useGPUAvailability(): GPUAvailability {
  const [gpuOnline, setGpuOnline] = useState(false);
  const [checking, setChecking] = useState(true);
  const [degradation, setDegradation] = useState<'full' | 'audio_only' | 'offline'>('offline');
  const [lastSeen, setLastSeen] = useState<number | null>(null);
  const failCount = useRef(0);
  const demoMode = import.meta.env.VITE_DEMO_DIGITAL_HUMAN === 'true';

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const { live, ready } = await healthCheck();
      if (ready) {
        failCount.current = 0;
        setGpuOnline(true);
        setDegradation('full');
        setLastSeen(Date.now());
      } else if (live) {
        // 网关在线但 GPU 不可达 → 降级模式
        failCount.current = 0;
        setGpuOnline(true);
        setDegradation('audio_only');
        setLastSeen(Date.now());
      } else {
        failCount.current++;
        if (failCount.current >= FAIL_THRESHOLD) {
          setGpuOnline(false);
          setDegradation('offline');
        }
      }
    } catch {
      failCount.current++;
      if (failCount.current >= FAIL_THRESHOLD) {
        setGpuOnline(false);
        setDegradation('offline');
      }
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    check();
    const timer = setInterval(check, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [check]);

  return {
    gpuOnline,
    checking,
    showDigitalHuman: demoMode || gpuOnline,
    degradation,
    lastSeen,
    refresh: check,
  };
}