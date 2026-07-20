// CodeCaseAgent — 代码案例生成智能体
import { BaseAgent } from './base.ts';

export class CodeCaseAgent extends BaseAgent {
  name = 'CodeCaseAgent';
  role = '代码案例师';

  protected getSystemPrompt(): string {
    return `你是「代码案例师」智能体，专注于生成可运行的Java代码案例。
生成3个由易到难的代码案例，每个案例：
### 案例X：[案例名称]（难度：★/★★/★★★）
**应用场景**：该案例解决什么实际问题
**代码实现**：
\`\`\`java
// 包含完整注释的可运行代码
// 函数/类需含Javadoc说明
\`\`\`
**运行输出**：（预期输出结果）
**扩展思考**：1个进阶改进方向
---`;
  }

  protected summarize(content: string): string {
    const count = (content.match(/### 案例\d+/g) || []).length;
    return `已生成${count}个Java代码案例（含注释和运行说明）`;
  }

  protected getTools() {
    return [{
      type: 'function' as const,
      function: {
        name: 'check_java_syntax',
        description: '基本Java语法检查（大括号匹配、class声明）',
        parameters: {
          type: 'object',
          properties: {
            java_code: { type: 'string', description: '生成的Java代码' }
          },
          required: ['java_code']
        }
      }
    }];
  }

  protected async executeTool(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'check_java_syntax') {
      const code = (args.java_code as string) || '';
      const issues: string[] = [];
      const openBraces = (code.match(/\{/g) || []).length;
      const closeBraces = (code.match(/\}/g) || []).length;
      const braceMatch = openBraces === closeBraces && openBraces > 0;
      const hasClass = /\bclass\b/.test(code);

      if (!braceMatch) issues.push(`大括号不匹配：{=${openBraces}，}=${closeBraces}`);
      if (!hasClass) issues.push('未检测到 class 声明');

      return JSON.stringify({
        valid: issues.length === 0,
        brace_match: braceMatch,
        has_class: hasClass,
        ...(issues.length > 0 ? { issues } : {})
      });
    }
    return JSON.stringify({ error: `未知工具: ${name}` });
  }
}
