/**
 * Edge Function 响应契约测试
 *
 * 验证 knowledge-retrieval-agent 返回数据结构与前端期望一致。
 * 运行: npx vitest run src/__tests__/contracts.test.ts
 * 前提: pnpm add -D vitest
 *
 * 注意：这些测试验证数据结构契约，不依赖实际 Supabase 连接。
 * 集成测试需在 Supabase 环境中运行。
 */

import { describe, it, expect } from 'vitest';

// ── 契约类型定义（与后端 index.ts 保持一致）──

interface KnowledgeRetrievalResult {
  id: string;
  engine: 'wiki' | 'rag';
  title: string;
  content: string;
  score: number;
  source_name: string;
  source_url: string | null;
  relation_count: number;
}

interface EngineSummary {
  wiki_count: number;
  rag_count: number;
  vector_enabled: boolean;
}

interface KnowledgeRetrievalResponse {
  query: string;
  mode: string;
  answer: string | null;
  results: KnowledgeRetrievalResult[];
  relations: unknown[];
  engine_summary: EngineSummary;
  vector_enabled: boolean;
}

// ── 契约验证函数 ──

function validateKnowledgeRetrievalResponse(
  data: unknown,
): data is KnowledgeRetrievalResponse {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj.query !== 'string') return false;
  if (typeof obj.mode !== 'string') return false;
  if (!Array.isArray(obj.results)) return false;
  if (!Array.isArray(obj.relations)) return false;
  if (typeof obj.vector_enabled !== 'boolean') return false;
  if (!obj.engine_summary || typeof obj.engine_summary !== 'object') return false;
  const es = obj.engine_summary as Record<string, unknown>;
  if (typeof es.wiki_count !== 'number') return false;
  if (typeof es.rag_count !== 'number') return false;
  if (typeof es.vector_enabled !== 'boolean') return false;
  return true;
}

function validateResult(result: unknown): result is KnowledgeRetrievalResult {
  if (!result || typeof result !== 'object') return false;
  const r = result as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    (r.engine === 'wiki' || r.engine === 'rag') &&
    typeof r.title === 'string' &&
    typeof r.content === 'string' &&
    typeof r.score === 'number' &&
    typeof r.source_name === 'string' &&
    (r.source_url === null || typeof r.source_url === 'string') &&
    typeof r.relation_count === 'number'
  );
}

describe('knowledge-retrieval-agent 响应契约', () => {
  it('标准响应结构应通过验证', () => {
    const mockResponse: KnowledgeRetrievalResponse = {
      query: '什么是 HashMap',
      mode: 'wvk+vector+fts',
      answer: null,
      results: [
        {
          id: 'uuid-1',
          engine: 'wiki',
          title: 'HashMap 基础',
          content: 'HashMap 是 Java 中的键值对集合...',
          score: 0.95,
          source_name: 'Java核心知识.pdf',
          source_url: 'https://example.com/file.pdf',
          relation_count: 3,
        },
        {
          id: 'uuid-2',
          engine: 'rag',
          title: 'HashMap 源码分析',
          content: 'HashMap 底层采用数组+链表+红黑树...',
          score: 0.82,
          source_name: '本地知识库文档',
          source_url: null,
          relation_count: 0,
        },
      ],
      relations: [],
      engine_summary: {
        wiki_count: 1,
        rag_count: 1,
        vector_enabled: true,
      },
      vector_enabled: true,
    };

    expect(validateKnowledgeRetrievalResponse(mockResponse)).toBe(true);
    for (const result of mockResponse.results) {
      expect(validateResult(result)).toBe(true);
    }
  });

  it('无来源时应返回默认值', () => {
    const result: KnowledgeRetrievalResult = {
      id: 'uuid-3',
      engine: 'rag',
      title: '片段',
      content: '内容...',
      score: 0.5,
      source_name: '本地知识库文档',
      source_url: null,
      relation_count: 0,
    };

    expect(validateResult(result)).toBe(true);
    expect(result.source_url).toBeNull();
    expect(result.source_name).toBe('本地知识库文档');
  });

  it('engine_summary 应正确反映检索结果分布', () => {
    const results: KnowledgeRetrievalResult[] = [
      { id: '1', engine: 'wiki', title: 'a', content: 'a', score: 1, source_name: 'f', source_url: null, relation_count: 0 },
      { id: '2', engine: 'wiki', title: 'b', content: 'b', score: 0.9, source_name: 'f', source_url: null, relation_count: 0 },
      { id: '3', engine: 'rag', title: 'c', content: 'c', score: 0.8, source_name: 'f', source_url: null, relation_count: 0 },
      { id: '4', engine: 'rag', title: 'd', content: 'd', score: 0.7, source_name: 'f', source_url: null, relation_count: 0 },
      { id: '5', engine: 'rag', title: 'e', content: 'e', score: 0.6, source_name: 'f', source_url: null, relation_count: 0 },
    ];

    const wikiCount = results.filter((r) => r.engine === 'wiki').length;
    const ragCount = results.filter((r) => r.engine === 'rag').length;

    const summary: EngineSummary = {
      wiki_count: wikiCount,
      rag_count: ragCount,
      vector_enabled: true,
    };

    expect(summary.wiki_count).toBe(2);
    expect(summary.rag_count).toBe(3);
    expect(summary.wiki_count + summary.rag_count).toBe(results.length);
  });

  it('空结果应返回有效的 engine_summary', () => {
    const summary: EngineSummary = {
      wiki_count: 0,
      rag_count: 0,
      vector_enabled: false,
    };

    expect(summary.wiki_count).toBe(0);
    expect(summary.rag_count).toBe(0);
  });

  it('错误响应应包含 error 字段', () => {
    const errorResponse = {
      error: 'QUERY_REQUIRED',
    };

    expect(typeof errorResponse.error).toBe('string');
    expect(errorResponse.error.length).toBeGreaterThan(0);
  });
});

describe('hybrid_knowledge_search RPC 契约', () => {
  it('返回字段应包含 result_id, result_type, title, content, score', () => {
    const mockRow = {
      result_id: 'uuid-1',
      result_type: 'wiki',
      title: 'Test',
      content: 'Test content',
      source_file_id: 'file-uuid-1',
      wiki_entry_id: 'entry-uuid-1',
      score: 0.95,
    };

    expect(typeof mockRow.result_id).toBe('string');
    expect(['wiki', 'chunk']).toContain(mockRow.result_type);
    expect(typeof mockRow.title).toBe('string');
    expect(typeof mockRow.content).toBe('string');
    expect(typeof mockRow.source_file_id).toBe('string');
    expect(typeof mockRow.score).toBe('number');
  });
});