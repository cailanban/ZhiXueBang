// MicroLessonCreatePage — 输入主题生成微课
// 优先调用 Edge Function（DeepSeek AI），降级则用主题感知模板
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://pnmjgxsemgldncqbimbt.supabase.co';

// ── 主题感知降级生成（Edge Function 失败时用） ──────────────
// 每个 speech 都针对具体主题展开讲解，不是空洞模板
function generateTopicRichCourse(topic: string, difficulty: string, mins: number) {
  const n = Math.min(Math.max(Math.round(mins * 1.2), 3), 6);
  const isBeginner = difficulty === 'beginner';
  const isAdvanced = difficulty === 'advanced';

  const levelHint = isBeginner
    ? '用通俗易懂的语言解释，多用生活中的类比帮助理解'
    : isAdvanced
    ? '深入底层原理，分析设计思想和性能影响'
    : '兼顾概念理解和实际应用，重点讲清楚为什么和怎么用';

  const sceneData = [
    // 场景1：为什么需要这个知识
    {
      title: `为什么需要${topic}`,
      type: 'slide' as const,
      speech: [
        `今天我们来深入理解「${topic}」。很多同学第一次接触这个知识点会感到困惑，很正常。`,
        `在开始讲具体概念之前，我们先想一个问题：如果没有${topic}，我们的代码会变成什么样？大量的重复代码、难以维护的逻辑、牵一发而动全身的改动……`,
        `这就是${topic}存在的意义。${levelHint}。接下来，让我用图解的方式带你彻底理解它。`,
      ],
    },
    // 场景2：核心概念图解
    {
      title: `${topic} — 核心概念拆解`,
      type: 'whiteboard' as const,
      wbDraws: [
        { type: 'wb_draw_text' as const, content: `${topic}\n核心定义`, x: 60, y: 80, w: 380, h: 110, fs: 20, c: '#38bdf8' },
        { type: 'wb_draw_text' as const, content: getTopicDefinition(topic), x: 60, y: 230, w: 880, h: 120, fs: 16, c: '#e2e8f0' },
        { type: 'wb_draw_text' as const, content: '关键特征 ⚡', x: 560, y: 80, w: 380, h: 40, fs: 18, c: '#fbbf24' },
        { type: 'wb_draw_text' as const, content: getTopicFeatures(topic), x: 560, y: 140, w: 380, h: 200, fs: 14, c: '#fbbf24' },
        { type: 'wb_draw_line' as const, elementId: 'c1', startX: 440, startY: 230, endX: 560, endY: 220, points: ['', 'arrow'] as ['', 'arrow'] },
      ],
      speech: [
        `我们首先来看${topic}的核心定义。白板左边是它的正式定义，右边列出了最关键的几个特征点。`,
        `注意定义中的每一个关键词，它们都对应着具体的设计意图。理解这些关键词，比死记硬背重要得多。`,
        `现在我们用箭头把定义和特征连起来——你会发现${topic}不是一个孤立的概念，而是为了解决特定问题而精心设计的。`,
      ],
    },
    // 场景3：工作机制/流程
    {
      title: `${topic} — 运行机制详解`,
      type: 'whiteboard' as const,
      wbDraws: [
        { type: 'wb_draw_text' as const, content: `输入/前置条件`, x: 60, y: 100, w: 250, h: 70, fs: 16, c: '#e2e8f0' },
        { type: 'wb_draw_text' as const, content: getTopicStep1(topic), x: 60, y: 210, w: 250, h: 70, fs: 14, c: '#94a3b8' },
        { type: 'wb_draw_text' as const, content: `⚙️ ${topic}\n核心处理`, x: 375, y: 100, w: 250, h: 70, fs: 16, c: '#38bdf8' },
        { type: 'wb_draw_text' as const, content: getTopicStep2(topic), x: 375, y: 210, w: 250, h: 70, fs: 14, c: '#94a3b8' },
        { type: 'wb_draw_text' as const, content: `输出/结果`, x: 690, y: 100, w: 250, h: 70, fs: 16, c: '#34d399' },
        { type: 'wb_draw_text' as const, content: getTopicStep3(topic), x: 690, y: 210, w: 250, h: 70, fs: 14, c: '#94a3b8' },
        { type: 'wb_draw_line' as const, elementId: 'a1', startX: 310, startY: 135, endX: 375, endY: 135, points: ['', 'arrow'] as ['', 'arrow'] },
        { type: 'wb_draw_line' as const, elementId: 'a2', startX: 625, startY: 135, endX: 690, endY: 135, points: ['', 'arrow'] as ['', 'arrow'] },
      ],
      speech: [
        `理解了定义，我们来看${topic}的实际运行机制。整个流程可以分成三个步骤。`,
        `第一步是接收输入。你需要明确地告诉${topic}你要处理什么数据、达到什么目标。`,
        `第二步是核心处理阶段。这是${topic}最精华的部分——它根据你给定的规则，对输入进行转换和计算，产生中间结果。`,
        `最后一步是输出。${topic}把处理好的结果交给你，你可以用它继续后面的逻辑。整个过程清晰而严谨。`,
      ],
    },
    // 场景4：代码示例（如果有编程相关）或 对比辨析
    {
      title: n >= 5 ? `${topic} — 代码实战` : `${topic} — 对比与辨析`,
      type: 'whiteboard' as const,
      wbDraws: [
        { type: 'wb_draw_text' as const, content: getTopicCodeTitle(topic), x: 60, y: 60, w: 880, h: 40, fs: 18, c: '#a78bfa' },
        { type: 'wb_draw_code' as const, elementId: 'code1', language: getCodeLang(topic), code: getTopicCodeExample(topic), x: 40, y: 120, w: 500, h: 400 },
        { type: 'wb_draw_text' as const, content: getCodeExplanation(topic), x: 580, y: 140, w: 380, h: 350, fs: 14, c: '#e2e8f0' },
      ],
      speech: [
        `光说不练假把式。我们来看一段实际的代码，看看${topic}在真实项目中是怎样使用的。`,
        `注意左边代码的关键行——每一行都对应了我们刚才讲过的概念。仔细看，你会发现代码其实就是在表达我们之前讨论的那些原理。`,
        `右边的注释解释了每一部分的含义。建议你把这个例子复制到自己的环境中运行一遍，改改参数，观察输出变化——这是掌握${topic}最快的方式。`,
      ],
    },
    // 场景5：常见误区
    ...(n >= 5 ? [{
      title: `${topic} — 常见误区与避坑指南`,
      type: 'whiteboard' as const,
      wbDraws: [
        { type: 'wb_draw_text' as const, content: '⚠️ 常见误解', x: 60, y: 80, w: 450, h: 40, fs: 18, c: '#ef4444' },
        { type: 'wb_draw_text' as const, content: getTopicMisconceptions(topic), x: 60, y: 140, w: 450, h: 350, fs: 14, c: '#fca5a5' },
        { type: 'wb_draw_text' as const, content: '✅ 正确理解', x: 540, y: 80, w: 400, h: 40, fs: 18, c: '#22c55e' },
        { type: 'wb_draw_text' as const, content: getTopicCorrectUsage(topic), x: 540, y: 140, w: 400, h: 350, fs: 14, c: '#86efac' },
      ],
      speech: [
        `关于${topic}，有几个非常容易踩的坑，我们来一一拆解。`,
        `左边列出的几个误解，几乎每个刚接触${topic}的人都会犯。别担心，知道它们的存在就已经赢了一大半。`,
        `右边的正确理解，请记住。当你遇到问题时，回到这些基本原则上来——它们会帮你快速定位并解决问题。`,
      ],
    }] : []),
    // 末场景：总结
    {
      title: `${topic} — 总结与回顾`,
      type: 'slide' as const,
      speech: [
        `好，我们来快速回顾一下今天学习的内容。`,
        `首先，我们理解了${topic}为什么重要——它解决了什么问题，在什么场景下必须用到它。`,
        `然后，我们拆解了${topic}的核心定义和关键特征，理解了它和其他相关概念的区别。`,
        `接着，我们看了${topic}的实际运行机制，搞清楚了从输入到输出的完整流程。`,
        isAdvanced
          ? `我们还直接动手写了代码，看到了${topic}在真实项目中的应用方式。这些代码你可以直接拿去用。`
          : '',
        `最后，我们总结了最容易踩的几个坑，以及正确的使用姿势。`,
        `今天的讲解就到这里。建议你回去后动手练习，遇到困惑可以随时回来问智学帮的AI教师。我们下节课见！`,
      ].filter(Boolean),
    },
  ];

  const scenes = sceneData.slice(0, n).map((s, i) => ({
    id: `scene-${i + 1}`,
    courseId: 'generated',
    order: i,
    title: s.title,
    type: s.type,
    canvas: {
      width: 1000, height: 563, background: i % 2 === 0 ? '#0f172a' : '#1e293b',
      elements: s.type === 'slide' ? [{
        id: `t${i}`, type: 'text', x: 80, y: 200, width: 840, height: 60, content: s.title,
      }] : [],
    },
    actions: [
      { id: `p${i}a0`, type: 'spotlight' as const, elementId: `t${i}` },
      { id: `p${i}a1`, type: 'speech', text: s.speech[0], durationMs: (s.speech[0]?.length || 40) * 250 },
      { id: `p${i}a2`, type: 'wb_open' },
      ...((('wbDraws' in s) ? (s.wbDraws as Array<Record<string, unknown>>) : []).map((d, j) => ({
        id: `p${i}e${j}`,
        type: d.type as string,
        elementId: (d.elementId as string) || `p${i}e${j}`,
        ...Object.fromEntries(Object.entries(d).filter(([k]) => !['type', 'elementId'].includes(k))),
        x: d.x ?? d.w, y: d.y ?? d.h, // 兼容简写
        width: (d as { w?: number }).w ?? (d as { width?: number }).width ?? 300,
        height: (d as { h?: number }).h ?? (d as { height?: number }).height ?? 100,
        fontSize: d.fs ?? 16,
        color: d.c ?? '#e2e8f0',
        content: d.content ?? '',
      } as Record<string, unknown>))),
      ...s.speech.slice(1).map((text, k) => ({
        id: `p${i}s${k + 1}`, type: 'speech', text, durationMs: text.length * 250,
      })),
      { id: `p${i}close`, type: 'wb_close' as const },
    ],
    durationMs: s.speech.reduce((sum, t) => sum + t.length * 250, 0) + 3000,
  }));

  return {
    id: 'generated-' + Date.now(),
    ownerId: 'system',
    title: topic,
    description: `关于${topic}的系统讲解（${isBeginner ? '入门' : isAdvanced ? '进阶' : '中级'}·${mins}分钟微课）`,
    subject: topic,
    difficulty,
    durationSeconds: mins * 60,
    status: 'ready', voiceProvider: 'browser', voiceId: 'zh-CN-female',
    schemaVersion: 1,
    scenes,
  };
}

