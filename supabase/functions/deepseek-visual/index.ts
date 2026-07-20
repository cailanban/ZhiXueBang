// deepseek-visual — 可视化图解生成智能体（14种图解类型）
// P0修复：移除 FALLBACK 虚构数据，API不可用时返回 503
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const DS_URL = 'https://api.deepseek.com/v1/chat/completions';

const VISUAL_PROMPTS: Record<string, (topic: string) => string> = {
  mind_map: (t) => `只输出 Mermaid mindmap 代码块。主题：${t}。要求 root((${t}))，3-4 层，20-32 个节点，每节点≤12字的中文短句，不要任何解释文字。`,
  flowchart: (t) => `只输出 Mermaid flowchart TD 代码块。主题：${t}。要求 4 个 subgraph：输入条件、核心机制、关键判断、输出反馈。节点用中文短句，箭头说明清晰，节点数10-20个。`,
  sequence: (t) => `只输出 Mermaid sequenceDiagram 代码块。主题：${t}。参与者包括用户、画像智能体、课程架构智能体、资源生成智能体、质量审核智能体、评估智能体。展示完整协作流程，消息用中文短句。`,
  concept: (t) => `只输出 Mermaid graph TD 代码块。主题：${t}。分为前置知识、核心概念、运行机制、代码实践、评估反馈五组，展示知识点依赖关系，节点用中文短句。`,
  class_diagram: (t) => `只输出 Mermaid classDiagram 代码块。主题：${t}。类名用英文，成员说明用中文短句，展示 4-6 个类及继承/依赖/聚合关系。`,
  state_diagram: (t) => `只输出 Mermaid stateDiagram-v2 代码块。主题：${t}。展示从开始、处理中、判断、反馈到结束的完整状态流转，节点用中文短句。`,
  er_diagram: (t) => `只输出 Mermaid erDiagram 代码块。主题：${t}。实体名用英文大写，展示学习者、画像、目标、知识点、资源、练习、评估之间的关系，关系描述用中文。`,
  gantt: (t) => `只输出 Mermaid gantt 代码块。主题：${t}的7天学习计划。title用中文，dateFormat YYYY-MM-DD，section按基础/进阶/实战/复盘分4段，每段2-3个任务，任务名≤12字。`,
  pie: (t) => `只输出 Mermaid pie 代码块。主题：${t}。title用"${t}掌握度构成"，展示概念理解、代码实践、题目正确率、迁移应用、复盘完成等5个维度的占比数字（合计100）。`,
  architecture: (t) => `只输出 Mermaid flowchart LR 代码块。主题：${t}。展示学生端→前端工作台→FastAPI→知识库/模型调度→多智能体→学习结果的完整工程链路，节点用中文短句。`,
  compare: (t) => `主题：${t}。按概念定义、适用场景、代码提示、易错点四个维度，生成三列对比分析。用Markdown表格格式输出。`,
  roadmap: (t) => `主题：${t}。按基础理解、机制突破、代码实战、复盘提升四个阶段生成学习路线。每阶段包含：阶段名、3-4个具体学习任务（每个≤15字）。用Markdown格式。`,
  journey: (t) => `主题：${t}。描述学生与4个智能体协同完成学习闭环的体验旅程。分4个阶段，每阶段2-3步。用Markdown格式。`,
};

function unavailableResponse(visualType: string, topic: string, reason: string) {
  return new Response(
    JSON.stringify({
      content: '',
      source: 'unavailable',
      visualType,
      topic,
      reason,
      message: 'AI 图解服务暂时不可用，请稍后重试。',
    }),
    { status: 503, headers: { ...CORS, 'Content-Type': 'application/json' } }
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const { topic, visualType = 'mind_map', visualStyle = 'teaching' } = await req.json();
    if (!topic) throw new Error('topic required');

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) {
      return unavailableResponse(visualType, topic, 'DEEPSEEK_API_KEY not configured');
    }

    const promptFn = VISUAL_PROMPTS[visualType] || VISUAL_PROMPTS.mind_map;
    const styleHint = visualStyle === 'defense'
      ? '\n\n要求：简洁正式，适合答辩展示，结构层次清晰。'
      : visualStyle === 'clean'
      ? '\n\n要求：极简风格，节点和文字尽量精炼。'
      : '\n\n要求：教学风格，注重层次和易读性，内容详细准确。';

    const prompt = promptFn(topic) + styleHint;

    const dsRes = await fetch(DS_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048,
        temperature: 0.4,
      }),
    });

    const dsData = await dsRes.json();
    if (!dsRes.ok) throw new Error(dsData.error?.message || 'DeepSeek API error');

    const content = dsData.choices?.[0]?.message?.content || '';
    if (!content) throw new Error('empty response');

    return new Response(
      JSON.stringify({ content, source: 'deepseek' }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    const body = await req.clone().json().catch(() => ({}));
    const visualType = (body as Record<string,string>)?.visualType || 'mind_map';
    const topic = (body as Record<string,string>)?.topic || '';
    return unavailableResponse(visualType, topic, String(e));
  }
});
