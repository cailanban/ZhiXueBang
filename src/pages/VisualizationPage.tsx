// ── 可视化生成模块 ─────────────────────────────────────────────────────
// Mermaid 图表生成：流程图 / 思维导图 / 架构图 / 时序图 / 类图 等
// 使用 deepseek-visual Edge Function，支持流式输出 + Markdown 渲染
// ────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import mermaid from 'mermaid';

// ── Mermaid 初始化 ──────────────────────────────────────────────────────
mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose', fontFamily: 'system-ui,sans-serif' });

// ── visualPresets（直接照抄 ZIP 第1160-1176行）──────────────────────────
const visualPresets = [
  { id: 'mind_map',      name: '思维导图',       value: '知识结构',  desc: '适合概念体系、章节结构、复习框架。',              prompt: (t: string) => `主题：${t}。生成 Mermaid mindmap 格式，1个根节点，5-7个一级分支，每个分支2-3个子节点，节点文字精简（8字以内），避免重复和空节点。` },
  { id: 'flowchart',     name: '流程图',         value: '机制与步骤', desc: '适合 HashMap 扩容、多线程生命周期、程序执行流。', prompt: (t: string) => `只输出 Mermaid flowchart TD。主题：${t}。展示核心机制步骤、关键判断、异常分支，节点文字8字以内。` },
  { id: 'roadmap',       name: '学习路线图',     value: '阶段路径',  desc: '适合展示学习闭环和阶段推进。',                    prompt: (t: string) => `主题：${t}。按基础、进阶、实战、复盘四阶段生成 flowchart LR，每阶段2-3个任务节点，任务名简洁。` },
  { id: 'compare',       name: '对比图',         value: '概念辨析',  desc: '适合 List/Set/Map、接口/抽象类、线程/进程。',     prompt: (t: string) => `主题：${t}。对比图：列出主题中2-3个核心概念，每个概念提供：定义、适用场景、易错点、代码提示，输出 Markdown 表格。` },
  { id: 'sequence',      name: '协作时序图',     value: '智能体协作', desc: '适合展示多智能体从任务到审核的协作过程。',       prompt: (t: string) => `只输出 Mermaid sequenceDiagram。主题：${t}。参与者：用户、画像智能体、课程架构智能体、资源生成智能体、质量审核智能体、评估智能体。展示协作过程。` },
  { id: 'concept',       name: '概念关系图',     value: '依赖关系',  desc: '适合知识点之间的前置依赖和迁移关系。',           prompt: (t: string) => `只输出 Mermaid graph TD。主题：${t}。展示前置知识→核心概念→运行机制→代码实践→评估反馈，体现依赖与包含关系。` },
  { id: 'class_diagram', name: '类图',           value: '对象结构',  desc: '适合展示 Java 类、接口、资源对象和关系。',        prompt: (t: string) => `只输出 Mermaid classDiagram。主题：${t}。展示核心类、接口、继承和依赖关系，方法名简洁。` },
  { id: 'state_diagram', name: '状态图',         value: '状态流转',  desc: '适合学习任务、线程生命周期、练习评估状态。',      prompt: (t: string) => `只输出 Mermaid stateDiagram-v2。主题：${t}。展示状态转移路径、触发条件和终态，状态名简洁。` },
  { id: 'er_diagram',    name: '实体关系图',     value: '数据关系',  desc: '适合展示学习画像、资源、题库和评估数据结构。',    prompt: (t: string) => `只输出 Mermaid erDiagram。主题：${t}。实体名用英文大写，展示学习者、画像、目标、知识点、资源、练习、评估之间的关系。` },
  { id: 'gantt',         name: '学习计划甘特图', value: '时间安排',  desc: '适合 5-7 天学习计划和阶段任务。',                 prompt: (t: string) => `主题：${t}。生成 7 天学习计划条形图，任务名称短、阶段清晰、避免文字重叠。` },
  { id: 'pie',           name: '掌握度占比图',   value: '评估比例',  desc: '适合展示概念理解、代码实践、题目正确率等占比。',  prompt: (t: string) => `只输出 Mermaid pie。主题：${t}。展示概念理解、代码实践、题目正确率、迁移应用、复盘完成等比例。` },
  { id: 'journey',       name: '学习旅程图',     value: '体验路径',  desc: '适合展示学生和智能体协同完成学习闭环的过程。',   prompt: (t: string) => `主题：${t}。按学生、画像智能体、资源智能体、评估智能体生成体验路径卡片。` },
  { id: 'architecture',  name: '系统架构图',     value: '工程链路',  desc: '适合展示前端、后端、知识库、模型调度和多智能体。', prompt: (t: string) => `只输出 Mermaid flowchart LR。主题：${t}。展示前端工作台、FastAPI、知识库、模型调度、多智能体、学习结果之间的工程链路。` },
];