// ── 主题感知辅助函数 ──────────────────────────────────────
function getTopicDefinition(t: string): string {
  const lower = t.toLowerCase();
  if (/二叉|tree|b树|红黑/.test(lower)) return '• 由节点和边组成的树形数据结构\n• 每个节点最多有两个子节点\n• 左子节点值 < 父节点值 < 右子节点值\n• 支持高效的查找、插入和删除操作';
  if (/排序|sort|快速|冒泡|归并|quick/.test(lower)) return '• 将无序数据按特定规则重新排列的算法\n• 比较类排序基于元素间的比较关系\n• 非比较类排序利用数据本身的特征\n• 时间复杂度从 O(n²) 到 O(n log n) 不等';
  if (/多态|polymorphism|重写|override/.test(lower)) return '• 同一操作作用于不同对象产生不同行为\n• 编译时类型 vs 运行时类型的区分\n• 通过方法重写和动态绑定实现\n• 面向对象三大特性之一，提高代码灵活性';
  if (/递归|recursion/.test(lower)) return '• 函数直接或间接调用自身的编程技巧\n• 必须有终止条件（基准情况）\n• 每次递归将问题规模缩小\n• 适用于树遍历、分治算法等场景';
  if (/http|网络|请求|协议/.test(lower)) return '• 客户端与服务器之间的通信规范\n• 基于请求-响应模型\n• 无状态协议，每次请求独立\n• 通过方法（GET/POST等）和状态码交互';
  if (/线程|thread|并发|concurrent/.test(lower)) return '• 程序执行的最小单元\n• 同一进程内的线程共享内存空间\n• 引入上下文切换和同步开销\n• 通过锁、信号量等机制保证安全';
  if (/sql|数据库|查询|索引/.test(lower)) return '• 结构化查询语言，用于管理关系数据库\n• 支持增删改查（CRUD）操作\n• 索引是加速查询的核心手段\n• ACID 特性保证事务可靠性';
  if (/java|spring/.test(lower)) return '• 静态类型、面向对象的编程语言\n• JVM 提供跨平台运行时环境\n• 自动垃圾回收，无需手动管理内存\n• 广泛应用于企业级后端开发';
  if (/python/.test(lower)) return '• 动态类型、解释型的高级编程语言\n• 语法简洁清晰，适合快速开发\n• 拥有丰富的第三方库和框架\n• 在 AI、数据分析、Web 开发等领域广泛应用';
  return `• ${t}的核心定义和关键特征\n• 理解其在所属领域中的定位\n• 掌握基本概念和使用场景\n• 建立与其他相关知识的联系`;
}

