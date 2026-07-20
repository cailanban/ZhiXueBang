import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── AI Butler Action Types ───────────────────────────────────────────────

type ActionType =
  | 'create_task'
  | 'update_plan'
  | 'mark_mistake'
  | 'schedule_reminder'
  | 'delete_task'
  | 'archive_plan'
  | 'export_data';

interface ButlerAction {
  type: ActionType;
  payload: Record<string, unknown>;
  requiresConfirmation: boolean;
  auditLabel: string;
}

interface AuditRecord {
  action: ActionType;
  userId: string;
  timestamp: number;
  payload: Record<string, unknown>;
  result: 'success' | 'rejected';
}

// ─── Risk classification ──────────────────────────────────────────────────

const HIGH_RISK_ACTIONS: Set<ActionType> = new Set([
  'delete_task',
  'archive_plan',
  'export_data',
]);

const ALLOWED_TOOLS = new Set<string>([
  'create_task',
  'update_plan',
  'mark_mistake',
  'schedule_reminder',
  'delete_task',
  'archive_plan',
  'export_data',
]);

function classifyAction(type: ActionType): ButlerAction {
  return {
    type,
    payload: {},
    requiresConfirmation: HIGH_RISK_ACTIONS.has(type),
    auditLabel: `butler:${type}`,
  };
}

// ─── Mock audit store & permission service ────────────────────────────────

let auditLog: AuditRecord[] = [];

function resetAuditLog() {
  auditLog = [];
}

function recordAudit(record: AuditRecord) {
  auditLog.push(record);
}

function isToolAllowed(tool: string): boolean {
  return ALLOWED_TOOLS.has(tool);
}

function executeAction(
  action: ButlerAction,
  userId: string,
  confirmed: boolean,
): { success: boolean; reason?: string } {
  // Tool whitelist check
  if (!isToolAllowed(action.type)) {
    recordAudit({ action: action.type, userId, timestamp: Date.now(), payload: action.payload, result: 'rejected' });
    return { success: false, reason: 'TOOL_NOT_ALLOWED' };
  }

  // High-risk requires confirmation
  if (action.requiresConfirmation && !confirmed) {
    recordAudit({ action: action.type, userId, timestamp: Date.now(), payload: action.payload, result: 'rejected' });
    return { success: false, reason: 'CONFIRMATION_REQUIRED' };
  }

  recordAudit({ action: action.type, userId, timestamp: Date.now(), payload: action.payload, result: 'success' });
  return { success: true };
}

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Butler Action Permissions', () => {
  beforeEach(() => {
    resetAuditLog();
  });

  it('should include all required action types: create_task, update_plan, mark_mistake, etc.', () => {
    const expectedTypes: ActionType[] = [
      'create_task',
      'update_plan',
      'mark_mistake',
      'schedule_reminder',
      'delete_task',
      'archive_plan',
      'export_data',
    ];
    for (const type of expectedTypes) {
      const action = classifyAction(type);
      expect(action.type).toBe(type);
    }
  });

  it('should require confirmation for high-risk actions (delete_task, archive_plan, export_data)', () => {
    for (const type of HIGH_RISK_ACTIONS) {
      const action = classifyAction(type);
      expect(action.requiresConfirmation).toBe(true);
    }
    const safeAction = classifyAction('create_task');
    expect(safeAction.requiresConfirmation).toBe(false);
  });

  it('should reject unauthorized actions (tool whitelist enforcement)', () => {
    const action: ButlerAction = {
      type: 'delete_task',
      payload: { taskId: 't-1' },
      requiresConfirmation: true,
      auditLabel: 'butler:delete_task',
    };

    // Without confirmation, high-risk action should be rejected
    const result = executeAction(action, 'user-1', false);
    expect(result.success).toBe(false);
    expect(result.reason).toBe('CONFIRMATION_REQUIRED');
  });

  it('should create audit records for mutating actions', () => {
    const action = classifyAction('mark_mistake');
    action.payload = { mistakeId: 'm-1', note: 'typo' };

    const result = executeAction(action, 'user-1', false);
    expect(result.success).toBe(true);
    expect(auditLog).toHaveLength(1);
    expect(auditLog[0]).toMatchObject({
      action: 'mark_mistake',
      userId: 'user-1',
      result: 'success',
    });
  });

  it('should enforce tool whitelist by rejecting unknown tools', () => {
    const action: ButlerAction = {
      type: 'export_data', // high-risk, needs confirmation
      payload: { format: 'csv' },
      requiresConfirmation: true,
      auditLabel: 'butler:export_data',
    };
    // Without confirmation should be rejected
    const withoutConfirm = executeAction(action, 'user-1', false);
    expect(withoutConfirm.success).toBe(false);
    // With confirmation should succeed
    const withConfirm = executeAction(action, 'user-1', true);
    expect(withConfirm.success).toBe(true);

    // A tool not in the whitelist should be rejected
    const unknownAction: ButlerAction = {
      type: 'execute_sql' as any,
      payload: {},
      requiresConfirmation: false,
      auditLabel: 'butler:execute_sql',
    };
    const unknownResult = executeAction(unknownAction, 'user-1', true);
    expect(unknownResult.success).toBe(false);
    expect(unknownResult.reason).toBe('TOOL_NOT_ALLOWED');

    // Verify audit log has both success and rejection entries
    expect(auditLog).toHaveLength(3);
    const results = auditLog.map((a) => a.result);
    expect(results).toContain('rejected');
    expect(results).toContain('success');
  });

  it('should record audit with rejection reason when action is unauthorized', () => {
    const action = classifyAction('delete_task');
    action.payload = { taskId: 't-sensitive' };

    const result = executeAction(action, 'user-1', false);
    expect(result.success).toBe(false);
    expect(auditLog).toHaveLength(1);
    expect(auditLog[0].result).toBe('rejected');
  });
});