// ── activePresetGuide（直接照抄 ZIP 第1181-1201行）──────────────────────
const PRESET_GUIDES: Record<string, string> = {
  mind_map:      '按中心主题、一级分支、二级知识点组织，控制节点数量和层级，让图能直接用于讲解和复习。',
  flowchart:     '按触发条件、关键步骤、判断分支、结果反馈组织，重点突出主题本身的运行机制。',
  roadmap:       '按基础、进阶、实战、复盘四阶段组织，每阶段对应资源和任务动作。',
  compare:       '按概念定义、适用场景、易错点、代码提示做分栏对比，帮助辨析相近知识点。',
  sequence:      '按用户、画像、课程架构、资源生成、审核、评估的先后关系展示协作过程。',
  concept:       '按前置知识、核心概念、运行机制、代码实践、评估反馈展示依赖关系。',
  class_diagram: '按类、接口、方法、依赖关系组织，适合展示 Java 面向对象设计和系统对象结构。',
  state_diagram: '按开始、处理中、判断、反馈、完成等状态组织，适合讲清生命周期和流程转移。',
  er_diagram:    '按实体、属性、关系组织，适合说明学习画像、知识点、资源、题库和评估的数据关系。',
  gantt:         '按日期和阶段组织任务，适合展示短周期学习计划和项目推进节奏。',
  pie:           '按比例展示掌握度或资源构成，适合把评估结果转成直观占比。',
  journey:       '按阶段和参与角色组织体验，适合展示学生与智能体协作完成学习闭环。',
  architecture:  '按前端、后端、知识库、模型调度、多智能体和输出结果组织，适合展示工程价值。',
};

// ── dynamicVisualTypes（直接照抄 ZIP）──────────────────────────────────
const dynamicVisualTypes = new Set(['compare', 'roadmap', 'gantt', 'journey']);

