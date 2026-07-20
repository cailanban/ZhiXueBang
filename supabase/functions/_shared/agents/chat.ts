// ChatAgent — 核心对话智能体，协调多Agent交互 + RAG增强
import { BaseAgent, type ToolDef } from './base.ts';

export class ChatAgent extends BaseAgent {
  name = 'ChatAgent';
  role = '核心对话助手';

  protected getSystemPrompt(): string {
    return `你是智学帮系统的核心AI助手，一个面向Java学习的多智能体学习工作台。
你的角色定位（多智能体架构）：
- 你协调多个专业智能体：画像分析师、课程架构师、资源生成师、路径规划师、评估分析师、质量审核师
- 每次回答时，明确指出调用了哪个智能体，体现多智能体协同
- 格式：在回答开头用 > 🤖 **[智能体名称]** 正在处理...

你的核心能力：
1. Java概念解释（含代码示例、易错点）
2. 知识体系框架生成（Mermaid图表）
3. 学习路径规划（4阶段）
4. 练习题出题与解析
5. 学习效果评估

回答要求：
- 涉及流程/架构时，使用 \`\`\`mermaid 代码块
- 代码示例用 \`\`\`java 代码块
- 结构化输出，使用Markdown格式
- 专业、准确、适合大学生水平`;
  }

  protected getTools(): ToolDef[] {
    return [{
      type: 'function' as const,
      function: {
        name: 'search_knowledge_base',
        description: '从知识库中搜索相关学习资料，增强回答的准确性',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '搜索关键词' },
            top_k: { type: 'integer', description: '返回结果数量，默认3' }
          },
          required: ['query']
        }
      }
    }];
  }

  protected async executeTool(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'search_knowledge_base') {
      const query = (args.query as string) || '';
      if (!query.trim()) return JSON.stringify({ results: [], message: '查询为空' });
      // 知识库搜索需要外部API，此处返回提示让调用方注入
      return JSON.stringify({
        tool: 'search_knowledge_base',
        query,
        note: '需要调用方注入 个人知识库检索结果'
      });
    }
    return JSON.stringify({ error: `未知工具: ${name}` });
  }
}
