// ima-search — 个人知识库检索
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const IMA_BASE = 'https://ima.qq.com';

function imaHeaders(clientId: string, apiKey: string) {
  return {
    'Content-Type': 'application/json',
    'ima-openapi-clientid': clientId,
    'ima-openapi-apikey': apiKey,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const clientId = Deno.env.get('IMA_CLIENT_ID');
    const apiKey = Deno.env.get('IMA_API_KEY');
    const kbId = Deno.env.get('IMA_KB_ID');

    const body = await req.json();
    const { action, query, cursor = '', limit = 10, folder_id } = body;

    if (!clientId || !apiKey) {
      return new Response(JSON.stringify({ error: 'IMA凭证未配置' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    const headers = imaHeaders(clientId, apiKey);

    // ── action: search ── 知识库内搜索
    if (action === 'search') {
      if (!query) return new Response(JSON.stringify({ error: 'query required' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
      if (!kbId) return new Response(JSON.stringify({ error: 'IMA_KB_ID未配置' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });

      const res = await fetch(`${IMA_BASE}/openapi/wiki/v1/search_knowledge`, {
        method: 'POST', headers,
        body: JSON.stringify({ query, cursor, knowledge_base_id: kbId, limit }),
      });
      const data = await res.json();
      if (data.code !== 0) {
        return new Response(JSON.stringify({ error: data.msg || data.message || '搜索失败', code: data.code }),
          { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } });
      }
      const items = data.data?.items || [];
      const results = items.map((item: Record<string, unknown>) => ({
        title: item.title || '',
        content: item.content || '',
        source: (item.meta_info as Record<string, unknown>)?.source || '个人知识库',
        relevance: (item.score as number) || 0.8,
      }));
      return new Response(JSON.stringify({ results, total: results.length }),
        { headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    // ── action: list ── 浏览文件/目录
    if (action === 'list') {
      const listBody: Record<string, unknown> = { knowledge_base_id: kbId, limit };
      if (folder_id) listBody.folder_id = folder_id;
      if (cursor) listBody.cursor = cursor;
      const res = await fetch(`${IMA_BASE}/openapi/wiki/v1/list_documents`, {
        method: 'POST', headers, body: JSON.stringify(listBody),
      });
      const data = await res.json();
      if (data.code !== 0) {
        return new Response(JSON.stringify({ error: data.msg || data.message || '列表失败', code: data.code }),
          { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify(data.data || {}),
        { headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    // ── action: kb_info ── 知识库元信息
    if (action === 'kb_info') {
      if (!kbId) return new Response(JSON.stringify({ error: 'IMA_KB_ID未配置' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
      const res = await fetch(`${IMA_BASE}/openapi/wiki/v1/get_knowledge_base`, {
        method: 'POST', headers, body: JSON.stringify({ knowledge_base_id: kbId }),
      });
      const data = await res.json();
      if (data.code !== 0) {
        return new Response(JSON.stringify({ error: data.msg || data.message || '获取失败', code: data.code }),
          { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify(data.data || {}),
        { headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    // ── action: save_note ── 存入IMA笔记
    if (action === 'save_note') {
      const noteTitle = (body.title || body.kbName || '知识笔记') as string;
      const noteContent = (body.content || body.query || '') as string;
      const res = await fetch(`${IMA_BASE}/openapi/note/v1/add_note`, {
        method: 'POST', headers,
        body: JSON.stringify({ title: noteTitle, content: noteContent, knowledge_base_id: kbId }),
      });
      const data = await res.json();
      if (data.code !== 0) {
        return new Response(JSON.stringify({ error: data.msg || data.message || '笔记保存失败', code: data.code }),
          { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ success: true, noteId: data.data?.note_id }),
        { headers: { ...CORS, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('[ima-search] error:', e);
    return new Response(JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
});
