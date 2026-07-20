/**
 * generate-ppt — PPT/课件内容工厂 V3
 * 输出: slides JSON + HTML 幻灯片 + 教师讲稿(Markdown)
 * PPTX 由前端浏览器端生成（pptxgenjs 不兼容 Deno Deploy）
 * 能力: 4 模板、任务队列、版本历史、失败重试
 */
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createServiceClient, requireUser, handleCORS, CORS_HEADERS, AuthError } from '../_shared/auth.ts';
import { createCostTracker, accumulateDailyCost } from '../_shared/observability.ts';

const headers = { ...CORS_HEADERS, 'Content-Type': 'application/json' };
const DS_URL = 'https://api.deepseek.com/v1/chat/completions';
const MAX_SLIDES = 20;
const MAX_RETRIES = 3;
const STORAGE_BUCKET = 'generated-content';

const TEMPLATES: Record<string, { name: string; bgColor: string; titleColor: string; accentColor: string; textColor: string; font: string }> = {
  lecture: { name: '讲义模式', bgColor: '1a1a2e', titleColor: 'e94560', accentColor: '0f3460', textColor: 'eaeaea', font: 'Arial' },
  workshop: { name: '工作坊模式', bgColor: '16213e', titleColor: '0f3460', accentColor: '533483', textColor: 'eaeaea', font: 'Arial' },
  review: { name: '复习模式', bgColor: '1b4332', titleColor: '2d6a4f', accentColor: '40916c', textColor: 'eaeaea', font: 'Arial' },
  "exam-prep": { name: '备考模式', bgColor: '3c096c', titleColor: '7b2cbf', accentColor: '5a189a', textColor: 'eaeaea', font: 'Arial' },
};

interface SlideContent {
  title: string;
  body: string[];
  type: string;
  notes?: string;
}

// ─── AI content generation with retry (DeepSeek) ──────────────────────
async function generateSlideContent(
  topic: string, outline: string[], template: string, count: number
): Promise<SlideContent[]> {
  const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
  if (!apiKey) throw new Error('AI_KEY_MISSING');

  const lines = outline.map((o, i) => `${i + 1}. ${o}`).join('\n');
  const prompt = `你是课件设计师。请根据大纲生成${count}页幻灯片。主题：${topic}，模板：${template}。大纲：\n${lines}\n\n以JSON数组返回：[{"title":"...","body":["..."],"type":"content|code|summary|quiz","notes":"教师讲解要点..."}]。notes字段必须写200字以上的教师讲解要点。只返回JSON数组。`;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(DS_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat', stream: false, temperature: 0.3,
          messages: [
            { role: 'system', content: '你是课件设计专家，输出必须是有效的JSON数组格式。' },
            { role: 'user', content: prompt },
          ],
        }),
      });
      if (!res.ok) throw new Error(`AI_ERROR: ${res.status}`);
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('AI_PARSE_ERROR');
      const slides = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(slides) || slides.length === 0) throw new Error('AI_EMPTY_RESPONSE');
      return slides;
    } catch (e: any) {
      lastError = e;
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, (attempt + 1) * 1000));
      }
    }
  }
  throw lastError || new Error('AI_RETRY_EXHAUSTED');
}

