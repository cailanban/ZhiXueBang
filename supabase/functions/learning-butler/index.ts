import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createServiceClient, requireUser, handleCORS, CORS_HEADERS, AuthError } from '../_shared/auth.ts';

const SPARK_URL = 'https://spark-api-open.xf-yun.com/v1/chat/completions';
const jsonHeaders = { ...CORS_HEADERS, 'Content-Type': 'application/json' };
const allowedActions = new Set(['create_task', 'update_plan', 'mark_mistake_status']);
const actionPolicies = {
  create_task: { risk: 'medium', confirmation: 'required', undo_minutes: 10 },
  update_plan: { risk: 'medium', confirmation: 'required', undo_minutes: 10 },
  mark_mistake_status: { risk: 'low', confirmation: 'required', undo_minutes: 10 },
} as const;

// ── 预置回复：代码层拦截，不依赖模型 ─────────────────────────
const HARDCODED_REPLIES: Record<string, string> = {
  welcome: `你好！我是你的专属学习管家 🎓

我可以帮你做三件事：
📋 创建学习任务 — 告诉我你想复习什么、什么时候完成
📝 调整学习计划 — 修改现有计划的标题、进度或时间
✅ 更新错题状态 — 标记错题"已掌握"或"未掌握"

我不会自动修改任何数据，每个操作都会先请你确认。
试试告诉我："帮我安排明天复习 Java 多态" 或 "把哈希表这道题标记为已掌握"`,

  intro: `我是智学帮的 AI 学习管家，专注于帮你管理学习 👇

📋 创建学习任务
告诉我你想学什么、什么时候完成，我帮你安排。支持设置优先级（高/中/低）和截止时间。

📝 调整学习计划
修改已有计划的标题、描述、进度或时间范围。也可以帮你新建学习计划。

✅ 更新错题状态
把错题标记为"已掌握"或"未掌握"，我会读取你真实的错题本数据。

🔒 安全机制
- 所有写操作都需要你点击确认才会执行
- 执行后 10 分钟内可撤销
- 全部操作记录可审计
- 不会自动修改任何学习数据

现在试试告诉我你的学习需求吧！`,
};

// ── 意图检测：匹配常见"介绍系统"类问题 ─────────────────────
const INTRO_PATTERNS = [
  /介绍.*系统/, /系统.*功能/, /你能.*做什么/, /你有什么.*功能/,
  /你能.*提供.*什么/, /你的.*作用/, /介绍.*自己/, /你是谁/,
  /你能.*帮我.*什么/, /你有什么.*用/, /功能.*介绍/, /使用.*说明/,
  /你能.*做.*什么/, /help/i, /what.*can.*you.*do/i,
];

function isIntroQuestion(msg: string): boolean {
  return INTRO_PATTERNS.some(p => p.test(msg));
}

// ── 回复验证：检测模型是否在胡编系统功能 ──────────────────────
const HALLUCINATION_KEYWORDS = [
  '审计管理', '审计系统', '审计模块', '审计计划', '操作日志',
  '权限管理', '合规性', '风险评估', '数据分析与可视化',
  '系统功能', '平台模块', '功能概述', '核心特性',
];

function isHallucinated(text: string): boolean {
  return HALLUCINATION_KEYWORDS.some(kw => text.includes(kw));
}

// ── 工具函数 ─────────────────────────────────────────────────
function cleanText(value: unknown, max = 500): string {
  return String(value ?? '').trim().slice(0, max);
}

function parseModelJson(content: string): { message: string; action?: { type: string; payload: Record<string, unknown>; summary: string } } {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced || content.match(/\{[\s\S]*\}/)?.[0];
  if (!candidate) return { message: content.trim() || '我暂时无法生成建议，请换一种说法。' };
  try {
    const parsed = JSON.parse(candidate);
    return {
      message: cleanText(parsed.message || content, 2000),
      action: parsed.action && allowedActions.has(parsed.action.type)
        ? { type: parsed.action.type, payload: parsed.action.payload || {}, summary: cleanText(parsed.action.summary, 240) }
        : undefined,
    };
  } catch {
    return { message: content.trim() || '我暂时无法生成建议，请换一种说法。' };
  }
}

