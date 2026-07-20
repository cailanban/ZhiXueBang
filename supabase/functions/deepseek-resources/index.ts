// deepseek-resources — 真多智能体并行编排（Orchestrator DAG 架构）
// 流水线：CurriculumAgent → [HandoutAgent, MindmapAgent, QuizAgent, CodeCaseAgent, ReadingListAgent] → ReviewerAgent
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { Orchestrator } from '../_shared/agents/orchestrator.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 兼容旧版单资源模式（resourceType 参数）
const LEGACY_TYPE_MAP: Record<string, keyof ReturnType<Orchestrator['run']> extends Promise<infer R> ? R['resources'] : never> = {
  course_document: 'handout',
  mind_map: 'mindmap',
  exercises: 'quiz',
  code_example: 'code',
  reading_list: 'reading',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const { topic, resourceType, profile, mode = 'full' } = await req.json();
    if (!topic) throw new Error('topic required');

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) throw new Error('DEEPSEEK_API_KEY not configured');

    const profileHint = profile ? JSON.stringify(profile).slice(0, 300) : '';

    // 全量多智能体模式
    const orchestrator = new Orchestrator();
    const result = await orchestrator.run(topic, apiKey, profileHint);

    // 兼容旧版：如果指定了 resourceType，只返回对应资源的 content
    if (mode === 'single' && resourceType && LEGACY_TYPE_MAP[resourceType]) {
      const key = LEGACY_TYPE_MAP[resourceType] as keyof typeof result.resources;
      return new Response(JSON.stringify({
        content: result.resources[key],
        resourceType,
        topic,
        agent_trace: result.agent_trace,
        review: result.review,
      }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    // 默认：返回全部资源 + agent_trace + review
    return new Response(JSON.stringify({
      resources: result.resources,
      agent_trace: result.agent_trace,
      review: result.review,
      topic,
      // 保持旧版 content 字段兼容（返回讲义内容）
      content: result.resources.handout,
      resourceType: resourceType || 'full',
    }), { headers: { ...CORS, 'Content-Type': 'application/json' } });

  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
});
