// deepseek-report — 叙事型学习周报生成智能体 v2: JWT鉴权
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { requireUser, createServiceClient, handleCORS, CORS_HEADERS } from '../_shared/auth.ts';

const DS_URL = 'https://api.deepseek.com/v1/chat/completions';

serve(async (req) => {
  const corsRes = handleCORS(req);
  if (corsRes) return corsRes;

  try {
    // 从 JWT 获取可信用户 ID
    const user = await requireUser(req);
    const { days = 7 } = await req.json();

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    const supabase = createServiceClient();

    const since = new Date(Date.now() - days * 86400000).toISOString();
    const prevSince = new Date(Date.now() - days * 2 * 86400000).toISOString();

    const [attRes, recRes, mistRes, prevRecRes] = await Promise.all([
      supabase.from('quiz_attempts').select('is_correct, attempted_at, question_id').eq('user_id', user.id).gte('attempted_at', since),
      supabase.from('learning_records').select('duration_minutes, recorded_at, course_id, course:courses(title)').eq('user_id', user.id).gte('recorded_at', since),
      supabase.from('mistake_book').select('id, status, knowledge_point').eq('user_id', user.id),
      supabase.from('learning_records').select('duration_minutes').eq('user_id', user.id).gte('recorded_at', prevSince).lt('recorded_at', since),
    ]);

    const attempts = attRes.data || [];
    const records = recRes.data || [];
    const mistakes = mistRes.data || [];
    const prevRecords = prevRecRes.data || [];

    const totalMin = records.reduce((s, r) => s + (r.duration_minutes || 0), 0);
    const prevMin = prevRecords.reduce((s, r) => s + (r.duration_minutes || 0), 0);
    const totalHours = +(totalMin / 60).toFixed(1);
    const prevHours = +(prevMin / 60).toFixed(1);
    const growth = prevHours > 0 ? Math.round(((totalHours - prevHours) / prevHours) * 100) : 0;
    const correct = attempts.filter(a => a.is_correct).length;
    const accuracy = attempts.length > 0 ? Math.round((correct / attempts.length) * 100) : 0;
    const activeDays = new Set(records.map(r => r.recorded_at)).size;
    const pendingMistakes = mistakes.filter(m => m.status !== 'mastered').length;

    const courseMap: Record<string, number> = {};
    records.forEach(r => {
      const cTitle = (r.course as { title?: string } | null)?.title || '未知课程';
      courseMap[cTitle] = (courseMap[cTitle] || 0) + (r.duration_minutes || 0);
    });
    const topCourses = Object.entries(courseMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, min]) => ({ id, hours: +(min / 60).toFixed(1) }));

    const dailyMap: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().slice(0, 10);
      dailyMap[d] = 0;
    }
    records.forEach(r => {
      const day = r.recorded_at ? r.recorded_at.slice(0, 10) : '';
      if (day && dailyMap[day] !== undefined) dailyMap[day] += (r.duration_minutes || 0);
    });
    const dailyData = Object.entries(dailyMap).map(([date, min]) => ({ date, minutes: min, hours: +(min / 60).toFixed(1) }));

    const weakPoints = mistakes.filter(m => m.status !== 'mastered')
      .map(m => m.knowledge_point).filter(Boolean).slice(0, 3);

    const stats = {
      totalHours, prevHours, growth, accuracy, activeDays, pendingMistakes,
      topCourses, dailyData, weakPoints, totalQuestions: attempts.length, correctQuestions: correct,
      period: days === 7 ? '本周' : `近${days}天`,
    };

    let narrative = '';
    if (apiKey) {
      const prompt = `你是一个激励学生的学习助手，风格类似 Spotify Wrapped，用温暖、有数据感的语言写一段学习总结（120-180字）。

数据：
- ${stats.period}学习时长：${totalHours}小时（上期：${prevHours}小时，${growth >= 0 ? '增长' : '下降'} ${Math.abs(growth)}%）
- 答题正确率：${accuracy}%（共${attempts.length}题）
- 连续活跃${activeDays}天
- 主要精力：${topCourses.map(c => `${c.id}（${c.hours}h）`).join('、') || '暂无'}
- 待复习错题：${pendingMistakes}道
- 薄弱知识点：${weakPoints.join('、') || '暂无'}

要求：
1. 开头用一句话点出最大亮点（含数字）
2. 中间指出最值得关注的薄弱点
3. 结尾给出一条具体的下一步行动建议
4. 语气积极但诚实，不要空洞鼓励`;

      try {
        const resp = await fetch(DS_URL, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'user', content: prompt }], max_tokens: 300, temperature: 0.7 }),
        });
        const d = await resp.json();
        narrative = d.choices?.[0]?.message?.content || '';
      } catch { /* 降级为空 */ }
    }

    if (!narrative) {
      narrative = `${stats.period}你累计学习了 ${totalHours} 小时，` +
        (growth > 0 ? `比上期增长了 ${growth}%，势头很好！` : growth < 0 ? `比上期减少了 ${Math.abs(growth)}%，下周可以加把劲。` : `与上期持平。`) +
        (topCourses.length > 0 ? `主要精力集中在 ${topCourses[0].id}（${topCourses[0].hours}h）。` : '') +
        (weakPoints.length > 0 ? `目前薄弱环节是"${weakPoints[0]}"，建议优先安排 30 分钟专项复习。` : '') +
        `答题正确率 ${accuracy}%，还有 ${pendingMistakes} 道错题待复习——它们是提分的关键！`;
    }

    const weekStart = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);
    const weekEnd = new Date().toISOString().slice(0, 10);
    await supabase.from('learning_reports').upsert(
      { user_id: user.id, week_start: weekStart, week_end: weekEnd, report_type: days === 7 ? 'weekly' : 'monthly', narrative, stats },
      { onConflict: 'user_id,week_start' }
    );

    return new Response(JSON.stringify({ narrative, stats }), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
    });
  } catch (e) {
    const status = e?.status ?? 500;
    return new Response(JSON.stringify({ error: String(e.message ?? e) }),
      { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  }
});
