// Orchestrator — DAG 多智能体编排器（容错版 + 自动返工）
// 流水线：CurriculumAgent → [HandoutAgent, MindmapAgent, QuizAgent, CodeCaseAgent, ReadingListAgent] → ReviewerAgent → [自动返工]
import { CurriculumAgent } from './curriculum.ts';
import { HandoutAgent } from './handout.ts';
import { MindmapAgent } from './mindmap.ts';
import { QuizAgent } from './quiz.ts';
import { CodeCaseAgent } from './codecase.ts';
import { ReadingListAgent } from './readinglist.ts';
import { ReviewerAgent } from './reviewer.ts';
import { AgentOutput, AgentOptions } from './base.ts';

export interface OrchestrationResult {
  resources: {
    curriculum: string;
    handout: string;
    mindmap: string;
    quiz: string;
    code: string;
    reading: string;
  };
  review: {
    score: number;
    verdict: 'pass' | 'warn' | 'reject';
    hallucination_risk: string;
    issues: string[];
    suggestions: string[];
  } | null;
  agent_trace: (AgentOutput & { step: string })[];
  retry_count: number;
  success: boolean;
  error?: string;
}

// 自动返工配置
const MAX_RETRY = 2;

// 中文资源名 → Agent 名称映射（用于从 review.issues 中提取失败的 Agent）
const AGENT_CHINESE_MAP: Record<string, string> = {
  '讲义': 'HandoutAgent',
  '思维导图': 'MindmapAgent',
  '练习题': 'QuizAgent',
  '代码案例': 'CodeCaseAgent',
  '阅读清单': 'ReadingListAgent',
};

// 所有阶段2 Agent 的名称列表
const ALL_AGENT_NAMES = ['HandoutAgent', 'MindmapAgent', 'QuizAgent', 'CodeCaseAgent', 'ReadingListAgent'];

/**
 * 从 review.issues 中提取涉及的具体 Agent 名称
 * 支持两种匹配方式：
 * 1. 直接包含 Agent 英文名（如 "HandoutAgent"）
 * 2. 包含中文资源名（如 "讲义"、"练习题"）
 */
function extractFailedAgents(issues: string[]): Set<string> {
  const failed = new Set<string>();
  for (const issue of issues) {
    for (const name of ALL_AGENT_NAMES) {
      if (issue.includes(name)) {
        failed.add(name);
      }
    }
    for (const [cn, name] of Object.entries(AGENT_CHINESE_MAP)) {
      if (issue.includes(cn)) {
        failed.add(name);
      }
    }
  }
  return failed;
}

