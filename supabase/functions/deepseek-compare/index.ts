// deepseek-compare — 知识库对比：学生回答 vs 标准答案（逐句分析）
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const DS_URL = 'https://api.deepseek.com/v1/chat/completions';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const { question, studentAnswer, referenceContent } = await req.json();
    if (!question || !studentAnswer) throw new Error('question and studentAnswer required');

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({
        analysis: [{ sentence: studentAnswer, status: 'neutral', comment: '暂无 AI 分析，请配置 DeepSeek API Key' }],
        overallScore: 0, summary: '未配置 AI 服务', suggestions: []
      }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const prompt = `你是一个严格但公正的 Java 学习导师。请对学生回答进行逐句分析，与参考知识对比。

【问题】
${question}

【参考知识库原文】
${referenceContent || '（无参考，请基于 Java 标准知识评判）'}

【学生回答】
${studentAnswer}

请以 JSON 格式返回分析结果，格式如下：
{
  "analysis": [
    { "sentence": "学生原文句子", "status": "correct|partial|wrong|missing", "comment": "简短点评（≤30字）" }
  ],
  "overallScore": 85,
  "summary": "整体评价（50字以内）",
  "suggestions": ["具体改进建议1", "具体改进建议2"],
  "missing_key_points": ["遗漏的重要知识点1"]
}

注意：
- correct = 正确且完整
- partial = 方向对但不够准确或完整
- wrong = 有明显错误
- missing = 重要知识点未提及（作为独立条目放在 analysis 末尾）`;

    const resp = await fetch(DS_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });
    const d = await resp.json();
    const raw = d.choices?.[0]?.message?.content || '{}';

    // 提取 JSON
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      analysis: [{ sentence: studentAnswer, status: 'neutral', comment: '解析失败，请重试' }],
      overallScore: 0, summary: '解析失败', suggestions: []
    };

    return new Response(JSON.stringify(result), {
      headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
    });
  }
});
