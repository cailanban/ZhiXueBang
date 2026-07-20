// KnowledgeAgent — 知识库检索智能体，封装个人知识库搜索
// 使用 _shared/knowledge-tool.ts 真实检索，不再只是占位符
import { BaseAgent, type ToolDef } from './base.ts';
import { searchKnowledge, renderKnowledgeContext, type KnowledgeSearchResult } from '../knowledge-tool.ts';

export class KnowledgeAgent extends BaseAgent {
  name = 'KnowledgeAgent';
  role = '知识检索师';

  // 由调用方注入 supabase client 和 user id
  private supabase: any;
  private userId: string;

  constructor(supabase: any, userId: string) {
    super();
    this.supabase = supabase;
    this.userId = userId;
  }

  protected getSystemPrompt(): string {
    return `你是智学帮系统的「知识检索师」智能体，负责从知识库中精准检索学习资料。
你的职责：接收查询请求，调用知识库检索工具，对检索结果进行相关性排序和摘要。

当用户查询知识时：
1. 先理解查询意图
2. 调用 search_knowledge 工具检索
3. 对结果进行筛选和排序
4. 返回最相关的资料摘要`;
  }

  protected getTools(): ToolDef[] {
    return [{
      type: 'function' as const,
      function: {
        name: 'search_knowledge',
        description: '搜索个人知识库，获取学习资料。支持 WVK 词条检索和 RAG 片段检索',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '搜索关键词或问题' },
            top_k: { type: 'integer', description: '返回结果数量，默认 5，最大 15' },
            engine: { type: 'string', enum: ['all', 'wiki', 'rag'], description: '检索引擎：all=全部, wiki=仅词条, rag=仅片段' },
          },
          required: ['query'],
        },
      },
    }, {
      type: 'function' as const,
      function: {
        name: 'get_knowledge_context',
        description: '获取知识库上下文，用于注入到 LLM prompt',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '搜索关键词' },
            format: { type: 'string', enum: ['plain', 'markdown', 'json'], description: '渲染格式' },
          },
          required: ['query'],
        },
      },
    }];
  }

  protected async executeTool(name: string, args: Record<string, unknown>): Promise<string> {
    if (name === 'search_knowledge') {
      try {
        const query = String(args.query || '');
        const topK = Math.min(Math.max(Number(args.top_k) || 5, 1), 15);
        const response = await searchKnowledge(this.supabase, this.userId, query, { limit: topK });

        const results = response.results.map((r: KnowledgeSearchResult, i: number) => ({
          rank: i + 1,
          title: r.title,
          engine: r.engine,
          score: r.score.toFixed(3),
          source: r.source_name,
          relations: r.relation_count,
          snippet: r.content.slice(0, 300),
        }));

        return JSON.stringify({
          query,
          total: results.length,
          wiki_count: response.engine_summary.wiki_count,
          rag_count: response.engine_summary.rag_count,
          results,
        });
      } catch (error: any) {
        return JSON.stringify({ error: '检索失败', message: error.message });
      }
    }

    if (name === 'get_knowledge_context') {
      try {
        const query = String(args.query || '');
        const format = (args.format as string) || 'plain';
        const response = await searchKnowledge(this.supabase, this.userId, query, { limit: 8 });
        const context = renderKnowledgeContext(response.results, format as any);
        return JSON.stringify({
          query,
          format,
          context: format === 'plain' ? context.plain : format === 'markdown' ? context.markdown : context.json,
          citations: context.json.map((r: KnowledgeSearchResult) => r.title),
        });
      } catch (error: any) {
        return JSON.stringify({ error: '获取上下文失败', message: error.message });
      }
    }

    return JSON.stringify({ error: `未知工具: ${name}` });
  }
}