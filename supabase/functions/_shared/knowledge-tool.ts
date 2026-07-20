/**
 * knowledge-tool.ts — 知识检索可复用工具
 *
 * 所有 Agent（ace-communication, discover-learning-resources, learning-butler 等）
 * 均可导入此模块，统一调用知识检索，无需各自重复实现。
 *
 * 用法:
 *   import { retrieveKnowledge, searchKnowledge, renderKnowledgeContext } from '../_shared/knowledge-tool.ts';
 *   const results = await searchKnowledge(supabase, user.id, '什么是泛型');
 *   const context = renderKnowledgeContext(results, 'markdown');
 */

// ── 类型定义 ──

export interface KnowledgeSearchResult {
  id: string;
  engine: 'wiki' | 'rag';
  title: string;
  content: string;
  score: number;
  source_name: string;
  source: string | null;
  relation_count: number;
}

export interface KnowledgeSearchOptions {
  limit?: number;
  vector?: boolean;
  answer?: boolean;
}

export interface KnowledgeSearchResponse {
  query: string;
  mode: string;
  answer: string | null;
  results: KnowledgeSearchResult[];
  relations: unknown[];
  engine_summary: { wiki_count: number; rag_count: number; vector_enabled: boolean };
  vector_enabled: boolean;
}

export interface KnowledgeContextFormat {
  plain: string;
  markdown: string;
  json: KnowledgeSearchResult[];
}

// ── 核心检索函数 ──

export async function searchKnowledge(
  supabase: any,
  userId: string,
  query: string,
  options: KnowledgeSearchOptions = {},
): Promise<KnowledgeSearchResponse> {
  const { limit = 8, vector = true } = options;

  let queryEmbedding: number[] | null = null;
  if (vector) {
    try {
      const { data: emb } = await supabase.rpc('generate_embedding', {
        api_key: null,
        input_text: query,
      });
      queryEmbedding = Array.isArray(emb) ? emb : null;
    } catch {
      queryEmbedding = null;
    }
  }

  const { data: raw, error } = await supabase.rpc('hybrid_knowledge_search', {
    p_user_id: userId,
    p_query: query,
    p_query_embedding: queryEmbedding ? `[${queryEmbedding.join(',')}]` : null,
    p_limit: limit,
  });
  if (error) throw error;

  const ids = [...new Set((raw || []).map((item: any) => item.wiki_entry_id).filter(Boolean))];

  const { data: relations } = ids.length
    ? await supabase.from('wiki_relations')
        .select('source_entry_id,target_entry_id,relation_type,weight')
        .eq('user_id', userId)
        .or(`source_entry_id.in.(${ids.join(',')}),target_entry_id.in.(${ids.join(',')})`)
        .limit(40)
    : { data: [] };

  const ranked = (raw || [])
    .map((item: any) => ({
      ...item,
      score: Number(item.score || 0) + (relations || [])
        .filter((r: any) => r.source_entry_id === item.wiki_entry_id || r.target_entry_id === item.wiki_entry_id)
        .reduce((sum: number, r: any) => sum + Number(r.weight || 0) * 0.02, 0),
    }))
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, limit);

  const sourceFileIds = [...new Set(ranked.map((item: any) => item.source_file_id).filter(Boolean))];
  const sourceMap = new Map<string, { name: string; url: string }>();
  if (sourceFileIds.length) {
    const { data: files } = await supabase.from('knowledge_files')
      .select('id,name,file_url').in('id', sourceFileIds);
    for (const f of files || []) {
      sourceMap.set(f.id, { name: f.name || '本地知识库', url: f.file_url || '' });
    }
  }

  const relationCountMap = new Map<string, number>();
  for (const r of relations || []) {
    if (r.source_entry_id) relationCountMap.set(r.source_entry_id, (relationCountMap.get(r.source_entry_id) || 0) + 1);
    if (r.target_entry_id) relationCountMap.set(r.target_entry_id, (relationCountMap.get(r.target_entry_id) || 0) + 1);
  }

  const wikiCount = ranked.filter((item: any) => item.result_type === 'wiki').length;
  const ragCount = ranked.filter((item: any) => item.result_type === 'chunk').length;

  const results: KnowledgeSearchResult[] = ranked.map((item: any) => {
    const source = sourceMap.get(item.source_file_id);
    return {
      id: item.result_id || item.id,
      engine: item.result_type === 'wiki' ? 'wiki' : 'rag',
      title: item.title || '',
      content: item.content || '',
      score: item.score,
      source_name: source?.name || '本地知识库',
      source: source?.url || null,
      relation_count: relationCountMap.get(item.wiki_entry_id) || 0,
    };
  });

  return {
    query,
    mode: queryEmbedding ? 'wvk+vector+fts' : 'wvk+fts',
    answer: null,
    results,
    relations: relations || [],
    engine_summary: { wiki_count: wikiCount, rag_count: ragCount, vector_enabled: Boolean(queryEmbedding) },
    vector_enabled: Boolean(queryEmbedding),
  };
}

