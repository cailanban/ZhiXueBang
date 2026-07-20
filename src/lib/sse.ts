export interface SseMessage {
  event: string;
  data: string;
  id?: string;
}

/**
 * Incrementally parses an SSE response without assuming that a network chunk
 * contains complete lines or events.
 */
export async function consumeSse(
  body: ReadableStream<Uint8Array>,
  onMessage: (message: SseMessage) => void | Promise<void>,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let eventName = 'message';
  let eventId: string | undefined;
  let dataLines: string[] = [];

  const dispatch = async () => {
    if (dataLines.length === 0) return;
    await onMessage({
      event: eventName,
      data: dataLines.join('\n'),
      id: eventId,
    });
    eventName = 'message';
    eventId = undefined;
    dataLines = [];
  };

  const processLine = async (line: string) => {
    if (line === '') {
      await dispatch();
      return;
    }
    if (line.startsWith(':')) return;

    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? '' : line.slice(colon + 1);
    if (value.startsWith(' ')) value = value.slice(1);

    if (field === 'event') eventName = value || 'message';
    else if (field === 'data') dataLines.push(value);
    else if (field === 'id') eventId = value;
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });

      let newline = buffer.indexOf('\n');
      while (newline !== -1) {
        const rawLine = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        await processLine(rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine);
        newline = buffer.indexOf('\n');
      }

      if (done) break;
    }

    if (buffer.length > 0) {
      await processLine(buffer.endsWith('\r') ? buffer.slice(0, -1) : buffer);
    }
    await dispatch();
  } finally {
    reader.releaseLock();
  }
}
