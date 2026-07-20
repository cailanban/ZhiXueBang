import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Brain, BookOpen, Sparkles, BarChart3, GraduationCap,
  ArrowRight, CheckCircle, Zap, Target, LineChart, FileText,
  MessageSquare, Map, Layers, Code, ListChecks, Lightbulb, LayoutList, Compass
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef } from 'react';

const BRANDS = ['DeepSeek V4', 'Spark Pro'];
const STATS = [
  { value: '500+', label: '知识点' },
  { value: '12+', label: '资源类型' },
  { value: '12', label: '智能体' },
  { value: '4', label: '学习阶段' },
];
const FEATURES = [
  { num: '01', icon: Brain, title: '智能对话', desc: '多模态AI对话，支持文字与图片输入，实时流式回复。内置RAG知识库检索，让每次对话都有据可依。', color: '#4F46E5' },
  { num: '02', icon: GraduationCap, title: '诊断型AI辅导', desc: '独创"教-检-进"教学节奏，深度诊断知识漏洞。自适应Level 1-5教学深度，精准填补知识空缺。', color: '#7C3AED' },
  { num: '03', icon: BarChart3, title: '六维学习画像', desc: '从知识基础、认知风格、学习偏好、易错点、学习目标、学习节奏六个维度构建个人学习画像。', color: '#4F46E5' },
  { num: '04', icon: Sparkles, title: '多模态资源生成', desc: '一键生成练习题、代码案例、PPT课件、AI课程讲解，十二智能体并行协作赋能学习资源创作。', color: '#7C3AED' },
  { num: '05', icon: FileText, title: '学习笔记与错题本', desc: '富文本学习笔记，支持标签分类与课程关联。错题自动收录，复习模式逐题攻克薄弱点。', color: '#4F46E5' },
  { num: '06', icon: Target, title: '结构化学习路径', desc: '基础→进阶→实战→评估四阶段规划。动态调整路径，基于评估结果精准推荐下一步。', color: '#7C3AED' },
];

// 十二智能体轨道配置
const ORBIT_ITEMS = [
  { icon: MessageSquare, name: '对话智能体', desc: 'RAG增强问答', color: '#4F46E5', ring: 0 },
  { icon: GraduationCap, name: '辅导智能体', desc: '诊断型教学', color: '#7C3AED', ring: 0 },
  { icon: LineChart, name: '画像智能体', desc: '六维能力分析', color: '#6D28D9', ring: 0 },
  { icon: BookOpen, name: '知识库智能体', desc: '文档检索管理', color: '#4338CA', ring: 0 },
  { icon: Target, name: '路径智能体', desc: '学习规划调整', color: '#4F46E5', ring: 0 },
  { icon: Compass, name: '课程架构师', desc: '知识体系分解', color: '#0891B2', ring: 0 },
  { icon: FileText, name: '讲义编写师', desc: '文档内容生成', color: '#059669', ring: 0 },
  { icon: Lightbulb, name: '思维导图师', desc: 'Mermaid导图', color: '#D97706', ring: 0 },
  { icon: ListChecks, name: '题库出题师', desc: '练习题目生成', color: '#DC2626', ring: 0 },
  { icon: Code, name: '代码案例师', desc: 'Java代码示例', color: '#7C3AED', ring: 0 },
  { icon: LayoutList, name: '资源推荐师', desc: '阅读清单推荐', color: '#BE185D', ring: 0 },
  { icon: CheckCircle, name: '质量审核师', desc: '内容质量校验', color: '#059669', ring: 0 },
];

// 内圈能力标签
const INNER_ITEMS = [
  { icon: MessageSquare, label: '智能问答' },
  { icon: Map,           label: '路径规划' },
  { icon: Layers,        label: '多模态' },
  { icon: FileText,      label: '知识管理' },
];

