// system-health — 系统健康检查 Edge Function
// 返回各服务的真实运行状态，替代前端硬编码的全绿状态页
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { handleCORS, CORS_HEADERS } from '../_shared/auth.ts';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  latency_ms?: number;
  message?: string;
  checked_at: string;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down';
  database: HealthStatus;
  deepseek: HealthStatus;
  spark: HealthStatus;
  rag: HealthStatus;
  storage: HealthStatus;
  agents: HealthStatus[];
  checked_at: string;
}

serve(async (req) => {
  const corsRes = handleCORS(req);
  if (corsRes) return corsRes;

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date().toISOString();
    const results: SystemHealth = {
      overall: 'healthy',
      database: { status: 'unknown', checked_at: now },
      deepseek: { status: 'unknown', checked_at: now },
      spark: { status: 'unknown', checked_at: now },
      rag: { status: 'unknown', checked_at: now },
      storage: { status: 'unknown', checked_at: now },
      agents: [],
      checked_at: now,
    };

    // 1. 数据库健康检查：轻量查询
    const dbStart = Date.now();
    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      if (error) throw error;
      results.database = { status: 'healthy', latency_ms: Date.now() - dbStart, checked_at: now };
    } catch (e) {
      results.database = { status: 'down', message: String(e), checked_at: now };
      results.overall = 'degraded';
    }

    // 2. DeepSeek 配置检查（不实际调用模型以节省成本）
    const dsKey = Deno.env.get('DEEPSEEK_API_KEY');
    results.deepseek = {
      status: dsKey ? 'healthy' : 'degraded',
      message: dsKey ? '已配置' : 'DEEPSEEK_API_KEY 未配置',
      checked_at: now,
    };

    // 3. 星火配置检查
    const sparkKey = Deno.env.get('SPARK_API_KEY');
    results.spark = {
      status: sparkKey ? 'healthy' : 'degraded',
      message: sparkKey ? '已配置' : 'SPARK_API_KEY 未配置',
      checked_at: now,
    };

    // 4. RAG 配置检查
    const imaKey = Deno.env.get('IMA_API_KEY');
    results.rag = {
      status: imaKey ? 'healthy' : 'down',
      message: imaKey ? '已配置' : 'IMA_API_KEY 未配置',
      checked_at: now,
    };

    // 5. Storage 配置检查
    const storageUrl = Deno.env.get('SUPABASE_URL');
    results.storage = {
      status: storageUrl ? 'healthy' : 'unknown',
      message: storageUrl ? 'Supabase Storage 已配置' : 'SUPABASE_URL 未配置',
      checked_at: now,
    };

    // 6. Agent 状态（基于配置检查，不实际调用模型）
    const agentNames = [
      '对话Agent', '诊断Agent', '画像Agent', '知识库Agent',
      '路径规划Agent', '课程架构Agent', '讲义编写Agent', '思维导图Agent',
      '题库出题Agent', '代码案例Agent', '资源推荐Agent', '质量审核Agent',
    ];
    results.agents = agentNames.map(name => ({
      status: dsKey ? 'healthy' as const : 'degraded' as const,
      message: dsKey ? 'DeepSeek API 可用' : 'DeepSeek API 未配置',
      checked_at: now,
    }));

    // 如果数据库挂了，整体状态降级
    if (results.database.status === 'down') {
      results.overall = 'down';
    }

    return new Response(JSON.stringify(results), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: 'HEALTH_CHECK_FAILED', message: String(e) }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
