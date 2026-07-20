// ReviewerAgent — 防幻觉内容审核智能体
import { BaseAgent, AgentOptions, AgentOutput } from './base.ts';

export interface ReviewResult {
  score: number;         // 0-10 内容质量分
  factual: boolean;      // 是否通过事实核查
  hallucination_risk: 'low' | 'medium' | 'high';
  issues: string[];      // 发现的问题列表
  suggestions: string[]; // 改进建议
  verdict: 'pass' | 'warn' | 'reject';
  raw: string;
}

export class ReviewerAgent extends BaseAgent {
  name = 'ReviewerAgent';
  role = '质量审核师';

  protected getSystemPrompt(): string {
    return `你是「质量审核师」智能体，负责对AI生成内容进行防幻觉审核和质量评估。
审核维度：
1. 事实准确性（Java知识点是否正确）
2. 代码可运行性（语法是否正确，逻辑是否合理）
3. 幻觉风险（是否存在编造的API/类名/方法）
4. 内容完整性（是否覆盖主题核心）
5. 教学适用性（是否适合学生学习）

请输出JSON格式：
{
  "score": 0-10的整数,
  "factual": true/false,
  "hallucination_risk": "low|medium|high",
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2"],
  "verdict": "pass|warn|reject"
}
审核标准：score>=8且无严重幻觉→pass；score>=6→warn；score<6或高幻觉→reject`;
  }

  async review(contents: Record<string, string>, opts: AgentOptions): Promise<AgentOutput & { reviewResult?: ReviewResult }> {
    const summary = Object.entries(contents)
      .map(([k, v]) => `=== ${k} ===\n${v.slice(0, 500)}`)
      .join('\n\n');

    const output = await this.run(
      `请对以下AI生成的学习资源进行质量审核：\n\n${summary}`,
      { ...opts, responseFormat: 'json', maxTokens: 1024, temperature: 0.3 },
    );

    if (output.status === 'error') return output;

    try {
      const reviewResult = JSON.parse(output.content) as ReviewResult;
      reviewResult.raw = output.content;
      const verdictMap = { pass: '通过', warn: '需复核', reject: '未通过' };
      return {
        ...output,
        summary: `质量评分 ${reviewResult.score}/10，审核结果：${verdictMap[reviewResult.verdict]}`,
        reviewResult,
      };
    } catch {
      return { ...output, summary: '审核完成（解析结果异常）' };
    }
  }

  protected summarize(content: string): string {
    try {
      const data = JSON.parse(content);
      return `质量评分 ${data.score}/10，风险等级：${data.hallucination_risk}`;
    } catch { return super.summarize(content); }
  }

  protected getTools() {
    return [{
      type: 'function' as const,
      function: {
        name: 'extract_verifiable_claims',
        description: '从内容中提取可验证的事实断言（包含数字、专有名词的句子）',
        parameters: {
          type: 'object',
          properties: {
            content: { type: 'string', description: '待审核内容' }
          },
          required: ['content']
        }
      }
    }];
  }

  protected async executeTool(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'extract_verifiable_claims') {
      const content = (args.content as string) || '';
      const sentences = content
        .split(/[。！？.!?]\s*/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
      const claims = sentences.filter(s => /\d/.test(s) || /[A-Z][a-z]{2,}/.test(s));
      return JSON.stringify({
        claims,
        count: claims.length
      });
    }
    return JSON.stringify({ error: `未知工具: ${name}` });
  }
}
