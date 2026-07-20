// ProfileAgent — 学习画像分析智能体，基于多维数据构建用户画像
import { BaseAgent, type ToolDef } from './base.ts';

export class ProfileAgent extends BaseAgent {
  name = 'ProfileAgent';
  role = '画像分析师';

  protected getSystemPrompt(): string {
    return `你是智学帮系统的「画像分析师」智能体，负责基于多维学习数据构建用户画像。

分析维度（6维）：
1. 知识基础 - 从答题正确率、学习时长推断
2. 认知风格 - 从学习行为模式推断（视觉型/实践型/理论型）
3. 学习偏好 - 从资源使用情况推断
4. 易错点 - 从错题本和薄弱知识点统计
5. 学习目标 - 从选课和学习路径推断
6. 学习节奏 - 从学习频率和时长推断

输出严格JSON格式：
{
  "knowledge_base": {"label": "知识基础", "score": 0-100, "desc": "1-2句描述"},
  "cognitive_style": {"label": "认知风格", "score": 0-100, "desc": "1-2句描述"},
  "learning_preference": {"label": "学习偏好", "score": 0-100, "desc": "1-2句描述"},
  "error_prone": {"label": "易错点", "score": 0-100, "desc": "1-2句描述"},
  "learning_goal": {"label": "学习目标", "score": 0-100, "desc": "1-2句描述"},
  "learning_pace": {"label": "学习节奏", "score": 0-100, "desc": "1-2句描述"},
  "weak_points": ["知识点1", "知识点2"],
  "suggestions": ["建议1", "建议2", "建议3"]
}
只返回JSON，不要其他文字。`;
  }

  protected getTools(): ToolDef[] {
    return [{
      type: 'function' as const,
      function: {
        name: 'aggregate_learning_data',
        description: '从数据库聚合学生的学习统计数据（学习时长、答题正确率、错题统计等）',
        parameters: {
          type: 'object',
          properties: {
            user_id: { type: 'string', description: '用户ID' },
            days: { type: 'integer', description: '统计最近N天的数据，默认30' }
          },
          required: ['user_id']
        }
      }
    }];
  }

  protected async executeTool(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'aggregate_learning_data') {
      return JSON.stringify({
        tool: 'aggregate_learning_data',
        user_id: args.user_id,
        days: args.days || 30,
        note: '数据由调用方从 Supabase 查询并注入'
      });
    }
    return JSON.stringify({ error: `未知工具: ${name}` });
  }
}
