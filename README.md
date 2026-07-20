# 智学帮 (ZhiXueBang) — 多智能体 AI 学习平台

> 中国软件杯 A3 赛题 · 基于讯飞星火 & DeepSeek 大模型的多智能体个性化学习系统
>
> **在线预览**: https://222e66967cb24fd99bc0b17b3f70d39f.app.codebuddy.work
>
> **GitHub**: [cailanban/zhixuebang](https://github.com/cailanban/zhixuebang)

---

## 项目简介

智学帮是一个面向编程学习的多智能体 AI 教学平台，集成 **12 大智能体**、**双引擎知识库（WVK+RAG）**、**AI 数字人教师**、**语音微课生成** 和 **多 Agent PPT 工厂** 等能力，提供从诊断、学习、练习到评估的完整学习闭环。

---

## 技术栈

| 层 | 技术 |
|----|------|
| **前端** | React 18 + TypeScript + Vite (Rolldown) + Tailwind CSS 3 + shadcn/ui |
| **状态/路由** | React Router 7 + React Hook Form + Zod |
| **可视化** | Recharts + Cytoscape + Mermaid + PPTXGenJS |
| **动画** | Framer Motion / Motion |
| **后端** | Supabase (Auth / PostgreSQL / Storage / Edge Functions / Realtime) |
| **大模型** | DeepSeek Chat V4 · 讯飞星火 Spark Pro/Lite |
| **数字人** | MuseTalk + LiveTalking + WebRTC + Coturn TURN |
| **包管理器** | pnpm |
| **质量工具** | Biome (lint/format) + Playwright (e2e) + Sentry |

---

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 10

### 安装

```bash
cd chatgpt-conversation-6a5310da-56fc-83e8-aaa0/v8_web_implementation
pnpm install
```

### 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，至少配置：

```env
VITE_SUPABASE_URL=https://pnmjxgsemgldncqbimbt.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_ID=zhixuebang
```

### 启动

```bash
pnpm dev        # 开发服务器 → http://localhost:5173
pnpm build      # 生产构建
pnpm test       # 运行测试
pnpm typecheck  # 类型检查
pnpm lint       # 代码检查
```

---

## 项目结构

```
v8_web_implementation/
├── src/
│   ├── pages/               # 32 个页面组件
│   │   ├── DashboardPage    # 学习仪表盘
│   │   ├── ChatPage         # AI 对话（含数字人面板）
│   │   ├── TutorPage        # 诊断辅导
│   │   ├── CoursesPage      # 课程中心
│   │   ├── PathPage         # 学习路径
│   │   ├── KnowledgePage    # 知识库
│   │   ├── ResourcesPage    # 资源生成
│   │   ├── MicroLessonsPage # 微课列表
│   │   ├── InterviewPage    # 模拟面试
│   │   ├── ProfilePage      # 学习画像
│   │   ├── MistakesPage     # 错题本
│   │   └── ...
│   ├── components/
│   │   ├── digital-human/   # 数字人组件 (面板/视频渲染/控制)
│   │   ├── ui/              # 52 个 shadcn/ui 组件
│   │   ├── AgentTracePanel  # Agent 调用轨迹
│   │   ├── ResourcePosterWall # 资源海报墙
│   │   └── SmartRecommend   # 智能推荐
│   ├── features/
│   │   └── micro-course/    # 微课引擎 (播放器/白板/动作引擎)
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useAvatarSession # WebRTC 会话管理
│   │   ├── useAvatarSpeech  # LLM → TTS 播报队列
│   │   └── useVisualEventBus# 微课可视化事件总线
│   ├── services/
│   │   ├── api.ts           # Supabase 查询封装
│   │   └── avatarGatewayApi # 数字人双模式 API 适配层
│   ├── contexts/            # Auth / DigitalHuman / Theme
│   ├── types/               # TypeScript 类型定义
│   └── data/                # 静态课程数据
├── supabase/
│   ├── migrations/          # 26 个数据库迁移脚本
│   └── functions/           # 34 个 Edge Functions
│       ├── _shared/         # 12 个智能体实现
│       └── avatar-gateway/  # 数字人网关
├── server/
│   └── rtc_manager.py       # WebRTC 管理服务
├── docs/                    # 项目文档
├── e2e/                     # 端到端测试
└── dist/                    # 构建产物
```

---

## 核心功能模块

### 🧠 多智能体系统

| 智能体 | 功能 |
|--------|------|
| `orchestrator` | 主调度器，意图识别与任务分发 |
| `tutor` | AI 辅导，知识点讲解 |
| `quiz` | 智能出题与批改 |
| `profile` | 学情画像分析 |
| `path` | 学习路径规划 |
| `curriculum` | 课程内容生成 |
| `handout` | 讲义/笔记整理 |
| `knowledge` | 知识库检索 |
| `mindmap` | 思维导图生成 |
| `codecase` | 代码案例分析 |
| `reviewer` | 复习规划 |
| `readinglist` | 阅读推荐 |

### 📚 双引擎知识库 (WVK + RAG)

```
原始资料 → LLM 整理为结构化 Wiki 条目（词条/前置/关联/错因/来源）
         → 向量化存储
查询 → WVK 结构检索 + RAG 语义检索 → RRF 融合 → Cross-Encoder 重排 → 带引用回答
```

### 🎙️ AI 语音微课

```
课程主题 → DeepSeek 生成大纲/场景/动作 → TTS 语音合成 → 浏览器播放引擎
（语音 + 字幕 + 动态绘图 + 场景切换，可暂停/跳转/提问）
```

### 👨‍🏫 AI 数字人教师

- 基于 MuseTalk + LiveTalking + WebRTC
- 文本/语音驱动口型同步
- 支持打断、重连、双模式（本地GPU / Supabase生产）
- GPU 不可用时自动降级为纯文本助手

### 📊 PPT 工厂

多 Agent 流水线：需求澄清 → 资料研究 → 教学设计 → 故事线 → 视觉导演 → 渲染 → 质检 → 导出 PPTX/PDF/讲稿

---

## 数据库概要

- 数据库：Supabase PostgreSQL 15
- 17 张核心表，全部启用 RLS 行级安全
- 核心表：`profiles` / `courses` / `knowledge_items` / `learning_sessions` / `quiz_attempts` / `mistake_book` / `micro_courses` / `digital_human_sessions`
- 迁移文件：`supabase/migrations/` (00001 ~ 00026)

---

## 基础设施

| 组件 | 说明 |
|------|------|
| **Supabase** | `pnmjxgsemgldncqbimbt.supabase.co` |
| **GPT GPU (AutoDL)** | NVIDIA RTX 4090D, SSH 隧道 6006 |
| **TURN 中继** | Coturn `101.132.27.67:3478` |
| **大模型 API** | DeepSeek V4 (对话/生成) + Spark Pro/Lite (诊断辅导) |

---

## 环境变量

### 前端 `.env.local`

| 变量 | 说明 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `VITE_APP_ID` | 应用标识 (zhixuebang) |
| `VITE_USE_LOCAL_GPU` | 是否使用本地 GPU 模式 |
| `VITE_DIGIHUMAN_GPU_URL` | GPU 服务地址 |
| `VITE_DEMO_DIGITAL_HUMAN` | 强制显示数字人入口 |

### Supabase Edge Function Secrets

| Secret | 用途 |
|--------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 |
| `SPARK_API_KEY` | 讯飞星火 API Key |
| `SPARK_API_SECRET` | 讯飞星火 API Secret |
| `DIGIHUMAN_GPU_URL` | GPU 服务地址 |
| `TURN_REST_SECRET` | TURN 动态凭证密钥 |
| `TURN_HOST` | TURN 服务器地址 |

---

## 相关文档

| 文档 | 路径 |
|------|------|
| Windows 环境搭建说明 | `./README_设置说明.md` |
| 数字人系统完整交付文档 | `./数字人系统完整交付文档.md` |
| 数字人排障修复记录 | `./数字人avatar-gateway排障修复记录.md` |
| 六项智能化升级方案 | `./chatgpt-conversation-6a5310da-56fc-83e8-aaa0/智学帮V8_六项智能化升级方案_执行定稿.md` |
| 语音微课设计方案 | `./chatgpt-conversation-6a5310da-56fc-83e8-aaa0/outputs/智学帮_语音微课_OpenMAIC同效方案.md` |
| 数字人选型方案 | `./chatgpt-conversation-6a5310da-56fc-83e8-aaa0/outputs/智学帮_开源数字人选型与集成设计方案.md` |
| 项目 PRD | `./chatgpt-conversation-6a5310da-56fc-83e8-aaa0/v8_web_implementation/docs/prd.md` |
| V8 开发审计记录 | `./chatgpt-conversation-6a5310da-56fc-83e8-aaa0/v8_web_implementation/docs/V8阶段0审计与阶段1实施记录.md` |
| 测试说明书 | `./chatgpt-conversation-6a5310da-56fc-83e8-aaa0/v8_web_implementation/docs/测试说明书.md` |

---

## 许可

内部项目，仅限开发团队使用。

---

> 最后更新：2026-07-20
