import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Brain, LayoutDashboard, MessageSquare, GraduationCap, FileText, BookX,
  User, BookOpen, Sparkles, BarChartHorizontalBig, Map, BookMarked, BarChart3,
  Settings, Shield, Activity, Sun, Moon, Menu, X, ChevronDown, LogOut, History,
  TrendingUp, Swords, Zap, Package, Presentation
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import FloatingLearningButler from '@/components/FloatingLearningButler';

interface NavItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', icon: LayoutDashboard, label: '学习中心', group: '学习' },
  { path: '/chat', icon: MessageSquare, label: '智能对话', group: '学习' },
  { path: '/tutor', icon: GraduationCap, label: '诊断辅导', group: '学习' },
  { path: '/history', icon: History, label: '对话历史', group: '学习' },
  { path: '/notes', icon: FileText, label: '学习笔记', group: '学习' },
  { path: '/mistakes', icon: BookX, label: '错题本', group: '学习' },
  { path: '/profile', icon: User, label: '学习画像', group: '分析' },
  { path: '/evaluation', icon: BarChart3, label: '学习评估', group: '分析' },
  { path: '/insight', icon: TrendingUp, label: '仪表盘 2.0', group: '分析' },
  { path: '/interview', icon: Swords, label: 'AI 互动评测', group: '分析' },
  { path: '/courses', icon: BookMarked, label: '课程中心', group: '内容' },
  { path: '/path', icon: Map, label: '学习路径', group: '内容' },
  { path: '/knowledge', icon: BookOpen, label: '知识库', group: '内容' },
  { path: '/visualization', icon: BarChartHorizontalBig, label: '可视化生成', group: '工具' },
  { path: '/micro-lessons', icon: Presentation, label: 'AI语音微课', group: '内容' },
  { path: '/resources', icon: Sparkles, label: '资源生成', group: '工具' },
  { path: '/assets', icon: Package, label: '资源中心', group: '内容' },
  { path: '/exam-cram', icon: Zap, label: '极速备考', group: '工具' },
  { path: '/status', icon: Activity, label: '系统状态', group: '工具' },
  { path: '/settings', icon: Settings, label: '个人设置', group: '账号' },
];

const GROUPS = ['学习', '分析', '内容', '工具', '账号'];

function NavContent({ onNav }: { onNav?: () => void }) {
  const { pathname } = useLocation();
  const { profile } = useAuth();
  const allItems = profile?.role === 'admin'
    ? [...NAV_ITEMS, { path: '/admin', icon: Shield, label: '管理后台', group: '账号' }]
    : NAV_ITEMS;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center gradient-bg shrink-0">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <span className="text-base font-bold gradient-text">智学帮</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4 min-h-0">
        {GROUPS.map(group => {
          const items = allItems.filter(i => i.group === group);
          if (!items.length) return null;
          return (
            <div key={group} className="mb-4">
              <p className="text-xs text-sidebar-foreground/40 font-semibold uppercase tracking-wider px-4 mb-1">{group}</p>
              {items.map(({ path, icon: Icon, label }) => {
                const active = pathname === path || pathname.startsWith(path + '/');
                return (
                  <Link key={path} to={path} onClick={onNav}
                    className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-all ${active
                      ? 'gradient-bg text-white font-medium shadow-sm'
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const initials = (profile?.username || profile?.email || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-sidebar-border bg-sidebar h-screen sticky top-0">
        <NavContent />
      </aside>
      <div className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        <header className="sticky top-0 z-40 h-14 border-b border-border flex items-center px-4 gap-3"
          style={{ background: 'hsl(var(--background)/0.95)', backdropFilter: 'blur(8px)' }}>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
              <NavContent onNav={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex-1 min-w-0" />
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="shrink-0 text-muted-foreground hover:text-foreground">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 h-9">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="gradient-bg text-white text-xs font-bold">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm hidden md:block max-w-[120px] truncate">{profile?.username || profile?.email}</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild><Link to="/settings">个人设置</Link></DropdownMenuItem>
                {profile?.role === 'admin' && <DropdownMenuItem asChild><Link to="/admin">管理后台</Link></DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> 退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button size="sm" className="gradient-bg text-white h-8">登录</Button>
            </Link>
          )}
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
      {user && <FloatingLearningButler />}
    </div>
  );
}
