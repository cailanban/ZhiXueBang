import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── RLS (Row-Level Security) Policy Tests ────────────────────────────────

interface KnowledgeEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: number;
}

interface WikiEntry {
  id: string;
  user_id: string;
  title: string;
  body: string;
  updated_at: number;
}

interface LearningTask {
  id: string;
  user_id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'done';
}

type Role = 'authenticated' | 'service_role';

interface RlsContext {
  userId: string;
  role: Role;
}

interface RlsStore {
  getKnowledgeEntries(ctx: RlsContext): KnowledgeEntry[];
  getWikiEntries(ctx: RlsContext): WikiEntry[];
  getLearningTasks(ctx: RlsContext): LearningTask[];
  updateWikiEntry(ctx: RlsContext, entryId: string, update: Partial<WikiEntry>): { success: boolean; reason?: string };
}

function createRlsStore(): RlsStore {
  const knowledge: KnowledgeEntry[] = [
    { id: 'k-alice', user_id: 'user-alice', title: 'Alice Notes', content: 'Alice content', created_at: 1000 },
    { id: 'k-bob', user_id: 'user-bob', title: 'Bob Notes', content: 'Bob content', created_at: 2000 },
  ];

  const wiki: WikiEntry[] = [
    { id: 'w-alice', user_id: 'user-alice', title: 'Alice Wiki', body: 'Alice wiki body', updated_at: 1000 },
    { id: 'w-bob', user_id: 'user-bob', title: 'Bob Wiki', body: 'Bob wiki body', updated_at: 2000 },
  ];

  const tasks: LearningTask[] = [
    { id: 't-alice', user_id: 'user-alice', name: 'Alice Task', status: 'pending' },
    { id: 't-bob', user_id: 'user-bob', name: 'Bob Task', status: 'in_progress' },
  ];

  function canAccess(ctx: RlsContext, resourceUserId: string): boolean {
    if (ctx.role === 'service_role') return true;
    return ctx.userId === resourceUserId;
  }

  return {
    getKnowledgeEntries(ctx: RlsContext): KnowledgeEntry[] {
      return knowledge.filter((e) => canAccess(ctx, e.user_id));
    },
    getWikiEntries(ctx: RlsContext): WikiEntry[] {
      return wiki.filter((e) => canAccess(ctx, e.user_id));
    },
    getLearningTasks(ctx: RlsContext): LearningTask[] {
      return tasks.filter((t) => canAccess(ctx, t.user_id));
    },
    updateWikiEntry(ctx: RlsContext, entryId: string, update: Partial<WikiEntry>): { success: boolean; reason?: string } {
      const entry = wiki.find((e) => e.id === entryId);
      if (!entry) return { success: false, reason: 'NOT_FOUND' };
      if (!canAccess(ctx, entry.user_id)) {
        return { success: false, reason: 'RLS_DENIED' };
      }
      Object.assign(entry, update);
      return { success: true };
    },
  };
}

describe('RLS Policy', () => {
  let store: RlsStore;

  beforeEach(() => {
    store = createRlsStore();
  });

  it('should prevent user A from reading user B knowledge entries', () => {
    const aliceCtx: RlsContext = { userId: 'user-alice', role: 'authenticated' };
    const entries = store.getKnowledgeEntries(aliceCtx);
    expect(entries).toHaveLength(1);
    expect(entries[0].user_id).toBe('user-alice');
    expect(entries.every((e) => e.user_id === 'user-alice')).toBe(true);
  });

  it('should prevent user A from modifying user B wiki entries', () => {
    const aliceCtx: RlsContext = { userId: 'user-alice', role: 'authenticated' };
    const result = store.updateWikiEntry(aliceCtx, 'w-bob', { title: 'Hacked' });
    expect(result.success).toBe(false);
    expect(result.reason).toBe('RLS_DENIED');
  });

  it('should prevent user A from seeing user B learning tasks', () => {
    const aliceCtx: RlsContext = { userId: 'user-alice', role: 'authenticated' };
    const tasks = store.getLearningTasks(aliceCtx);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].user_id).toBe('user-alice');
    expect(tasks.find((t) => t.user_id === 'user-bob')).toBeUndefined();
  });

  it('should allow service_role to bypass RLS and read all entries', () => {
    const serviceCtx: RlsContext = { userId: 'service', role: 'service_role' };
    const knowledge = store.getKnowledgeEntries(serviceCtx);
    expect(knowledge).toHaveLength(2);
    expect(knowledge.map((k) => k.user_id)).toEqual(['user-alice', 'user-bob']);
    const wiki = store.getWikiEntries(serviceCtx);
    expect(wiki).toHaveLength(2);
    const tasks = store.getLearningTasks(serviceCtx);
    expect(tasks).toHaveLength(2);
  });

  it('should allow service_role to modify any wiki entry', () => {
    const serviceCtx: RlsContext = { userId: 'service', role: 'service_role' };
    const result = store.updateWikiEntry(serviceCtx, 'w-bob', { title: 'Service Updated' });
    expect(result.success).toBe(true);
    const wiki = store.getWikiEntries(serviceCtx);
    const updated = wiki.find((w) => w.id === 'w-bob');
    expect(updated?.title).toBe('Service Updated');
  });

  it('should allow user A to read and modify their own entries', () => {
    const aliceCtx: RlsContext = { userId: 'user-alice', role: 'authenticated' };
    const entries = store.getKnowledgeEntries(aliceCtx);
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe('k-alice');
    const result = store.updateWikiEntry(aliceCtx, 'w-alice', { title: 'Alice Updated' });
    expect(result.success).toBe(true);
    const wiki = store.getWikiEntries(aliceCtx);
    expect(wiki[0].title).toBe('Alice Updated');
  });
});