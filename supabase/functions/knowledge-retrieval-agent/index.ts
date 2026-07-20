import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createServiceClient, requireUser, handleCORS, CORS_HEADERS, AuthError } from '../_shared/auth.ts';

const headers = { ...CORS_HEADERS, 'Content-Type': 'application/json' };
const SPARK_URL = 'https://spark-api-open.xf-yun.com/v1/chat/completions';
const clean = (value: unknown, max = 1000) => String(value ?? '').trim().slice(0, max);

function getSparkAuthToken(): string | null {
  const apiKey = Deno.env.get('SPARK_API_KEY');
  const apiSecret = Deno.env.get('SPARK_API_SECRET');
  if (!apiKey || !apiSecret) return null;
  return `${apiKey}:${apiSecret}`;
}

async function embed(text: string): Promise<number[] | null> {
  const url = Deno.env.get('EMBEDDING_API_URL');
  const key = Deno.env.get('EMBEDDING_API_KEY');
  if (!url || !key) return null;
  const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: Deno.env.get('EMBEDDING_MODEL') || 'BAAI/bge-m3', input: text }) });
  if (!response.ok) return null;
  const body = await response.json();
  const vector = body.data?.[0]?.embedding;
  return Array.isArray(vector) && vector.length === 1024 ? vector : null;
}

async function searchRawContent(supabase: any, userId: string, query: string, limit: number): Promise<any[]> {
  const { data, error } = await supabase
    .from('knowledge_files')
    .select('id,name,file_url,content_text')
    .eq('user_id', userId)
    .not('content_text', 'is', null)
    .or(`content_text.ilike.%${query}%,name.ilike.%${query}%`)
    .limit(limit);
  if (error || !data?.length) return [];
  const out: any[] = [];
  for (const f of data) {
    const text = String(f.content_text || '');
    const lowerQuery = query.toLowerCase();
    const idx = text.toLowerCase().indexOf(lowerQuery);
    if (idx === -1) continue;
    const start = Math.max(0, idx - 120);
    const end = Math.min(text.length, idx + query.length + 300);
    const snippet = (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
    out.push({
      result_id: f.id,
      result_type: 'chunk',
      title: f.name,
      content: snippet,
      source_file_id: f.id,
      wiki_entry_id: null,
      score: 0.25,
      source_name: f.name,
      source_url: f.file_url,
      relation_count: 0,
      engine: 'rag',
      fallback: true,
    });
  }
  return out;
}

serve(async request => {
  const cors = handleCORS(request); if (cors) return cors;
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const query = clean(body.query, 500);
    if (!query) return new Response(JSON.stringify({ error: 'QUERY_REQUIRED' }), { status: 400, headers });
    const supabase = createServiceClient();
    const queryEmbedding = await embed(query);
    const { data: raw, error } = await supabase.rpc('hybrid_knowledge_search', {
      p_user_id: user.id, p_query: query, p_query_embedding: queryEmbedding ? `[${queryEmbedding.join(',')}]` : null, p_limit: 18,
    });
    if (error) throw error;

    // Fallback: 如果双引擎索引尚未建立，直接搜索已解析文件内容
    let searchResults = raw || [];
    if (!searchResults.length) {
      searchResults = await searchRawContent(supabase, user.id, query, 18);
    }

    const ids = [...new Set(searchResults.map((item: any) => item.wiki_entry_id).filter(Boolean))];
    const { data: relations } = ids.length ? await supabase.from('wiki_relations')
      .select('source_entry_id,target_entry_id,relation_type,weight').eq('user_id', user.id)
      .or(`source_entry_id.in.(${ids.join(',')}),target_entry_id.in.(${ids.join(',')})`).limit(40) : { data: [] };

    const ranked = searchResults.map((item: any) => ({ ...item, score: Number(item.score || 0) + (relations || []).filter((r: any) => r.source_entry_id === item.wiki_entry_id || r.target_entry_id === item.wiki_entry_id).reduce((sum: number, r: any) => sum + Number(r.weight || 0) * 0.02, 0) }))
      .sort((a: any, b: any) => b.score - a.score).slice(0, Math.max(1, Math.min(Number(body.limit) || 8, 15)));

    // Enrich results with source metadata
    const sourceFileIds = [...new Set(ranked.map((item: any) => item.source_file_id).filter(Boolean))];
    const sourceMap = new Map<string, { name: string; url: string }>();
    if (sourceFileIds.length) {
      const { data: files } = await supabase.from('knowledge_files')
        .select('id,name,file_url').in('id', sourceFileIds);
      for (const f of (files || [])) {
        sourceMap.set(f.id, { name: f.name || '本地知识库文档', url: f.file_url || '' });
      }
    }
    const relationCountMap = new Map<string, number>();
    for (const r of (relations || [])) {
      if (r.source_entry_id) relationCountMap.set(r.source_entry_id, (relationCountMap.get(r.source_entry_id) || 0) + 1);
      if (r.target_entry_id) relationCountMap.set(r.target_entry_id, (relationCountMap.get(r.target_entry_id) || 0) + 1);
    }

    const wikiCount = ranked.filter((item: any) => item.result_type === 'wiki').length;
    const ragCount = ranked.filter((item: any) => item.result_type === 'chunk').length;
    const engine_summary = { wiki_count: wikiCount, rag_count: ragCount, vector_enabled: Boolean(queryEmbedding) };

    const enriched = ranked.map((item: any) => {
      const source = sourceMap.get(item.source_file_id);
      return {
        ...item,
        source_name: source?.name || '本地知识库文档',
        source_url: source?.url || null,
        relation_count: relationCountMap.get(item.wiki_entry_id) || 0,
        engine: item.result_type === 'wiki' ? 'wiki' : 'rag',
      };
    });

    let answer: string | null = null;
    if (body.answer === true && enriched.length) {
      const authToken = getSparkAuthToken();
      if (authToken) {
        const context = enriched.map((item: any, index: number) => `[${index + 1}] ${item.title}\n${clean(item.content, 1800)}`).join('\n\n');
        const response = await fetch(SPARK_URL, { method: 'POST', headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'generalv3', stream: false, temperature: 0.1, messages: [
          { role: 'system', content: '你是知识检索子Agent。只能依据给定资料回答；资料不足就明确说不足。使用[1]形式标注依据，不得编造来源。' },
          { role: 'user', content: `问题：${query}\n\n检索资料：\n${context}` },
        ] }) });
        if (response.ok) answer = (await response.json()).choices?.[0]?.message?.content || null;
      }
    }
    const hasFallback = ranked.some((item: any) => item.fallback === true);
    const mode = hasFallback ? 'content_fallback' : (queryEmbedding ? 'wvk+vector+fts' : 'wvk+fts');
    return new Response(JSON.stringify({ query, mode, answer, results: enriched, relations: relations || [], engine_summary, vector_enabled: Boolean(queryEmbedding) }), { headers });
  } catch (error) {
    const status = error instanceof AuthError ? error.status : 500;
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), { status, headers });
  }
});
