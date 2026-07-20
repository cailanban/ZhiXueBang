import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import { Eye, EyeOff, Brain, BookOpen, Sparkles, Users, BarChart3, GraduationCap, Award } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const [form, setForm] = useState({ email: '', password: '', username: '' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard');
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !agreed) { toast.error('请先同意用户协议和隐私政策'); return; }
    if (!form.email || !form.password) { toast.error('请填写邮箱和密码'); return; }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;
        toast.success('登录成功');
        navigate('/dashboard');
      } else {
        const { data, error } = await supabase.functions.invoke('register-user', {
          body: { email: form.email, password: form.password, username: form.username || form.email.split('@')[0] }
        });
        if (error) throw new Error(await error?.context?.text() || error.message);
        if (data?.error) throw new Error(data.error);
        const { error: loginErr } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
        if (loginErr) throw loginErr;
        toast.success('注册成功，欢迎使用智学帮！');
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // ── 评委一键体验：自动登录演示账号 ───────────────────────
  const DEMO_EMAIL = 'evaluator@zhixuebang.demo';
  const DEMO_PASSWORD = 'Demo@2026#';

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // 1. 尝试直接登录
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });

      if (!loginErr) {
        toast.success('评委体验登录成功');
        navigate('/dashboard');
        return;
      }

      // 2. 登录失败 → 尝试注册
      const { data, error } = await supabase.functions.invoke('register-user', {
        body: { email: DEMO_EMAIL, password: DEMO_PASSWORD, username: '评委体验账号' },
      });

      if (error) throw new Error(await error?.context?.text() || error.message);
      if (data?.error) throw new Error(data.error);

      // 3. 注册成功后登录
      const { error: retryErr } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });

      if (retryErr) throw retryErr;
      toast.success('评委体验账号已创建，登录成功');
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '登录失败';
      toast.error('评委体验入口暂不可用：' + msg);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Brain, label: '智能对话', desc: '多模态AI学习助手' },
    { icon: BookOpen, label: '知识库', desc: '个人知识管理系统' },
    { icon: BarChart3, label: '学习画像', desc: '六维能力可视化' },
    { icon: GraduationCap, label: '诊断辅导', desc: '教-检-进自适应教学' },
    { icon: Sparkles, label: '资源生成', desc: 'PPT/思维导图/练习题' },
    { icon: Users, label: '学习路径', desc: '四阶段结构化规划' },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col w-1/2 relative overflow-hidden p-12"
        style={{ background: 'linear-gradient(135deg, #0a0b0d 0%, #111215 40%, #1a1060 100%)' }}>
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #4F46E5, transparent)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mb-16 z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center gradient-bg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">智学帮</span>
        </Link>
        {/* Headline */}
        <div className="z-10 mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            AI驱动的<br />
            <span className="gradient-text">智能学习平台</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-xs">
            十二智能体协同工作，为您提供个性化学习体验，从入门到精通全程陪伴
          </p>
        </div>
        {/* Feature grid */}
        <div className="z-10 grid grid-cols-2 gap-4">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="glass-card rounded-xl p-4 glow-card">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                style={{ background: 'rgba(79,70,229,0.2)', border: '1px solid rgba(79,70,229,0.3)' }}>
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-bg">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">智学帮</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">{isLogin ? '欢迎回来' : '创建账号'}</h2>
            <p className="text-muted-foreground mt-1">{isLogin ? '登录您的智学帮账号' : '开始您的AI学习之旅'}</p>
          </div>

          {/* Tab switch */}
          <div className="flex bg-muted rounded-xl p-1 mb-8">
            <button onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isLogin ? 'gradient-bg text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              登录
            </button>
            <button onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'gradient-bg text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <Label htmlFor="username" className="text-sm font-medium text-foreground mb-1.5 block">用户名</Label>
                <Input id="username" placeholder="您的用户名" value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  className="bg-muted border-border focus:border-primary h-11 px-4" />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-foreground mb-1.5 block">邮箱</Label>
              <Input id="email" type="email" placeholder="your@email.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="bg-muted border-border focus:border-primary h-11 px-4" />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-foreground mb-1.5 block">密码</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="bg-muted border-border focus:border-primary h-11 px-4 pr-11" />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {!isLogin && (
              <div className="flex items-start gap-3">
                <Checkbox id="agree" checked={agreed} onCheckedChange={v => setAgreed(v === true)}
                  className="mt-0.5 border-border data-[state=checked]:bg-primary" />
                <Label htmlFor="agree" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                  我已阅读并同意
                  <button type="button" onClick={() => setShowPrivacy(true)} className="text-primary hover:underline mx-1">《用户协议》</button>
                  和
                  <button type="button" onClick={() => setShowPrivacy(true)} className="text-primary hover:underline mx-1">《隐私政策》</button>
                </Label>
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full h-11 gradient-bg text-white font-semibold text-base hover:opacity-90 transition-opacity">
              {loading ? '处理中...' : (isLogin ? '登录' : '创建账号')}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? '还没有账号？' : '已有账号？'}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline ml-1 font-medium">
              {isLogin ? '立即注册' : '去登录'}
            </button>
          </p>

          {/* 评委一键体验入口 */}
          <div className="mt-8 pt-6 border-t border-border">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all group disabled:opacity-50"
            >
              <Award className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-primary">评委一键体验</span>
              <span className="text-xs text-muted-foreground">· 免注册直接进入</span>
            </button>
            <p className="text-center text-[11px] text-muted-foreground/70 mt-2">
              评委专属入口，自动登录演示账号体验全部功能
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowPrivacy(false)}>
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-foreground mb-4">用户协议与隐私政策</h3>
            <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
              <p><strong className="text-foreground">用户协议：</strong>使用智学帮服务，您须遵守相关法律法规，不得从事违法活动。平台保留对违规账号的处置权。</p>
              <p><strong className="text-foreground">隐私政策：</strong>我们收集您的学习数据以提供个性化服务。数据仅用于平台功能，不会出售给第三方。您可随时申请删除账号及相关数据。</p>
              <p className="text-xs text-muted-foreground/70">请自行修改完整的用户协议与隐私政策内容以符合法律要求。</p>
            </div>
            <Button onClick={() => { setAgreed(true); setShowPrivacy(false); }} className="w-full mt-6 gradient-bg text-white">
              我已阅读并同意
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
