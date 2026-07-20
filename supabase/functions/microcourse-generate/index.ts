// microcourse-generate — AI 语音微课生成器
// 输入主题 + 难度 + 时长 → 输出完整的 Scene/Action JSON
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const DS_URL = 'https://api.deepseek.com/v1/chat/completions';

const SYSTEM_PROMPT = `你是智学帮AI微课生成器。你需要把一个教学主题转换为可分步播放的语音微课。

微课数据结构说明：
- 每个微课包含 3-6 个场景(scenes)
- 每个场景有一组动作(actions)
- 动作类型：speech(讲解), wb_open/wb_close(白板开关), wb_draw_text/wb_draw_shape/wb_draw_line/wb_draw_code(绘图), spotlight/laser(指示)

白板坐标系：1000×563，安全边距 x:60-940, y:40-523

输出要求：
1. 第一个场景必须是导入(标题页)，最后一个场景必须是总结
2. speech 讲解词要口语化，每段 40-120 字
3. 白板元素要有合理的坐标位置，不能重叠
4. 支持代码类型时用 wb_draw_code，语言用 java/python/javascript
5. wb_draw_text 的 fontSize 建议 16-24
6. 颜色建议：标题#38bdf8 正文#e2e8f0 重点#fbbf24 代码#a78bfa

严格按以下JSON格式输出，不要任何解释文字：
{
  "title": "微课标题",
  "description": "简短描述",
  "subject": "学科",
  "scenes": [
    {
      "title": "场景标题",
      "type": "slide|whiteboard",
      "canvas": { "width": 1000, "height": 563, "background": "#0f172a", "elements": [{"id":"id","type":"text","x":0,"y":0,"width":0,"height":0,"content":"内容"}] },
      "actions": [
        {"id":"a1","type":"spotlight","elementId":"id"},
        {"id":"a2","type":"speech","text":"讲解词","durationMs":5000},
        {"id":"a3","type":"wb_open"},
        {"id":"a4","type":"wb_draw_text","elementId":"el1","content":"文字","x":80,"y":100,"width":300,"height":60,"fontSize":20,"color":"#38bdf8"},
        {"id":"a5","type":"speech","text":"解释刚才画的"},
        {"id":"a6","type":"wb_draw_line","elementId":"arrow","startX":380,"startY":130,"endX":580,"endY":130,"points":["","arrow"]},
        {"id":"a7","type":"wb_close"}
      ]
    }
  ]
}`;

function getUserPrompt(topic: string, difficulty: string, durationMinutes: number): string {
  const sceneCount = Math.min(Math.max(Math.round(durationMinutes * 1.2), 3), 6);
  return `请为以下主题生成一个完整的语音微课：

主题：${topic}
难度：${difficulty}
目标时长：${durationMinutes} 分钟
场景数量：${sceneCount} 个

要求：
- 每个场景至少包含 1 个 speech 动作
- 至少 ${Math.floor(sceneCount * 0.5)} 个场景使用白板（whiteboard 类型），包含绘图动作
- 如果主题涉及编程，至少 1 个场景包含 wb_draw_code
- 白板元素的坐标不能重叠，间距至少 20px
- speech 讲解词要自然口语化，适合 TTS 朗读
- 所有 durationMs 根据字数估算（中文约 250ms/字）

直接输出 JSON，不要有任何 markdown 代码块标记。`;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const body = await req.json();
    const { topic, difficulty = 'intermediate', durationMinutes = 4 } = body;
    if (!topic) throw new Error('topic required');

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI_KEY_MISSING' }), {
        status: 503, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch(DS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: getUserPrompt(topic, difficulty, durationMinutes) },
        ],
        temperature: 0.7,
        max_tokens: 8192,
      }),
    });

    const json = await res.json();
    const raw = json?.choices?.[0]?.message?.content || '';
    if (!raw) throw new Error('AI returned empty response');

    // 提取 JSON（可能被 markdown 代码块包裹）
    let parsed: Record<string, unknown>;
    const codeMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = codeMatch ? codeMatch[1].trim() : raw.trim();
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // 尝试修复常见问题：尾部逗号、单引号
      const fixed = jsonStr
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/'/g, '"');
      parsed = JSON.parse(fixed);
    }

    // 构建完整响应
    const course = {
      id: crypto.randomUUID(),
      ownerId: 'system',
      title: parsed.title || topic,
      description: parsed.description || `关于${topic}的AI语音微课`,
      subject: parsed.subject || topic,
      difficulty,
      durationSeconds: durationMinutes * 60,
      status: 'ready',
      voiceProvider: 'browser',
      voiceId: 'zh-CN-female',
      schemaVersion: 1,
      scenes: (parsed.scenes as Array<Record<string, unknown>> || []).map((s: Record<string, unknown>, i: number) => ({
        id: `scene-${i + 1}`,
        courseId: 'generated',
        order: i,
        title: s.title || `场景 ${i + 1}`,
        type: s.type || 'slide',
        canvas: s.canvas || { width: 1000, height: 563, background: '#0f172a', elements: [] },
        actions: (s.actions as Array<Record<string, unknown>> || []).map((a: Record<string, unknown>, j: number) => ({
          id: a.id || `${String.fromCharCode(97 + i)}${j + 1}`,
          ...a,
        })),
        durationMs: ((s.actions as Array<{ durationMs?: number; text?: string }> || []).reduce(
          (sum: number, a: { durationMs?: number; text?: string }) =>
            sum + (a.durationMs || (a.text ? a.text.length * 250 : 3000)), 0
        )),
      })),
    };

    return new Response(JSON.stringify(course), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
