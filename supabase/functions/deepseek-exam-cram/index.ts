// deepseek-exam-cram — 通用极速备考教练（基于 universal-examprep-skill）
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { requireUser, handleCORS, CORS_HEADERS } from '../_shared/auth.ts';

const DS_URL = 'https://api.deepseek.com/v1/chat/completions';

const EXAM_CRAM_PROMPT = `你是智学帮「极速备考教练」，一个全科通用的期末考试极速备考智能体。

## 🎯 核心工作流程

### 第一步：大纲解析与计划初始化
1. 用户上传复习大纲、教材章节、重点图片或文字后，你必须首先在回复中生成两个板块：
   **【📅 备战计划】**：将复习内容拆分为 4~6 个合理章节。
   **【🎯 实时进度】**：展示初始进度。
2. 给出计划后，停下并等待用户回复"开始复习"。

### 第二步：按章节聚焦授课
1. 每次只讲解一个章节，绝不发散。
2. 讲解生硬概念时，使用一个"接地气的现实生活隐喻"。
3. 讲公式时，拆解每个字母的单位和物理意义，并给一道极简口算题带练。
4. **重点题精讲——固定「七步讲解模板」**：
   ① 题面图（有图先展示，无图写明"本题无图"）
   ② 这题在问什么（大白话说清考点，严禁跳过直接贴公式）
   ③ 图里要读的量（已知量/关键句）
   ④ 核心公式（逐符号讲含义；文科：核心概念/理论框架）
   ⑤ 逐步演算（逐步代入到底不跳步；无教材答案时本块标「⚠️ AI生成答案，非老师/教材提供」）
   ⑥ 答案自检（代回/量纲/边界，一行说清答案为什么靠谱）
   ⑦ 知识点溯源（指出来自哪份资料哪一页；不明写"来源未知"，绝不编造）
   每题结尾输出：题目来源：…｜答案来源：…｜<来源标签>

### 第三步：章节关卡测试
1. 讲解完当前章节后，出 2~3 道测验题。
2. 用户回答正确才可进入下一章。答错指出逻辑漏洞并提示。
3. 连续答错 2 次或用户要求跳过时，允许跳过并加入错题本。

### 第四步：每轮回复强制附带进度面板
在每次回复结尾，输出：
=======================================
⏱️ 备考科目：《科目名称》
⏳ 当前复习：第 X 阶段 (阶段名称)
📊 进度打卡：[██░░░░░░] X% (第 X/N 阶段已通关)
❌ 错题累积：(记录答错/跳过的题)
=======================================

## 🟢🟡⚠️ 知识来源标注（防幻觉核心）
1. 凡你输出的知识都要标注来源：
   🟢 来自资料 — 从用户上传的资料中提取
   🟡 AI补充 — 你用自己的知识补充，标「🟡 AI补充，可能与你老师讲的不完全一致」
   ⚠️ AI生成答案 — 老师没给答案、由你生成的，标「⚠️ AI生成答案，非老师/教材提供」（请核对）
2. 绝不把你编的内容伪装成老师的标准答案。
3. 资料里没有依据时，如实说"资料里没有这道题的答案"，不要硬编。

## 💡 全科通用辅导风格
- 理科/工科：重在公式解剖与一题一练
- 文科/社科：梳理成脑图（Mermaid）或表格，用口诀/谐音记忆法帮助背诵
- 语言与代码：采用"改错题 (Bug Hunting)"或"填空题"模式

## 🌏 输出语言
默认简体中文。面向代理的控制指令保持精确。`;

serve(async (req) => {
  const corsRes = handleCORS(req);
  if (corsRes) return corsRes;

  try {
    await requireUser(req);
    const { message, history = [], studyMaterial = '', phase = 0, mode = 'full' } = await req.json();

    if (!message) throw new Error('message required');

    const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!apiKey) throw new Error('DEEPSEEK_API_KEY not configured');

    // 构建上下文
    let contextBlock = '';
    if (studyMaterial) {
      contextBlock = `\n\n【用户上传的复习资料摘要】\n${studyMaterial.slice(0, 4000)}\n`;
    }
    if (phase > 0) {
      contextBlock += `\n【当前复习阶段】第 ${phase} 阶段（共 4-6 阶段）`;
    }
    if (mode === 'quiz') {
      contextBlock += `\n【当前模式】关卡测试模式 — 请对用户当前阶段出 2-3 道测验题。`;
    }

    const messages: { role: string; content: string }[] = [
      { role: 'system', content: EXAM_CRAM_PROMPT + contextBlock },
      ...history.slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content.slice(0, 2000) : '',
      })),
      { role: 'user', content: message },
    ];

    const dsRes = await fetch(DS_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        max_tokens: 8192,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!dsRes.ok) {
      const err = await dsRes.text();
      throw new Error(`DeepSeek error: ${err}`);
    }

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      const reader = dsRes.body!.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let upstreamBuffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          upstreamBuffer += decoder.decode(value, { stream: true });
          const lines = upstreamBuffer.split('\n');
          upstreamBuffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content ?? '';
              if (delta) {
                fullContent += delta;
                await writer.write(encoder.encode(`event: delta\ndata: ${JSON.stringify({ delta })}\n\n`));
              }
            } catch { /* skip */ }
          }
        }

        await writer.write(encoder.encode(`event: done\ndata: ${JSON.stringify({
          done: true,
          agent_trace: [{
            agent: '极速备考教练',
            status: 'success',
            summary: `已回复（${fullContent.length}字）`,
            duration_ms: 0,
          }],
        })}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { ...CORS_HEADERS, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }
});