// ─── HTML slides builder ──────────────────────────────────────────────────
function buildHtmlSlides(slides: SlideContent[], topic: string, template: string): string {
  const cfg = TEMPLATES[template] || TEMPLATES.lecture;
  const slideHtml = slides.map((s, i) => {
    const bodyHtml = s.type === 'code'
      ? `<pre class="code-block"><code>${escapeHtml(s.body.join('\n'))}</code></pre>`
      : `<ol>${s.body.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}</ol>`;
    return `    <section class="slide">
      <span class="page-num">${i + 1} / ${slides.length}</span>
      <h2>${escapeHtml(s.title)}</h2>
      <div class="accent-bar"></div>
      ${bodyHtml}
      ${s.notes ? `<aside class="notes">${escapeHtml(s.notes)}</aside>` : ''}
    </section>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(topic)} - ${cfg.name}</title>
<style>
  :root { --bg: #${cfg.bgColor}; --title: #${cfg.titleColor}; --accent: #${cfg.accentColor}; --text: #${cfg.textColor}; --font: ${cfg.font}, sans-serif; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: var(--font); background: #111; color: var(--text); display: flex; flex-direction: column; align-items: center; padding: 24px; gap: 24px; }
  .cover { background: var(--bg); border-radius: 16px; width: 100%; max-width: 960px; padding: 60px 48px; text-align: center; }
  .cover h1 { font-size: 36px; color: var(--title); margin-bottom: 16px; }
  .cover .subtitle { font-size: 14px; opacity: .7; }
  .slide { background: var(--bg); border-radius: 16px; width: 100%; max-width: 960px; padding: 48px; position: relative; }
  .slide h2 { font-size: 24px; color: var(--title); margin-bottom: 16px; }
  .slide .page-num { position: absolute; top: 16px; right: 24px; font-size: 11px; opacity: .5; }
  .accent-bar { width: 60px; height: 3px; background: var(--accent); border-radius: 2px; margin-bottom: 24px; }
  .slide ol { padding-left: 24px; line-height: 2; font-size: 16px; }
  .slide li { margin-bottom: 8px; }
  .code-block { background: #0d1117; border-radius: 8px; padding: 24px; font-family: 'Courier New', monospace; font-size: 13px; color: #58a6ff; overflow-x: auto; line-height: 1.6; }
  .notes { margin-top: 24px; padding: 16px; background: rgba(255,255,255,.05); border-left: 3px solid var(--accent); border-radius: 0 8px 8px 0; font-size: 13px; opacity: .8; line-height: 1.6; }
  .notes::before { content: '📝 教师讲稿'; display: block; font-size: 11px; font-weight: 600; margin-bottom: 8px; opacity: .6; }
  .end { background: var(--bg); border-radius: 16px; width: 100%; max-width: 960px; padding: 80px 48px; text-align: center; }
  .end h2 { font-size: 40px; color: var(--title); margin-bottom: 12px; }
  @media print { body { background: #fff; padding: 0; } .slide { page-break-after: always; border-radius: 0; } }
</style>
</head>
<body>
  <div class="cover">
    <h1>${escapeHtml(topic)}</h1>
    <p class="subtitle">共 ${slides.length} 页 · ${cfg.name}</p>
  </div>
${slideHtml}
  <div class="end">
    <h2>感谢学习</h2>
    <p style="opacity:.5">${escapeHtml(topic)}</p>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ─── Teacher notes builder ────────────────────────────────────────────────
function buildTeacherNotes(slides: SlideContent[], topic: string, template: string): string {
  const cfg = TEMPLATES[template] || TEMPLATES.lecture;
  const slideNotes = slides.map((s, i) => {
    const body = s.body.map((p) => `- ${p}`).join('\n');
    return `## 第 ${i + 1} 页：${s.title}\n\n**内容要点**：\n${body}\n\n**教师讲解**：\n${s.notes || '(无讲稿)'}\n`;
  }).join('\n---\n\n');

  return `# ${topic} — 教师讲稿\n\n> 模板：${cfg.name} | 共 ${slides.length} 页 | 生成时间：${new Date().toISOString()}\n\n---\n\n${slideNotes}\n\n---\n\n*由智学帮 AI 课件工厂生成*`;
}

// ─── Convert SlideContent to frontend-compatible PptSlide format ──────────
function toPptSlides(slides: SlideContent[]) {
  return slides.map((s, i) => ({
    index: i,
    type: s.type || 'content',
    title: s.title,
    bullets: s.body || [],
    notes: s.notes || undefined,
    code: s.type === 'code' ? s.body.join('\n') : undefined,
  }));
}

