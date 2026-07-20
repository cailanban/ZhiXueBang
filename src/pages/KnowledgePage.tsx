import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getKnowledgeFiles, deleteKnowledgeFile } from '@/services/api';
import type { KnowledgeFile } from '@/types/types';
import { supabase } from '@/db/supabase';
import KnowledgeGraph from '@/components/knowledge/KnowledgeGraph';
import {
  Upload, Search, BookOpen, Trash2, Globe, FileText, Clock,
  ExternalLink, BookmarkPlus, GitCompare, CheckCircle, XCircle,
  MinusCircle, RefreshCw, ChevronRight, Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'library' | 'compare' | 'graph';

interface AnalysisItem { sentence: string; status: 'correct' | 'partial' | 'wrong' | 'missing' | 'neutral'; comment: string; }
interface CompareResult {
  analysis: AnalysisItem[];
  overallScore: number;
  summary: string;
  suggestions: string[];
  missing_key_points?: string[];
}
interface IndexJob { source_file_id: string; status: 'pending'|'processing'|'completed'|'failed'; wiki_count: number; chunk_count: number; vector_count: number; error_message: string | null; updated_at: string; }

interface KnowledgeSearchResult {
  title: string;
  content: string;
  source: string;
  score: number;
  resultType: 'wiki' | 'chunk';
  sourceName: string | null;
  sourceUrl: string | null;
  relationCount: number;
}

interface SearchEngineSummary {
  wiki: number;
  chunk: number;
  relationHits: number;
}

const STATUS_CONFIG = {
  correct: { label: '正确', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  partial: { label: '部分正确', icon: MinusCircle, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
  wrong: { label: '有误', icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  missing: { label: '缺失', icon: MinusCircle, color: 'text-muted-foreground', bg: 'bg-muted border-border' },
  neutral: { label: '待分析', icon: MinusCircle, color: 'text-muted-foreground', bg: 'bg-muted border-border' },
};

export default function KnowledgePage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('library');
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeSearchResult[]>([]);
  const [searchMode, setSearchMode] = useState('');
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [searchVectorEnabled, setSearchVectorEnabled] = useState(false);
  const [searchElapsedMs, setSearchElapsedMs] = useState(0);
  const [searchEngineSummary, setSearchEngineSummary] = useState<SearchEngineSummary>({ wiki: 0, chunk: 0, relationHits: 0 });
  const [indexingId, setIndexingId] = useState<string | null>(null);
  const [indexJobs, setIndexJobs] = useState<Record<string, IndexJob>>({});
  const [searching, setSearching] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [addingUrl, setAddingUrl] = useState(false);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [cmpQuestion, setCmpQuestion] = useState('');
  const [cmpAnswer, setCmpAnswer] = useState('');
  const [cmpReference, setCmpReference] = useState('');
  const [cmpSearching, setCmpSearching] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [cmpResult, setCmpResult] = useState<CompareResult | null>(null);

  useEffect(() => {
    if (!user) return;
    getKnowledgeFiles(user.id).then(f => { setFiles(f); setLoading(false); });
    loadIndexJobs();
  }, [user]);

  const loadIndexJobs = async () => {
    if (!user) return;
    const { data } = await supabase.from('knowledge_index_jobs').select('source_file_id,status,wiki_count,chunk_count,vector_count,error_message,updated_at')
      .eq('user_id', user.id).order('updated_at', { ascending: false }).limit(100);
    const latest: Record<string, IndexJob> = {};
    for (const job of (data || []) as IndexJob[]) if (!latest[job.source_file_id]) latest[job.source_file_id] = job;
    setIndexJobs(latest);
  };

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`knowledge-index-jobs:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'knowledge_index_jobs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const deleted = payload.old as Partial<IndexJob>;
            if (deleted.source_file_id) {
              setIndexJobs((current) => {
                const next = { ...current };
                delete next[deleted.source_file_id!];
                return next;
              });
            }
            return;
          }

          const incoming = payload.new as IndexJob;
          if (!incoming.source_file_id) return;

          setIndexJobs((current) => {
            const previous = current[incoming.source_file_id];
            if (
              previous &&
              Date.parse(previous.updated_at) > Date.parse(incoming.updated_at)
            ) {
              return current;
            }
            return { ...current, [incoming.source_file_id]: incoming };
          });

          if (incoming.status === 'completed' || incoming.status === 'failed') {
            setIndexingId((current) =>
              current === incoming.source_file_id ? null : current,
            );
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // 后端解析 PDF/DOCX（异步，不阻塞上传）
  async function parseFileOnServer(fileUrl: string, fileName: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('parse-file', {
        body: { file_url: fileUrl, file_name: fileName },
      });
      if (error) return '';
      return data?.content || '';
    } catch {
      return '';
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9_.\-]/g, '_');
      const path = `${user.id}/${Date.now()}_${safeName}`;
      const { data: uploadData, error: uploadErr } = await supabase.storage.from('knowledge-files').upload(path, file);
      if (uploadErr) throw uploadErr;
      const { data: { publicUrl } } = supabase.storage.from('knowledge-files').getPublicUrl(uploadData.path);

      // TXT/MD 直接读，PDF/DOCX 调后端 parse-file
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let extractedText = '';
      if (ext === 'txt' || ext === 'md' || ext === 'markdown') {
        extractedText = await file.text();
      } else if (ext === 'pdf' || ext === 'docx' || ext === 'doc') {
        toast.info('正在后端解析 ' + ext.toUpperCase() + ' 文件...');
        extractedText = await parseFileOnServer(publicUrl, file.name);
      }

      const { data: inserted } = await supabase.from('knowledge_files').insert({
        user_id: user.id,
        name: file.name,
        file_url: publicUrl,
        content_text: extractedText || null,
      }).select('id').single();
      toast.success(extractedText ? `文件上传成功，已解析 ${extractedText.length} 字符` : '文件已上传（解析未提取到文本）');
      await getKnowledgeFiles(user.id).then(setFiles);

      // 自动建立 WVK + RAG 索引
      if (inserted?.id && extractedText?.trim().length > 30) {
        toast.info('正在自动建立知识索引…');
        handleIndexWiki({ id: inserted.id, name: file.name, content_text: extractedText, file_url: publicUrl, created_at: new Date().toISOString(), user_id: user.id }).catch(() => {});
      }
    } catch (err) {
      console.error('文件上传失败', err);
      toast.error('文件上传失败，请检查存储配置后重试');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddUrl = async () => {
    if (!urlInput.trim() || !user) return;
    setAddingUrl(true);
    try {
      const name = (new URL(urlInput).hostname + urlInput.split('/').pop()?.slice(0, 30)) || urlInput;
      let contentText = '';

      // 抓取网页内容
      try {
        const { data, error } = await supabase.functions.invoke('fetch-page', { body: { url: urlInput } });
        if (!error && data?.content) {
          contentText = data.content;
        }
      } catch { /* 抓取失败不影响 URL 添加 */ }

      const { data: inserted } = await supabase.from('knowledge_files').insert({
        user_id: user.id, name, file_url: urlInput, content_text: contentText || null,
      }).select('id').single();
      toast.success(contentText ? '网页已添加，已抓取内容' : '网页已添加（内容抓取失败）');
      setUrlInput('');
      await getKnowledgeFiles(user.id).then(setFiles);

      // 自动建立 WVK + RAG 索引
      if (inserted?.id && contentText?.trim().length > 30) {
        toast.info('正在自动建立知识索引…');
        handleIndexWiki({ id: inserted.id, name, content_text: contentText, file_url: urlInput, created_at: new Date().toISOString(), user_id: user.id }).catch(() => {});
      }
    } catch {
      toast.error('添加失败，请检查URL格式');
    } finally {
      setAddingUrl(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const startedAt = performance.now();
    setSearching(true);
    setSearchAttempted(true);
    setSearchResults([]);
    setSearchMode('');
    setSearchVectorEnabled(false);
    setSearchElapsedMs(0);
    setSearchEngineSummary({ wiki: 0, chunk: 0, relationHits: 0 });
    try {
      const { data, error } = await supabase.functions.invoke('knowledge-retrieval-agent', {
        body: { query: searchQuery.trim(), limit: 10, answer: false },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message || '检索服务不可用');
      const results: KnowledgeSearchResult[] = (data.results || []).map((item: any) => {
        const resultType: 'wiki' | 'chunk' = item.result_type === 'wiki' ? 'wiki' : 'chunk';
        return {
          title: item.title || '资料片段',
          content: item.content || '',
          source: resultType === 'wiki' ? 'WVK 结构词条' : 'RAG 内容片段',
          score: Number(item.score || 0),
          resultType,
          sourceName: item.source_name || null,
          sourceUrl: item.source_url || null,
          relationCount: Number(item.relation_count || 0),
        };
      });
      setSearchMode(data.mode || 'wvk+fts');
      setSearchVectorEnabled(Boolean(data.vector_enabled));
      setSearchEngineSummary(data.engine_summary || {
        wiki: results.filter((item) => item.resultType === 'wiki').length,
        chunk: results.filter((item) => item.resultType === 'chunk').length,
        relationHits: results.reduce((sum, item) => sum + item.relationCount, 0),
      });
      setSearchResults(results);
      if (results.length === 0) toast.info('暂无匹配结果，请尝试其他关键词');
      else toast.success(`找到 ${results.length} 条相关内容`);
    } catch (e) {
      setSearchMode('检索失败');
      toast.error(`搜索失败：${e instanceof Error ? e.message : '请检查'}`);
    } finally {
      setSearchElapsedMs(Math.round(performance.now() - startedAt));
      setSearching(false);
    }
  };

  const handleIndexWiki = async (file: KnowledgeFile) => {
    if (!file.content_text) { toast.error('请先解析文件内容'); return; }
    const activeJob = indexJobs[file.id];
    if (activeJob && (activeJob.status === 'pending' || activeJob.status === 'processing')) {
      toast.info('该文档正在构建 WVK + RAG 索引，请勿重复提交');
      return;
    }
    setIndexingId(file.id);
    try {
      const { data, error } = await supabase.functions.invoke('index-knowledge-wiki', { body: { file_id: file.id } });
      if (error || data?.error) throw new Error(data?.message || data?.error || error?.message || '索引失败');
      toast.success(`已生成 ${data.wiki_count} 个词条、${data.chunk_count} 个片段${data.vector_enabled ? '及向量索引' : '；向量服务未配置，当前使用结构+全文检索'}`);
    } catch (error) {
      toast.error(`维基化失败：${error instanceof Error ? error.message : '请重试'}`);
    } finally { setIndexingId(null); loadIndexJobs(); }
  };

  // 保存到本地笔记
  const handleSaveToIma = async (idx: number) => {
    const result = searchResults[idx];
    if (!result) return;
    setSavingIdx(idx);
    try {
      await supabase.from('notes').insert({
        user_id: user?.id,
        title: result.title,
        content: `${result.content}\n\n来源: ${result.source}${result.sourceName ? ` · ${result.sourceName}` : ''}${result.sourceUrl ? `\n原文: ${result.sourceUrl}` : ''}${result.relationCount ? `\n关联证据: ${result.relationCount} 条` : ''}`,
        tags: ['知识库'],
      });
      toast.success('已存入本地笔记');
    } catch {
      toast.error('存入失败');
    } finally {
      setSavingIdx(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确认删除此文件？')) return;
    const err = await deleteKnowledgeFile(id);
    if (err) { toast.error('删除失败'); return; }
    setFiles(prev => prev.filter(f => f.id !== id));
    toast.success('已删除');
  };

  // 重新解析某个文件
  const handleReparse = async (f: KnowledgeFile) => {
    if (!user) { toast.error('登录状态已失效，请重新登录'); return; }
    if (!f.file_url) { toast.error('该文件无URL，无法解析'); return; }
    const ext = (f.name || '').split('.').pop()?.toLowerCase() || '';
    if (ext !== 'pdf' && ext !== 'docx' && ext !== 'doc' && !f.file_url.startsWith('http')) {
      toast.error('仅支持 PDF/DOCX 重新解析');
      return;
    }
    const isUrl = f.file_url.startsWith('http') && !f.file_url.includes('supabase');
    toast.info(isUrl ? '正在抓取网页内容...' : '正在解析 ' + ext.toUpperCase() + ' 文件...');
    try {
      let content = '';
      if (isUrl) {
        const { data, error } = await supabase.functions.invoke('fetch-page', { body: { url: f.file_url } });
        if (error) throw error;
        content = data?.content || '';
      } else {
        const { data, error } = await supabase.functions.invoke('parse-file', {
          body: { file_url: f.file_url, file_name: f.name },
        });
        if (error) throw error;
        content = data?.content || '';
      }
      await supabase.from('knowledge_files').update({ content_text: content }).eq('id', f.id);
      toast.success(`已解析 ${content.length} 字符`);
      await getKnowledgeFiles(user.id).then(setFiles);

      // 解析成功后自动重建索引
      if (content.trim().length > 30) {
        toast.info('正在自动重建知识索引…');
        handleIndexWiki({ ...f, content_text: content }).catch(() => {});
      }
    } catch (e) {
      toast.error(`解析失败：${e instanceof Error ? e.message : '请重试'}`);
    }
  };

  // 从本地知识库搜索参考内容
  const fetchReference = async () => {
    if (!cmpQuestion.trim()) return;
    setCmpSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('knowledge-retrieval-agent', { body: { query: cmpQuestion.trim(), limit: 4, answer: false } });
      if (error || data?.error) throw new Error(data?.error || error?.message || '检索失败');
      if (data.results?.length > 0) {
        setCmpReference(data.results.map((item: any) => `【${item.title}】\n${item.content?.slice(0, 900)}`).join('\n\n'));
        toast.success('已从知识库获取参考内容');
      } else {
        toast.info('知识库暂无相关内容');
      }
    } catch {
      toast.error('获取失败');
    } finally {
      setCmpSearching(false);
    }
  };

  const runCompare = async () => {
    if (!cmpQuestion.trim() || !cmpAnswer.trim()) {
      toast.error('请填写问题和你的回答');
      return;
    }
    setComparing(true);
    setCmpResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('deepseek-compare', {
        body: { question: cmpQuestion, studentAnswer: cmpAnswer, referenceContent: cmpReference }
      });
      if (error) throw new Error(error.message);
      setCmpResult(data as CompareResult);
    } catch (e) {
      toast.error(`对比失败：${e instanceof Error ? e.message : '请重试'}`);
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">知识库</h1>
        <p className="text-sm text-muted-foreground">上传资料、导入网页，智能检索本地知识内容</p>
      </div>

      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {([
          { key: 'library', label: '上传与检索' },
          { key: 'compare', label: '答案对比分析' },
          { key: 'graph', label: '知识图谱' },
        ] as const).map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === key
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'}`}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'library' && (
          <motion.div key="library" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-5">
            <div className="grid lg:grid-cols-2 gap-5">
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Upload className="w-4 h-4 text-primary" /> 上传资料
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all">
                    <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">点击上传文件（TXT/MD自动解析）</span>
                    <span className="text-xs text-muted-foreground mt-1">支持 PDF, Word, TXT, MD</span>
                    <input type="file" className="hidden" onChange={handleUpload} disabled={uploading}
                      accept=".pdf,.doc,.docx,.txt,.md" />
                  </label>
                  {uploading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />上传中...</div>}
                  <div className="border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Globe className="w-3 h-3" /> 导入网页资源（自动抓取内容）</p>
                    <div className="flex gap-2">
                      <Input value={urlInput} onChange={e => setUrlInput(e.target.value)}
                        placeholder="https://example.com/article"
                        className="bg-muted border-border text-sm h-9" />
                      <Button onClick={handleAddUrl} disabled={addingUrl || !urlInput.trim()}
                        className="gradient-bg text-white h-9 px-3 text-xs shrink-0">
                        {addingUrl ? <RefreshCw className="w-3 h-3 animate-spin" /> : '添加'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Search className="w-4 h-4 text-primary" /> 知识检索
                    {searchMode && <Badge variant="outline" className="ml-auto text-[10px]">{searchMode}</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="搜索文件内容..."
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      className="bg-muted border-border h-9 text-sm" />
                    <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()}
                      className="gradient-bg text-white h-9 px-3 shrink-0">
                      {searching ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                  {searchAttempted && searchResults.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground mb-1">
                      <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/20">
                        WVK 词条 {searchEngineSummary.wiki}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-500 border-purple-500/20">
                        RAG 片段 {searchEngineSummary.chunk}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        关联证据 {searchEngineSummary.relationHits}
                      </Badge>
                      {searchVectorEnabled && (
                        <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20">
                          向量检索已启用
                        </Badge>
                      )}
                      {searchElapsedMs > 0 && (
                        <span className="ml-auto text-[10px] text-muted-foreground/50">{searchElapsedMs}ms</span>
                      )}
                    </div>
                  )}
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map((r, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-muted rounded-xl text-sm text-foreground border border-border/40">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="font-medium text-foreground text-xs truncate">{r.title}</p>
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => handleSaveToIma(i)}
                            disabled={savingIdx === i}
                            className="h-6 text-[10px] text-primary border border-primary/20 hover:bg-primary/10 shrink-0 px-2">
                            {savingIdx === i
                              ? <RefreshCw className="w-3 h-3 animate-spin" />
                              : <><BookmarkPlus className="w-3 h-3 mr-1" />保存笔记</>}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{r.content}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5" />{r.source}{r.score !== undefined ? ` · 相关度 ${r.score.toFixed(3)}` : ''}
                          </p>
                          {r.sourceName && (
                            <span className="text-[10px] text-muted-foreground/70 flex items-center gap-0.5">
                              <FileText className="w-2.5 h-2.5" />
                              {r.sourceUrl ? (
                                <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[120px]">
                                  {r.sourceName}
                                </a>
                              ) : r.sourceName}
                            </span>
                          )}
                          {r.relationCount > 0 && (
                            <span className="text-[10px] text-emerald-500/80 flex items-center gap-0.5">
                              <GitCompare className="w-2.5 h-2.5" />{r.relationCount} 条关联
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {searchResults.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-8">
                        输入关键词搜索知识库内容
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" /> 知识库文件
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 ml-auto">{files.length} 个文件</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const unindexed = files.filter(f => f.content_text && !['completed','pending','processing'].includes(indexJobs[f.id]?.status || ''));
                  if (unindexed.length > 0) {
                    return (
                      <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
                        <div className="text-xs text-amber-600">
                          <p className="font-medium">有 {unindexed.length} 个已解析文件尚未建立索引</p>
                          <p className="opacity-80">点击右侧按钮可一键建立 WVK + RAG 双引擎索引；搜索未索引文件时也会自动从原文中检索。</p>
                        </div>
                        <Button size="sm" variant="outline" className="shrink-0 h-8 text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                          disabled={indexingId !== null}
                          onClick={async () => {
                            for (const f of unindexed) {
                              await handleIndexWiki(f);
                            }
                          }}>
                          {indexingId !== null ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <BookmarkPlus className="w-3 h-3 mr-1" />}
                          一键索引
                        </Button>
                      </div>
                    );
                  }
                  return null;
                })()}
                {loading ? (
                  <div className="space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}</div>
                ) : files.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">暂无文件，请上传学习资料或添加学习网站</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {files.map(f => {
                      const job = indexJobs[f.id];
                      return (
                      <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          {f.file_url?.startsWith('http') && !f.file_url?.includes('supabase')
                            ? <Globe className="w-4 h-4 text-primary" />
                            : <FileText className="w-4 h-4 text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />{f.created_at.slice(0, 10)}
                            {f.content_text && <span className="ml-2 text-primary">已解析</span>}
                          </p>
                          {job ? <p className={`text-[10px] mt-1 ${job.status === 'failed' ? 'text-destructive' : job.status === 'completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {job.status === 'completed' ? `WVK ${job.wiki_count} 词条 · RAG ${job.chunk_count} 片段 · 向量 ${job.vector_count}` : job.status === 'failed' ? `索引失败：${job.error_message || '未知错误'}` : '正在建立双引擎索引…'}
                          </p> : f.content_text ? <p className="text-[10px] mt-1 text-amber-500">已解析，点击右侧「WVK 索引」建立检索</p> : null}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="outline" size="sm" disabled={!f.content_text || indexingId === f.id}
                            title="整理为 Wiki 词条并建立双引擎索引" className="h-7 text-[10px] px-2"
                            onClick={() => handleIndexWiki(f)}>
                            {indexingId === f.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : job?.status === 'completed' ? '重建索引' : 'WVK 索引'}
                          </Button>
                          <Button variant="ghost" size="icon"
                            title={f.content_text ? '重新解析' : '解析文件'}
                            className="h-7 w-7 text-muted-foreground hover:text-primary"
                            onClick={() => handleReparse(f)}>
                            <RefreshCw className="w-3.5 h-3.5" />
                          </Button>
                          {f.file_url && (
                            <a href={f.file_url} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                            </a>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(f.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {tab === 'compare' && (
          <motion.div key="compare" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Card className="border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <GitCompare className="w-4 h-4 text-primary" /> 知识库对比分析
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">问题 / 知识点</label>
                      <Input value={cmpQuestion} onChange={e => setCmpQuestion(e.target.value)}
                        placeholder="例：请解释 HashMap 的 put 方法流程"
                        className="h-9 text-sm bg-muted border-border" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">你的回答</label>
                      <Textarea value={cmpAnswer} onChange={e => setCmpAnswer(e.target.value)}
                        placeholder="输入你对该知识点的理解或回答..."
                        rows={5} className="text-sm bg-muted border-border resize-none" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs text-muted-foreground">知识库参考内容（可选）</label>
                        <Button variant="ghost" size="sm" onClick={fetchReference}
                          disabled={!cmpQuestion.trim() || cmpSearching}
                          className="h-6 text-[10px] text-primary px-2 border border-primary/20 hover:bg-primary/10">
                          {cmpSearching
                            ? <><RefreshCw className="w-2.5 h-2.5 mr-1 animate-spin" />获取中</>
                            : <><Search className="w-2.5 h-2.5 mr-1" />从知识库获取</>}
                        </Button>
                      </div>
                      <Textarea value={cmpReference} onChange={e => setCmpReference(e.target.value)}
                        placeholder="知识库参考内容（点击从知识库获取自动填入，或手动粘贴）"
                        rows={4} className="text-sm bg-muted border-border resize-none" />
                    </div>
                    <Button onClick={runCompare} disabled={comparing || !cmpQuestion.trim() || !cmpAnswer.trim()}
                      className="w-full gradient-bg text-white h-9 text-sm">
                      {comparing
                        ? <><RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />AI 分析中...</>
                        : <><ChevronRight className="w-3.5 h-3.5 mr-2" />开始对比分析</>}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div>
                <AnimatePresence>
                  {!cmpResult && !comparing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="h-full min-h-64 rounded-2xl border border-dashed border-primary/30 flex flex-col items-center justify-center gap-3 p-8 text-center bg-primary/3">
                      <GitCompare className="w-10 h-10 text-primary/30" />
                      <p className="text-sm text-muted-foreground">填写问题和你的回答后，AI 将逐句对比分析</p>
                      <p className="text-xs text-muted-foreground/70">支持标绿（正确）、标黄（部分正确）、标红（有误）三色标注</p>
                    </motion.div>
                  )}
                  {comparing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="h-full min-h-64 rounded-2xl border border-border bg-card flex items-center justify-center">
                      <div className="text-center space-y-3">
                        <div className="w-10 h-10 rounded-full gradient-bg mx-auto flex items-center justify-center">
                          <RefreshCw className="w-5 h-5 text-white animate-spin" />
                        </div>
                        <p className="text-sm text-muted-foreground">DeepSeek 正在逐句分析...</p>
                      </div>
                    </motion.div>
                  )}
                  {cmpResult && !comparing && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-border bg-card overflow-hidden">
                      <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">对比分析结果</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{cmpResult.summary}</p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <div className={`text-2xl font-bold ${cmpResult.overallScore >= 80 ? 'text-emerald-500' : cmpResult.overallScore >= 60 ? 'text-amber-500' : 'text-red-400'}`}>
                            {cmpResult.overallScore}
                          </div>
                          <div className="text-xs text-muted-foreground">/ 100 分</div>
                        </div>
                      </div>
                      <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">逐句标注</p>
                        {cmpResult.analysis.map((item, i) => {
                          const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.neutral;
                          const Icon = cfg.icon;
                          return (
                            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className={`p-3 rounded-xl border ${cfg.bg}`}>
                              <div className="flex items-start gap-2">
                                <Icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${cfg.color}`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-foreground leading-relaxed">{item.sentence}</p>
                                  {item.comment && (
                                    <p className={`text-[10px] mt-1 ${cfg.color}`}>{item.comment}</p>
                                  )}
                                </div>
                                <Badge className={`text-[9px] h-4 shrink-0 ${cfg.bg} ${cfg.color} border-0`}>
                                  {cfg.label}
                                </Badge>
                              </div>
                            </motion.div>
                          );
                        })}
                        {cmpResult.suggestions.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs font-medium text-foreground mb-2">改进建议</p>
                            <ul className="space-y-1">
                              {cmpResult.suggestions.map((s, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'graph' && (
          <motion.div key="graph" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-primary" /> 知识图谱
                  <span className="text-xs text-muted-foreground font-normal ml-2">点击节点查看详情</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <KnowledgeGraph />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
