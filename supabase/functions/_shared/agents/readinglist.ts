// ReadingListAgent — 阅读推荐智能体
import { BaseAgent } from './base.ts';

export class ReadingListAgent extends BaseAgent {
  name = 'ReadingListAgent';
  role = '资源推荐师';

  protected getSystemPrompt(): string {
    return `你是「资源推荐师」智能体，专注于推荐高质量学习资源。
生成8条精选阅读/学习清单，以Markdown表格输出：
| 序号 | 资源名称 | 类型 | 难度 | 推荐理由 |
|------|---------|------|------|---------|
类型：官方文档/书籍/博客/视频/源码/课程
难度：⭐入门 / ⭐⭐进阶 / ⭐⭐⭐高级
推荐理由：20字以内说明为什么推荐

表格后附：3条学习建议（如何高效使用这些资源）`;
  }

  protected summarize(content: string): string {
    const count = (content.match(/\|\s*\d+\s*\|/g) || []).length;
    return `已推荐${count}条精选学习资源`;
  }

  protected getTools() {
    return [{
      type: 'function' as const,
      function: {
        name: 'validate_resource_urls',
        description: '提取URL并校验格式',
        parameters: {
          type: 'object',
          properties: {
            content: { type: 'string', description: '推荐资源文本内容' }
          },
          required: ['content']
        }
      }
    }];
  }

  protected async executeTool(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'validate_resource_urls') {
      const content = (args.content as string) || '';
      const urlPattern = /https?:\/\/[^\s)]+/g;
      const urls = content.match(urlPattern) || [];
      const invalid: string[] = [];

      urls.forEach(u => {
        if (!/^https?:\/\//.test(u)) invalid.push(u);
      });

      return JSON.stringify({
        valid: invalid.length === 0,
        urls_found: urls.length,
        urls,
        invalid
      });
    }
    return JSON.stringify({ error: `未知工具: ${name}` });
  }
}
