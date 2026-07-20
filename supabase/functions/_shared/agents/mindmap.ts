// MindmapAgent — 思维导图生成智能体
import { BaseAgent } from './base.ts';

export class MindmapAgent extends BaseAgent {
  name = 'MindmapAgent';
  role = '思维导图师';

  protected getSystemPrompt(): string {
    return `你是「思维导图师」智能体，专注于生成Mermaid格式思维导图。
严格规则：
1. 只输出Mermaid代码块（\`\`\`mermaid ... \`\`\`）
2. 使用mindmap格式
3. 3-4层结构，20-35个节点
4. 每个节点文字≤15字
5. 涵盖所有核心知识点
示例：
\`\`\`mermaid
mindmap
  root((主题))
    模块A
      子点1
      子点2
    模块B
      子点3
\`\`\``;
  }

  protected summarize(content: string): string {
    const nodeCount = (content.match(/\n\s+\S/g) || []).length;
    return `已生成思维导图（约${nodeCount}个节点）`;
  }

  protected getTools() {
    return [{
      type: 'function' as const,
      function: {
        name: 'validate_mermaid_syntax',
        description: '校验Mermaid基本语法（graph/mindmap关键字、括号匹配）',
        parameters: {
          type: 'object',
          properties: {
            mermaid_code: { type: 'string', description: 'Mermaid代码块内容' }
          },
          required: ['mermaid_code']
        }
      }
    }];
  }

  protected async executeTool(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'validate_mermaid_syntax') {
      const code = (args.mermaid_code as string) || '';
      const issues: string[] = [];

      let mermaidType = 'unknown';
      if (/\bmindmap\b/.test(code)) mermaidType = 'mindmap';
      else if (/\bgraph\b/i.test(code)) mermaidType = 'graph';
      else if (/\bflowchart\b/i.test(code)) mermaidType = 'graph';
      else issues.push('未检测到 graph/mindmap/flowchart 关键字');

      const openBrackets = (code.match(/\(/g) || []).length + (code.match(/\[/g) || []).length + (code.match(/\{/g) || []).length;
      const closeBrackets = (code.match(/\)/g) || []).length + (code.match(/\]/g) || []).length + (code.match(/\}/g) || []).length;
      if (openBrackets !== closeBrackets) {
        issues.push(`括号不匹配：开括号${openBrackets}个，闭括号${closeBrackets}个`);
      }

      return JSON.stringify({
        valid: issues.length === 0,
        type: mermaidType,
        ...(issues.length > 0 ? { issues } : {})
      });
    }
    return JSON.stringify({ error: `未知工具: ${name}` });
  }
}
