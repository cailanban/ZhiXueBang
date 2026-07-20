// QuizAgent — 题库生成智能体
import { BaseAgent } from './base.ts';

export class QuizAgent extends BaseAgent {
  name = 'QuizAgent';
  role = '题库出题师';

  protected getSystemPrompt(): string {
    return `你是「题库出题师」智能体，专注于生成高质量练习题。
生成10道题目，难度分布：简单3道、中等5道、难2道。
包含类型：单选题、多选题、判断题、填空题、简答题。
每题格式：
### 第X题（类型）[难度：简单/中等/难]
题目内容
A. 选项1（多选/单选题才有）
**答案**：答案内容
**解析**：100-150字详细解析，重点分析错误选项的原因
---`;
  }

  protected summarize(content: string): string {
    const count = (content.match(/### 第\d+题/g) || []).length;
    return `已生成${count}道练习题（含详细解析）`;
  }

  protected getTools() {
    return [{
      type: 'function' as const,
      function: {
        name: 'validate_quiz_format',
        description: '统计题目数量、检查每题是否有答案标记和解析',
        parameters: {
          type: 'object',
          properties: {
            quiz_content: { type: 'string', description: '生成的题目内容' }
          },
          required: ['quiz_content']
        }
      }
    }];
  }

  protected async executeTool(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'validate_quiz_format') {
      const content = (args.quiz_content as string) || '';
      const questions = (content.match(/### 第\d+题/g) || []).length;
      const withAnswer = (content.match(/\*\*答案\*\*/g) || []).length;
      const withAnalysis = (content.match(/\*\*解析\*\*/g) || []).length;
      return JSON.stringify({
        valid: questions > 0 && withAnswer === questions && withAnalysis === questions,
        questions,
        with_answer: withAnswer,
        with_analysis: withAnalysis
      });
    }
    return JSON.stringify({ error: `未知工具: ${name}` });
  }
}
