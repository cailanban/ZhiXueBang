// PathAgent — 学习路径规划智能体，生成4阶段学习路线
import { BaseAgent, type ToolDef } from './base.ts';

export class PathAgent extends BaseAgent {
  name = 'PathAgent';
  role = '路径规划师';

  protected getSystemPrompt(): string {
    return `你是智学帮系统的「路径规划师」智能体，为学习者生成个性化4阶段学习路径。

输出JSON格式：
{
  "stages": [
    {
      "id": 1,
      "phase": "基础理解",
      "goal": "阶段目标描述",
      "duration": "建议学习时长（如3-5天）",
      "topics": ["知识点1", "知识点2"],
      "resources": ["资源1", "资源2"],
      "milestone": "阶段完成标志"
    },
    ...
  ]
}

4个阶段：
- 阶段1：基础理解（建立核心概念框架）
- 阶段2：专题突破（深入关键知识点）
- 阶段3：项目实战（综合实践应用）
- 阶段4：复盘评估（知识体系总结与查漏补缺）

根据用户画像调整路径的深度、广度和节奏。`;
  }

  protected getTools(): ToolDef[] {
    return [{
      type: 'function' as const,
      function: {
        name: 'get_prerequisites',
        description: '获取知识点的前置依赖关系和用户当前掌握度',
        parameters: {
          type: 'object',
          properties: {
            topic: { type: 'string', description: '学习主题' },
            user_id: { type: 'string', description: '用户ID' }
          },
          required: ['topic']
        }
      }
    }];
  }

  protected async executeTool(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'get_prerequisites') {
      return JSON.stringify({
        tool: 'get_prerequisites',
        topic: args.topic,
        note: '前置依赖关系从课程数据结构中查询，由调用方注入'
      });
    }
    return JSON.stringify({ error: `未知工具: ${name}` });
  }
}
