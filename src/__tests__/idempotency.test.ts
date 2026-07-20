import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Learning Event Idempotency ───────────────────────────────────────────

interface LearningEvent {
  event_id: string;
  user_id: string;
  session_id: string;
  event_type: 'page_view' | 'quiz_submit' | 'note_create' | 'resource_open';
  payload: Record<string, unknown>;
  timestamp: number;
}

interface EventStore {
  addEvent(event: LearningEvent): { success: boolean; reason?: string };
  getEvents(): LearningEvent[];
}

function createEventStore(): EventStore {
  const events: LearningEvent[] = [];
  const idempotencyKeys = new Set<string>();
  const sessionIds = new Set<string>();

  return {
    addEvent(event: LearningEvent): { success: boolean; reason?: string } {
      const idempotencyKey = `${event.event_id}::${event.user_id}`;
      if (idempotencyKeys.has(idempotencyKey)) {
        return { success: false, reason: 'DUPLICATE_IDEMPOTENCY_KEY' };
      }
      if (sessionIds.has(event.session_id)) {
        return { success: false, reason: 'DUPLICATE_SESSION_ID' };
      }
      idempotencyKeys.add(idempotencyKey);
      sessionIds.add(event.session_id);
      events.push(event);
      return { success: true };
    },
    getEvents(): LearningEvent[] {
      return [...events];
    },
  };
}

function makeEvent(overrides: Partial<LearningEvent> = {}): LearningEvent {
  return {
    event_id: 'evt-001',
    user_id: 'user-alice',
    session_id: 'sess-001',
    event_type: 'page_view',
    payload: { page: '/learn/react' },
    timestamp: Date.now(),
    ...overrides,
  };
}

describe('Learning Event Idempotency', () => {
  let store: EventStore;

  beforeEach(() => {
    store = createEventStore();
  });

  it('should reject duplicate session_id events', () => {
    const e1 = makeEvent({ session_id: 'sess-dup' });
    const e2 = makeEvent({ event_id: 'evt-002', session_id: 'sess-dup' });
    expect(store.addEvent(e1).success).toBe(true);
    const r2 = store.addEvent(e2);
    expect(r2.success).toBe(false);
    expect(r2.reason).toBe('DUPLICATE_SESSION_ID');
  });

  it('should enforce unique event_id + user_id combination', () => {
    const e1 = makeEvent({ event_id: 'evt-unique', user_id: 'user-alice', session_id: 'sess-a' });
    const e2 = makeEvent({ event_id: 'evt-unique', user_id: 'user-alice', session_id: 'sess-b' });
    expect(store.addEvent(e1).success).toBe(true);
    const r2 = store.addEvent(e2);
    expect(r2.success).toBe(false);
    expect(r2.reason).toBe('DUPLICATE_IDEMPOTENCY_KEY');
  });

  it('should allow same event_id with different user_id', () => {
    const e1 = makeEvent({ event_id: 'evt-shared', user_id: 'user-alice', session_id: 'sess-a' });
    const e2 = makeEvent({ event_id: 'evt-shared', user_id: 'user-bob', session_id: 'sess-b' });
    expect(store.addEvent(e1).success).toBe(true);
    expect(store.addEvent(e2).success).toBe(true);
    expect(store.getEvents()).toHaveLength(2);
  });

  it('should use idempotency key to prevent double writes', () => {
    const event = makeEvent({ session_id: 'sess-idem' });
    expect(store.addEvent(event).success).toBe(true);
    expect(store.getEvents()).toHaveLength(1);
    const duplicate = makeEvent({ session_id: 'sess-different' });
    duplicate.event_id = event.event_id;
    duplicate.user_id = event.user_id;
    expect(store.addEvent(duplicate).success).toBe(false);
    expect(store.getEvents()).toHaveLength(1);
  });

  it('should handle different event types with same event_id correctly', () => {
    const e1 = makeEvent({ event_id: 'evt-type', event_type: 'page_view', user_id: 'user-alice', session_id: 'sess-a' });
    const e2 = makeEvent({ event_id: 'evt-type', event_type: 'quiz_submit', user_id: 'user-alice', session_id: 'sess-b' });
    expect(store.addEvent(e1).success).toBe(true);
    const r2 = store.addEvent(e2);
    expect(r2.success).toBe(false);
    expect(r2.reason).toBe('DUPLICATE_IDEMPOTENCY_KEY');
  });

  it('should allow different event types with different event_ids', () => {
    const e1 = makeEvent({ event_id: 'evt-page', event_type: 'page_view', session_id: 'sess-a' });
    const e2 = makeEvent({ event_id: 'evt-quiz', event_type: 'quiz_submit', session_id: 'sess-b' });
    expect(store.addEvent(e1).success).toBe(true);
    expect(store.addEvent(e2).success).toBe(true);
    expect(store.getEvents()).toHaveLength(2);
  });
});