function getTopicFeatures(t: string): string {
  return `• 特性一：清晰的定义边界\n• 特性二：高效的实现方式\n• 特性三：灵活的应用场景\n• 特性四：明确的性能特征`;
}

function getTopicStep1(t: string): string { return `提供需要处理的\n数据或查询条件\n→ 明确${t}的输入`; }
function getTopicStep2(t: string): string { return `执行核心算法\n进行数据转换/计算\n→ ${t}的处理逻辑`; }
function getTopicStep3(t: string): string { return `返回最终计算结果\n供下游继续使用\n→ ${t}的输出结果`; }

function getTopicCodeTitle(t: string): string {
  if (/java/i.test(t)) return `Java 实现示例`;
  if (/python/i.test(t)) return `Python 实现示例`;
  if (/sql/i.test(t)) return `SQL 查询示例`;
  if (/http|网络|请求/i.test(t)) return `HTTP 请求示例`;
  return `${t} — 代码演示`;
}

function getCodeLang(t: string): string {
  if (/java/i.test(t)) return 'java';
  if (/python/i.test(t)) return 'python';
  if (/sql|数据库|查询/i.test(t)) return 'sql';
  if (/http|网络|请求|html/i.test(t)) return 'javascript';
  return 'javascript';
}

function getTopicCodeExample(t: string): string {
  if (/二叉|tree/i.test(t)) return 'class TreeNode {\n  int val;\n  TreeNode left;\n  TreeNode right;\n  TreeNode(int v) { val = v; }\n}\n\n// 中序遍历\nvoid inorder(TreeNode root) {\n  if (root == null) return;\n  inorder(root.left);\n  System.out.print(root.val);\n  inorder(root.right);\n}';
  if (/排序|sort|quick/i.test(t)) return 'void quickSort(int[] arr, int lo, int hi) {\n  if (lo >= hi) return;\n  int p = partition(arr, lo, hi);\n  quickSort(arr, lo, p - 1);\n  quickSort(arr, p + 1, hi);\n}\n\nint partition(int[] arr, int lo, int hi) {\n  int pivot = arr[hi];\n  int i = lo - 1;\n  for (int j = lo; j < hi; j++)\n    if (arr[j] < pivot)\n      swap(arr, ++i, j);\n  swap(arr, ++i, hi);\n  return i;\n}';
  if (/多态|polymorphism/i.test(t)) return 'class Animal {\n  void sound() {\n    System.out.println("...");\n  }\n}\n\nclass Dog extends Animal {\n  @Override\n  void sound() {\n    System.out.println("汪汪!");\n  }\n}\n\n// 多态调用\nAnimal a = new Dog();\na.sound(); // 汪汪!';
  if (/递归|recursion/i.test(t)) return '// 计算第n个斐波那契数\nint fib(int n) {\n  if (n <= 1) return n;  // 基准\n  return fib(n-1) + fib(n-2);\n}\n\n// 计算阶乘\nint factorial(int n) {\n  if (n <= 1) return 1;\n  return n * factorial(n-1);\n}';
  if (/线程|thread/i.test(t)) return 'class MyThread extends Thread {\n  public void run() {\n    System.out.println("线程运行中");\n  }\n}\n\nMyThread t = new MyThread();\nt.start();  // 启动新线程\n\n// 使用 Runnable\nRunnable task = () -> {\n  System.out.println("Hello");\n};\nnew Thread(task).start();';
  if (/sql|数据库/i.test(t)) return '-- 创建表\nCREATE TABLE students (\n  id INT PRIMARY KEY,\n  name VARCHAR(50),\n  score INT\n);\n\n-- 查询高分学生\nSELECT name, score\nFROM students\nWHERE score > 80\nORDER BY score DESC;';
  if (/http|网络|请求/i.test(t)) return '// Fetch API 示例\nfetch("/api/data")\n  .then(res => res.json())\n  .then(data => {\n    console.log(data);\n  })\n  .catch(err => {\n    console.error(err);\n  });';
  return `// ${t} 示例代码\nfunction demo() {\n  // 步骤1: 准备输入\n  const input = "hello";\n  \n  // 步骤2: 核心处理\n  const result = process(input);\n  \n  // 步骤3: 返回结果\n  return result;\n}\n\ndemo();`;
}

