// BaseAgent — 所有智能体的基类
// 支持 DeepSeek function_call 工具调用机制，满足元宝"真·多智能体"标准

export interface AgentOutput {
  agent: string;
  status: 'success' | 'error';
  summary: string;
  content: string;
  duration_ms: number;
  tool_calls?: { name: string; args: Record<string, unknown>; result: string }[];
}

export interface AgentOptions {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  responseFormat?: 'text' | 'json';
}

export interface ToolDef {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, { type: string; description: string; enum?: string[]; items?: Record<string, unknown> }>;
      required: string[];
    };
  };
}

const DS_URL = 'https://api.deepseek.com/v1/chat/completions';
const MAX_TOOL_ROUNDS = 2; // 最多2轮工具调用，防止无限循环

export abstract class BaseAgent {
  abstract name: string;
  abstract role: string;

  // ── 子类覆盖：专属工具定义 ────────────────
  protected getTools(): ToolDef[] {
    return [];
  }

  // ── 子类覆盖：工具执行器 ────────────────
  protected async executeTool(_name: string, _args: Record<string, unknown>): Promise<string> {
    return JSON.stringify({ error: `工具 ${_name} 未实现` });
  }

  async run(input: string, opts: AgentOptions): Promise<AgentOutput> {
    const start = Date.now();
    const model = opts.model ?? 'deepseek-chat';
    const maxTokens = opts.maxTokens ?? 2048;
    const tools = this.getTools();
    const toolCallsLog: { name: string; args: Record<string, unknown>; result: string }[] = [];

    console.log(`[Agent:${this.name}] ▶ 开始执行 | 角色=${this.role} | 模型=${model} | maxTokens=${maxTokens} | 工具=${tools.map(t => t.function.name).join(',') || '无'}`);

    try {
      const messages: Array<{ role: string; content?: string; tool_calls?: unknown[]; tool_call_id?: string; name?: string }> = [
        { role: 'system', content: this.getSystemPrompt() },
        { role: 'user', content: input },
      ];

      let content = '';
      let round = 0;
      let lastData: Record<string, unknown> | null = null;

      while (round <= MAX_TOOL_ROUNDS) {
        round++;
        const body: Record<string, unknown> = {
          model,
          messages,
          max_tokens: maxTokens,
          temperature: opts.temperature ?? 0.7,
        };

        if (opts.responseFormat === 'json') {
          body.response_format = { type: 'json_object' };
        }

        // 只在有工具时注入 tools 参数
        if (tools.length > 0) {
          body.tools = tools;
          body.tool_choice = 'auto';
        }

        console.log(`[Agent:${this.name}] 第${round}轮 → DeepSeek API${tools.length > 0 ? ' (带工具)' : ''}`);

        const res = await fetch(DS_URL, {
          method: 'POST',
          headers: { Authorization: `Bearer ${opts.apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        lastData = data;
        if (!res.ok) throw new Error(data.error?.message ?? 'DeepSeek error');

        const choiceMsg = data.choices?.[0]?.message;

        // 如果有工具调用，执行工具并追加到消息
        if (choiceMsg?.tool_calls && choiceMsg.tool_calls.length > 0) {
          messages.push(choiceMsg); // 追加 assistant 消息含 tool_calls

          for (const tc of choiceMsg.tool_calls) {
            const toolName = tc.function?.name ?? 'unknown';
            let toolArgs: Record<string, unknown> = {};
            try { toolArgs = JSON.parse(tc.function?.arguments ?? '{}'); } catch { /**/ }

            console.log(`[Agent:${this.name}] 🔧 调用工具: ${toolName}(${JSON.stringify(toolArgs).slice(0, 120)})`);

            let toolResult: string;
            try {
              toolResult = await this.executeTool(toolName, toolArgs);
            } catch (e) {
              toolResult = JSON.stringify({ error: `工具执行异常: ${String(e)}` });
            }

            toolCallsLog.push({ name: toolName, args: toolArgs, result: toolResult });

            messages.push({
              role: 'tool',
              tool_call_id: tc.id ?? `call_${toolName}`,
              name: toolName,
              content: toolResult,
            });
          }

          console.log(`[Agent:${this.name}] 第${round}轮 工具执行完成，继续请求`);
          continue; // 调完工具后，继续下一轮让 LLM 基于工具结果回答
        }

        // 无工具调用 → 获得最终回复
        content = choiceMsg?.content ?? '';
        break;
      }

      const usage = (lastData as Record<string, unknown>)?.usage ?? {};
      const duration_ms = Date.now() - start;

      console.log(`[Agent:${this.name}] ✅ 执行成功 | 耗时=${duration_ms}ms | 轮次=${round} | tokens(prompt=${usage.prompt_tokens ?? '?'}, completion=${usage.completion_tokens ?? '?'}) | 工具调用=${toolCallsLog.length}次`);

      return {
        agent: this.name,
        status: 'success',
        summary: this.summarize(content),
        content,
        duration_ms,
        tool_calls: toolCallsLog.length > 0 ? toolCallsLog : undefined,
      };
    } catch (e) {
      const duration_ms = Date.now() - start;
      console.error(`[Agent:${this.name}] ❌ 执行失败 | 耗时=${duration_ms}ms | 错误=${String(e)}`);
      return {
        agent: this.name,
        status: 'error',
        summary: `执行失败：${String(e)}`,
        content: '',
        duration_ms,
      };
    }
  }

  protected abstract getSystemPrompt(): string;

  protected summarize(content: string): string {
    const plain = content.replace(/[#*`>\n]/g, ' ').replace(/\s+/g, ' ').trim();
    return plain.length > 80 ? plain.slice(0, 80) + '…' : plain;
  }
}
