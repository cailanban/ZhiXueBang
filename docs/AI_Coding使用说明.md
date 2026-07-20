# AI Coding 使用说明

> 智学帮（ZhiXueBang）项目开发过程中 AI 辅助工具使用情况说明  
> 版本：v13 · 更新日期：2026-07-12

## 使用的 AI 工具

| 工具 | 用途 | 使用范围 |
|------|------|---------|
| Claude Code / CodeBuddy | 代码生成、重构、Debug | 前端组件、Edge Functions、文档编写 |
| DeepSeek Chat V4 | 项目内的 AI 对话/辅导/资源生成 | 15 个 Edge Functions 的核心能力 |
| 讯飞星火 Spark Pro | 辅助对话模型（辅导分支） | spark-tutor Edge Function |

## AI Coding 使用边界

1. **AI 生成的代码均由人工审核后合入**：所有 AI 产出的代码经过开发团队审查、测试和修改
2. **核心算法与架构设计由人工完成**：多智能体 DAG 编排、JWT 鉴权中间层、数据库 Schema 设计
3. **AI 工具仅用于加速开发**：不替代人工决策、安全审查和质量保证
4. **符合赛题要求**：本作品使用 AI 辅助编码工具，核心创新和架构设计由团队独立完成

## 代码来源声明

- `src/components/ui/` 目录下的 52 个组件来自 shadcn/ui（MIT 协议），已按项目主题定制
- `supabase/functions/_shared/agents/` 下的 Agent 实现为团队原创
- 课程数据（`src/data/courses/`）为团队整理，来源标注见 `docs/开源与数据来源清单.md`