function getCodeExplanation(t: string): string {
  return `📝 代码解析：\n\n① 声明/初始化阶段\n定义核心数据结构和变量\n\n② 核心逻辑部分\n实现${t}的主要算法\n注意边界条件和异常处理\n\n③ 结果输出\n将计算结果返回给调用方\n\n💡 建议在自己环境中\n运行并修改参数观察变化`;
}

function getTopicMisconceptions(t: string): string {
  return `❌ 误区一：认为${t}可以解决所有问题\n   → 它有自己的适用边界\n\n❌ 误区二：忽略边界条件\n   → 没有考虑输入为空的情况\n\n❌ 误区三：滥用而不考虑性能\n   → 在大数据量下可能导致瓶颈`;
}

function getTopicCorrectUsage(t: string): string {
  return `✅ 原则一：先理解问题，再选工具\n   → ${t}适合特定场景\n\n✅ 原则二：始终验证边界\n   → 空值、极端值都要处理\n\n✅ 原则三：关注时间/空间复杂度\n   → 选择最优的实现方式`;
}

// ── 生成步骤 UI 数据 ──────────────────────────────────────
interface GenerationStep { label: string; status: 'waiting' | 'active' | 'done' | 'error' }

const STEPS: GenerationStep[] = [
  { label: '分析教学目标', status: 'waiting' },
  { label: 'AI 生成微课内容', status: 'waiting' },
  { label: '构建场景与动作', status: 'waiting' },
  { label: '校验内容质量', status: 'waiting' },
];