async function audit(supabase: any, userId: string, requestId: string, eventType: string, actionType: string, payload: Record<string, unknown>, result?: unknown) {
  await supabase.from('assistant_action_audit').insert({
    user_id: userId, request_id: requestId, event_type: eventType, action_type: actionType,
    safe_payload: payload, result: result ?? null,
  });
}

async function executeAction(supabase: any, userId: string, requestId: string, decision: 'confirm' | 'reject' | 'undo') {
  const { data: request, error } = await supabase.from('assistant_action_requests')
    .select('*').eq('id', requestId).eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (!request) return { status: 404, body: { error: 'ACTION_NOT_FOUND' } };
  if (decision === 'undo') {
    if (request.status !== 'executed') return { status: 409, body: { error: 'ACTION_NOT_UNDOABLE', action: request } };
    if (!request.undo_expires_at || new Date(request.undo_expires_at).getTime() < Date.now()) return { status: 409, body: { error: 'UNDO_EXPIRED' } };
    const result = request.result || {};
    if (request.action_type === 'create_task') {
      await supabase.from('learning_tasks').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', result.id).eq('user_id', userId);
    } else if (request.action_type === 'update_plan') {
      if (result.created) {
        await supabase.from('learning_plans').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', result.id).eq('user_id', userId);
      } else if (result.before) {
        const before = result.before;
        await supabase.from('learning_plans').update({
          title: before.title, description: before.description, status: before.status,
          start_date: before.start_date, end_date: before.end_date, updated_at: new Date().toISOString(),
        }).eq('id', result.id).eq('user_id', userId);
      }
    } else if (request.action_type === 'mark_mistake_status' && result.before_status) {
      await supabase.from('mistake_book').update({ status: result.before_status, updated_at: new Date().toISOString() }).eq('id', result.id).eq('user_id', userId);
    }
    const { data: undone } = await supabase.from('assistant_action_requests').update({ status: 'undone', undone_at: new Date().toISOString() })
      .eq('id', request.id).eq('status', 'executed').select().maybeSingle();
    if (!undone) return { status: 409, body: { error: 'ACTION_NOT_UNDOABLE' } };
    await audit(supabase, userId, request.id, 'undone', request.action_type, request.payload, { restored: true });
    return { status: 200, body: { action: undone } };
  }

  if (request.status !== 'proposed') return { status: 409, body: { error: 'ACTION_ALREADY_DECIDED', action: request } };

  if (decision === 'reject') {
    const { data } = await supabase.from('assistant_action_requests').update({ status: 'rejected', decided_at: new Date().toISOString() })
      .eq('id', request.id).eq('status', 'proposed').select().maybeSingle();
    if (!data) return { status: 409, body: { error: 'ACTION_ALREADY_DECIDED' } };
    await audit(supabase, userId, request.id, 'rejected', request.action_type, request.payload);
    return { status: 200, body: { action: data } };
  }

  let result: any;
  const payload = request.payload || {};
  try {
    if (request.action_type === 'create_task') {
      const title = cleanText(payload.title, 160);
      if (!title) throw new Error('任务标题不能为空');
      const dueAt = payload.due_at ? new Date(String(payload.due_at)) : null;
      if (dueAt && Number.isNaN(dueAt.getTime())) throw new Error('截止时间格式无效');
      const priority = ['low', 'medium', 'high'].includes(String(payload.priority)) ? payload.priority : 'medium';
      const response = await supabase.from('learning_tasks').insert({
        user_id: userId, title, description: cleanText(payload.description, 1000), priority,
        due_at: dueAt?.toISOString() || null, source: 'ai_butler',
      }).select().single();
      if (response.error) throw response.error;
      result = { table: 'learning_tasks', id: response.data.id, title: response.data.title, created: true };
    } else if (request.action_type === 'update_plan') {
      const planId = cleanText(payload.plan_id, 80);
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (payload.title) updates.title = cleanText(payload.title, 160);
      if (payload.description !== undefined) updates.description = cleanText(payload.description, 2000);
      if (['draft', 'active', 'completed', 'cancelled'].includes(String(payload.status))) updates.status = payload.status;
      if (payload.start_date) updates.start_date = cleanText(payload.start_date, 10);
      if (payload.end_date) updates.end_date = cleanText(payload.end_date, 10);
      if (!planId && !updates.title) throw new Error('新计划必须包含标题');
      const beforeResponse = planId
        ? await supabase.from('learning_plans').select('title,description,status,start_date,end_date').eq('id', planId).eq('user_id', userId).maybeSingle()
        : { data: null, error: null };
      if (beforeResponse.error) throw beforeResponse.error;
      const response = planId
        ? await supabase.from('learning_plans').update(updates).eq('id', planId).eq('user_id', userId).select().maybeSingle()
        : await supabase.from('learning_plans').insert({ ...updates, user_id: userId, source: 'ai_butler' }).select().maybeSingle();
      if (response.error) throw response.error;
      if (!response.data) throw new Error('学习计划不存在或不属于当前用户');
      result = { table: 'learning_plans', id: response.data.id, title: response.data.title, created: !planId, before: beforeResponse.data };
    } else if (request.action_type === 'mark_mistake_status') {
      const mistakeId = cleanText(payload.mistake_id, 80);
      const status = payload.status === 'mastered' ? 'mastered' : payload.status === 'unmastered' ? 'unmastered' : '';
      if (!mistakeId || !status) throw new Error('错题或目标状态无效');
      const beforeResponse = await supabase.from('mistake_book').select('status').eq('id', mistakeId).eq('user_id', userId).maybeSingle();
      if (beforeResponse.error) throw beforeResponse.error;
      const response = await supabase.from('mistake_book').update({ status, updated_at: new Date().toISOString() })
        .eq('id', mistakeId).eq('user_id', userId).select('id,status').maybeSingle();
      if (response.error) throw response.error;
      if (!response.data) throw new Error('错题不存在或不属于当前用户');
      result = { table: 'mistake_book', id: response.data.id, status: response.data.status, before_status: beforeResponse.data?.status };
    } else throw new Error('不支持的操作');

    const { data: updated } = await supabase.from('assistant_action_requests').update({
      status: 'executed', result, decided_at: new Date().toISOString(),
      undo_expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    }).eq('id', request.id).eq('status', 'proposed').select().maybeSingle();
    if (!updated) return { status: 409, body: { error: 'ACTION_ALREADY_DECIDED' } };
    await audit(supabase, userId, request.id, 'executed', request.action_type, payload, result);
    return { status: 200, body: { action: updated, result } };
  } catch (actionError) {
    const message = actionError instanceof Error ? actionError.message : String(actionError);
    await supabase.from('assistant_action_requests').update({ status: 'failed', error_message: message, decided_at: new Date().toISOString() }).eq('id', request.id).eq('status', 'proposed');
    await audit(supabase, userId, request.id, 'failed', request.action_type, payload, { error: message });
    return { status: 400, body: { error: 'ACTION_FAILED', message } };
  }
}

