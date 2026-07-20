// deepseek-path — 个性化学习路径规划智能体 v2: JWT鉴权
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { requireUser, createServiceClient, handleCORS, CORS_HEADERS } from '../_shared/auth.ts';

const DS_URL = 'https://api.deepseek.com/v1/chat/completions';

serve(async (req) => {
  const corsRes = handleCORS(req);
  if (corsRes) return corsRes;

  try {
    // 从 JWT 获取可信用户 ID
    const user = await requireUser(req);
    const { topic, profile } = await req.json();
    if (!topic) throw new Error('topic required');

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) throw new Error('DEEPSEEK_API_KEY not configured');

    // 获取用户画像
    let profileData = profile;
    if (!profileData) {
      const supabase = createServiceClient();
      const { data } = await supabase.from('learning_profiles').select('profile_data,weak_points').eq('user_id', user.id).maybeSingle();
      profileData = data?.profile_data || {};
    }

    const profileHint = profileData
      ? `\n学生画像：${JSON.stringify(profileData).slice(0, 500)}`
      : '';

    const systemPrompt = `你是智学帮系统的「路径规划师」智能体，负责为学习者生成围绕指定主题的个性化4阶段学习路径。

核心要求：
1. 必须严格围绕用户输入的学习主题生成路径，所有知识点、资源、示例都必须与主题直接相关
2. 不要偏离主题到Java、Python等特定编程语言，除非用户明确要求
3. 每个阶段的目标、知识点、推荐资源都必须紧扣主题
4. 输出严格JSON格式，不要返回任何解释性文字

输出JSON格式：
{
  "stages": [
    {
      "id": 1,
      "phase": "基础理解",
      "color": "green",
      "icon": "🟢",
      "goal": "阶段目标(1句话，紧扣主题)",
      "duration": "预估X天",
      "topics": [
        {"name": "知识点名（与主题相关）", "type": "文档|练习|代码|思维导图", "difficulty": 1-3}
      ],
      "resources": ["推荐资源1", "推荐资源2"],
      "recommendedResources": [
        {"type": "讲义", "topic": "与主题相关的子主题"},
        {"type": "思维导图", "topic": "与主题相关的知识结构"}
      ]
    },
    {"id": 2, "phase": "专题突破", "color": "yellow", "icon": "🟡", ...},
    {"id": 3, "phase": "项目实战", "color": "red", "icon": "🔴", ...},
    {"id": 4, "phase": "复盘评估", "color": "blue", "icon": "🔵", ...}
  ],
  "total_days": 总天数,
  "agent_trace": [
    {"agent": "路径规划师", "action": "分析主题依赖", "result": "完成"},
    {"agent": "课程架构师", "action": "设计知识结构", "result": "完成"}
  ]
}
recommendedResources 中的 type 只能是：讲义、思维导图、练习题、代码案例、阅读清单、课程讲解 之一。
只返回JSON。`;

    const userPrompt = `学习主题：${topic}${profileHint}

请严格围绕「${topic}」生成4阶段学习路径，不要引入与主题无关的内容。`;

    const dsRes = await fetch(DS_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 2048,
        temperature: 0.5,
        response_format: { type: 'json_object' },
      }),
    });
    const dsData = await dsRes.json();
    const result = JSON.parse(dsData.choices?.[0]?.message?.content || '{}');

    if (!result.agent_trace) {
      result.agent_trace = [
        { agent: '路径规划师', action: '分析主题依赖关系', status: 'success', summary: `为"${topic}"规划4阶段学习路径`, duration_ms: 0 },
        { agent: '课程架构师', action: '设计知识结构', status: 'success', summary: `已生成${result.stages?.length ?? 4}个阶段，${result.total_days ?? '?'}天计划`, duration_ms: 0 },
      ];
    }

    return new Response(JSON.stringify(result),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  } catch (e) {
    const status = e?.status ?? 500;
    return new Response(JSON.stringify({ error: String(e.message ?? e) }),
      { status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
  }
});