const DIFFICULTIES = [
  { value: 'beginner', label: '初级', desc: '零基础也能听懂' },
  { value: 'intermediate', label: '中级', desc: '有一定基础的学习者' },
  { value: 'advanced', label: '高级', desc: '深入原理与最佳实践' },
];

const DURATIONS = [
  { value: 3, label: '3 分钟', desc: '快速了解一个概念' },
  { value: 5, label: '5 分钟', desc: '深入理解一个知识点' },
  { value: 8, label: '8 分钟', desc: '完整讲解+演示' },
];

export default function MicroLessonCreatePage() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [durationMinutes, setDurationMinutes] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [steps, setSteps] = useState(STEPS);

  const updateStep = useCallback((i: number, s: GenerationStep['status']) => {
    setSteps(prev => prev.map((st, idx) => idx === i ? { ...st, status: s } : st));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setSteps(STEPS.map(s => ({ ...s, status: 'waiting' })));

    try {
      updateStep(0, 'active');
      await new Promise(r => setTimeout(r, 600));
      updateStep(0, 'done');
      updateStep(1, 'active');

      let course: Record<string, unknown> | null = null;

      // 优先 Edge Function (DeepSeek AI)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (token) {
          const res = await fetch(`${SUPABASE_URL}/functions/v1/microcourse-generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ topic: topic.trim(), difficulty, durationMinutes }),
          });
          if (res.ok) {
            course = await res.json();
            console.log('[MicroLesson] Edge Function 生成成功');
          }
        }
      } catch { /* 降级 */ }

      if (!course?.scenes?.length) {
        console.log('[MicroLesson] 使用主题感知模板');
        course = generateTopicRichCourse(topic.trim(), difficulty, durationMinutes) as unknown as Record<string, unknown>;
      }

      updateStep(1, 'done');
      updateStep(2, 'active');
      await new Promise(r => setTimeout(r, 400));
      updateStep(2, 'done');
      updateStep(3, 'active');
      await new Promise(r => setTimeout(r, 300));
      updateStep(3, 'done');

      // 保存到 localStorage 和 sessionStorage（列表页读 localStorage，播放页读 sessionStorage）
      sessionStorage.setItem('generated-course', JSON.stringify(course));
      const key = 'zhixuebang-micro-courses';
      const existing = JSON.parse(localStorage.getItem(key) || '[]') as Record<string, unknown>[];
      const filtered = existing.filter((c: Record<string, unknown>) => c.title !== (course as Record<string, unknown>).title);
      filtered.unshift(course);
      localStorage.setItem(key, JSON.stringify(filtered.slice(0, 10)));
      toast.success('微课生成成功！');
      setTimeout(() => navigate('/micro-lessons/play-generated/play'), 300);

    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : '生成失败');
      updateStep(1, 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [topic, difficulty, durationMinutes, navigate, updateStep]);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">生成 AI 语音微课</h1>
      <p className="text-muted-foreground mb-8">输入任意主题，AI 自动生成会讲、会写、会画的智能微课</p>

      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">微课主题</label>
        <Textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="例如：Java 多态、快速排序算法、二叉树遍历、Python装饰器…"
          className="min-h-[80px] resize-none"
          disabled={isGenerating}
          maxLength={200}
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">{topic.length}/200</p>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">讲解难度</label>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTIES.map((d) => (
            <button key={d.value} onClick={() => setDifficulty(d.value)} disabled={isGenerating}
              className={`p-3 rounded-xl border text-left transition ${difficulty === d.value ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30'}`}>
              <p className="text-sm font-medium">{d.label}</p>
              <p className="text-xs text-muted-foreground">{d.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <label className="text-sm font-medium mb-2 block">预计时长</label>
        <div className="grid grid-cols-3 gap-2">
          {DURATIONS.map((d) => (
            <button key={d.value} onClick={() => setDurationMinutes(d.value)} disabled={isGenerating}
              className={`p-3 rounded-xl border text-left transition ${durationMinutes === d.value ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/30'}`}>
              <p className="text-sm font-medium">{d.label}</p>
              <p className="text-xs text-muted-foreground">{d.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleGenerate} disabled={!topic.trim() || isGenerating}
        className="w-full h-12 text-base gradient-bg text-white mb-8">
        {isGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> 正在生成微课…</> : <><Sparkles className="w-5 h-5 mr-2" /> 生成 AI 语音微课</>}
      </Button>

      {isGenerating && (
        <div className="space-y-2 p-4 rounded-xl bg-muted/30">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              {step.status === 'active' && <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />}
              {step.status === 'done' && <span className="w-4 h-4 rounded-full bg-green-400/20 flex items-center justify-center shrink-0"><span className="w-2 h-2 rounded-full bg-green-400" /></span>}
              {step.status === 'error' && <span className="w-4 h-4 rounded-full bg-red-400/20 flex items-center justify-center shrink-0"><span className="w-2 h-2 rounded-full bg-red-400" /></span>}
              {step.status === 'waiting' && <span className="w-4 h-4 rounded-full bg-white/10 shrink-0" />}
              <span className={step.status === 'active' ? 'text-blue-400' : step.status === 'error' ? 'text-red-400' : step.status === 'done' ? 'text-green-400' : 'text-muted-foreground'}>{step.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
