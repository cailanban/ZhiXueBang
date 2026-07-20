// deepseek-tutor — 诊断型辅导智能体（SSE 流式，教-检-进节奏）
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DS_URL = 'https://api.deepseek.com/v1/chat/completions';

const TUTOR_SYSTEM = `你是智学帮系统的「诊断型辅导智能体」，遵循"教-检-进"教学节奏：

**诊断阶段（首轮）**：
先主动诊断学生水平，提问：
- "你对[主题]的了解程度？（零基础/了解基础/有一定经验）"
- "最困惑的点是什么？"
- 根据回答调整教学深度

**教学阶段**：
- 分层次讲解：概念→原理→代码→练习
- 使用 \`\`\`java 代码块演示
- 使用 \`\`\`mermaid 绘制流程图/结构图
- 每讲完一个要点，嵌入一道检验题

**检验阶段**：
- 出一道针对性练习题
- 等待学生作答后给出解析
- 若答错，深化讲解该知识点

**推进阶段**：
- 根据掌握情况，推进到下一知识点
- 更新学习进度评估
- 记录薄弱点供画像分析使用

角色标识（每轮开头）：> 🎓 **诊断辅导智能体** 正在教学...

保持专业、耐心、循循善诱的风格。`;

const MODE_HINTS: Record<string, string> = {
  beginner: '\n\n【当前模式：入门】从最基础的概念开始，多用类比，少用专业术语。',
  normal: '\n\n【当前模式：标准】按正常大学课程深度讲解。',
  advanced: '\n\n【当前模式：进阶】深入底层原理、源码分析、性能优化。',
  auto: '\n\n【当前模式：自适应】先诊断学生水平再调整。',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

  try {
    const { messages, sessionId, userId, topic, mode = 'auto' } = await req.json();
    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) return new Response('data: {"error":"Missing DEEPSEEK_API_KEY"}\n\n', { headers: CORS_HEADERS });

    const systemContent = TUTOR_SYSTEM + (MODE_HINTS[mode] || '') + (topic ? `\n\n当前学习主题：${topic}` : '');

    const dsMessages = [
      { role: 'system', content: systemContent },
      ...(messages || []).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content.slice(0, 3000),
      })),
    ];

    const dsRes = await fetch(DS_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'deepseek-chat', messages: dsMessages, max_tokens: 4096, temperature: 0.6, stream: true }),
    });

    if (!dsRes.ok) {
      const err = await dsRes.text();
      return new Response(`data: {"error":"DeepSeek API error: ${err}"}\n\n`, { headers: CORS_HEADERS });
    }

    const startTime = Date.now();
    let fullReply = '';

    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        const reader = dsRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;
              const data = trimmed.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content || '';
                if (delta) fullReply += delta;
                controller.enqueue(enc.encode(`${trimmed}\n\n`));
              } catch { /* skip malformed */ }
            }
          }
        } finally {
          // 持久化对话（异步，不阻塞流）
          if (sessionId && userId && fullReply) {
            const supabase = createClient(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            );
            const lastMsg = messages?.[messages.length - 1];
            if (lastMsg?.role === 'user') {
              supabase.from('chat_messages').insert([
                { session_id: sessionId, user_id: userId, role: 'user', content: lastMsg.content, agent_type: 'tutor', metadata: { topic, mode } },
                { session_id: sessionId, user_id: userId, role: 'assistant', content: fullReply, agent_type: 'tutor', metadata: { topic, mode } },
              ]).then(() => {});
              supabase.from('chat_sessions').update({ updated_at: new Date().toISOString(), topic }).eq('id', sessionId).then(() => {});
            }
          }
          // agent_trace 附在流末尾
          const trace = JSON.stringify({
            type: 'agent_trace',
            data: { agent: '诊断辅导智能体', status: 'success', summary: `流式响应完成（${fullReply.length}字），遵循"教-检-进"节奏`, duration_ms: Date.now() - startTime, mode },
          });
          controller.enqueue(new TextEncoder().encode(`data: ${trace}\n\n`));
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        }
      },
    });

    return new Response(stream, { headers: CORS_HEADERS });
  } catch (e) {
    return new Response(`data: {"error":"${String(e)}"}\n\ndata: [DONE]\n\n`, { headers: CORS_HEADERS });
  }
});
