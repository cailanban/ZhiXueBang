// CurriculumAgent — 课程架构智能体，产出知识框架
import { BaseAgent } from './base.ts';

export class CurriculumAgent extends BaseAgent {
  name = 'CurriculumAgent';
  role = '课程架构师';

  protected getSystemPrompt(): string {
    return `你是「课程架构师」智能体，专注于将学习主题分解为结构化知识框架。
你的任务：
1. 识别主题的核心知识模块（3-5个）
2. 为每个模块列出3-4个关键知识点
3. 标注模块间的依赖关系
4. 评估整体学习难度

输出JSON格式：
{"modules": [{"name": "模块名", "points": ["知识点1","知识点2"], "difficulty": 1-5, "prerequisite": "前置模块名或null"}], "total_points": 数字, "difficulty_overview": "整体难度描述"}`;
  }

  protected summarize(content: string): string {
    try {
      const data = JSON.parse(content);
      return `已分解为${data.modules?.length ?? '?'}个知识模块，共${data.total_points ?? '?'}个知识点`;
    } catch { return super.summarize(content); }
  }

  protected getTools() {
    return [{
      type: 'function' as const,
      function: {
        name: 'validate_curriculum_schema',
        description: '校验生成的课程JSON结构是否完整',
        parameters: {
          type: 'object',
          properties: {
            json_content: { type: 'string', description: '生成的课程JSON内容' }
          },
          required: ['json_content']
        }
      }
    }];
  }

  protected async executeTool(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'validate_curriculum_schema') {
      try {
        const data = JSON.parse(args.json_content as string);
        const modules = Array.isArray(data.modules) ? data.modules : [];
        const requiredFields = ['name', 'points', 'difficulty'];
        const missingFields: string[] = [];
        modules.forEach((m: Record<string, unknown>, i: number) => {
          requiredFields.forEach(f => {
            if (!(f in m)) missingFields.push(`modules[${i}].${f} 缺失`);
          });
        });
        return JSON.stringify({
          valid: missingFields.length === 0 && modules.length > 0,
          modules_count: modules.length,
          missing_fields: missingFields
        });
      } catch (e) {
        return JSON.stringify({ valid: false, error: `JSON解析失败: ${String(e)}` });
      }
    }
    return JSON.stringify({ error: `未知工具: ${name}` });
  }
}