// ── 主路由 ───────────────────────────────────────────────────
serve(async req => {
  const cors = handleCORS(req); if (cors) return cors;
  try {
    const user = await requireUser(req);
    const supabase = createServiceClient();
    const body = await req.json();

    if (body.mode === 'execute') {
      const decision = body.decision === 'reject' ? 'reject' : body.decision === 'undo' ? 'undo' : 'confirm';
      const response = await executeAction(supabase, user.id, cleanText(body.request_id, 80), decision);
      return new Response(JSON.stringify({
        ...response.body,
        policy: response.body?.action?.action_type
          ? actionPolicies[response.body.action.action_type as keyof typeof actionPolicies]
          : undefined,
      }), { status: response.status, headers: jsonHeaders });
    }

    const message = cleanText(body.message, 2000);
    if (!message) return new Response(JSON.stringify({ error: 'MESSAGE_REQUIRED' }), { status: 400, headers: jsonHeaders });

    // ── 代码层拦截：介绍类问题直接返回预置回复 ───────────────
    if (isIntroQuestion(message)) {
      return new Response(JSON.stringify({
        message: HARDCODED_REPLIES.intro,
        action: null,
        policy: null,
      }), { headers: jsonHeaders });
    }

    // ── 真实对话：查询用户数据 + 调 Spark ──────────────────────
    const [tasksRes, plansRes, mistakesRes] = await Promise.all([
      supabase.from('learning_tasks').select('id,title,status,priority,due_at').eq('user_id', user.id).neq('status', 'cancelled').order('created_at', { ascending: false }).limit(8),
      supabase.from('learning_plans').select('id,title,status,start_date,end_date,description').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(5),
      supabase.from('mistake_book').select('id,status,topic_title,question_data').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(8),
    ]);

    const password = Deno.env.get('SPARK_API_PASSWORD')
      || (() => { const key = Deno.env.get('SPARK_API_KEY'); const secret = Deno.env.get('SPARK_API_SECRET'); return key && secret ? `${key}:${secret}` : ''; })();
    if (!password) return new Response(JSON.stringify({ error: 'SPARK_NOT_CONFIGURED', message: '请配置 SPARK_API_PASSWORD' }), { status: 503, headers: jsonHeaders });

    const taskCount = (tasksRes.data || []).length;
    const planCount = (plansRes.data || []).length;
    const mistakeCount = (mistakesRes.data || []).length;

    const system = `你是一个学习助手，你的用户是学生。你只负责帮用户安排学习任务、调整学习计划、标记错题状态。

## 绝对禁止
- 禁止说"系统"、"平台"、"模块"、"功能"这些词
- 禁止介绍任何软件系统的功能
- 禁止说"审计"、"日志"、"权限"、"合规"、"风险"、"数据可视化"
- 如果你不知道说什么，就追问用户的学习需求

## 输出格式（严格 JSON，不要 Markdown 围栏）
{"message":"你的回复（≤80字，学生口吻）","action":null}
或
{"message":"说明","action":{"type":"create_task|update_plan|mark_mistake_status","summary":"确认卡片简短文案","payload":{...}}}

## 操作参数
- create_task: title(必填),description(可选),priority=low|medium|high,due_at=ISO时间
- update_plan: plan_id=下方真实计划ID, 新建计划可省略plan_id但必须含title
- mark_mistake_status: mistake_id=下方真实错题ID,status=mastered|unmastered

## 当前上下文
时间：${new Date().toISOString()}
用户数据：${taskCount}个任务、${planCount}个计划、${mistakeCount}条错题
${tasksRes.data?.length ? '任务：' + JSON.stringify(tasksRes.data) : '暂无任务'}
${plansRes.data?.length ? '计划：' + JSON.stringify(plansRes.data) : '暂无计划'}
${mistakesRes.data?.length ? '错题：' + JSON.stringify(mistakesRes.data) : '暂无错题'}`;

    const spark = await fetch(SPARK_URL, {
      method: 'POST', headers: { Authorization: `Bearer ${password}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'generalv3', stream: false, temperature: 0.3, max_tokens: 1200, messages: [{ role: 'system', content: system }, { role: 'user', content: message }] }),
    });
    if (!spark.ok) {
      const errText = await spark.text().catch(() => '');
      return new Response(JSON.stringify({ error: 'SPARK_ERROR', status: spark.status, detail: errText.slice(0, 200) }), { status: 502, headers: jsonHeaders });
    }
    const sparkBody = await spark.json();
    const rawContent = sparkBody.choices?.[0]?.message?.content || '';

    // ── 回复验证：检测胡编内容 ──────────────────────────────
    if (isHallucinated(rawContent)) {
      console.warn('Hallucination detected, returning fallback:', rawContent.slice(0, 100));
      return new Response(JSON.stringify({
        message: `好的！我目前看到你有 ${taskCount} 个学习任务和 ${mistakeCount} 条错题。你想创建新任务、调整计划，还是更新错题状态呢？`,
        action: null,
        policy: null,
      }), { headers: jsonHeaders });
    }

    const parsed = parseModelJson(rawContent);

    let action = null;
    if (parsed.action) {
      const { data, error } = await supabase.from('assistant_action_requests').insert({
        user_id: user.id, action_type: parsed.action.type, payload: parsed.action.payload,
        summary: parsed.action.summary || 'AI 学习管家建议执行此操作', status: 'proposed',
      }).select().single();
      if (error) throw error;
      action = data;
      await audit(supabase, user.id, data.id, 'proposed', data.action_type, data.payload);
    }
    return new Response(JSON.stringify({
      message: parsed.message,
      action,
      policy: action ? actionPolicies[action.action_type as keyof typeof actionPolicies] : null,
    }), { headers: jsonHeaders });
  } catch (error) {
    const status = error instanceof AuthError ? error.status : 500;
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), { status, headers: jsonHeaders });
  }
});