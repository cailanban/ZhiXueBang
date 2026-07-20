import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { getMistakeBook, updateMistakeStatus, deleteMistake } from '@/services/api';
import type { MistakeBook, Question } from '@/types/types';
import { BookX, CheckCircle, RotateCcw, Trash2, ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import ResourcePosterWall from '@/components/ResourcePosterWall';

const DIFF_COLORS: Record<string, string> = { easy: 'text-green-500', medium: 'text-yellow-500', hard: 'text-red-500' };
const DIFF_LABELS: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难' };
const TYPE_LABELS: Record<string, string> = { choice: '选择题', fill: '填空题', coding: '编程题' };

// 兼容静态 JSON 课程错题（question_data）与数据库题目（question）
function effectiveQuestion(m: MistakeBook): Partial<Question> {
  if (m.question) return m.question;
  return {
    content: m.question_data?.content,
    options: m.question_data?.options,
    answer: m.question_data?.answer !== undefined ? String(m.question_data.answer) : (m.correct_answer ?? undefined),
    explanation: m.question_data?.explanation || m.explanation,
    difficulty: m.question_data?.difficulty || 'medium',
    type: (m.question_data?.type as 'choice' | 'fill' | 'coding') || 'choice',
  };
}

export default function MistakesPage() {
  const { user } = useAuth();
  const [mistakes, setMistakes] = useState<MistakeBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [diffFilter, setDiffFilter] = useState('all');
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (user) getMistakeBook(user.id).then(m => { setMistakes(m); setLoading(false); });
  }, [user]);

  const filtered = mistakes.filter(m => {
    const q = effectiveQuestion(m);
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchDiff = diffFilter === 'all' || q.difficulty === diffFilter;
    return matchStatus && matchDiff;
  });

  const reviewList = filtered;
  const current = reviewMode ? reviewList[reviewIdx] : null;

  const handleMarkMastered = async (id: string, cur: 'mastered' | 'unmastered') => {
    const next = cur === 'mastered' ? 'unmastered' : 'mastered';
    const err = await updateMistakeStatus(id, next);
    if (err) { toast.error('更新失败'); return; }
    setMistakes(prev => prev.map(m => m.id === id ? { ...m, status: next } : m));
    toast.success(next === 'mastered' ? '已标记为已掌握' : '已标记为未掌握');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认从错题本移除？')) return;
    const err = await deleteMistake(id);
    if (err) { toast.error('删除失败'); return; }
    setMistakes(prev => prev.filter(m => m.id !== id));
    toast.success('已移除');
  };

  const deleteMastered = async () => {
    if (!confirm('确认删除所有已掌握的错题？')) return;
    const mastered = mistakes.filter(m => m.status === 'mastered');
    for (const m of mastered) await deleteMistake(m.id);
    setMistakes(prev => prev.filter(m => m.status !== 'mastered'));
    toast.success(`已删除 ${mastered.length} 道已掌握错题`);
  };

  const total = mistakes.length;
  const masteredCount = mistakes.filter(m => m.status === 'mastered').length;
  const masteryRate = total > 0 ? Math.round(masteredCount / total * 100) : 0;

  return (
    <div className="max-w-6xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">错题本</h1>
          <p className="text-sm text-muted-foreground">追踪答错的题目，重点复习薄弱知识点</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={deleteMastered} className="text-muted-foreground h-8 text-xs border-border">
            <Trash2 className="w-3 h-3 mr-1" /> 删除已掌握
          </Button>
          {filtered.length > 0 && (
            <Button size="sm" onClick={() => { setReviewMode(true); setReviewIdx(0); setShowAnswer(false); }} className="gradient-bg text-white h-8 text-xs">
              <RotateCcw className="w-3 h-3 mr-1" /> 开始复习
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '总错题数', value: total, color: '#4F46E5' },
          { label: '已掌握', value: masteredCount, color: '#10B981' },
          { label: '掌握率', value: `${masteryRate}%`, color: '#F59E0B' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-8 text-xs bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="unmastered">未掌握</SelectItem>
            <SelectItem value="mastered">已掌握</SelectItem>
          </SelectContent>
        </Select>
        <Select value={diffFilter} onValueChange={setDiffFilter}>
          <SelectTrigger className="w-32 h-8 text-xs bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部难度</SelectItem>
            <SelectItem value="easy">简单</SelectItem>
            <SelectItem value="medium">中等</SelectItem>
            <SelectItem value="hard">困难</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground self-center">{filtered.length} 道题</span>
      </div>

      {/* Review Mode */}
      <AnimatePresence>
        {reviewMode && current && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <Card className="border-primary/40 bg-card shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">复习模式</CardTitle>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{reviewIdx + 1} / {reviewList.length}</span>
                    <Button variant="ghost" size="sm" onClick={() => setReviewMode(false)} className="h-7 text-xs text-muted-foreground">退出</Button>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full gradient-bg rounded-full transition-all" style={{ width: `${(reviewIdx + 1) / reviewList.length * 100}%` }} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-xs ${DIFF_COLORS[effectiveQuestion(current).difficulty || 'medium']}`}>
                    {DIFF_LABELS[effectiveQuestion(current).difficulty || 'medium']}
                  </Badge>
                  <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                    {TYPE_LABELS[effectiveQuestion(current).type || 'choice']}
                  </Badge>
                </div>
                <div className="p-4 bg-muted rounded-xl">
                  <p className="text-sm text-foreground leading-relaxed">{effectiveQuestion(current).content || '题目内容不可用'}</p>
                  {effectiveQuestion(current).options && (
                    <div className="mt-3 space-y-2">
                      {effectiveQuestion(current).options!.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-xs font-medium shrink-0">
                            {String.fromCharCode(65 + i)}
                          </span>
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {current.user_answer && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">我的答案</p>
                    <p className="text-sm text-foreground">{current.user_answer}</p>
                  </div>
                )}
                {showAnswer ? (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">正确答案</p>
                    <p className="text-sm font-medium text-green-400">{effectiveQuestion(current).answer}</p>
                    {effectiveQuestion(current).explanation && (
                      <p className="text-sm text-muted-foreground mt-2">{effectiveQuestion(current).explanation}</p>
                    )}
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setShowAnswer(true)} className="w-full border-border text-muted-foreground hover:text-foreground h-9 text-sm">
                    显示答案与解析
                  </Button>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={reviewIdx === 0}
                      onClick={() => { setReviewIdx(i => i - 1); setShowAnswer(false); }} className="border-border h-8">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={reviewIdx === reviewList.length - 1}
                      onClick={() => { setReviewIdx(i => i + 1); setShowAnswer(false); }} className="border-border h-8">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button size="sm" onClick={() => handleMarkMastered(current.id, current.status)}
                    className={current.status === 'mastered' ? 'bg-muted text-foreground h-8 text-xs' : 'gradient-bg text-white h-8 text-xs'}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {current.status === 'mastered' ? '取消掌握' : '标记已掌握'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <BookX className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-lg font-medium text-foreground">错题本为空</p>
          <p className="text-sm mt-1">答错的题目会自动收录到这里</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(m => {
            const q = effectiveQuestion(m);
            return (
            <Card key={m.id} className={`border-border transition-all ${m.status === 'mastered' ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${m.status === 'mastered' ? 'bg-green-500' : 'bg-destructive'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed line-clamp-2">{q.content || '题目不可用'}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="outline" className={`text-xs ${DIFF_COLORS[q.difficulty || 'medium']}`}>
                        {DIFF_LABELS[q.difficulty || 'medium']}
                      </Badge>
                      <Badge variant="outline" className="text-xs text-muted-foreground border-border">
                        {TYPE_LABELS[q.type || 'choice']}
                      </Badge>
                      {m.status === 'mastered' && <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">已掌握</Badge>}
                      <span className="text-xs text-muted-foreground">{m.added_at.slice(0, 10)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-green-400"
                      onClick={() => handleMarkMastered(m.id, m.status)}>
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(m.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
          })}
        </div>
      )}
      <ResourcePosterWall
        topics={filtered.map(m => effectiveQuestion(m).topic || '').filter(Boolean).slice(0, 8)}
        placement="mistake_book"
        contextId={user?.id}
        title="针对错题的精选资源"
      />
    </div>
  );
}
