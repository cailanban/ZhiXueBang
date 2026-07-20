import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';
import { Users, BookMarked, BarChart3, Settings, Trash2, Edit, Plus, Search, Shield, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { Profile, Course } from '@/types/types';
import { useNavigate } from 'react-router-dom';

type AdminTab = 'users' | 'courses' | 'resources' | 'stats';
interface ReviewResource { id: string; title: string; summary: string; url: string; source_name: string; resource_type: string; topic: string; status: 'pending' | 'approved' | 'rejected'; discovery_source: string; discovered_at: string; }

export default function AdminPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('stats');
  const [users, setUsers] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [reviewResources, setReviewResources] = useState<ReviewResource[]>([]);
  const [discoverForm, setDiscoverForm] = useState({ query: '', topic: '' });
  const [discovering, setDiscovering] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editRole, setEditRole] = useState('');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', category: '', difficulty: 'easy' });
  const [stats, setStats] = useState({ totalUsers: 0, totalCourses: 0, totalNotes: 0, totalMistakes: 0 });

  useEffect(() => {
    if (profile && profile.role !== 'admin') { navigate('/dashboard'); return; }
    loadStats();
  }, [profile]);

  useEffect(() => {
    if (tab === 'users') loadUsers();
    else if (tab === 'courses') loadCourses();
    else if (tab === 'resources') loadReviewResources();
  }, [tab]);

  const loadStats = async () => {
    const [{ count: u }, { count: c }, { count: n }, { count: m }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('notes').select('*', { count: 'exact', head: true }),
      supabase.from('mistake_book').select('*', { count: 'exact', head: true }),
    ]);
    setStats({ totalUsers: u || 0, totalCourses: c || 0, totalNotes: n || 0, totalMistakes: m || 0 });
  };

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100);
    setUsers(data as Profile[] || []);
    setLoading(false);
  };

  const loadCourses = async () => {
    setLoading(true);
    const { data } = await supabase.from('courses').select('*, chapters(count)').order('created_at', { ascending: false });
    setCourses(data as Course[] || []);
    setLoading(false);
  };

  const loadReviewResources = async () => {
    setLoading(true);
    const { data } = await supabase.from('recommendation_resources').select('*').order('discovered_at', { ascending: false }).limit(100);
    setReviewResources((data || []) as ReviewResource[]);
    setLoading(false);
  };

  const reviewResource = async (id: string, status: 'approved' | 'rejected') => {
    if (!profile) return;
    const { error } = await supabase.from('recommendation_resources').update({ status, reviewed_by: profile.id, reviewed_at: new Date().toISOString() }).eq('id', id);
    if (error) { toast.error('审核失败'); return; }
    setReviewResources(prev => prev.map(item => item.id === id ? { ...item, status } : item));
    toast.success(status === 'approved' ? '资源已批准发布' : '资源已拒绝');
  };

  const discoverResources = async () => {
    if (!discoverForm.query.trim() || !discoverForm.topic.trim()) { toast.error('请填写搜索词和知识点'); return; }
    setDiscovering(true);
    const { data, error } = await supabase.functions.invoke('discover-learning-resources', { body: discoverForm });
    setDiscovering(false);
    if (error || data?.error) { toast.error(data?.message || '候选发现失败，请检查搜索服务配置'); return; }
    toast.success(`新增 ${data?.discovered || 0} 条待审候选`);
    await loadReviewResources();
  };

  const handleUpdateRole = async () => {
    if (!editingUser) return;
    const { error } = await supabase.from('profiles').update({ role: editRole }).eq('id', editingUser.id);
    if (error) { toast.error('更新失败'); return; }
    setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, role: editRole as Profile['role'] } : u));
    setEditingUser(null);
    toast.success('角色已更新');
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('确认删除课程？')) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) { toast.error('删除失败'); return; }
    setCourses(prev => prev.filter(c => c.id !== id));
    toast.success('课程已删除');
  };

  const handleAddCourse = async () => {
    if (!courseForm.title.trim()) { toast.error('请填写课程标题'); return; }
    const { data, error } = await supabase.from('courses').insert(courseForm).select().single();
    if (error) { toast.error('添加失败'); return; }
    setCourses(prev => [data as Course, ...prev]);
    setShowAddCourse(false);
    setCourseForm({ title: '', description: '', category: '', difficulty: 'easy' });
    toast.success('课程已添加');
  };

  const TABS: { key: AdminTab; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { key: 'stats', icon: BarChart3, label: '数据统计' },
    { key: 'users', icon: Users, label: '用户管理' },
    { key: 'courses', icon: BookMarked, label: '课程管理' },
    { key: 'resources', icon: CheckCircle, label: '资源审核' },
  ];

  const filteredUsers = users.filter(u => !search || u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
  const filteredCourses = courses.filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl space-y-4">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-primary" />
        <div>
          <h1 className="text-xl font-bold text-foreground">管理后台</h1>
          <p className="text-sm text-muted-foreground">系统管理与数据统计</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        {TABS.map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => { setTab(key); setSearch(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'gradient-bg text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {tab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '总用户数', value: stats.totalUsers, icon: Users, color: '#4F46E5' },
              { label: '课程数', value: stats.totalCourses, icon: BookMarked, color: '#7C3AED' },
              { label: '学习笔记', value: stats.totalNotes, icon: Settings, color: '#0EA5E9' },
              { label: '错题记录', value: stats.totalMistakes, icon: BarChart3, color: '#F59E0B' },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-border">
            <CardHeader className="pb-3"><CardTitle className="text-base">系统信息</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {[
                  ['版本', '智学帮 v2.0 (软件杯A3优化版)'],
                  ['Supabase项目', 'supabase331694469063684096 (北京)'],
                  ['数据库表', '12个表，RLS已启用'],
                  ['AI能力', 'DeepSeek已接入（12大智能体）'],
                  ['设计主题', 'Cyberpunk Dark × Glassmorphism'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="text-foreground font-medium text-right">{v}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索用户..." className="pl-9 bg-card border-border h-9" />
            </div>
          </div>
          {loading ? (
            <div className="space-y-2">{Array(5).fill(0).map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}</div>
          ) : (
            <Card className="border-border">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-border">
                      {['用户名', '邮箱', '角色', '注册时间', '操作'].map(h => <th key={h} className="text-xs text-muted-foreground font-medium py-3 px-4 text-left whitespace-nowrap">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                          <td className="py-3 px-4 text-sm text-foreground whitespace-nowrap">{u.username || '—'}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">{u.email || '—'}</td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <Badge className={`text-xs ${u.role === 'admin' ? 'bg-primary/20 text-primary border-primary/30' : u.role === 'teacher' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-muted text-muted-foreground border-muted'}`}>
                              {u.role === 'admin' ? '管理员' : u.role === 'teacher' ? '教师' : '学习者'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">{u.created_at?.slice(0, 10)}</td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingUser(u); setEditRole(u.role); }} className="h-7 text-xs text-muted-foreground">
                              <Edit className="w-3 h-3 mr-1" />修改角色
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">暂无用户数据</div>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Courses Tab */}
      {tab === 'courses' && (
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索课程..." className="pl-9 bg-card border-border h-9" />
            </div>
            <Button onClick={() => setShowAddCourse(true)} className="gradient-bg text-white h-9 shrink-0">
              <Plus className="w-4 h-4 mr-1.5" />添加课程
            </Button>
          </div>
          {loading ? (
            <div className="space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}</div>
          ) : (
            <div className="space-y-2">
              {filteredCourses.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/20 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{c.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs border-border text-muted-foreground">{c.category}</Badge>
                      <Badge variant="outline" className="text-xs border-border text-muted-foreground">{c.difficulty === 'easy' ? '入门' : c.difficulty === 'medium' ? '进阶' : '高级'}</Badge>
                      <span className="text-xs text-muted-foreground">{c.chapter_count || 0} 章节</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" onClick={() => handleDeleteCourse(c.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {filteredCourses.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">暂无课程</div>}
            </div>
          )}
        </div>
      )}

      {tab === 'resources' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between"><div><h2 className="font-semibold">候选资源审核</h2><p className="text-xs text-muted-foreground">联网发现的资源不会自动发布，批准后才进入学生资源墙</p></div><Button variant="outline" size="sm" onClick={loadReviewResources}>刷新</Button></div>
          <Card className="border-border"><CardContent className="p-4"><div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"><Input value={discoverForm.query} onChange={event => setDiscoverForm(value => ({ ...value, query: event.target.value }))} placeholder="搜索词，如 Java 多态优质教程" /><Input value={discoverForm.topic} onChange={event => setDiscoverForm(value => ({ ...value, topic: event.target.value }))} placeholder="关联知识点，如 Java多态" /><Button onClick={discoverResources} disabled={discovering}>{discovering ? '发现中…' : '联网发现候选'}</Button></div><p className="mt-2 text-xs text-muted-foreground">仅写入 pending 队列；URL 自动去重，非 HTTPS 与内网地址会被拒绝。</p></CardContent></Card>
          {loading ? <div className="space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)}</div> : reviewResources.length === 0 ? <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">暂无候选资源</div> :
            <div className="space-y-3">{reviewResources.map(item => <Card key={item.id} className="border-border"><CardContent className="p-4"><div className="flex gap-4"><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><Badge variant="outline">{item.resource_type}</Badge><Badge className={item.status === 'approved' ? 'bg-green-500/15 text-green-500' : item.status === 'rejected' ? 'bg-red-500/15 text-red-500' : 'bg-amber-500/15 text-amber-500'}>{item.status === 'pending' ? '待审核' : item.status === 'approved' ? '已批准' : '已拒绝'}</Badge><span className="text-xs text-muted-foreground">{item.discovery_source} · {item.source_name}</span></div><h3 className="font-medium">{item.title}</h3><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.summary || '无摘要'}</p><p className="mt-2 text-xs text-primary">知识点：{item.topic}</p></div><div className="flex shrink-0 flex-col gap-2"><Button variant="outline" size="sm" onClick={() => window.open(item.url, '_blank', 'noopener,noreferrer')}><ExternalLink className="mr-1 h-3.5 w-3.5" />核验链接</Button><Button size="sm" onClick={() => reviewResource(item.id, 'approved')} disabled={item.status === 'approved'} className="bg-green-600 text-white hover:bg-green-700"><CheckCircle className="mr-1 h-3.5 w-3.5" />批准</Button><Button variant="outline" size="sm" onClick={() => reviewResource(item.id, 'rejected')} disabled={item.status === 'rejected'} className="text-red-500"><XCircle className="mr-1 h-3.5 w-3.5" />拒绝</Button></div></div></CardContent></Card>)}</div>}
        </div>
      )}

      {/* Edit role modal */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-sm border-border bg-card">
          <DialogHeader><DialogTitle>修改用户角色</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">用户：{editingUser?.username || editingUser?.email}</p>
            <Select value={editRole} onValueChange={setEditRole}>
              <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="student">学习者</SelectItem>
                <SelectItem value="teacher">教师</SelectItem>
                <SelectItem value="admin">管理员</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingUser(null)} className="border-border">取消</Button>
              <Button onClick={handleUpdateRole} className="gradient-bg text-white">保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add course modal */}
      <Dialog open={showAddCourse} onOpenChange={setShowAddCourse}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md border-border bg-card">
          <DialogHeader><DialogTitle>添加课程</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title: e.target.value }))} placeholder="课程标题" className="bg-muted border-border" />
            <Input value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description: e.target.value }))} placeholder="课程简介" className="bg-muted border-border" />
            <div className="grid grid-cols-2 gap-3">
              <Select value={courseForm.category} onValueChange={v => setCourseForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(() => {
                const cats = [...new Set(courses.map(c => c.category).filter(Boolean))];
                if (!cats.length) cats.push('Java', 'Python', 'C语言', '数据结构', '英语');
                return cats.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>);
              })()}
                </SelectContent>
              </Select>
              <Select value={courseForm.difficulty} onValueChange={v => setCourseForm(f => ({ ...f, difficulty: v }))}>
                <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">入门</SelectItem>
                  <SelectItem value="medium">进阶</SelectItem>
                  <SelectItem value="hard">高级</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddCourse(false)} className="border-border">取消</Button>
              <Button onClick={handleAddCourse} className="gradient-bg text-white">添加</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
