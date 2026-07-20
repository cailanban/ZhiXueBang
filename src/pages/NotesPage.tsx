import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { getNotes, createNote, updateNote, deleteNote } from '@/services/api';
import type { Note } from '@/types/types';
import { Plus, Search, Tag, Download, Edit, Trash2, FileText, BookMarked, Clock } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);
  const [viewing, setViewing] = useState<Note | null>(null);
  const [form, setForm] = useState({ title: '', content: '', tags: '' });

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  useEffect(() => {
    if (user) getNotes(user.id).then(n => { setNotes(n); setLoading(false); });
  }, [user]);

  const filtered = notes.filter(n => {
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchTag = !activeTag || n.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  const openCreate = () => { setEditing(null); setForm({ title: '', content: '', tags: '' }); setShowModal(true); };
  const openEdit = (n: Note) => { setEditing(n); setForm({ title: n.title, content: n.content, tags: n.tags.join(', ') }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.title.trim() || !user) { toast.error('请填写标题'); return; }
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (editing) {
      const err = await updateNote(editing.id, { title: form.title, content: form.content, tags });
      if (err) { toast.error('保存失败'); return; }
      setNotes(ns => ns.map(n => n.id === editing.id ? { ...n, title: form.title, content: form.content, tags, updated_at: new Date().toISOString() } : n));
      toast.success('笔记已更新');
    } else {
      const { data, error } = await createNote(user.id, form.title, form.content, tags);
      if (error) { toast.error('创建失败'); return; }
      if (data) setNotes(ns => [data as Note, ...ns]);
      toast.success('笔记已创建');
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除此笔记？')) return;
    const err = await deleteNote(id);
    if (err) { toast.error('删除失败'); return; }
    setNotes(ns => ns.filter(n => n.id !== id));
    if (viewing?.id === id) setViewing(null);
    toast.success('已删除');
  };

  const handleExport = (note: Note, fmt: 'txt' | 'md') => {
    const content = fmt === 'md'
      ? `# ${note.title}\n\n> 标签: ${note.tags.join(', ')}\n\n${note.content}`
      : `${note.title}\n\n标签: ${note.tags.join(', ')}\n\n${note.content}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `${note.title}.${fmt}`; a.click();
    toast.success(`已导出为 ${fmt.toUpperCase()}`);
  };

  return (
    <div className="max-w-6xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">学习笔记</h1>
          <p className="text-sm text-muted-foreground">记录学习心得，支持Markdown渲染和标签分类</p>
        </div>
        <Button onClick={openCreate} className="gradient-bg text-white h-9">
          <Plus className="w-4 h-4 mr-1.5" /> 新建笔记
        </Button>
      </div>

      {/* Search & tags */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索笔记..." className="pl-9 bg-card border-border h-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setActiveTag('')}
            className={`px-3 py-1 rounded-full text-xs border transition-all ${!activeTag ? 'gradient-bg text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>全部</button>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setActiveTag(tag === activeTag ? '' : tag)}
              className={`px-3 py-1 rounded-full text-xs border transition-all ${activeTag === tag ? 'gradient-bg text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="h-40 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <FileText className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-lg font-medium text-foreground">暂无笔记</p>
          <p className="text-sm mt-1">点击"新建笔记"开始记录你的学习心得</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(note => (
            <Card key={note.id} className="glow-card border-border cursor-pointer group" onClick={() => setViewing(note)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-foreground text-sm line-clamp-1 flex-1">{note.title}</h3>
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onClick={() => openEdit(note)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(note.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{note.content || '暂无内容'}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {note.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs py-0 px-2 bg-primary/10 text-primary border-primary/20">{tag}</Badge>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{note.updated_at.slice(0, 10)}
                  </span>
                </div>
                {note.course && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <BookMarked className="w-3 h-3" />{note.course.title}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl border-border bg-card max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? '编辑笔记' : '新建笔记'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="笔记标题" className="bg-muted border-border" />
            </div>
            <div>
              <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="笔记内容（支持Markdown语法）" className="bg-muted border-border min-h-48 font-mono text-sm" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">标签（逗号分隔）</span>
              </div>
              <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="Java, 面向对象, 多态" className="bg-muted border-border" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowModal(false)}>取消</Button>
              <Button onClick={handleSave} className="gradient-bg text-white">保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View modal */}
      {viewing && (
        <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
          <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-3xl border-border bg-card max-h-[90dvh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between flex-wrap gap-2">
                <span>{viewing.title}</span>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  <Button variant="outline" size="sm" onClick={() => handleExport(viewing, 'md')} className="h-7 text-xs">
                    <Download className="w-3 h-3 mr-1" /> MD
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport(viewing, 'txt')} className="h-7 text-xs">
                    <Download className="w-3 h-3 mr-1" /> TXT
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { openEdit(viewing); setViewing(null); }} className="h-7 text-xs">
                    <Edit className="w-3 h-3 mr-1" /> 编辑
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="flex gap-2 flex-wrap mb-4">
              {viewing.tags.map(t => <Badge key={t} variant="secondary" className="bg-primary/10 text-primary border-primary/20">{t}</Badge>)}
            </div>
            <div className="prose prose-sm max-w-none text-foreground [&>*]:text-foreground [&>h1]:text-foreground [&>h2]:text-foreground [&>h3]:text-foreground [&>code]:bg-muted [&>code]:px-1 [&>code]:rounded [&>pre]:bg-muted [&>pre]:p-3 [&>pre]:rounded-lg">
              <ReactMarkdown>{viewing.content || '暂无内容'}</ReactMarkdown>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
