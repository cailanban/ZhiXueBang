// deepseek-interview — AI 模拟面试 + 辩论赛智能体 v2: JWT鉴权
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { requireUser, createServiceClient, handleCORS, CORS_HEADERS } from '../_shared/auth.ts';

const DS_URL = 'https://api.deepseek.com/v1/chat/completions';

const INTERVIEW_SYSTEM = (topic: string) => `你是一位资深 Java 技术面试官，正在就"${topic}"考核候选人。

规则：
1. 每次只问一个问题，问题要有深度（不仅是背概念，要考察理解与实践）
2. 根据候选人的回答决定追问还是换题（追问标志：回答正确但不够深入）
3. 所有问题完成后（约5-6轮），给出评分（0-100）和详细反馈
4. 评分时输出固定格式：【评分：XX分】【反馈：...】【建议：...】
5. 语气专业，可以适当给提示，不要太严苛

从第一个问题开始。`;

const DEBATE_SYSTEM = (topic: string, side: 'pro' | 'con') => `你是一位辩论赛${side === 'pro' ? '正方' : '反方'}辩手，辩题是"${topic}"。

规则：
1. 你只持${side === 'pro' ? '正方（支持）' : '反方（反对）'}立场，不能改变
2. 每次发言 2-4 句，观点鲜明、有论据支撑
3. 针对对方（学生）的发言进行反驳或补充
4. 辩论约进行 4-5 轮后，给出总结陈词
5. 总结时输出固定格式：【总结：...】【评价对方论点：...】

请先用 2-3 句话阐述你的核心论点，开启辩论。`;

serve(async (req) => {
  const corsRes = handleCORS(req);
  if (corsRes) return corsRes;

  try {
    // 从 JWT 获取可信用户 ID
    const user = await requireUser(req);
    const { sessionId, sessionType = 'interview', topic, messages, side = 'pro' } = await req.json();
    if (!topic) throw new Error('topic required');

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    const supabase = createServiceClient();

    const systemPrompt = sessionType === 'debate'
      ? DEBATE_SYSTEM(topic, side as 'pro' | 'con')
      : INTERVIEW_SYSTEM(topic);

    const history = (messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === 'ai' ? 'assistant' : m.role,
      content: m.content,
    }));

    let reply = '';
    let score: number | null = null;
    let feedback = '';

    if (apiKey) {
      const resp = await fetch(DS_URL, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'system', content: systemPrompt }, ...history],
          max_tokens: 600,
          temperature: 0.7,
        }),
      });
      const d = await resp.json();
      reply = d.choices?.[0]?.message?.content || '';

      const scoreMatch = reply.match(/【评分：(\d+)分】/);
      if (scoreMatch) score = parseInt(scoreMatch[1]);
      const fbMatch = reply.match(/【反馈：(.+?)】/s);
      if (fbMatch) feedback = fbMatch[1];
    } else {
      reply = sessionType === 'debate'
        ? `我方认为，"${topic}"这一论点需要从以下角度分析：首先考虑实际工程场景，其次看具体数据支撑。请问您如何回应？`
        : `请解释一下在 ${topic} 中，最核心的概念是什么？请结合实际使用场景说明。`;
    }

    // 使用 JWT 验证后的 user.id 持久化会话
    if (sessionId) {
      const newMessages = [...(messages || []), { role: 'ai', content: reply }];
      await supabase.from('interview_sessions').upsert({
        id: sessionId, user_id: user.id, session_type: sessionType, topic,
        messages: newMessages, score, feedback, updated_at: new Date().toISOString(),
      });
    }

    return new Response(JSON.stringify({ reply, score, feedback }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    const status = e?.status ?? 500;
    return new Response(JSON.stringify({ error: String(e.message ?? e) }),
      { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  }
});
