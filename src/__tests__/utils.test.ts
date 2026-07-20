/**
 * 工具函数与边缘情况测试
 *
 * 运行: npx vitest run src/__tests__/utils.test.ts
 * 前提: pnpm add -D vitest
 */

import { describe, it, expect } from 'vitest';
import { cn, createQueryString, formatDate } from '../lib/utils';

describe('cn (className 合并)', () => {
  it('应合并多个 className', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
  });

  it('应过滤 false/null/undefined', () => {
    expect(cn('text-red-500', false && 'hidden', undefined, null)).toBe(
      'text-red-500',
    );
  });

  it('应处理 Tailwind 冲突（twMerge）', () => {
    // px-4 和 px-2 冲突，后者应覆盖前者
    expect(cn('px-4', 'px-2')).toBe('px-2');
  });

  it('应处理空输入', () => {
    expect(cn()).toBe('');
  });
});

describe('createQueryString', () => {
  it('应设置新的查询参数', () => {
    const result = createQueryString(
      { page: 1, limit: 10 },
      new URLSearchParams(),
    );
    expect(result).toBe('page=1&limit=10');
  });

  it('应保留已有参数并覆盖同名参数', () => {
    const existing = new URLSearchParams('page=1&sort=asc');
    const result = createQueryString({ page: 2 }, existing);
    expect(result).toBe('page=2&sort=asc');
  });

  it('应删除值为 null/undefined 的参数', () => {
    const existing = new URLSearchParams('page=1&limit=10');
    const result = createQueryString({ limit: null }, existing);
    expect(result).toBe('page=1');
  });

  it('应处理空参数', () => {
    const result = createQueryString({}, new URLSearchParams('page=1'));
    expect(result).toBe('page=1');
  });
});

describe('formatDate', () => {
  it('应格式化日期为中文', () => {
    const result = formatDate('2026-07-15');
    expect(result).toContain('2026');
    expect(result).toContain('7');
    expect(result).toContain('15');
  });

  it('应支持自定义格式选项', () => {
    const result = formatDate('2026-07-15', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    expect(result).toMatch(/2026/);
  });

  it('应处理 Date 对象', () => {
    const result = formatDate(new Date(2026, 6, 15));
    expect(result).toContain('2026');
  });
});