// ─── Main handler ─────────────────────────────────────────────────────────
serve(async (req: Request) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  const cost = createCostTracker();

  try {
    const supabase = createServiceClient();
    const user = await requireUser(req);

    if (req.method === 'GET') {
      // List templates and user's jobs
      const { data: jobs } = await supabase
        .from('ppt_generation_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      return new Response(JSON.stringify({
        templates: Object.entries(TEMPLATES).map(([key, cfg]) => ({ id: key, name: cfg.name })),
        jobs: jobs || [],
      }), { headers });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      if (!body.topic || !body.outline?.length) {
        return new Response(JSON.stringify({ error: 'TOPIC_AND_OUTLINE_REQUIRED' }), { status: 400, headers });
      }

      const template = TEMPLATES[body.template] ? body.template : 'lecture';
      const slideCount = Math.min(Math.max(body.slideCount || 8, 3), MAX_SLIDES);
      const formats = body.formats || ['html', 'notes'];

      // Create job record
      const { data: job, error: jobErr } = await supabase
        .from('ppt_generation_jobs')
        .insert({
          user_id: user.id,
          topic: body.topic,
          template,
          status: 'generating',
          max_retries: MAX_RETRIES,
        })
        .select()
        .single();

      if (jobErr) throw jobErr;

      try {
        const slides = await generateSlideContent(body.topic, body.outline, TEMPLATES[template].name, slideCount);
        const prefix = `ppt/${user.id}/${job.id}`;
        const result: Record<string, string> = {};

        // Upload HTML slides
        if (formats.includes('html')) {
          try {
            const htmlContent = buildHtmlSlides(slides, body.topic, template);
            const htmlPath = `${prefix}/slides.html`;
            await supabase.storage.from(STORAGE_BUCKET).upload(htmlPath, new TextEncoder().encode(htmlContent), {
              contentType: 'text/html; charset=utf-8',
              upsert: false,
            });
            const { data: htmlUrl } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(htmlPath);
            result.htmlUrl = htmlUrl.publicUrl;
          } catch (e: any) {
            console.error('HTML upload failed:', e.message);
          }
        }

        // Upload teacher notes
        if (formats.includes('notes')) {
          try {
            const notesContent = buildTeacherNotes(slides, body.topic, template);
            const notesPath = `${prefix}/notes.md`;
            await supabase.storage.from(STORAGE_BUCKET).upload(notesPath, new TextEncoder().encode(notesContent), {
              contentType: 'text/markdown; charset=utf-8',
              upsert: false,
            });
            const { data: notesUrl } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(notesPath);
            result.notesUrl = notesUrl.publicUrl;
          } catch (e: any) {
            console.error('Notes upload failed:', e.message);
          }
        }

        // Convert to frontend-compatible format
        const pptSlides = toPptSlides(slides);

        // Update job to completed
        await supabase.from('ppt_generation_jobs').update({
          status: 'completed',
          slide_count: slides.length,
          pptx_url: null, // PPTX is built client-side
          html_url: result.htmlUrl || null,
          notes_url: result.notesUrl || null,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('id', job.id);

        // Create version history
        await supabase.from('ppt_version_history').insert({
          job_id: job.id,
          version: 1,
          pptx_url: null,
          html_url: result.htmlUrl || null,
          notes_url: result.notesUrl || null,
          slide_count: slides.length,
        });

        // FIXED: pass the cost tracker object, not the raw number
        accumulateDailyCost('generate-ppt', cost);

        return new Response(JSON.stringify({
          success: true,
          job_id: job.id,
          topic: body.topic,
          subtitle: `${TEMPLATES[template].name} · ${slides.length} 页`,
          slideCount: slides.length,
          template: TEMPLATES[template].name,
          slides: pptSlides,
          ...result,
        }), { headers });
      } catch (genErr: any) {
        // Update job to failed
        await supabase.rpc('increment_ppt_retry', { p_job_id: job.id }).catch(() => {});
        await supabase.from('ppt_generation_jobs').update({
          status: 'failed',
          error_message: genErr.message,
          updated_at: new Date().toISOString(),
        }).eq('id', job.id);

        throw genErr;
      }
    }

    return new Response(JSON.stringify({ error: 'NOT_FOUND' }), { status: 404, headers });
  } catch (e: any) {
    if (e instanceof AuthError) return new Response(JSON.stringify({ error: e.message }), { status: e.status, headers });
    console.error('generate-ppt error:', e.message);
    return new Response(JSON.stringify({ error: e.message || 'INTERNAL_ERROR' }), { status: 500, headers });
  }
});