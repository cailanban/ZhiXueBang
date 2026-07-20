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

function chunksOf(content: string, size = 1200, overlap = 180) {
  const result: string[] = [];
  for (let start = 0; start < content.length; start += size - overlap) {
    const value = content.slice(start, start + size).trim(); if (value) result.push(value);
  }
  return result.slice(0, 120);
}

async function embeddings(texts: string[]): Promise<(number[] | null)[]> {
  const url = Deno.env.get('EMBEDDING_API_URL'); const key = Deno.env.get('EMBEDDING_API_KEY');
  if (!url || !key) return texts.map(() => null);
  const output: (number[] | null)[] = [];
  for (let i = 0; i < texts.length; i += 16) {
    const batch = texts.slice(i, i + 16);
    const response = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: Deno.env.get('EMBEDDING_MODEL') || 'BAAI/bge-m3', input: batch }) });
    if (!response.ok) { output.push(...batch.map(() => null)); continue; }
    const data = (await response.json()).data || [];
    output.push(...batch.map((_, offset) => Array.isArray(data[offset]?.embedding) && data[offset].embedding.length === 1024 ? data[offset].embedding : null));
  }
  return output;
}

function parseJson(content: string) {
  const candidate = content.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] || content.match(/\{[\s\S]*\}/)?.[0];
  if (!candidate) throw new Error('WIKI_STRUCTURE_INVALID');
  const parsed = JSON.parse(candidate);
  if (!Array.isArray(parsed.entries) || parsed.entries.length === 0) throw new Error('WIKI_ENTRIES_EMPTY');
  return parsed;
}

