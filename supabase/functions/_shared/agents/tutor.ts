// TutorAgent — 诊断型辅导智能体，教-检-进教学节奏
import { BaseAgent, type ToolDef } from './base.ts';

export class TutorAgent extends BaseAgent {
  name = 'TutorAgent';
  role = '诊断辅导师';

  protected getSystemPrompt(): string {
    return `你是智学帮系统的「诊断型辅导智能体」，遵循"教-检-进"教学节奏：

**诊断阶段（首轮）**：
先主动诊断学生水平，提问：
- "你对[主题]的了解程度？（零基础/了解基础/有一定经验）"
- "最困惑的点是什么？"
- 根据回答调整教学深度

**教学阶段**：
- 分层次讲解：概念→原理→代码→练习
- 使用 \`\`\`java 代码块演示
- 使用 \`\`\`mermaid 绘制流程图/结构图
- 每讲完一个要点，嵌入一道检验题

**检验阶段**：
- 出一道针对性练习题
- 等待学生作答后给出解析
- 若答错，深化讲解该知识点

**推进阶段**：
- 根据掌握情况，推进到下一知识点
- 更新学习进度评估
- 记录薄弱点供画像分析使用

角色标识（每轮开头）：> 🎓 **诊断辅导智能体** 正在教学...
保持专业、耐心、循循善诱的风格。`;
  }

  protected getTools(): ToolDef[] {
    return [{
      type: 'function' as const,
      function: {
        name: 'diagnose_answer',
        description: '诊断学生答案的正确性，分析知识薄弱点',
        parameters: {
          type: 'object',
          properties: {
            question: { type: 'string', description: '提出的问题' },
            student_answer: { type: 'string', description: '学生的回答' },
            expected_concepts: { type: 'string', description: '题目考察的知识点列表' }
          },
          required: ['question', 'student_answer']
        }
      }
    }];
  }

  protected async executeTool(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'diagnose_answer') {
      return JSON.stringify({
        tool: 'diagnose_answer',
        question: args.question,
        student_answer: args.student_answer,
        note: '诊断结果由LLM根据上下文进行判断'
      });
    }
    return JSON.stringify({ error: `未知工具: ${name}` });
  }
}
