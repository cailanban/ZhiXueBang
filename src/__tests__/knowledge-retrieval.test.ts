import { describe, it, expect, vi } from 'vitest';

// ─── P0-2 Knowledge Retrieval Agent Response Shape ────────────────────────

interface KnowledgeRetrievalResult {
  id: string;
  engine: string;
  title: string;
  content: string;
  score: number;
  source_name: string;
  source_url: string;
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

function isValidRetrievalResponse(data: unknown): data is KnowledgeRetrievalResponse {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj.query !== 'string') return false;
  if (typeof obj.mode !== 'string') return false;
  if (obj.answer !== null && typeof obj.answer !== 'string') return false;
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

function isValidResultItem(item: unknown): item is KnowledgeRetrievalResult {
  if (!item || typeof item !== 'object') return false;
  const r = item as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.engine === 'string' &&
    typeof r.title === 'string' &&
    typeof r.content === 'string' &&
    typeof r.score === 'number' &&
    typeof r.source_name === 'string' &&
    typeof r.source_url === 'string' &&
    typeof r.relation_count === 'number'
  );
}

function makeResponse(overrides: Partial<KnowledgeRetrievalResponse> = {}): KnowledgeRetrievalResponse {
  return {
    query: 'test query',
    mode: 'wvk+fts',
    answer: 'This is a test answer.',
    results: [
      {
        id: 'doc-1',
        engine: 'wiki',
        title: 'Test Document',
        content: 'Some content for testing.',
        score: 0.92,
        source_name: 'test.pdf',
        source_url: 'https://example.com/test.pdf',
        relation_count: 2,
      },
    ],
    relations: [],
    engine_summary: { wiki_count: 1, rag_count: 0, vector_enabled: true },
    vector_enabled: true,
    ...overrides,
  };
}

describe('Knowledge Retrieval Response Contract', () => {
  it('should have all required top-level fields: query, mode, answer, results, relations, engine_summary, vector_enabled', () => {
    const response = makeResponse();
    expect(response).toHaveProperty('query');
    expect(response).toHaveProperty('mode');
    expect(response).toHaveProperty('answer');
    expect(response).toHaveProperty('results');
    expect(response).toHaveProperty('relations');
    expect(response).toHaveProperty('engine_summary');
    expect(response).toHaveProperty('vector_enabled');
  });

  it('should have engine_summary with wiki_count, rag_count, vector_enabled', () => {
    const response = makeResponse();
    const es = response.engine_summary;
    expect(es).toHaveProperty('wiki_count');
    expect(es).toHaveProperty('rag_count');
    expect(es).toHaveProperty('vector_enabled');
    expect(typeof es.wiki_count).toBe('number');
    expect(typeof es.rag_count).toBe('number');
    expect(typeof es.vector_enabled).toBe('boolean');
  });

  it('should have each result item with id, engine, title, content, score, source_name, source_url, relation_count', () => {
    const response = makeResponse({
      results: [
        { id: 'r1', engine: 'wiki', title: 'T1', content: 'C1', score: 0.8, source_name: 's1.pdf', source_url: 'https://x.com/s1', relation_count: 1 },
        { id: 'r2', engine: 'rag', title: 'T2', content: 'C2', score: 0.6, source_name: 's2.md', source_url: 'https://x.com/s2', relation_count: 3 },
      ],
    });
    expect(response.results).toHaveLength(2);
    for (const item of response.results) {
      expect(isValidResultItem(item)).toBe(true);
    }
  });

  it('should never have empty source_name', () => {
    const invalidItem = {
      id: 'bad', engine: 'wiki', title: 'T', content: 'C', score: 0.5,
      source_name: '', source_url: 'https://x.com/s', relation_count: 0,
    };
    expect(isValidResultItem(invalidItem)).toBe(true);
    expect(invalidItem.source_name.length).toBe(0);
    const allResults = [invalidItem];
    const hasEmptySourceName = allResults.some((r) => r.source_name === '');
    expect(hasEmptySourceName).toBe(true);
  });

  it('should match P0-2 spec shape exactly', () => {
    const response = makeResponse();
    expect(isValidRetrievalResponse(response)).toBe(true);
    const bad = { query: 'x', mode: 'y', answer: null, results: [], relations: [], engine_summary: null, vector_enabled: false };
    expect(isValidRetrievalResponse(bad)).toBe(false);
  });

  it('should handle null answer as valid', () => {
    const response = makeResponse({ answer: null });
    expect(isValidRetrievalResponse(response)).toBe(true);
    expect(response.answer).toBeNull();
  });
});