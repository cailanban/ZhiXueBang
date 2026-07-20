import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/db/supabase';
import { User, Lock, Eye, EyeOff, Sun, Moon, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState(profile?.username || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').update({ username }).eq('id', profile.id);
    setSavingProfile(false);
    if (error) { toast.error('保存失败'); return; }
    toast.success('资料已更新');
  };

  const handleChangePassword = async () => {
    if (!newPwd || newPwd.length < 6) { toast.error('新密码至少6位'); return; }
    setChangingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setChangingPwd(false);
    if (error) { toast.error('密码修改失败: ' + error.message); return; }
    toast.success('密码已修改');
    setCurrentPwd(''); setNewPwd('');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    toast.info('账号注销功能需要联系管理员处理（合规保护措施）');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">个人设置</h1>
        <p className="text-sm text-muted-foreground">管理账号信息与系统偏好</p>
      </div>

      {/* Profile */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4 text-primary" /> 基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">用户名</label>
            <Input value={username} onChange={e => setUsername(e.target.value)} className="bg-muted border-border h-10" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">邮箱</label>
            <Input value={user?.email || ''} disabled className="bg-muted border-border h-10 opacity-60" />
            <p className="text-xs text-muted-foreground mt-1">邮箱不可修改</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">角色</label>
            <Input value={profile?.role === 'admin' ? '管理员' : profile?.role === 'teacher' ? '教师' : '学习者'} disabled className="bg-muted border-border h-10 opacity-60" />
          </div>
          <Button onClick={handleSaveProfile} disabled={savingProfile} className="gradient-bg text-white h-9">
            {savingProfile ? '保存中...' : '保存修改'}
          </Button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Lock className="w-4 h-4 text-primary" /> 修改密码</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">当前密码</label>
            <div className="relative">
              <Input type={showCurrent ? 'text' : 'password'} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} className="bg-muted border-border h-10 pr-10" placeholder="输入当前密码" />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowCurrent(v => !v)}>
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">新密码</label>
            <div className="relative">
              <Input type={showNew ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)} className="bg-muted border-border h-10 pr-10" placeholder="至少6位字符" />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowNew(v => !v)}>
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button onClick={handleChangePassword} disabled={changingPwd || !newPwd} className="gradient-bg text-white h-9">
            {changingPwd ? '修改中...' : '修改密码'}
          </Button>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
            显示设置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted border border-border">
            <div>
              <p className="text-sm font-medium text-foreground">主题模式</p>
              <p className="text-xs text-muted-foreground mt-0.5">当前：{theme === 'dark' ? '深色模式' : '亮色模式'}</p>
            </div>
            <Button onClick={toggleTheme} variant="outline" className="border-border h-9 gap-2">
              {theme === 'dark' ? <><Sun className="w-4 h-4" /> 切换亮色</> : <><Moon className="w-4 h-4" /> 切换暗色</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> 隐私与安全</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
            <div>
              <p className="text-sm text-foreground">隐私政策</p>
              <p className="text-xs text-muted-foreground">了解我们如何处理您的数据</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary text-xs h-7" onClick={() => toast.info('隐私政策内容即将上线')}>查看</Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
            <div>
              <p className="text-sm text-foreground">用户协议</p>
              <p className="text-xs text-muted-foreground">智学帮用户服务协议</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary text-xs h-7" onClick={() => toast.info('用户协议内容即将上线')}>查看</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-destructive"><AlertTriangle className="w-4 h-4" /> 危险操作</CardTitle>
        </CardHeader>
        <CardContent>
          {showDeleteConfirm ? (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-3">
              <p className="text-sm text-foreground">确认注销账号？此操作不可逆，所有数据将被删除。</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)} className="border-border h-8">取消</Button>
                <Button size="sm" onClick={handleDeleteAccount} className="bg-destructive text-white h-8 text-xs">确认注销</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">注销账号</p>
                <p className="text-xs text-muted-foreground">删除所有个人数据，操作不可逆</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(true)} className="border-destructive/50 text-destructive hover:bg-destructive/10 h-8 text-xs">
                注销账号
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
