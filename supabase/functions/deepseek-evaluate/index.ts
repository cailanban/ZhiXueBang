// deepseek-evaluate — 多维学习评估智能体（基于实际答题数据）v2: JWT鉴权
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { requireUser, createServiceClient, handleCORS, CORS_HEADERS } from '../_shared/auth.ts';

const DS_URL = 'https://api.deepseek.com/v1/chat/completions';

serve(async (req) => {
  const corsRes = handleCORS(req);
  if (corsRes) return corsRes;

  try {
    // 从 JWT 获取可信用户 ID
    const user = await requireUser(req);
    const { days = 30 } = await req.json();

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    const supabase = createServiceClient();

    const since = new Date(Date.now() - days * 86400000).toISOString();

    // 并行获取真实学习数据
    const [attemptsRes, recordsRes, profileRes, mistakesRes] = await Promise.all([
      supabase.from('quiz_attempts').select('is_correct, attempted_at, question_id').eq('user_id', user.id).gte('attempted_at', since),
      supabase.from('learning_records').select('duration_minutes, recorded_at, course_id').eq('user_id', user.id).gte('recorded_at', since),
      supabase.from('learning_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('mistake_book').select('id, status').eq('user_id', user.id),
    ]);

    const attempts = attemptsRes.data || [];
    const records = recordsRes.data || [];
    const profile = profileRes.data;
    const mistakes = mistakesRes.data || [];

    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter(a => a.is_correct).length;
    const accuracy = totalAttempts > 0 ? Math.round(correctAttempts / totalAttempts * 100) : 0;
    const totalMinutes = records.reduce((s, r) => s + (r.duration_minutes || 0), 0);
    const studyDays = new Set(records.map(r => r.recorded_at)).size;
    const pendingMistakes = mistakes.filter(m => m.status === 'pending').length;

    const context = `
学习数据统计（最近${days}天）：
- 总答题次数：${totalAttempts}，正确率：${accuracy}%
- 累计学习时间：${totalMinutes}分钟，学习天数：${studyDays}天
- 错题本：共${mistakes.length}题，待复习：${pendingMistakes}题
- 现有学习画像：${profile ? JSON.stringify(profile.profile_data) : '暂无'}`;

    if (!apiKey) {
      return new Response(JSON.stringify({
        scores: { knowledge: accuracy, engagement: Math.min(studyDays * 10, 100), progress: Math.min(totalAttempts * 2, 100), method: 75, goal: 70 },
        summary: `近${days}天共学习${studyDays}天，答题正确率${accuracy}%，学习时长${totalMinutes}分钟。`,
        strengths: accuracy > 70 ? ['答题正确率较高'] : [],
        weaknesses: pendingMistakes > 5 ? ['有较多待复习错题'] : [],
        suggestions: ['坚持每日学习', '及时复习错题', '加强薄弱知识点练习'],
        chartData: [
          { date: new Date().toLocaleDateString(), minutes: Math.round(totalMinutes / Math.max(studyDays, 1)) }
        ],
      }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    }

    const dsRes = await fetch(DS_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{
          role: 'user',
          content: `你是学习评估智能体。基于以下真实学习数据进行多维评估：\n${context}\n\n请返回JSON格式评估报告：
{
  "scores": {"knowledge": 0-100, "engagement": 0-100, "progress": 0-100, "method": 0-100, "goal": 0-100},
  "summary": "总体评价(2-3句)",
  "strengths": ["优势1","优势2"],
  "weaknesses": ["不足1","不足2"],
  "suggestions": ["建议1","建议2","建议3"],
  "agent_trace": [{"agent":"评估分析师","action":"分析学习数据","result":"完成"}]
}
只返回JSON。`,
        }],
        max_tokens: 1024,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });
    const dsData = await dsRes.json();
    const result = JSON.parse(dsData.choices?.[0]?.message?.content || '{}');

    const dailyMap: Record<string, number> = {};
    for (const r of records) {
      const d = r.recorded_at?.slice(0, 10) || '';
      if (d) dailyMap[d] = (dailyMap[d] || 0) + (r.duration_minutes || 0);
    }
    result.chartData = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, minutes]) => ({ date, minutes }));

    return new Response(JSON.stringify(result),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  } catch (e) {
    const status = e?.status ?? 500;
    return new Response(JSON.stringify({ error: String(e.message ?? e) }),
      { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  }
});
