// deepseek-chat-stream — 流式对话 Edge Function（SSE）v3: 支持 reasoning_content
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { requireUser, handleCORS, CORS_HEADERS } from '../_shared/auth.ts';

const DS_URL = 'https://api.deepseek.com/v1/chat/completions';

const SYSTEM_PROMPT = `你是智学帮系统的核心AI助手，一个面向Java学习的多智能体学习工作台。

你的角色定位（多智能体架构）：
- 你协调多个专业智能体：画像分析师、课程架构师、资源生成师、路径规划师、评估分析师、质量审核师
- 每次回答时，明确指出调用了哪个智能体，体现多智能体协同
- 格式：在回答开头用 > 🤖 **[智能体名称]** 正在处理...

你的核心能力：
1. Java概念解释（含代码示例、易错点）
2. 知识体系框架生成（Mermaid图表）
3. 学习路径规划（4阶段）
4. 练习题出题与解析
5. 学习效果评估

回答要求：
- 涉及流程/架构时，使用 \`\`\`mermaid 代码块
- 代码示例用 \`\`\`java 代码块
- 结构化输出，使用Markdown格式
- 专业、准确、适合大学生水平`;

serve(async (req) => {
  const corsRes = handleCORS(req);
  if (corsRes) return corsRes;

  try {
    const user = await requireUser(req);
    const { message, history = [], useRag = false, sessionId } = await req.json();
    if (!message) throw new Error('message required');

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) throw new Error('DEEPSEEK_API_KEY not configured');

    const messages: { role: string; content: string }[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-8).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content.slice(0, 1000),
      })),
      { role: 'user', content: message },
    ];

    // RAG 上下文注入
    let ragContext = '';
    if (useRag) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        );
        const { data: ragData } = await supabase.functions.invoke('ima-search', {
          body: { action: 'search', query: message, limit: 3 },
        });
        if (ragData?.results?.length > 0) {
          ragContext = '\n\n[个人知识库参考]\n' +
            ragData.results.slice(0, 3).map((r: { title: string; content: string }) =>
              `- ${r.title}：${r.content.slice(0, 200)}`).join('\n');
          messages[messages.length - 1].content += ragContext;
        }
      } catch { /* RAG失败不阻断主流程 */ }
    }

    const dsRes = await fetch(DS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        max_tokens: 4096,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!dsRes.ok) {
      const err = await dsRes.text();
      throw new Error(`DeepSeek error: ${err}`);
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      const reader = dsRes.body!.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let fullReasoning = '';
      let upstreamBuffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          upstreamBuffer += decoder.decode(value, { stream: true });
          const lines = upstreamBuffer.split('\n');
          upstreamBuffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;

              // 推理过程 (DeepSeek reasoning_content)
              const reasoning = delta?.reasoning_content ?? '';
              if (reasoning) {
                fullReasoning += reasoning;
                await writer.write(encoder.encode(`event: reasoning\ndata: ${JSON.stringify({ delta: reasoning })}\n\n`));
              }

              // 正文内容
              const content = delta?.content ?? '';
              if (content) {
                fullContent += content;
                await writer.write(encoder.encode(`event: delta\ndata: ${JSON.stringify({ delta: content })}\n\n`));
              }
            } catch { /* 跳过解析错误行 */ }
          }
        }

        const agentTrace = [{
          agent: '智能对话助手',
          status: 'success',
          summary: `已回答用户问题（${fullContent.length}字）${fullReasoning ? '，含推理过程' : ''}${useRag ? '，含个人知识库引用' : ''}`,
          duration_ms: 0,
        }];
        await writer.write(encoder.encode(`event: done\ndata: ${JSON.stringify({ done: true, agent_trace: agentTrace, reasoning: fullReasoning ? fullReasoning.slice(0, 500) : undefined })}\n\n`));

        // 保存对话历史
        if (sessionId) {
          try {
            const supabase = createClient(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            );
            await supabase.from('chat_sessions').upsert({
              id: sessionId, user_id: user.id, updated_at: new Date().toISOString(),
            });
            await supabase.from('chat_messages').insert([
              { session_id: sessionId, role: 'user', content: message },
              { session_id: sessionId, role: 'assistant', content: fullContent },
            ]);
          } catch { /* 保存失败不阻断 */ }
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (e) {
    const status = e?.status ?? 500;
    return new Response(
      JSON.stringify({ error: String(e.message ?? e) }),
      { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }
});