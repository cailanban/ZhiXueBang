// synthesize-video — 讲稿 TTS 音频合成
// 输入：slides（含 notes 字段）→ 输出：每页的 TTS 音频 URL + 时长
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { requireUser, handleCORS, CORS_HEADERS, AuthError } from '../_shared/auth.ts';

const headers = { ...CORS_HEADERS, 'Content-Type': 'application/json' };
const STORAGE_BUCKET = 'generated-content';
// EdgeTTS 兼容的 TTS 端点（使用 Microsoft Edge TTS 免费服务）
const TTS_ENDPOINT = 'https://speech.platform.bing.com/consumer/speech/synthesize/readaloud';

interface SlideInput {
  slideIndex: number;
  title: string;
  text: string;      // 讲稿文本
  voice?: string;    // 语音，默认 zh-CN-XiaoxiaoNeural
}

// ─── TTS 合成（EdgeTTS via Microsoft） ──────────────────────
async function synthesizeSpeech(
  text: string,
  voice = 'zh-CN-XiaoxiaoNeural',
): Promise<{ audioBytes: Uint8Array; durationMs: number }> {
  // SSML 构建
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
    xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="zh-CN">
    <voice name="${voice}">
      <prosody rate="1.0" pitch="default">
        ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </prosody>
    </voice>
  </speak>`;

  const res = await fetch(`${TTS_ENDPOINT}?trustedclienttoken=6A5AA1D14EA1A8DCFD6C2A4C4A4A6A4A`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/ssml+xml',
      'User-Agent': 'Mozilla/5.0 (compatible; EdgeTTS/1.0)',
      'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
    },
    body: ssml,
  });

  if (!res.ok) {
    throw new Error(`TTS_ERROR: ${res.status}`);
  }

  const audioBytes = new Uint8Array(await res.arrayBuffer());
  // 估算时长：中文约 4 字/秒
  const durationMs = Math.round(text.length * 250);
  return { audioBytes, durationMs };
}

// ─── Main handler ────────────────────────────────────────────
serve(async (req: Request) => {
  const corsResponse = handleCORS(req);
  if (corsResponse) return corsResponse;

  try {
    const user = await requireUser(req);

    // GET: 查询合成任务状态
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const jobId = url.pathname.split('/').pop();
      return new Response(JSON.stringify({
        jobId,
        status: 'completed',  // 当前版本为同步合成
        message: 'TTS 合成完成',
      }), { headers });
    }

    // POST: 合成音频
    if (req.method === 'POST') {
      const body = await req.json();
      const slides: SlideInput[] = body.slides || [];
      const voice = body.voice || 'zh-CN-XiaoxiaoNeural';
      const courseId = body.courseId || crypto.randomUUID();

      if (!slides.length) {
        return new Response(JSON.stringify({ error: 'SLIDES_REQUIRED' }), { status: 400, headers });
      }

      const audioFiles: Array<{
        slideIndex: number;
        title: string;
        audioUrl: string;
        durationMs: number;
        text: string;
      }> = [];

      for (const slide of slides) {
        const textToSpeak = slide.text || slide.title;
        if (!textToSpeak.trim()) continue;

        try {
          const { audioBytes, durationMs } = await synthesizeSpeech(textToSpeak, voice);
          const path = `tts/${user.id}/${courseId}/slide-${slide.slideIndex}.mp3`;

          const { error: uploadErr } = await supabaseClient()
            .storage.from(STORAGE_BUCKET)
            .upload(path, audioBytes, {
              contentType: 'audio/mpeg',
              upsert: true,
            });

          if (uploadErr) {
            console.error('Upload error:', uploadErr.message);
            continue;
          }

          const { data: publicUrl } = supabaseClient()
            .storage.from(STORAGE_BUCKET)
            .getPublicUrl(path);

          audioFiles.push({
            slideIndex: slide.slideIndex,
            title: slide.title,
            audioUrl: publicUrl.publicUrl,
            durationMs,
            text: textToSpeak.substring(0, 200),
          });
        } catch (ttsErr: unknown) {
          const msg = ttsErr instanceof Error ? ttsErr.message : String(ttsErr);
          console.error(`TTS failed for slide ${slide.slideIndex}:`, msg);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        jobId: crypto.randomUUID(),
        status: 'completed',
        slideCount: slides.length,
        audioFiles,
        totalDurationSec: Math.round(audioFiles.reduce((s, a) => s + a.durationMs, 0) / 1000),
      }), { headers });
    }

    return new Response(JSON.stringify({ error: 'NOT_FOUND' }), { status: 404, headers });
  } catch (e: unknown) {
    if (e instanceof AuthError) return new Response(JSON.stringify({ error: e.message }), { status: e.status, headers });
    const msg = e instanceof Error ? e.message : String(e);
    console.error('synthesize-video error:', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers });
  }
});

// Helper to create supabase client (Deno-compatible)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function supabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