serve(async request => {
  const cors = handleCORS(request); if (cors) return cors;
  let jobId = '';
  const supabase = createServiceClient();
  try {
    const user = await requireUser(request); const body = await request.json(); const fileId = clean(body.file_id, 80);
    if (!fileId) return new Response(JSON.stringify({ error: 'FILE_ID_REQUIRED' }), { status: 400, headers });
    const { data: file, error: fileError } = await supabase.from('knowledge_files').select('id,name,content_text').eq('id', fileId).eq('user_id', user.id).maybeSingle();
    if (fileError) throw fileError;
    if (!file) return new Response(JSON.stringify({ error: 'FILE_NOT_FOUND' }), { status: 404, headers });
    const content = clean(file.content_text, 60000);
    if (content.length < 30) return new Response(JSON.stringify({ error: 'FILE_NOT_PARSED', message: '请先解析文件内容' }), { status: 409, headers });
    const staleBefore = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { data: activeJob, error: activeJobError } = await supabase
      .from('knowledge_index_jobs')
      .select('id,status,updated_at')
      .eq('user_id', user.id)
      .eq('source_file_id', file.id)
      .in('status', ['pending', 'processing'])
      .gte('updated_at', staleBefore)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeJobError) throw activeJobError;
    if (activeJob) {
      return new Response(JSON.stringify({
        error: 'INDEX_ALREADY_RUNNING',
        message: '该文档正在构建 WVK + RAG 索引，请稍后查看实时状态',
        job_id: activeJob.id,
        status: activeJob.status,
      }), { status: 409, headers });
    }

    const staleResult = await supabase
      .from('knowledge_index_jobs')
      .update({
        status: 'failed',
        error_message: 'STALE_JOB_REPLACED',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('source_file_id', file.id)
      .in('status', ['pending', 'processing'])
      .lt('updated_at', staleBefore);

    if (staleResult.error) throw staleResult.error;

    const job = await supabase
      .from('knowledge_index_jobs')
      .insert({ user_id: user.id, source_file_id: file.id, status: 'processing' })
      .select()
      .single();

    if (job.error?.code === '23505') {
      return new Response(JSON.stringify({
        error: 'INDEX_ALREADY_RUNNING',
        message: '该文档正在构建 WVK + RAG 索引，请稍后查看实时状态',
      }), { status: 409, headers });
    }
    if (job.error) throw job.error;
    jobId = job.data.id;

    const authToken = getSparkAuthToken();
    if (!authToken) throw new Error('SPARK_NOT_CONFIGURED');
    const response = await fetch(SPARK_URL, { method: 'POST', headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'generalv3', stream: false, temperature: 0.1, max_tokens: 5000, messages: [
      { role: 'system', content: '把资料整理为紧凑 Wiki。只返回JSON：{"entries":[{"title":"","summary":"","content":"","aliases":[],"keywords":[],"parent_title":null,"depth":0}],"relations":[{"source_title":"","target_title":"","relation_type":"parent|prerequisite|related|example|contrast","weight":1}]}。词条必须来自原文，禁止补造事实；最多20条。' },
      { role: 'user', content: `文件：${file.name}\n\n${content}` },
    ] }) });
    if (!response.ok) throw new Error(`SPARK_ERROR_${response.status}`);
    const structured = parseJson((await response.json()).choices?.[0]?.message?.content || '');

    // ── 事务化原子发布：先写入 staging，成功后原子切换，失败则回滚 ──
    const snapshotId = crypto.randomUUID();

    const entries = structured.entries.slice(0, 20).map((entry: any) => ({ user_id: user.id, source_file_id: file.id,
      title: clean(entry.title, 200), summary: clean(entry.summary, 1200), content: clean(entry.content, 5000),
      aliases: Array.isArray(entry.aliases) ? entry.aliases.map((x: unknown) => clean(x, 80)).filter(Boolean).slice(0, 10) : [],
      keywords: Array.isArray(entry.keywords) ? entry.keywords.map((x: unknown) => clean(x, 80)).filter(Boolean).slice(0, 15) : [],
      parent_title: entry.parent_title ? clean(entry.parent_title, 200) : null, depth: Math.max(0, Math.min(Number(entry.depth) || 0, 8)),
      snapshot_id: snapshotId, status: 'staging',
    })).filter((entry: any) => entry.title && (entry.content || entry.summary));
    if (!entries.length) throw new Error('WIKI_ENTRIES_EMPTY');

    // 写入 staging 词条
    const inserted = await supabase.from('wiki_entries').insert(entries).select('id,title');
    if (inserted.error) throw inserted.error;
    const byTitle = new Map((inserted.data || []).map((entry: any) => [entry.title, entry.id]));

    // 写入 staging 关系
    const relations = (structured.relations || []).slice(0, 60).map((relation: any) => ({ user_id: user.id,
      source_entry_id: byTitle.get(clean(relation.source_title, 200)), target_entry_id: byTitle.get(clean(relation.target_title, 200)),
      relation_type: ['parent','prerequisite','related','example','contrast'].includes(relation.relation_type) ? relation.relation_type : 'related',
      weight: Math.max(0, Math.min(Number(relation.weight) || 1, 10)),
      snapshot_id: snapshotId,
    })).filter((relation: any) => relation.source_entry_id && relation.target_entry_id && relation.source_entry_id !== relation.target_entry_id);
    if (relations.length) {
      const relationResult = await supabase.from('wiki_relations').insert(relations);
      if (relationResult.error) {
        // 回滚 staging 词条
        await supabase.rpc('rollback_wiki_snapshot', { p_user_id: user.id, p_source_file_id: file.id, p_snapshot_id: snapshotId });
        throw relationResult.error;
      }
    }

    // 原子发布：将 staging 切换为 published，归档旧版本
    const { data: publishResult, error: publishError } = await supabase.rpc('atomic_publish_wiki_snapshot', {
      p_user_id: user.id, p_source_file_id: file.id, p_snapshot_id: snapshotId,
    });
    if (publishError) {
      await supabase.rpc('rollback_wiki_snapshot', { p_user_id: user.id, p_source_file_id: file.id, p_snapshot_id: snapshotId });
      throw publishError;
    }

    // RAG chunks 直接替换（无需 staging，chunks 不参与图谱关系）
    const chunkDelete = await supabase.from('knowledge_chunks').delete().eq('user_id', user.id).eq('source_file_id', file.id);
    if (chunkDelete.error) throw chunkDelete.error;
    const chunks = chunksOf(content); const vectors = await embeddings(chunks);
    const chunkRows = chunks.map((chunk, index) => ({ user_id: user.id, source_file_id: file.id, chunk_index: index, content: chunk,
      token_estimate: Math.ceil(chunk.length / 3), embedding: vectors[index] ? `[${vectors[index]!.join(',')}]` : null,
      embedding_model: vectors[index] ? (Deno.env.get('EMBEDDING_MODEL') || 'BAAI/bge-m3') : null,
    }));
    const chunkResult = await supabase.from('knowledge_chunks').insert(chunkRows); if (chunkResult.error) throw chunkResult.error;
    const vectorCount = vectors.filter(Boolean).length;

    await supabase.from('knowledge_index_jobs').update({
      status: 'completed', wiki_count: entries.length, chunk_count: chunks.length,
      vector_count: vectorCount, updated_at: new Date().toISOString(),
    }).eq('id', jobId);

    return new Response(JSON.stringify({
      job_id: jobId, status: 'completed', snapshot_id: snapshotId,
      wiki_count: entries.length, relation_count: relations.length,
      chunk_count: chunks.length, vector_count: vectorCount,
      vector_enabled: vectorCount > 0,
      published: publishResult,
    }), { headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (jobId) await supabase.from('knowledge_index_jobs').update({ status: 'failed', error_message: message, updated_at: new Date().toISOString() }).eq('id', jobId);
    const status = error instanceof AuthError ? error.status : 500;
    return new Response(JSON.stringify({ error: message }), { status, headers });
  }
});