function BrandScroll() {
  const ref = useRef<HTMLDivElement>(null);
  // 只有2个品牌，复制多份保证滚动流畅
  const repeated = Array.from({ length: 8 }, () => BRANDS).flat();
  return (
    <div className="overflow-hidden w-full py-4 relative">
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to right, hsl(var(--background)), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to left, hsl(var(--background)), transparent)' }} />
      <div ref={ref} className="flex gap-8 w-max animate-[scroll_12s_linear_infinite]">
        {repeated.map((b, i) => (
          <div key={i} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-card whitespace-nowrap">
            <div className="w-2 h-2 rounded-full gradient-bg" />
            <span className="text-sm text-muted-foreground font-semibold tracking-wide">{b}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}

// ===== 轨道旋转组件（参考 zhmt88.com 效果）=====
function OrbitalSection() {
  const outerR = 200; // 外圈半径（px）
  const innerR = 108; // 内圈半径（px）

  return (
    <section className="py-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(79,70,229,0.06) 50%, transparent 100%)' }}>
      {/* 背景光晕 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] opacity-10"
          style={{ background: 'radial-gradient(circle, #4F46E5, transparent)' }} />
      </div>

      <div className="container mx-auto px-6">
        <motion.div className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-4xl font-bold text-foreground mb-4">十二智能体协同架构</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">分工协作，专注精通，每个智能体都是领域专家</p>
        </motion.div>

        {/* 轨道容器 */}
        <div className="flex items-center justify-center">
          <div className="relative flex items-center justify-center" style={{ width: outerR * 2 + 100, height: outerR * 2 + 100 }}>

            {/* 外圈轨道装饰线 */}
            <div className="absolute rounded-full border border-dashed pointer-events-none"
              style={{ width: outerR * 2, height: outerR * 2, borderColor: 'rgba(79,70,229,0.2)' }} />
            {/* 内圈轨道装饰线 */}
            <div className="absolute rounded-full border border-dashed pointer-events-none"
              style={{ width: innerR * 2, height: innerR * 2, borderColor: 'rgba(124,58,237,0.25)' }} />

            {/* 外圈旋转容器 */}
            <motion.div className="absolute"
              style={{ width: outerR * 2, height: outerR * 2 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}>
              {ORBIT_ITEMS.map(({ icon: Icon, name, desc, color }, i) => {
                const angle = (i / ORBIT_ITEMS.length) * 360;
                const rad = (angle * Math.PI) / 180;
                const x = outerR + outerR * Math.cos(rad) - 40;
                const y = outerR + outerR * Math.sin(rad) - 40;
                return (
                  <motion.div key={name}
                    className="absolute w-20 h-20 flex flex-col items-center justify-center rounded-2xl cursor-default"
                    style={{
                      left: x, top: y,
                      background: `${color}18`,
                      border: `1px solid ${color}40`,
                      backdropFilter: 'blur(8px)',
                    }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                    whileHover={{ scale: 1.12, zIndex: 20 }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-1"
                      style={{ background: `${color}30` }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <p className="text-[10px] font-semibold text-foreground leading-tight text-center px-1">{name}</p>
                    <p className="text-[9px] text-muted-foreground leading-tight text-center px-1 mt-0.5">{desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* 内圈旋转容器（反方向，稍慢） */}
            <motion.div className="absolute"
              style={{ width: innerR * 2, height: innerR * 2 }}
              animate={{ rotate: -360 }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}>
              {INNER_ITEMS.map(({ icon: Icon, label }, i) => {
                const angle = (i / INNER_ITEMS.length) * 360 + 45;
                const rad = (angle * Math.PI) / 180;
                const x = innerR + innerR * Math.cos(rad) - 26;
                const y = innerR + innerR * Math.sin(rad) - 26;
                return (
                  <motion.div key={label}
                    className="absolute w-[52px] h-[52px] flex flex-col items-center justify-center rounded-xl"
                    style={{ left: x, top: y, background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(79,70,229,0.3)' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}>
                    <Icon className="w-4 h-4 text-primary mb-0.5" />
                    <p className="text-[9px] text-muted-foreground font-medium text-center leading-tight px-0.5">{label}</p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* 中心核心 */}
            <motion.div
              className="relative z-10 flex flex-col items-center justify-center rounded-full"
              style={{
                width: 88, height: 88,
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                boxShadow: '0 0 40px rgba(79,70,229,0.5), 0 0 80px rgba(79,70,229,0.2)',
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
              <Brain className="w-8 h-8 text-white mb-1" />
              <span className="text-[11px] text-white font-bold tracking-wide">智学帮</span>
            </motion.div>

            {/* 连接射线（装饰） */}
            <svg className="absolute pointer-events-none opacity-10"
              style={{ width: outerR * 2 + 100, height: outerR * 2 + 100, top: 0, left: 0 }}>
              {ORBIT_ITEMS.map((_, i) => {
                const angle = (i / ORBIT_ITEMS.length) * 360;
                const rad = (angle * Math.PI) / 180;
                const cx = outerR + 50;
                const cy = outerR + 50;
                const ex = cx + outerR * Math.cos(rad);
                const ey = cy + outerR * Math.sin(rad);
                return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="#4F46E5" strokeWidth="1" strokeDasharray="4 6" />;
              })}
            </svg>
          </div>
        </div>

        {/* 底部文字说明 */}
        <div className="flex flex-wrap justify-center gap-3 mt-12">
          {ORBIT_ITEMS.map(({ name, color }) => (
            <div key={name} className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50"
        style={{ background: 'rgba(10,11,13,0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-bg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">智学帮</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">功能特性</a>
            <a href="#agents" className="hover:text-foreground transition-colors">智能体</a>
            <a href="#stats" className="hover:text-foreground transition-colors">数据统计</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">登录</Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="gradient-bg text-white hover:opacity-90 font-medium">
                免费开始
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20"
            style={{ background: 'radial-gradient(circle, #4F46E5, transparent)' }} />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-15"
            style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] opacity-10"
            style={{ background: 'radial-gradient(circle, #4F46E5, transparent)' }} />
        </div>
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(79,70,229,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
              style={{ background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.3)', color: '#818cf8' }}>
              <Zap className="w-4 h-4" />
              软件杯 A3 赛题 · 以《Java 语言程序设计》为切入 · 高校 AI 教育平台
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              下一代
              <span className="gradient-text block md:inline"> AI学习平台</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              以《Java 语言程序设计》为教学主线 · 十二智能体协同<br />
              诊断型教学 · 多模态资源生成 · 让每个学习者拥有专属AI导师
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/login">
                <Button size="lg" className="gradient-bg text-white font-semibold text-base h-12 px-8 hover:opacity-90 group">
                  立即开始学习
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/status">
                <Button size="lg" variant="ghost"
                  className="h-12 px-8 font-semibold text-base border border-border hover:border-primary/50 hover:text-primary transition-colors">
                  查看系统状态
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div id="stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map(({ value, label }) => (
              <div key={label} className="glass-card rounded-2xl p-5 glow-card">
                <div className="text-3xl font-bold gradient-text">{value}</div>
                <div className="text-sm text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Brand scroll */}
      <div className="border-y border-border py-2">
        <p className="text-center text-xs text-muted-foreground mb-3">集成主流AI大模型</p>
        <BrandScroll />
      </div>

      {/* Features */}
      <section id="features" className="py-24 container mx-auto px-6">
        <motion.div className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-4xl font-bold text-foreground mb-4">产品特性</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">六大核心能力，覆盖学习全周期</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ num, icon: Icon, title, desc, color }, i) => (
            <motion.div key={num} className="glass-card rounded-2xl p-6 glow-card cursor-default"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <span className="text-4xl font-bold opacity-10 text-foreground">{num}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 轨道旋转智能体展示区 */}
      <div id="agents">
        <OrbitalSection />
      </div>

      {/* CTA */}
      <section className="py-24 container mx-auto px-6 text-center">
        <motion.div className="glass-card rounded-3xl p-12 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="absolute inset-0 pointer-events-none opacity-30"
            style={{ background: 'radial-gradient(ellipse at center, rgba(79,70,229,0.3), transparent 70%)' }} />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-6 flex-wrap mb-6 text-sm text-muted-foreground">
              {['永久免费', '无需信用卡', '立即可用'].map(t => (
                <div key={t} className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-primary" />{t}</div>
              ))}
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">开始您的AI学习之旅</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">加入智学帮，体验AI驱动的个性化学习新时代</p>
            <Link to="/login">
              <Button size="lg" className="gradient-bg text-white font-bold text-base h-13 px-10 hover:opacity-90 group">
                立即免费注册
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center gradient-bg">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold gradient-text">智学帮</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 智学帮 · 软件杯 A3 赛题作品 · 以《Java 语言程序设计》为教学主线</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">隐私政策</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">用户协议</Link>
            <Link to="/status" className="hover:text-foreground transition-colors">系统状态</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
