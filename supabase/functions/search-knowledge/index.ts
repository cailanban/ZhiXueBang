// search-knowledge Edge Function — 个人知识库检索（v2: 移除生产环境静默 demo fallback）
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { handleCORS, CORS_HEADERS } from '../_shared/auth.ts';

serve(async (req) => {
  const corsRes = handleCORS(req);
  if (corsRes) return corsRes;

  try {
    const { query, limit = 5 } = await req.json();

    const IMA_KEY = Deno.env.get('IMA_API_KEY');
    const IMA_CLIENT = Deno.env.get('IMA_CLIENT_ID');

    if (!IMA_KEY || !IMA_CLIENT) {
      return new Response(
        JSON.stringify({ error: 'RAG_NOT_CONFIGURED', message: '知识库检索服务未配置，请联系管理员', results: [] }),
        { status: 503, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // 调用个人知识库搜索 API
    const res = await fetch('https://imaapi.qq.com/v1/knowledge/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${IMA_KEY}`,
        'X-Client-ID': IMA_CLIENT,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, limit })
    });
    const data = await res.json();

    return new Response(
      JSON.stringify({ results: data.results || [] }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    // 异常时也不返回 demo 数据，而是返回明确错误
    return new Response(
      JSON.stringify({ error: 'SEARCH_FAILED', message: String(e), results: [] }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
