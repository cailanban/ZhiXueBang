// fetch-page — 代理抓取网页内容，提取纯文本
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function stripHtml(html: string): string {
  // 去掉 script/style 标签及其内容
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  // 去掉所有 HTML 标签
  text = text.replace(/<[^>]+>/g, ' ');
  // 解码实体
  text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  // 合并空白
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const { url } = await req.json();
    if (!url) throw new Error('url required');

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ZhixueBang/1.0)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

    const html = await res.text();
    const text = stripHtml(html);
    // 截断到合理长度（防止超大页面）
    const content = text.length > 50000 ? text.slice(0, 50000) + '...(已截断)' : text;

    return new Response(JSON.stringify({ content, charCount: content.length }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }),
      { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
});
