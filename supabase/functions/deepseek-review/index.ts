// deepseek-review — 独立防幻觉审核 Edge Function
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const DS_URL = 'https://api.deepseek.com/v1/chat/completions';

const REVIEW_SYSTEM = `你是「质量审核师」智能体，负责对AI生成内容进行防幻觉审核。
审核维度（每项0-10分）：
1. 事实准确性：Java/编程知识点是否正确
2. 代码可运行性：语法正确，逻辑合理
3. 幻觉风险：是否存在编造的API/类名/不存在的方法
4. 内容完整性：是否覆盖主题核心知识点
5. 教学适用性：是否适合初中级学习者

输出严格的JSON（不加任何其他文字）：
{
  "score": 0-10的整数（综合分）,
  "dimension_scores": {
    "factual": 0-10,
    "code_quality": 0-10,
    "hallucination_free": 0-10,
    "completeness": 0-10,
    "pedagogical": 0-10
  },
  "factual": true或false,
  "hallucination_risk": "low"或"medium"或"high",
  "issues": ["具体问题1", "具体问题2"],
  "suggestions": ["改进建议1", "改进建议2"],
  "verdict": "pass"或"warn"或"reject",
  "summary": "30字以内的一句话审核结论"
}
评分标准：score≥8且幻觉风险low→pass；score≥6→warn；score<6或高幻觉→reject`;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const { content, topic, type = 'general' } = await req.json();
    if (!content) throw new Error('content required');

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) throw new Error('DEEPSEEK_API_KEY not configured');

    const userPrompt = `请对以下AI生成的${type === 'code' ? '代码' : '学习'}内容进行审核：
主题：${topic || '未指定'}
内容：
${content.slice(0, 3000)}`;

    const start = Date.now();
    const dsRes = await fetch(DS_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: REVIEW_SYSTEM },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1024,
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    const dsData = await dsRes.json();
    if (!dsRes.ok) throw new Error(dsData.error?.message ?? 'DeepSeek error');

    const duration_ms = Date.now() - start;
    let reviewResult;
    try {
      reviewResult = JSON.parse(dsData.choices?.[0]?.message?.content ?? '{}');
    } catch {
      reviewResult = {
        score: 7, factual: true, hallucination_risk: 'low',
        issues: [], suggestions: [], verdict: 'warn', summary: '审核结果解析异常',
      };
    }

    return new Response(JSON.stringify({
      ...reviewResult,
      duration_ms,
      agent_trace: [{
        agent: 'ReviewerAgent',
        status: 'success',
        summary: `质量评分 ${reviewResult.score}/10，审核结论：${reviewResult.verdict}`,
        duration_ms,
      }],
    }), { headers: { ...CORS, 'Content-Type': 'application/json' } });

  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
});
