import { describe, it, expect } from 'vitest';

function recallAtK(relevant: Set<string>, retrieved: string[], k: number): number {
  if (relevant.size === 0) return 0;
  const topK = retrieved.slice(0, k);
  const hits = topK.filter((id) => relevant.has(id)).length;
  return hits / relevant.size;
}

function precisionAtK(relevant: Set<string>, retrieved: string[], k: number): number {
  const topK = retrieved.slice(0, k);
  if (topK.length === 0) return 0;
  return topK.filter((id) => relevant.has(id)).length / topK.length;
}

function mrr(queries: { relevant: Set<string>; retrieved: string[] }[]): number {
  let sum = 0;
  for (const q of queries) {
    for (let i = 0; i < q.retrieved.length; i++) {
      if (q.relevant.has(q.retrieved[i])) { sum += 1 / (i + 1); break; }
    }
  }
  return queries.length > 0 ? sum / queries.length : 0;
}

function ndcgAtK(relevant: Set<string>, retrieved: string[], k: number): number {
  const topK = retrieved.slice(0, k);
  let dcg = 0;
  for (let i = 0; i < topK.length; i++) {
    if (relevant.has(topK[i])) dcg += 1 / Math.log2(i + 2);
  }
  const idealCount = Math.min(relevant.size, k);
  let idcg = 0;
  for (let i = 0; i < idealCount; i++) idcg += 1 / Math.log2(i + 2);
  return idcg > 0 ? dcg / idcg : 0;
}

describe('Recall@K', () => {
  it('should be 1.0 when all relevant docs are in top K', () => {
    const relevant = new Set(['a', 'b']);
    const retrieved = ['a', 'b', 'c', 'd'];
    expect(recallAtK(relevant, retrieved, 3)).toBe(1.0);
  });
  it('should be 0.5 when half relevant docs are found', () => {
    const relevant = new Set(['a', 'b']);
    const retrieved = ['a', 'c', 'd'];
    expect(recallAtK(relevant, retrieved, 3)).toBe(0.5);
  });
  it('should be 0 when no relevant docs found', () => {
    const relevant = new Set(['x', 'y']);
    const retrieved = ['a', 'b', 'c'];
    expect(recallAtK(relevant, retrieved, 3)).toBe(0);
  });
  it('should return 0 for empty relevant set', () => {
    expect(recallAtK(new Set(), ['a', 'b'], 3)).toBe(0);
  });
});

describe('Precision@K', () => {
  it('should be 1.0 when all top K are relevant', () => {
    const relevant = new Set(['a', 'b', 'c']);
    const retrieved = ['a', 'b'];
    expect(precisionAtK(relevant, retrieved, 2)).toBe(1.0);
  });
  it('should be 0.5 when half are relevant', () => {
    const relevant = new Set(['a']);
    const retrieved = ['a', 'b'];
    expect(precisionAtK(relevant, retrieved, 2)).toBe(0.5);
  });
});

describe('MRR', () => {
  it('should be 1.0 when first result is relevant', () => {
    const result = mrr([{ relevant: new Set(['a']), retrieved: ['a', 'b', 'c'] }]);
    expect(result).toBe(1.0);
  });
  it('should be 0.5 when second result is relevant', () => {
    const result = mrr([{ relevant: new Set(['b']), retrieved: ['a', 'b', 'c'] }]);
    expect(result).toBe(0.5);
  });
  it('should be 0 when no relevant found', () => {
    const result = mrr([{ relevant: new Set(['x']), retrieved: ['a', 'b'] }]);
    expect(result).toBe(0);
  });
});

describe('NDCG@K', () => {
  it('should be 1.0 for perfect ranking', () => {
    const relevant = new Set(['a', 'b']);
    const retrieved = ['a', 'b', 'c'];
    expect(ndcgAtK(relevant, retrieved, 3)).toBeCloseTo(1.0, 2);
  });
  it('should be lower for suboptimal ranking', () => {
    const relevant = new Set(['a', 'b']);
    const retrieved = ['c', 'd', 'a', 'b'];
    const score = ndcgAtK(relevant, retrieved, 4);
    expect(score).toBeLessThan(1.0);
    expect(score).toBeGreaterThan(0);
  });
  it('should return 0 for no relevant docs', () => {
    expect(ndcgAtK(new Set(), ['a', 'b'], 3)).toBe(0);
  });
});