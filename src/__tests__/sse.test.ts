/**
 * SSE 分段解析与中断测试
 *
 * 运行: npx vitest run src/__tests__/sse.test.ts
 * 前提: pnpm add -D vitest
 */

import { describe, it, expect, vi } from 'vitest';
import { consumeSse, type SseMessage } from '../lib/sse';

/** 将字符串转为 ReadableStream<Uint8Array> 用于测试 */
function textStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(encoder.encode(chunks[index]));
        index++;
      } else {
        controller.close();
      }
    },
  });
}

describe('consumeSse', () => {
  it('应正确解析标准 SSE 事件', async () => {
    const messages: SseMessage[] = [];
    const stream = textStream([
      'event: delta\ndata: {"content":"Hello"}\n\n',
      'event: delta\ndata: {"content":" World"}\n\n',
      'event: done\ndata: [DONE]\n\n',
    ]);

    await consumeSse(stream, (msg) => {
      messages.push(msg);
    });

    expect(messages).toHaveLength(3);
    expect(messages[0]).toEqual({
      event: 'delta',
      data: '{"content":"Hello"}',
    });
    expect(messages[1]).toEqual({
      event: 'delta',
      data: '{"content":" World"}',
    });
    expect(messages[2]).toEqual({
      event: 'done',
      data: '[DONE]',
    });
  });

  it('应正确处理跨 chunk 的 SSE 数据（分段到达）', async () => {
    const messages: SseMessage[] = [];
    // 模拟一个完整事件被拆成多个 chunk
    const stream = textStream([
      'event: delta\nda',
      'ta: {"content":"Split',
      ' message"}\n\n',
    ]);

    await consumeSse(stream, (msg) => {
      messages.push(msg);
    });

    expect(messages).toHaveLength(1);
    expect(messages[0].event).toBe('delta');
    expect(messages[0].data).toBe('{"content":"Split message"}');
  });

  it('应正确处理空 data 事件', async () => {
    const messages: SseMessage[] = [];
    const stream = textStream([
      'event: heartbeat\ndata:\n\n',
    ]);

    await consumeSse(stream, (msg) => {
      messages.push(msg);
    });

    expect(messages).toHaveLength(1);
    expect(messages[0].event).toBe('heartbeat');
    expect(messages[0].data).toBe('');
  });

  it('应忽略注释行（以 : 开头的行）', async () => {
    const messages: SseMessage[] = [];
    const stream = textStream([
      ': this is a comment\n',
      'event: delta\ndata: real data\n\n',
    ]);

    await consumeSse(stream, (msg) => {
      messages.push(msg);
    });

    expect(messages).toHaveLength(1);
    expect(messages[0].data).toBe('real data');
  });

  it('应正确处理多行 data', async () => {
    const messages: SseMessage[] = [];
    const stream = textStream([
      'event: message\ndata: line1\ndata: line2\ndata: line3\n\n',
    ]);

    await consumeSse(stream, (msg) => {
      messages.push(msg);
    });

    expect(messages).toHaveLength(1);
    expect(messages[0].data).toBe('line1\nline2\nline3');
  });

  it('应正确处理事件 ID', async () => {
    const messages: SseMessage[] = [];
    const stream = textStream([
      'id: 42\nevent: delta\ndata: test\n\n',
    ]);

    await consumeSse(stream, (msg) => {
      messages.push(msg);
    });

    expect(messages).toHaveLength(1);
    expect(messages[0].id).toBe('42');
  });

  it('应正确处理连续多个事件', async () => {
    const messages: SseMessage[] = [];
    // 一个 chunk 包含多个完整事件
    const stream = textStream([
      'event: delta\ndata: first\n\nevent: delta\ndata: second\n\nevent: done\ndata: [DONE]\n\n',
    ]);

    await consumeSse(stream, (msg) => {
      messages.push(msg);
    });

    expect(messages).toHaveLength(3);
    expect(messages.map((m) => m.data)).toEqual(['first', 'second', '[DONE]']);
  });

  it('flow 流式输出: delta 追加 + done 结束', async () => {
    // 模拟真实的流式 AI 输出场景
    const messages: SseMessage[] = [];
    const stream = textStream([
      'event: delta\ndata: 你好\n\n',
      'event: delta\ndata: ，我是\n\n',
      'event: delta\ndata: AI助手\n\n',
      'event: done\ndata: [DONE]\n\n',
    ]);

    await consumeSse(stream, (msg) => {
      messages.push(msg);
    });

    const fullText = messages
      .filter((m) => m.event === 'delta')
      .map((m) => m.data)
      .join('');
    expect(fullText).toBe('你好，我是AI助手');
    expect(messages[messages.length - 1].event).toBe('done');
  });

  it('应正确处理空流', async () => {
    const messages: SseMessage[] = [];
    const stream = textStream([]);

    await consumeSse(stream, (msg) => {
      messages.push(msg);
    });

    expect(messages).toHaveLength(0);
  });

  it('buffer 末尾无换行时应在流结束后 dispatch', async () => {
    const messages: SseMessage[] = [];
    // 最后一个事件没有尾随 \n\n
    const stream = textStream([
      'event: delta\ndata: incomplete',
    ]);

    await consumeSse(stream, (msg) => {
      messages.push(msg);
    });

    expect(messages).toHaveLength(1);
    expect(messages[0].data).toBe('incomplete');
  });
});