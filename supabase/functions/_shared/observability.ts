/**
 * observability.ts — 可观测性模块 V2
 *
 * 追踪指标：
 * - 成本: 累计 API 调用费用 (RPC → edge_function_costs)
 * - TTFT: 首 Token 延迟 (ms)
 * - 总延迟: 请求总响应时间 (ms)
 * - SSE 中断率: 流式连接中断次数/总连接数
 * - 请求计数: 每次调用 +1
 * - 错误计数: 每次错误 +1
 * - Token 使用量: 累计 token 数
 *
 * 使用方式：
 *   const obs = createObservabilityTracker('function-name');
 *   obs.recordTTFT(ms);
 *   obs.recordLatency(ms);
 *   obs.recordSSEInterrupt();
 *   obs.recordError();
 *   obs.recordTokens(count);
 *   await obs.flush(); // 最佳实践：在函数末尾调用
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// ─── Cost tracker (保留兼容) ──────────────────────────────────────────────
export interface CostTracker {
  getCost: () => number;
  addCost: (amount: number) => void;
}

export function createCostTracker(): CostTracker {
  let total = 0;
  return {
    getCost: () => total,
    addCost: (amount: number) => { total += amount; },
  };
}

export async function accumulateDailyCost(
  functionName: string,
  cost: { getCost: () => number },
  tokens?: number,
): Promise<void> {
  if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
    EdgeRuntime.waitUntil(
      _doAccumulateCost(functionName, cost.getCost(), tokens).catch(() => {}),
    );
  }
}

async function _doAccumulateCost(functionName: string, cost: number, tokens?: number) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  await supabase.rpc("accumulate_function_cost", {
    p_function_name: functionName,
    p_cost: cost,
    p_tokens: tokens || 0,
  });
}

// ─── Detailed observability tracker V2 ────────────────────────────────────
export interface ObservabilityTracker {
  functionName: string;
  recordTTFT: (ms: number) => void;
  recordLatency: (ms: number) => void;
  recordSSEInterrupt: () => void;
  recordRequest: () => void;
  recordError: () => void;
  recordTokens: (count: number) => void;
  recordIndexLatency: (ms: number) => void;
  recordGPUFirstFrame: (ms: number) => void;
  recordGPUAuioLipDelay: (ms: number) => void;
  recordRecommendationImpression: () => void;
  recordRecommendationClick: () => void;
  recordRecommendationCompletion: () => void;
  getCostTracker: () => CostTracker;
  getSummary: () => Record<string, number>;
  flush: () => Promise<void>;
}

export function createObservabilityTracker(functionName: string): ObservabilityTracker {
  const costTracker = createCostTracker();
  const metrics: Record<string, number> = {
    ttft_ms: 0,
    total_latency_ms: 0,
    sse_interrupt_count: 0,
    request_count: 0,
    error_count: 0,
    token_count: 0,
    index_latency_ms: 0,
    gpu_first_frame_ms: 0,
    gpu_audio_lip_delay_ms: 0,
    recommendation_impression: 0,
    recommendation_click: 0,
    recommendation_completion: 0,
    cost: 0,
  };

  let ttftSamples = 0;
  let latencySamples = 0;
  let indexSamples = 0;
  let gpuFrameSamples = 0;
  let gpuLipSamples = 0;

  return {
    functionName,

    recordTTFT(ms: number) {
      metrics.ttft_ms = ((metrics.ttft_ms * ttftSamples) + ms) / (ttftSamples + 1);
      ttftSamples++;
    },

    recordLatency(ms: number) {
      metrics.total_latency_ms = ((metrics.total_latency_ms * latencySamples) + ms) / (latencySamples + 1);
      latencySamples++;
    },

    recordSSEInterrupt() {
      metrics.sse_interrupt_count++;
    },

    recordRequest() {
      metrics.request_count++;
    },

    recordError() {
      metrics.error_count++;
    },

    recordTokens(count: number) {
      metrics.token_count += count;
    },

    recordIndexLatency(ms: number) {
      metrics.index_latency_ms = ((metrics.index_latency_ms * indexSamples) + ms) / (indexSamples + 1);
      indexSamples++;
    },

    recordGPUFirstFrame(ms: number) {
      metrics.gpu_first_frame_ms = ((metrics.gpu_first_frame_ms * gpuFrameSamples) + ms) / (gpuFrameSamples + 1);
      gpuFrameSamples++;
    },

    recordGPUAuioLipDelay(ms: number) {
      metrics.gpu_audio_lip_delay_ms = ((metrics.gpu_audio_lip_delay_ms * gpuLipSamples) + ms) / (gpuLipSamples + 1);
      gpuLipSamples++;
    },

    recordRecommendationImpression() {
      metrics.recommendation_impression++;
    },

    recordRecommendationClick() {
      metrics.recommendation_click++;
    },

    recordRecommendationCompletion() {
      metrics.recommendation_completion++;
    },

    getCostTracker: () => costTracker,

    getSummary: () => ({ ...metrics, cost: costTracker.getCost() }),

    async flush() {
      if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
        EdgeRuntime.waitUntil(_flushMetrics(functionName, metrics, costTracker).catch(() => {}));
      }
    },
  };
}

async function _flushMetrics(
  functionName: string,
  metrics: Record<string, number>,
  costTracker: CostTracker,
) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const metricMap: Record<string, { value: number; unit?: string }> = {
    request_count: { value: metrics.request_count, unit: 'count' },
    error_count: { value: metrics.error_count, unit: 'count' },
    token_count: { value: metrics.token_count, unit: 'tokens' },
    sse_interrupt_count: { value: metrics.sse_interrupt_count, unit: 'count' },
    recommendation_impression: { value: metrics.recommendation_impression, unit: 'count' },
    recommendation_click: { value: metrics.recommendation_click, unit: 'count' },
    recommendation_completion: { value: metrics.recommendation_completion, unit: 'count' },
  };

  const avgMap: Record<string, { value: number; unit: string }> = {
    ttft_ms: { value: metrics.ttft_ms, unit: 'ms' },
    total_latency_ms: { value: metrics.total_latency_ms, unit: 'ms' },
    index_latency_ms: { value: metrics.index_latency_ms, unit: 'ms' },
    gpu_first_frame_ms: { value: metrics.gpu_first_frame_ms, unit: 'ms' },
    gpu_audio_lip_delay_ms: { value: metrics.gpu_audio_lip_delay_ms, unit: 'ms' },
  };

  // Record all count metrics
  for (const [type, { value, unit }] of Object.entries(metricMap)) {
    if (value > 0) {
      await supabase.rpc("record_function_metric", {
        p_function_name: functionName,
        p_metric_type: type,
        p_metric_value: value,
        p_unit: unit,
      }).catch(() => {});
    }
  }

  // Record all average metrics (only if samples were recorded)
  for (const [type, { value, unit }] of Object.entries(avgMap)) {
    if (value > 0) {
      await supabase.rpc("record_function_metric", {
        p_function_name: functionName,
        p_metric_type: type,
        p_metric_value: value,
        p_unit: unit,
      }).catch(() => {});
    }
  }

  // Also accumulate cost
  await _doAccumulateCost(functionName, costTracker.getCost(), metrics.token_count);
}

// ─── SSE 中断率计算工具 ──────────────────────────────────────────────────
export function calculateSSEInterruptRate(interruptCount: number, totalConnections: number): number {
  if (totalConnections === 0) return 0;
  return interruptCount / totalConnections;
}

// ─── 推荐转化率计算工具 ──────────────────────────────────────────────────
export function calculateRecommendationRate(impressions: number, clicks: number, completions: number): {
  ctr: number;    // Click-through rate
  completion_rate: number;  // Completion rate
} {
  return {
    ctr: impressions > 0 ? clicks / impressions : 0,
    completion_rate: clicks > 0 ? completions / clicks : 0,
  };
}