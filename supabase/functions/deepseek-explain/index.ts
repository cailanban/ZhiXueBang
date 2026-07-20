// deepseek-explain — 题目答案解析（支持个人知识库增强）
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const DS_URL = 'https://api.deepseek.com/v1/chat/completions';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const { question, options, correctAnswer, userAnswer, questionType, topic, imaContext } = await req.json();
    if (!question) throw new Error('question required');

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) throw new Error('DEEPSEEK_API_KEY not configured');

    const isCorrect = userAnswer === correctAnswer;
    const optionsText = options
      ? Object.entries(options as Record<string, string>).map(([k, v]) => `${k}. ${v}`).join('\n')
      : '';

    let ragHint = '';
    if (imaContext) ragHint = `\n\n[知识库参考]\n${imaContext}`;

    const prompt = `你是智学帮系统的「质量审核师」智能体，负责提供专业的题目解析。

题目：${question}
${optionsText ? '选项：\n' + optionsText : ''}
正确答案：${correctAnswer}
学生作答：${userAnswer}（${isCorrect ? '✅ 正确' : '❌ 错误'}）
知识点：${topic || '未知'}
${ragHint}

请提供详细解析（Markdown格式）：
1. **答案确认**：说明正确答案及理由
2. **知识点讲解**：深入解释相关Java知识点（含代码示例）
3. **易错分析**：${!isCorrect ? '分析学生出错的原因，指出思维误区' : '说明此题的常见错误及注意事项'}
4. **记忆口诀**：给出1-2句便于记忆的总结

保持专业、简洁、有教学价值。`;

    const dsRes = await fetch(DS_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500,
        temperature: 0.5,
      }),
    });
    const dsData = await dsRes.json();
    if (!dsRes.ok) throw new Error(dsData.error?.message || 'DeepSeek error');

    const explanation = dsData.choices?.[0]?.message?.content || '';
    return new Response(JSON.stringify({ explanation, isCorrect }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
});