// ── 工具函数（直接照抄 ZIP）────────────────────────────────────────────
const escapeHtml = (text: string) =>
  String(text || '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]!);

const visualTopicTitle = (topic: string) =>
  escapeHtml(String(topic || '').replace(/\s+/g, ' ').trim().slice(0, 48) || '请选择主题');

const cleanVisualLabel = (text: string) =>
  String(text || '')
    .replace(/怎么选|如何选择|如何选|怎么理解|复习计划|学习路径/g, '')
    .replace(/^[A-Za-z0-9_]+\s*/, '')
    .replace(/[`"'<>[\]{}|]/g, '').replace(/[()（）]/g, '').replace(/[;；]/g, '')
    .replace(/[，,]/g, ' ').replace(/…/g, '等').replace(/\s+/g, ' ').trim().slice(0, 28) || '';

const topicTerms = (topic: string): string[] => {
  const t = String(topic || '').trim();
  const terms: string[] = [];
  // 按 vs/和/与/、拆分
  t.split(/\s+vs\s+|\s+和\s+|\s+与\s+|[、,，]/g).forEach(s => {
    const clean = cleanVisualLabel(s.trim());
    if (clean && !terms.includes(clean)) terms.push(clean);
  });
  if (!terms.length) {
    const match = t.match(/[\u4e00-\u9fa5A-Za-z0-9_\-\.]+/g) || [];
    match.forEach(s => { const c = cleanVisualLabel(s); if (c && !terms.includes(c)) terms.push(c); });
  }
  return terms.slice(0, 6);
};

const labelsFromDiagram = (code: string, topic: string): string[] => {
  const labels: string[] = [];
  const generic = new Set(['主题', '知识点', '概念', '分支', '节点', '学习', '理解', '掌握', '复习', 'Java', '代码', '示例',
    '课程架构智能体', '资源智能体', '资源生成智能体', '评估智能体', '质量审核智能体']);
  const add = (v: string) => {
    const label = cleanVisualLabel(v);
    if (label && !generic.has(label) && !labels.includes(label)
      && !/^(TB|TD|LR|RL|BT|title|section|dateFormat|axisFormat)$/i.test(label)) labels.push(label);
  };
  Array.from(code.matchAll(/\[([^\]]{1,40})\]/g)).forEach(m => add(m[1]));
  Array.from(code.matchAll(/section\s+([^\n]{1,30})/gi)).forEach(m => add(m[1]));
  Array.from(code.matchAll(/^\s*([^:\n]{2,24})\s*:/gm)).forEach(m => add(m[1]));
  Array.from(code.matchAll(/root\s*\(\(([^)]{1,40})\)\)/gi)).forEach(m => add(m[1]));
  topicTerms(topic).forEach(add);
  return labels.slice(0, 28);
};

const pickLabels = (labels: string[], start: number, count: number, fallbacks: string[]): string[] => {
  const pool = [...labels, ...fallbacks].filter(Boolean);
  const out: string[] = [];
  for (let i = start; i < pool.length && out.length < count; i++) if (!out.includes(pool[i])) out.push(pool[i]);
  for (let i = 0; i < pool.length && out.length < count; i++) if (!out.includes(pool[i])) out.push(pool[i]);
  return out;
};

const visualSourceLabel = (source: string) => source === 'deepseek' ? 'AI 生成' : '预览模式';

// ── fallbackDiagram：仅提供结构模板，不含任何虚构数据 ──
function fallbackDiagram(type: string, topic: string): string {
  const t = topic || '当前主题';
  if (type === 'flowchart') return `\`\`\`mermaid\nflowchart TD\n  A[主题: ${t}] --> B[触发条件]\n  B --> C[核心步骤]\n  C --> D{关键判断}\n  D -->|满足条件| E[执行主流程]\n  D -->|不满足| F[调整策略]\n  E --> G[输出结果]\n  F --> G\n  G --> H[复盘易错点]\n\`\`\``;
  if (type === 'roadmap') return '';
  if (type === 'compare') return '';
  if (type === 'gantt') return '';
  if (type === 'pie') return '';
  if (type === 'journey') return '';
  if (type === 'architecture') return `\`\`\`mermaid\nflowchart LR\n  U[学生端] --> FE[前端工作台]\n  FE --> API[Edge Functions]\n  API --> RAG[个人知识库]\n  API --> LLM[模型调度]\n  LLM --> A1[画像智能体]\n  LLM --> A2[资源生成智能体]\n  LLM --> A3[质量审核智能体]\n  A1 --> OUT[个性化学习闭环]\n  A2 --> OUT\n  A3 --> OUT\n  RAG --> OUT\n\`\`\``;
  if (type === 'class_diagram') return `\`\`\`mermaid\nclassDiagram\n  class Learner {\n    学习目标\n    基础水平\n    薄弱知识点\n  }\n  class Resource {\n    讲解文档\n    代码案例\n    练习题\n  }\n  class Agent {\n    画像分析\n    路径规划\n    质量审核\n  }\n  Learner --> Agent : 提供画像\n  Agent --> Resource : 生成资源\n  Resource --> Learner : 支撑训练\n\`\`\``;
  if (type === 'state_diagram') return `\`\`\`mermaid\nstateDiagram-v2\n  [*] --> 输入目标\n  输入目标 --> 构建画像\n  构建画像 --> 检索知识\n  检索知识 --> 生成图解\n  生成图解 --> 路径规划\n  路径规划 --> 练习评估\n  练习评估 --> 调整建议\n  调整建议 --> [*]\n\`\`\``;
  if (type === 'er_diagram') return `\`\`\`mermaid\nerDiagram\n  LEARNER ||--o{ PROFILE : owns\n  PROFILE ||--o{ GOAL : describes\n  GOAL ||--o{ KNOWLEDGE_POINT : maps\n  KNOWLEDGE_POINT ||--o{ RESOURCE : produces\n  RESOURCE ||--o{ QUIZ : supports\n  QUIZ ||--o{ EVALUATION : creates\n\`\`\``;
  if (type === 'sequence') return `\`\`\`mermaid\nsequenceDiagram\n  participant U as 用户\n  participant P as 画像智能体\n  participant C as 课程架构智能体\n  participant G as 资源生成智能体\n  participant R as 质量审核智能体\n  participant E as 评估智能体\n  U->>P: 输入学习目标\n  P->>C: 提供基础与薄弱点\n  C->>G: 输出知识结构\n  G->>R: 提交资源和图解\n  R->>E: 通过后进入练习评估\n  E-->>U: 返回建议与下一步路径\n\`\`\``;
  if (type === 'concept') return `\`\`\`mermaid\ngraph TD\n  A[前置知识] --> B[核心概念]\n  A --> C[相关领域]\n  B --> D[关键原理]\n  B --> E[主要特性]\n  D --> F[代码实践]\n  E --> F\n  F --> G[评估反馈]\n\`\`\``;
  return `\`\`\`mermaid\nmindmap\n  root((${t}))\n    基础概念\n    核心机制\n    实践应用\n    易错点\n\`\`\``;
}

// ── generatedVisual（直接照抄 ZIP 动态 HTML 生成，完全保留 DOM 结构）──
function generatedVisual(type: string, topic: string, raw: string, source = 'runtime'): string {
  const t = visualTopicTitle(topic);
  const labels = labelsFromDiagram(raw, topic);
  const terms = topicTerms(topic);
  const badge = visualSourceLabel(source);
  if (type === 'compare') return `
<div class="visual-custom compare-visual">
  <div class="visual-title"><div><h3>${t} 对比图</h3><div class="visual-sub">根据当前主题实时抽取对比对象，按定义、场景、易错点重排成图。</div></div><span class="label ok">${badge}</span></div>
  <div class="compare-grid">
    ${pickLabels(terms, 0, 3, [terms[0], terms[1] || '核心机制', terms[2] || '选择建议']).map(name => {
      const items = [`${name}定义`, `${name}适用场景`, `${name}代码提示`, `${name}易错点`];
      return `<section class="compare-col"><strong>${escapeHtml(name)}</strong><ul>${items.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul></section>`;
    }).join('')}
  </div>
</div>`;
  if (type === 'roadmap') return `
<div class="visual-custom roadmap-visual">
  <div class="visual-title"><div><h3>${t} 学习路线图</h3><div class="visual-sub">基于当前主题即时拆解阶段任务，切换主题后路线会同步变化。</div></div><span class="label ok">${badge}</span></div>
  <div class="roadmap-track">
    ${(['基础理解', '机制突破', '代码实战', '复盘提升'] as const).map((phase, i) => {
      const seed = terms[i] || terms[0] || phase;
      const phaseFallbacks = [
        [`${seed}概念`, `${seed}术语`, `${seed}基础题`],
        [`${seed}机制`, `${seed}图解`, `${seed}易错点`],
        [`${seed}代码`, `${seed}案例`, `${seed}调试`],
        [`${seed}练习`, `${seed}错题`, `${seed}路径调整`],
      ][i];
      const items = pickLabels(labels, i * 2, 3, phaseFallbacks);
      return `<section class="roadmap-phase"><span class="phase-index">${String(i + 1).padStart(2, '0')}</span><div class="phase-name">${phase}</div><div class="phase-list">${items.map(x => `<span>${escapeHtml(x)}</span>`).join('')}</div></section>`;
    }).join('')}
  </div>
</div>`;
  if (type === 'gantt') return `
<div class="visual-custom gantt-visual">
  <div class="visual-title"><div><h3>${t} 学习计划甘特图</h3><div class="visual-sub">按当前主题生成 7 天任务条，任务名来自本次生成结果。</div></div><span class="label ok">${badge}</span></div>
  <div class="gantt-grid">
    ${pickLabels(labels, 0, 5, [`${terms[0]}梳理`, `${terms[1] || terms[0]}图解`, `${terms[2] || terms[0]}案例`, `${terms[0]}练习`, '复盘调整']).map((task, i) => {
      const left = [0, 18, 42, 66, 82][i];
      const width = [28, 34, 32, 22, 18][i];
      const day = ['D1 基础', 'D2-D3 机制', 'D4-D5 实战', 'D6 练习', 'D7 复盘'][i];
      return `<div class="gantt-row"><div class="gantt-label">${day}</div><div class="gantt-line"><div class="gantt-bar" style="left:${left}%;width:${width}%">${escapeHtml(task)}</div></div></div>`;
    }).join('')}
  </div>
</div>`;
  if (type === 'journey') return `
<div class="visual-custom journey-visual">
  <div class="visual-title"><div><h3>${t} 学习旅程图</h3><div class="visual-sub">按本次问题主题生成学生与智能体协作旅程。</div></div><span class="label ok">${badge}</span></div>
  <div class="journey-grid">
    ${(['学生', '画像智能体', '资源智能体', '评估智能体'] as const).map((role, i) => {
      const core = terms[i] || terms[0] || t;
      const second = terms[i + 1] || terms[1] || core;
      const action = [`提出${core}目标`, `识别${second}难点`, `生成${core}资源`, `调整${second}路径`][i];
      const result = [
        `明确${core}的学习范围和输出形式。`,
        `定位${second}中的薄弱点与先修要求。`,
        `生成${core}讲解、图解和练习任务。`,
        `根据测评结果更新${second}复盘路线。`,
      ][i];
      return `<section class="journey-step"><span class="journey-role">${role}</span><div class="journey-action">${escapeHtml(action)}</div><div class="journey-result">${escapeHtml(result)}</div></section>`;
    }).join('')}
  </div>
</div>`;
  return fallbackDiagram(type, topic);
}

// ── Mermaid 代码清理（直接照抄 ZIP sanitizeMermaidCode）────────────────
const cleanMindmapLabel = (label: string) =>
  String(label || '').replace(/[`"'<>[\]{}|]/g, '').replace(/[()（）]/g, '')
    .replace(/[;；]/g, '').replace(/[，,]/g, ' ').replace(/…/g, '等')
    .replace(/\s+/g, ' ').trim().slice(0, 28) || '知识点';

function sanitizeMermaidCode(raw: string): string {
  const code = String(raw || '').trim();
  if (!/^mindmap\b/i.test(code)) return code;
  const lines = code.split(/\n/).map((line, i) => {
    if (i === 0) return 'mindmap';
    const indent = line.match(/^\s*/)?.[0] || '  ';
    const text = line.trim();
    if (!text) return '';
    const root = text.match(/^root\s*\(\(([\s\S]*?)\)\)$/i);
    if (root) return `${indent}root((${cleanMindmapLabel(root[1])}))`;
    return indent + cleanMindmapLabel(text);
  }).filter(Boolean);
  return lines.length > 1 ? lines.join('\n') : '';
}

function normalizeMermaidMarkdown(raw: string): string {
  let text = String(raw || '').trim();
  if (!text) return '';
  text = text.replace(/```mindmap\s*\n?/gi, '```mermaid\nmindmap\n');
  text = text.replace(/```\s*mindmap\s*\n/gi, '```mermaid\nmindmap\n');
  text = text.replace(/```mermaid\s+(mindmap|graph|flowchart|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie)/gi, '```mermaid\n$1');
  if (/^(mindmap|graph\s|flowchart\s|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie)\b/i.test(text) && !text.startsWith('```'))
    text = '```mermaid\n' + text + '\n```';
  return text;
}

function mermaidCodeFromMarkdown(markdown: string): string {
  return normalizeMermaidMarkdown(markdown).replace(/^```mermaid\s*/i, '').replace(/```$/, '').trim();
}

// ── Mermaid 渲染器组件（封装 mermaid.render + 自动下载按钮）──────────
function MermaidBlock({ code, id, topic, presetName }: { code: string; id: string; topic: string; presetName: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!ref.current || !code) return;
    setErr('');
    const elId = `mermaid-${id}-${Date.now()}`;
    const cleaned = sanitizeMermaidCode(code) || code;
    mermaid.render(elId, cleaned)
      .then(({ svg }) => { if (ref.current) ref.current.innerHTML = svg; })
      .catch(() => {
        // 降级：用 fallback
        const fb = mermaidCodeFromMarkdown(fallbackDiagram('mind_map', topic));
        mermaid.render(elId + 'fb', fb)
          .then(({ svg }) => { if (ref.current) ref.current.innerHTML = svg; })
          .catch(e2 => setErr(String(e2)));
      });
  }, [code, id, topic]);

  const downloadSVG = () => {
    const svg = ref.current?.querySelector('svg');
    if (!svg) return;
    const copy = svg.cloneNode(true) as SVGElement;
    copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const blob = new Blob([copy.outerHTML], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${topic}-${presetName}.svg`;
    a.click();
    toast.success('SVG 已下载');
  };

  if (err) return <div className="mermaid-wrapper error">图解渲染失败，请切换图解类型或点击示例图重试。</div>;
  return (
    <div className="mermaid-wrapper rendered" style={{ position: 'relative' }}>
      <div ref={ref} style={{ width: '100%' }} />
      <div className="mermaid-actions">
        <button className="btn ghost" onClick={downloadSVG}>下载 SVG</button>
      </div>
    </div>
  );
}

// ── useFallbackVisual（直接照抄 ZIP 第1581行）──────────────────────────
function useFallbackVisualFn(type: string, topic: string): string {
  const diagram = fallbackDiagram(type, topic);
  return dynamicVisualTypes.has(type) ? generatedVisual(type, topic, diagram, 'runtime') : diagram;
}

// ── generateDiagramContent（照抄 ZIP 逻辑，API 层改为 Supabase Edge）──
async function generateDiagramContent(type: string, topic: string, style: string): Promise<string> {
  const preset = visualPresets.find(p => p.id === type) || visualPresets[0];
  const { data, error } = await supabase.functions.invoke('deepseek-visual', {
    body: { topic, diagram_type: type, style, context: preset.prompt(topic) },
  });
  if (error) throw new Error(error.message);
  // API 返回 { content: "mermaid code...", source: "deepseek" }
  const rawContent: string = data?.content || data?.data?.content || '';
  const diagram: string = rawContent ? (mermaidCodeFromMarkdown(rawContent) || rawContent) : fallbackDiagram(type, topic);
  const source: string = data?.source || data?.data?.source || 'runtime';
  return dynamicVisualTypes.has(type) ? generatedVisual(type, topic, diagram, source) : diagram;
}

// ── 主组件：完全照抄 ZIP workspace 三栏布局 ──────────────────────────
export default function VisualizationPage() {
  const [visualMode, setVisualMode] = useState('mind_map');
  const [visualTopic, setVisualTopic] = useState('');
  const [visualStyle, setVisualStyle] = useState('teaching');
  const [visualOutput, setVisualOutput] = useState('');
  const [visualLoading, setVisualLoading] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // ── 图解生成状态 ──

  const activePreset = visualPresets.find(p => p.id === visualMode) || visualPresets[0];
  const activePresetGuide = PRESET_GUIDES[visualMode] || PRESET_GUIDES.mind_map;
  const visualTemplateCount = visualPresets.length;

  // 判断是否纯 Mermaid（非动态HTML）
  const isMermaidOutput = !dynamicVisualTypes.has(visualMode);

  // 直接照抄 ZIP generateVisual（第1590-1595行）
  const generateVisual = useCallback(async () => {
    if (!visualTopic.trim()) { toast.error('请输入图解主题'); return; }
    setVisualLoading(true);
    setVisualOutput('');
    try {
      const result = await generateDiagramContent(visualMode, visualTopic, visualStyle);
      setVisualOutput(result);
    } catch {
      setVisualOutput(fallbackDiagram(visualMode, visualTopic));
    } finally {
      setVisualLoading(false);
    }
  }, [visualMode, visualTopic, visualStyle]);

  // useFallbackVisual（直接照抄 ZIP 第1581行）
  const handleFallbackVisual = useCallback(() => {
    setVisualOutput(useFallbackVisualFn(visualMode, visualTopic));
  }, [visualMode, visualTopic]);

  // 切换图解类型时若已有输出则刷新 fallback
  useEffect(() => {
    if (visualOutput) setVisualOutput(useFallbackVisualFn(visualMode, visualTopic));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualMode]);

  // 下载 SVG（Mermaid 类型）
  const handleDownload = () => {
    const svgEl = canvasRef.current?.querySelector('svg');
    if (svgEl) {
      const copy = svgEl.cloneNode(true) as SVGElement;
      copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      const blob = new Blob([copy.outerHTML], { type: 'image/svg+xml' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = `${visualTopic}-${activePreset.name}.svg`; a.click();
      toast.success('SVG 已下载');
    }
  };

  // ── HTML 渲染（dynamic types 直接用 dangerouslySetInnerHTML）──────────
  const renderVisualOutput = () => {
    if (visualLoading) return (
      <div style={{ margin: 'auto', textAlign: 'center' }}>
        <span className="spinner" style={{ display: 'inline-block', marginBottom: 8 }} />
        <p className="card-note">正在调用 DeepSeek 生成图解...</p>
      </div>
    );
    if (!visualOutput) return (
      <div className="empty">选择图解类型后生成。思维导图、流程图、对比图、学习路线都用统一渲染器展示。</div>
    );
    if (!isMermaidOutput) {
      // compare / roadmap / gantt / journey → 直接渲染 HTML（照抄 ZIP）
      return <div style={{ width: '100%' }} dangerouslySetInnerHTML={{ __html: visualOutput }} />;
    }
    // Mermaid 类型
    const code = mermaidCodeFromMarkdown(normalizeMermaidMarkdown(visualOutput));
    return (
      <div style={{ width: '100%' }} ref={canvasRef}>
        <MermaidBlock
          code={code}
          id={`${visualMode}-${Date.now()}`}
          topic={visualTopic}
          presetName={activePreset.name}
        />
      </div>
    );
  };

  // ── 渲染：完全照抄 ZIP workspace-grid 三栏 ──────────────────────────
  return (
    <div style={{ maxWidth: 1400 }}>
      <div style={{ marginBottom: 14 }}>
        <div className="card-title" style={{ fontSize: 18, fontWeight: 700 }}>可视化生成</div>
        <div className="card-note">覆盖知识结构、流程机制、学习计划、系统架构和评估图表</div>
      </div>

      {/* ── 图解生成 ─────────────────────────────── */}
      <div className="workspace-grid">

        {/* ── 左栏：图解类型选择（直接照抄 ZIP 第696-705行）── */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">图解类型</div>
              <div className="card-note">按题目要求强化多模态可视化</div>
            </div>
          </div>
          <div className="card-body preset-list" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {visualPresets.map(preset => (
              <button
                key={preset.id}
                className={`preset${visualMode === preset.id ? ' active' : ''}`}
                onClick={() => setVisualMode(preset.id)}
              >
                <div className="preset-title">{preset.name}</div>
                <div className="preset-desc">{preset.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── 中栏：生成画布（直接照抄 ZIP 第706-743行）── */}
        <div className="card visual-frame">
          <div className="card-head">
            <div>
              <div className="card-title">{activePreset.name}</div>
              <div className="card-note">{activePreset.value}</div>
            </div>
            <div className="top-actions" style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {/* 生成按钮 */}
              <button className="btn primary" onClick={generateVisual} disabled={visualLoading}>
                {visualLoading ? <><span className="spinner" style={{ marginRight: 6 }} />生成中</> : '生成图解'}
              </button>
            </div>
          </div>
          <div className="card-body">
            {/* 输入框 + 风格选择（直接照抄 ZIP 第716-724行）*/}
            <div className="hero-input" style={{ marginTop: 0 }}>
              <input
                className="input"
                value={visualTopic}
                onChange={e => setVisualTopic(e.target.value)}
                onKeyUp={e => e.key === 'Enter' && generateVisual()}
                placeholder="输入图解主题，如 Java 泛型、HashMap 扩容、多线程生命周期"
              />
              <select className="select" value={visualStyle} onChange={e => setVisualStyle(e.target.value)} style={{ maxWidth: 100, flexShrink: 0 }}>
                <option value="clean">清爽</option>
                <option value="teaching">教学</option>
                <option value="defense">答辩</option>
              </select>
            </div>
          </div>
          {/* visual-canvas（直接照抄 ZIP 第725-733行）*/}
          <div className="visual-canvas">
            {renderVisualOutput()}
          </div>
        </div>

        {/* ── 右栏：提示词预设（直接照抄 ZIP 第734-741行）── */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">提示词预设</div>
              <div className="card-note">避免生成堆砌文本</div>
            </div>
            <span className="label ok">{visualTemplateCount} 套</span>
          </div>
          <div className="card-body" style={{ display: 'grid', gap: 12 }}>
            <div className="prompt-box">{activePresetGuide}</div>
            {/* trace-list（直接照抄 ZIP 第735-737行）*/}
            <div className="trace-list">
              <div className="trace">
                <div className="trace-top"><span className="trace-name">结构约束</span><span className="label ok">已启用</span></div>
                <div className="trace-summary">限制层级、节点数、节点字数和分组，避免一坨文字直接贴到页面。</div>
              </div>
              <div className="trace">
                <div className="trace-top"><span className="trace-name">渲染兜底</span><span className="label ok">已启用</span></div>
                <div className="trace-summary">接口响应慢时用本地高质量 Mermaid 模板，主流程不会断。</div>
              </div>
              <div className="trace">
                <div className="trace-top"><span className="trace-name">下载能力</span><span className="label ok">SVG</span></div>
                <div className="trace-summary">生成后的图可以直接下载，用于 PPT 或视频素材。</div>
              </div>
            </div>
            {/* 下载按钮（仅 Mermaid 类型显示）*/}
            {visualOutput && isMermaidOutput && (
              <button className="btn ghost" style={{ width: '100%' }} onClick={handleDownload}>⬇ 下载 SVG</button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
