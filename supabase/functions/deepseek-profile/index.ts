// deepseek-profile — 实时学习画像构建（6维度，写入数据库）v2: JWT鉴权
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { requireUser, createServiceClient, handleCORS, CORS_HEADERS } from '../_shared/auth.ts';

const DS_URL = 'https://api.deepseek.com/v1/chat/completions';

serve(async (req) => {
  const corsRes = handleCORS(req);
  if (corsRes) return corsRes;

  try {
    // 从 JWT 获取可信用户 ID，不再信任请求体中的 userId
    const user = await requireUser(req);
    const { conversation, quizStats, studyStats } = await req.json();

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) throw new Error('DEEPSEEK_API_KEY not configured');

    const supabase = createServiceClient();

    // 并行从DB拉取真实学习数据（补充前端传入的对话记录）
    const since30d = new Date(Date.now() - 30 * 86400000).toISOString();
    const [recRes, mistRes, attemptRes] = await Promise.all([
      supabase.from('learning_records').select('duration_minutes, recorded_at, course_id')
        .eq('user_id', user.id).gte('recorded_at', since30d),
      supabase.from('mistake_book').select('status, knowledge_point').eq('user_id', user.id),
      supabase.from('quiz_attempts').select('is_correct, topic_name').eq('user_id', user.id)
        .gte('attempted_at', since30d).limit(100),
    ]);
    const records = recRes.data || [];
    const mistakes = mistRes.data || [];
    const attempts = attemptRes.data || [];

    const totalMin = records.reduce((s: number, r: { duration_minutes: number }) => s + (r.duration_minutes || 0), 0);
    const studyDays = new Set(records.map((r: { recorded_at: string }) => r.recorded_at?.slice(0, 10))).size;
    const correct = attempts.filter((a: { is_correct: boolean }) => a.is_correct).length;
    const accuracy = attempts.length > 0 ? Math.round(correct / attempts.length * 100) : 0;
    const pendingMistakes = mistakes.filter((m: { status: string }) => m.status !== 'mastered').length;
    const weakFromDB = mistakes.filter((m: { status: string; knowledge_point: string }) => m.status !== 'mastered')
      .map((m: { knowledge_point: string }) => m.knowledge_point).filter(Boolean).slice(0, 5);

    let context = conversation || '';
    if (quizStats) {
      context += `\n\n[前端答题统计]\n总题数:${quizStats.total}, 正确:${quizStats.correct}, 错误:${quizStats.wrong}\n薄弱知识点:${quizStats.weakTopics?.join('、') || '暂无'}`;
    }
    context += `\n\n[DB真实学习数据-近30天]\n累计学习:${totalMin}分钟(${studyDays}天)\n答题正确率:${accuracy}%(共${attempts.length}题)\n错题本待复习:${pendingMistakes}道\n薄弱知识点:${weakFromDB.join('、') || '暂无'}`;
    if (studyStats?.courseList) {
      context += `\n在学课程:${studyStats.courseList}`;
    }

    const prompt = `根据以下学习数据，提取6维学习画像，严格按JSON格式返回：
${context}

要求输出：
{
  "知识基础": "描述(1-2句)",
  "认知风格": "描述(1-2句)",
  "学习偏好": "描述(1-2句)",
  "易错点": "描述(1-2句)",
  "学习目标": "描述(1-2句)",
  "学习节奏": "描述(1-2句)",
  "scores": {
    "knowledge_base": 0-100,
    "cognitive_style": 0-100,
    "learning_preference": 0-100,
    "error_prone": 0-100,
    "learning_goal": 0-100,
    "learning_pace": 0-100
  },
  "weak_points": ["知识点1","知识点2"],
  "suggestions": ["建议1","建议2","建议3"]
}

只返回JSON，不要其他文字。分数反映掌握程度（error_prone越低越好）。`;

    const dsRes = await fetch(DS_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });
    const dsData = await dsRes.json();
    const raw = dsData.choices?.[0]?.message?.content || '{}';
    const profile = JSON.parse(raw);

    const scores = profile.scores || {};
    // 使用JWT验证后的 user.id 写入数据库
    const { error: rpcErr } = await supabase.rpc('upsert_learning_profile', {
      p_user_id: user.id,
      p_knowledge_base: scores.knowledge_base ?? 50,
      p_cognitive_style: scores.cognitive_style ?? 50,
      p_learning_preference: scores.learning_preference ?? 50,
      p_error_prone: scores.error_prone ?? 50,
      p_learning_goal: scores.learning_goal ?? 50,
      p_learning_pace: scores.learning_pace ?? 50,
      p_weak_points: profile.weak_points || [],
      p_suggestions: profile.suggestions || [],
      p_profile_data: profile,
    });
    if (rpcErr) throw new Error(rpcErr.message);

    return new Response(JSON.stringify({
      success: true, profile,
      agent_trace: [
        { agent: '画像分析师', status: 'success', summary: `已构建6维学习画像，综合评级${profile.overall_level ?? '中级'}`, duration_ms: 0 },
        { agent: '数据挖掘师', status: 'success', summary: `识别${profile.weak_points?.length ?? 0}个薄弱知识点`, duration_ms: 0 },
      ],
    }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  } catch (e) {
    const status = e?.status ?? 500;
    return new Response(JSON.stringify({ error: String(e.message ?? e) }),
      { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  }
});
