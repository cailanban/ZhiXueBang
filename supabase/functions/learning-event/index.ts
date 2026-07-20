import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { requireUser, handleCORS, CORS_HEADERS, createServiceClient } from '../_shared/auth.ts';

// ─── 类型定义 ────────────────────────────────────────────────

interface QuizAttemptPayload {
  knowledge_id: string;
  is_correct: boolean;
  score?: number;
  question_id?: string;
  answer?: string;
  time_spent?: number;
}

interface StudySessionPayload {
  subject_id?: string;
  duration_minutes: number;
  focus_score?: number;
  notes?: string;
}

interface ChapterCompletePayload {
  chapter_id: string;
  chapter_title?: string;
  score?: number;
  time_spent?: number;
}

interface SyncMasteryPayload {
  knowledge_ids?: string[];
}

// ─── 内部辅助函数 ────────────────────────────────────────────

/**
 * 记录事件到 learning_events 表，返回 event_id
 */
async function recordEvent(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  action: string,
  payload: Record<string, unknown>,
): Promise<string> {
  const { data, error } = await supabase
    .from('learning_events')
    .insert({
      user_id: userId,
      action,
      data: payload,
    })
    .select('id')
    .single();

  if (error) throw new Error(`写入 learning_events 失败: ${error.message}`);
  return data.id;
}

/**
 * 根据答题结果更新知识掌握度（knowledge_mastery 表）
 * 使用 EMA 平滑算法：旧掌握度 * 0.7 + 本次结果 * 0.3
 */
async function updateMastery(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  payload: QuizAttemptPayload,
): Promise<void> {
  // 1. 查找现有记录
  const { data: existing } = await supabase
    .from('knowledge_mastery')
    .select('mastery_level, attempts, correct_attempts')
    .eq('user_id', userId)
    .eq('knowledge_id', payload.knowledge_id)
    .maybeSingle();

  const prevMastery = existing?.mastery_level ?? 0.5;
  const prevAttempts = existing?.attempts ?? 0;
  const prevCorrect = existing?.correct_attempts ?? 0;

  // 2. 计算新的掌握度
  const newAttempts = prevAttempts + 1;
  const newCorrect = prevCorrect + (payload.is_correct ? 1 : 0);

  // 新掌握度 = 旧掌握度 * 0.7 + 本次结果 * 0.3（EMA 平滑）
  const thisResult = payload.is_correct ? 1.0 : 0.0;
  const newMastery = Math.round((prevMastery * 0.7 + thisResult * 0.3) * 100) / 100;

  // 3. 更新或插入
  const { error } = await supabase
    .from('knowledge_mastery')
    .upsert(
      {
        user_id: userId,
        knowledge_id: payload.knowledge_id,
        mastery_level: Math.max(0, Math.min(1, newMastery)),
        attempts: newAttempts,
        correct_attempts: newCorrect,
        last_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,knowledge_id' },
    );

  if (error) throw new Error(`更新 knowledge_mastery 失败: ${error.message}`);
}

/**
 * 将掌握度数据同步到 profiles 表（汇总统计）
 */
async function syncMasteryToProfile(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string,
  knowledgeIds?: string[],
): Promise<{ total: number; mastered: number; average_level: number }> {
  let query = supabase
    .from('knowledge_mastery')
    .select('knowledge_id, mastery_level')
    .eq('user_id', userId);

  if (knowledgeIds && knowledgeIds.length > 0) {
    query = query.in('knowledge_id', knowledgeIds);
  }

  const { data: masteryData, error } = await query;

  if (error) throw new Error(`查询 knowledge_mastery 失败: ${error.message}`);

  const total = masteryData?.length ?? 0;
  const mastered = masteryData?.filter((r) => r.mastery_level >= 0.8).length ?? 0;
  const averageLevel =
    total > 0
      ? Math.round(
          (masteryData!.reduce((sum, r) => sum + r.mastery_level, 0) / total) * 100,
        ) / 100
      : 0;

  // 同步到 profiles 表
  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        knowledge_total: total,
        knowledge_mastered: mastered,
        knowledge_avg_level: averageLevel,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );

  if (upsertError) {
    console.warn('同步到 profiles 失败:', upsertError.message);
  }

  return { total, mastered, average_level: averageLevel };
}

// ─── 主服务 ─────────────────────────────────────────────────

serve(async (req: Request) => {
  // 处理 CORS 预检请求
  const corsRes = handleCORS(req);
  if (corsRes) return corsRes;

  try {
    // 1. JWT 鉴权 —— 从 token 中提取可信用户身份
    const user = await requireUser(req);

    // 2. 解析请求体
    const body = await req.json();
    const { action, ...data } = body as { action: string } & Record<string, unknown>;

    if (!action) {
      return new Response(
        JSON.stringify({ error: '缺少 action 字段' }),
        {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        },
      );
    }

    const supabase = createServiceClient();

    // 3. 根据 action 分发处理
    switch (action) {
      case 'quiz_attempt': {
        const payload = data as unknown as QuizAttemptPayload;

        if (!payload.knowledge_id) {
          return new Response(
            JSON.stringify({ error: 'quiz_attempt 缺少 knowledge_id 字段' }),
            {
              status: 400,
              headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            },
          );
        }

        // 记录事件 + 更新掌握度
        const [eventId] = await Promise.all([
          recordEvent(supabase, user.id, action, payload as unknown as Record<string, unknown>),
          updateMastery(supabase, user.id, payload),
        ]);

        return new Response(
          JSON.stringify({ success: true, event_id: eventId }),
          { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
        );
      }

      case 'study_session': {
        const payload = data as unknown as StudySessionPayload;

        if (payload.duration_minutes == null) {
          return new Response(
            JSON.stringify({ error: 'study_session 缺少 duration_minutes 字段' }),
            {
              status: 400,
              headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            },
          );
        }

        const eventId = await recordEvent(
          supabase,
          user.id,
          action,
          payload as unknown as Record<string, unknown>,
        );

        return new Response(
          JSON.stringify({ success: true, event_id: eventId }),
          { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
        );
      }

      case 'chapter_complete': {
        const payload = data as unknown as ChapterCompletePayload;

        if (!payload.chapter_id) {
          return new Response(
            JSON.stringify({ error: 'chapter_complete 缺少 chapter_id 字段' }),
            {
              status: 400,
              headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
            },
          );
        }

        const eventId = await recordEvent(
          supabase,
          user.id,
          action,
          payload as unknown as Record<string, unknown>,
        );

        return new Response(
          JSON.stringify({ success: true, event_id: eventId }),
          { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
        );
      }

      case 'sync_mastery': {
        const payload = data as unknown as SyncMasteryPayload;

        const result = await syncMasteryToProfile(supabase, user.id, payload?.knowledge_ids);

        return new Response(
          JSON.stringify({ success: true, ...result }),
          { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `不支持的操作: ${action}` }),
          {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          },
        );
    }
  } catch (e: unknown) {
    const err = e as Error & { status?: number };
    return new Response(
      JSON.stringify({ error: String(err.message ?? err) }),
      {
        status: err?.status ?? 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      },
    );
  }
});
