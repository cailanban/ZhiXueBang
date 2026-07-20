// HandoutAgent — 讲义生成智能体
import { BaseAgent } from './base.ts';

export class HandoutAgent extends BaseAgent {
  name = 'HandoutAgent';
  role = '讲义编写师';

  protected getSystemPrompt(): string {
    return `你是「讲义编写师」智能体，专注于生成高质量课程讲义文档。
请生成包含以下结构的讲义（1800-2500字，Markdown格式）：
- 学习目标（3个具体可量化目标）
- 核心概念（深入讲解，配合Java代码示例）
- 应用场景（2个真实案例）
- 重点总结（5个要点）
- 常见误区（3个典型错误）
代码使用 \`\`\`java 代码块，标题清晰分级。`;
  }

  protected summarize(content: string): string {
    const wordCount = content.replace(/[^a-zA-Z\u4e00-\u9fa5]/g, '').length;
    return `已生成讲义文档（约${wordCount}字）`;
  }

  protected getTools() {
    return [{
      type: 'function' as const,
      function: {
        name: 'check_markdown_sections',
        description: '检查Markdown是否包含必要的标题层级结构',
        parameters: {
          type: 'object',
          properties: {
            markdown: { type: 'string', description: '生成的讲义Markdown内容' }
          },
          required: ['markdown']
        }
      }
    }];
  }

  protected async executeTool(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'check_markdown_sections') {
      const content = (args.markdown as string) || '';
      const h1 = (content.match(/^#\s[^#]/gm) || []).length;
      const h2 = (content.match(/^##\s[^#]/gm) || []).length;
      const h3 = (content.match(/^###\s[^#]/gm) || []).length;
      const valid = h1 >= 1 && h2 >= 2;
      return JSON.stringify({
        valid,
        h1,
        h2,
        h3,
        ...(valid ? {} : { reason: `缺少必要标题结构：需要至少1个h1（当前${h1}），至少2个h2（当前${h2}）` })
      });
    }
    return JSON.stringify({ error: `未知工具: ${name}` });
  }
}