export async function retrieveKnowledge(
  supabase: any,
  userId: string,
  query: string,
  options: KnowledgeSearchOptions = {},
): Promise<KnowledgeSearchResponse> {
  const response = await searchKnowledge(supabase, userId, query, { ...options, answer: false });
  if (!response.results.length) {
    response.answer = '知识库中未找到相关内容。';
    return response;
  }

  const sparkPassword = Deno.env.get('SPARK_API_PASSWORD');
  if (!sparkPassword) { response.answer = null; return response; }

  try {
    const context = response.results
      .map((item, index) => {
        const content = item.content.length > 1800 ? item.content.slice(0, 1800) + '...' : item.content;
        return `[${index + 1}] ${item.title}\n${content}`;
      })
      .join('\n\n');

    const aiResponse = await fetch('https://spark-api-open.xf-yun.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sparkPassword}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'general', stream: false, temperature: 0.1,
        messages: [
          { role: 'system', content: '你是知识检索子Agent。只能依据给定资料回答；资料不足就明确说不足。使用[1]形式标注依据，不得编造来源。' },
          { role: 'user', content: `问题：${query}\n\n检索资料：\n${context}` },
        ],
      }),
    });
    if (aiResponse.ok) {
      const data = await aiResponse.json();
      response.answer = data.choices?.[0]?.message?.content || null;
    }
  } catch { response.answer = null; }

  return response;
}

// ── 上下文渲染 ──

export function renderKnowledgeContext(
  results: KnowledgeSearchResult[],
  format: 'plain' | 'markdown' | 'json' = 'markdown',
): KnowledgeContextFormat {
  const plain = results
    .map((r, i) => `[${i + 1}] ${r.title} (${r.engine}, score:${r.score.toFixed(3)})\n${r.content}`)
    .join('\n\n');

  const markdown = results
    .map((r, i) =>
      `### [${i + 1}] ${r.title}\n` +
      `- **来源**: ${r.source_name}${r.source ? ` (${r.source})` : ''}\n` +
      `- **引擎**: ${r.engine === 'wiki' ? 'WVK' : 'RAG'} | 相关度: ${r.score.toFixed(3)}\n` +
      `\n${r.content}`,
    )
    .join('\n\n---\n\n');

  return { plain, markdown, json: results };
}

export function buildKnowledgeSystemPrompt(
  results: KnowledgeSearchResult[],
  basePrompt = '你是学习助手，基于知识库内容回答用户问题。',
): { system: string; context: string; citations: string[] } {
  const ctx = renderKnowledgeContext(results, 'plain').plain;
  const citations = results.map((r) => r.title);
  return {
    system: `${basePrompt}\n\n知识库参考资料：\n${ctx}\n\n请在回答中引用资料编号（如 [1]、[2]）。`,
    context: ctx,
    citations,
  };
}