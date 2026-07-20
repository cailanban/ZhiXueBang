// parse-file — 解析 PDF/DOCX/TXT/MD 文件
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 解析 PDF - 使用 unpdf 库（专为 Deno 优化）
async function extractPdfText(buf: ArrayBuffer): Promise<string> {
  try {
    const unpdf: any = await import('https://esm.sh/unpdf@0.11.0');
    const result = await unpdf.extractText(buf, { mergePages: true });
    return result.text || '';
  } catch (e) {
    return `[PDF 解析失败: ${String(e).slice(0, 200)}]`;
  }
}

// 解析 DOCX - 用 mammoth
async function extractDocxText(buf: ArrayBuffer): Promise<string> {
  try {
    const mammoth: any = await import('https://esm.sh/mammoth@1.8.0');
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return result.value || '';
  } catch (e) {
    return `[DOCX 解析失败: ${String(e).slice(0, 200)}]`;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const { file_url, file_name } = await req.json();
    if (!file_url) throw new Error('file_url required');

    const ext = (file_name || file_url).split('.').pop()?.toLowerCase() || '';
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // 下载文件
    const res = await fetch(file_url);
    if (!res.ok) throw new Error(`下载文件失败: ${res.status}`);
    const buf = await res.arrayBuffer();

    let content = '';
    if (ext === 'txt' || ext === 'md' || ext === 'markdown') {
      content = new TextDecoder('utf-8').decode(buf);
    } else if (ext === 'docx' || ext === 'doc') {
      content = await extractDocxText(buf);
    } else if (ext === 'pdf') {
      content = await extractPdfText(buf);
    }

    // 截断到 50k
    const truncated = content.length > 50000 ? content.slice(0, 50000) + '...(已截断)' : content;
    return new Response(JSON.stringify({ content: truncated, ext, charCount: truncated.length }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
});
