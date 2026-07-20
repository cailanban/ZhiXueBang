// deepseek-chat — 多智能体对话（含历史留存）v2: JWT鉴权
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
    // 从 JWT 获取可信用户 ID
    const user = await requireUser(req);
    const { messages, sessionId, saveHistory = true, useRag = false } = await req.json();

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) throw new Error('DEEPSEEK_API_KEY not configured');

    // 可选：从个人知识库补充RAG上下文
    let ragContext = '';
    let ragSources: { title: string; content: string; source: string }[] = [];
    if (useRag && messages?.length > 0) {
      const lastMsg = messages[messages.length - 1]?.content || '';
      try {
        const imaRes = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/ima-search`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': req.headers.get('Authorization') || '' },
            body: JSON.stringify({ action: 'search', query: lastMsg.slice(0, 100) }),
          }
        );
        const imaData = await imaRes.json();
        if (imaData.results?.length > 0) {
          ragSources = imaData.results.slice(0, 3).map((r: { title: string; content: string; source?: string }) => ({
            title: r.title || '知识库文档',
            content: r.content?.slice(0, 200) || '',
            source: r.source || '个人知识库',
          }));
          ragContext = '\n\n[知识库参考]\n' + ragSources
            .map(r => `【${r.title}】${r.content}`)
            .join('\n\n');
        }
      } catch { /* RAG失败不影响主流程 */ }
    }

    const systemContent = SYSTEM_PROMPT + ragContext;
    const dsMessages = [
      { role: 'system', content: systemContent },
      ...(messages || []),
    ];

    const dsRes = await fetch(DS_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'deepseek-chat', messages: dsMessages, max_tokens: 4096, temperature: 0.7 }),
    });
    const dsData = await dsRes.json();
    if (!dsRes.ok) throw new Error(dsData.error?.message || 'DeepSeek API error');

    const reply = dsData.choices?.[0]?.message?.content || '抱歉，获取回复失败';

    // 保存对话历史到数据库（使用 JWT 验证后的 user.id）
    if (saveHistory && sessionId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      const lastUser = messages?.[messages.length - 1];
      if (lastUser?.role === 'user') {
        await supabase.from('chat_messages').insert([
          { session_id: sessionId, user_id: user.id, role: 'user', content: lastUser.content, agent_type: 'chat' },
          { session_id: sessionId, user_id: user.id, role: 'assistant', content: reply, agent_type: 'chat' },
        ]);
        await supabase.from('chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionId);
      }
    }

    return new Response(JSON.stringify({ content: reply, usage: dsData.usage, sources: ragSources }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  } catch (e) {
    const status = e?.status ?? 500;
    return new Response(JSON.stringify({ error: String(e.message ?? e) }),
      { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  }
});