export class Orchestrator {
  async run(topic: string, apiKey: string, profileHint = ''): Promise<OrchestrationResult> {
    const opts: AgentOptions = { apiKey, temperature: 0.7 };
    const trace: (AgentOutput & { step: string })[] = [];
    const wallStart = Date.now();
    let retryCount = 0;

    console.log(`[Orchestrator] ▶ 启动 DAG 编排 | 主题="${topic}" | ${new Date().toISOString()}`);

    try {
      // ── 阶段1：串行 — CurriculumAgent ────────────────────
      const curriculumAgent = new CurriculumAgent();
      let curriculumOut: AgentOutput;
      try {
        curriculumOut = await curriculumAgent.run(
          `学习主题：${topic}${profileHint ? `\n学生画像：${profileHint}` : ''}`,
          { ...opts, responseFormat: 'json', maxTokens: 1024 },
        );
        trace.push({ ...curriculumOut, step: '1-串行' });
        console.log(`[Orchestrator] 阶段1 完成 | CurriculumAgent ${curriculumOut.status} ${curriculumOut.duration_ms}ms`);
      } catch (e) {
        const errOut: AgentOutput & { step: string } = {
          agent: 'CurriculumAgent', step: '1-串行', status: 'error',
          content: '', summary: String(e), duration_ms: 0,
        };
        trace.push(errOut);
        console.error(`[Orchestrator] 阶段1 失败 | CurriculumAgent → ${e}`);
        return { success: false, resources: { curriculum: '', handout: '', mindmap: '', quiz: '', code: '', reading: '' }, review: null, agent_trace: trace, retry_count: retryCount, error: '课程大纲生成失败' };
      }

      let curriculumContext = '';
      try {
        const parsed = JSON.parse(curriculumOut.content);
        const moduleNames = parsed.modules?.map((m: { name: string }) => m.name).join('、') ?? topic;
        curriculumContext = `\n\n课程架构参考：${moduleNames}`;
      } catch { /* 使用原始主题 */ }

      const generationInput = `学习主题：${topic}${curriculumContext}${profileHint ? `\n学生画像：${profileHint}` : ''}`;

      // ── 阶段2：并行（Promise.allSettled — 任一失败不影响其他） ─────
      console.log(`[Orchestrator] 阶段2 并行启动 — 5智能体`);
      const phase2Start = Date.now();

      type AgentEntry = { name: string; agent: { run: (input: string, opts: AgentOptions) => Promise<AgentOutput> }; maxTokens: number };
      const agentDefs: AgentEntry[] = [
        { name: 'HandoutAgent',     agent: new HandoutAgent(),     maxTokens: 4096 },
        { name: 'MindmapAgent',     agent: new MindmapAgent(),     maxTokens: 1024 },
        { name: 'QuizAgent',        agent: new QuizAgent(),        maxTokens: 4096 },
        { name: 'CodeCaseAgent',    agent: new CodeCaseAgent(),    maxTokens: 3072 },
        { name: 'ReadingListAgent', agent: new ReadingListAgent(), maxTokens: 1536 },
      ];

      const settled = await Promise.allSettled(
        agentDefs.map(({ name, agent, maxTokens }) =>
          agent.run(generationInput, { ...opts, maxTokens })
            .then(out => ({ name, out, ok: true }))
            .catch(e => ({ name, out: { agent: name, status: 'error' as const, content: '', summary: String(e), duration_ms: 0 }, ok: false }))
        )
      );

      const contentMap: Record<string, string> = {};
      let successCount = 0;
      for (const res of settled) {
        const { name, out, ok } = res.status === 'fulfilled' ? res.value : { name: 'unknown', out: null, ok: false };
        if (ok && out) {
          trace.push({ ...out, step: '2-并行' });
          contentMap[name] = out.content;
          successCount++;
          console.log(`[Orchestrator]   ✅ ${name} ${out.duration_ms}ms`);
        } else {
          trace.push({ agent: name, step: '2-并行', status: 'error', content: '', summary: String(out?.summary ?? 'failed'), duration_ms: 0 });
          console.warn(`[Orchestrator]   ❌ ${name} 失败`);
        }
      }
      console.log(`[Orchestrator] 阶段2 完成 | 成功=${successCount}/5 | 耗时=${Date.now() - phase2Start}ms`);

      if (successCount === 0) {
        return { success: false, resources: { curriculum: curriculumOut.content, handout: '', mindmap: '', quiz: '', code: '', reading: '' }, review: null, agent_trace: trace, retry_count: retryCount, error: '所有资源生成 Agent 均失败' };
      }

      // ── 阶段3：串行 — ReviewerAgent（仅当 successCount ≥ 3）────────
      let review: OrchestrationResult['review'] = null;
      if (successCount >= 3) {
        try {
          const reviewerAgent = new ReviewerAgent();
          const reviewOut = await reviewerAgent.review(
            { 讲义: contentMap['HandoutAgent'] || '', 思维导图: contentMap['MindmapAgent'] || '', 练习题: contentMap['QuizAgent'] || '', 代码案例: contentMap['CodeCaseAgent'] || '', 阅读清单: contentMap['ReadingListAgent'] || '' },
            { ...opts, maxTokens: 1024 },
          );
          trace.push({ ...reviewOut, step: '3-串行' });
          const rv = (reviewOut as { reviewResult?: typeof review }).reviewResult;
          if (rv) review = rv;
          console.log(`[Orchestrator] 阶段3 完成 | ReviewerAgent | score=${rv?.score} verdict=${rv?.verdict}`);
        } catch (e) {
          trace.push({ agent: 'ReviewerAgent', step: '3-串行', status: 'error', content: '', summary: String(e), duration_ms: 0 });
          console.warn(`[Orchestrator] 阶段3 跳过/失败 → ${e}`);
        }
      } else {
        console.warn(`[Orchestrator] 阶段3 跳过 — 成功智能体不足(${successCount}<3)`);
      }

      // ── 阶段3b：自动返工 — 当 review 被 reject 时重试失败 Agent ──
      while (
        retryCount < MAX_RETRY &&
        review &&
        review.verdict === 'reject' &&
        review.issues.length > 0
      ) {
        retryCount++;
        console.log(`[Orchestrator] 🔄 自动返工 第${retryCount}次 | issues=${JSON.stringify(review.issues)}`);

        // 提取失败的 Agent 名称
        const failedAgents = extractFailedAgents(review.issues);
        if (failedAgents.size === 0) {
          console.warn(`[Orchestrator] 无法从 issues 中提取 Agent 名称，跳过返工`);
          break;
        }

        console.log(`[Orchestrator] 涉及返工的 Agent: ${[...failedAgents].join(', ')}`);

        // 将 suggestions 作为改进提示注入
        const suggestions = review.suggestions.join('; ');
        const retryInput = `${generationInput}\n\n【审核改进建议 — 请针对以下问题改进你的输出】${suggestions}`;

        // 只重新运行失败的 Agent（Promise.allSettled 容错）
        const retryDefs = agentDefs.filter(({ name }) => failedAgents.has(name));
        const retrySettled = await Promise.allSettled(
          retryDefs.map(({ name, agent, maxTokens }) =>
            agent.run(retryInput, { ...opts, maxTokens })
              .then(out => ({ name, out, ok: true }))
              .catch(e => ({ name, out: { agent: name, status: 'error' as const, content: '', summary: String(e), duration_ms: 0 }, ok: false }))
          )
        );

        for (const res of retrySettled) {
          const { name, out, ok } = res.status === 'fulfilled' ? res.value : { name: 'unknown', out: null, ok: false };
          if (ok && out) {
            trace.push({ ...out, step: `retry-${retryCount}` });
            contentMap[name] = out.content;
            console.log(`[Orchestrator]   🔄 ${name} 返工成功 ${out.duration_ms}ms`);
          } else {
            trace.push({ agent: name, step: `retry-${retryCount}`, status: 'error', content: '', summary: String(out?.summary ?? 'failed'), duration_ms: 0 });
            console.warn(`[Orchestrator]   🔄 ${name} 返工失败`);
          }
        }

        // 重新运行 ReviewerAgent 审核
        try {
          const reviewerAgent = new ReviewerAgent();
          const reviewOut = await reviewerAgent.review(
            { 讲义: contentMap['HandoutAgent'] || '', 思维导图: contentMap['MindmapAgent'] || '', 练习题: contentMap['QuizAgent'] || '', 代码案例: contentMap['CodeCaseAgent'] || '', 阅读清单: contentMap['ReadingListAgent'] || '' },
            { ...opts, maxTokens: 1024 },
          );
          trace.push({ ...reviewOut, step: `retry-${retryCount}` });
          const rv = (reviewOut as { reviewResult?: typeof review }).reviewResult;
          if (rv) review = rv;
          console.log(`[Orchestrator] 返工${retryCount}次后审核 | score=${rv?.score} verdict=${rv?.verdict}`);
        } catch (e) {
          trace.push({ agent: 'ReviewerAgent', step: `retry-${retryCount}`, status: 'error', content: '', summary: String(e), duration_ms: 0 });
          console.warn(`[Orchestrator] 返工${retryCount}次审核失败 → ${e}`);
          break;
        }
      }

      if (retryCount > 0) {
        console.log(`[Orchestrator] 自动返工结束 | 共返工${retryCount}次 | 最终verdict=${review?.verdict}`);
      }

      console.log(`[Orchestrator] ✅ 完成 | 总耗时=${Date.now() - wallStart}ms`);
      return {
        success: true,
        resources: {
          curriculum: curriculumOut.content,
          handout: contentMap['HandoutAgent'] || '',
          mindmap: contentMap['MindmapAgent'] || '',
          quiz: contentMap['QuizAgent'] || '',
          code: contentMap['CodeCaseAgent'] || '',
          reading: contentMap['ReadingListAgent'] || '',
        },
        review,
        agent_trace: trace,
        retry_count: retryCount,
      };
    } catch (e) {
      console.error(`[Orchestrator] 未捕获异常 → ${e}`);
      return {
        success: false,
        resources: { curriculum: '', handout: '', mindmap: '', quiz: '', code: '', reading: '' },
        review: null,
        agent_trace: trace.length > 0 ? trace : [{ agent: 'Orchestrator', step: '0-入口', status: 'error', content: '', summary: String(e), duration_ms: 0 }],
        retry_count: retryCount,
        error: String(e),
      };
    }
  }
}