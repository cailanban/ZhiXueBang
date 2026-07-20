/**
 * VideoSynthesizer — PPT 讲稿 → 数字人视频合成流水线 (P2-1)
 *
 * 流水线：
 *   1. 调用 generate-ppt 生成幻灯片（含教师讲稿 notes）
 *   2. 调用 synthesize-video 为每页讲稿生成 TTS 音频
 *   3. 展示播放器：按页播放音频 + 可切换数字人/PPT 视图
 *
 * Props:
 *   - topic: 课件主题
 *   - outline: 大纲列表
 *   - template: PPT 模板
 */
import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import { Play, Pause, SkipForward, SkipBack, Download, Loader2, CheckCircle2, XCircle, Clock, FileText, Video, Music } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://pnmjgxsemgldncqbimbt.supabase.co';

interface SynthesisJob {
  jobId: string;
  status: 'generating_audio' | 'completed' | 'failed';
  slideCount: number;
  totalDurationSec?: number;
  audioFiles?: { slideIndex: number; title: string; audioUrl: string; durationMs: number; text: string }[];
  pptxUrl?: string;
  htmlUrl?: string;
  notesUrl?: string;
}

interface Props {
  topic: string;
  outline: string[];
  template?: string;
  onClose?: () => void;
}

const TEMPLATES = [
  { id: 'lecture', name: '讲义模式' },
  { id: 'workshop', name: '工作坊' },
  { id: 'review', name: '复习模式' },
  { id: 'exam-prep', name: '备考模式' },
];

export default function VideoSynthesizer({ topic, outline, template = 'lecture', onClose }: Props) {
  const [step, setStep] = useState<'idle' | 'generating_ppt' | 'synthesizing' | 'ready' | 'error'>('idle');
  const [job, setJob] = useState<SynthesisJob | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPipeline = useCallback(async () => {
    if (step !== 'idle') return;
    setStep('generating_ppt');
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('未登录');

      // Step 1: Generate PPT with teacher notes
      const pptRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-ppt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          topic,
          outline,
          template,
          slideCount: Math.min(outline.length + 2, 15),
          formats: ['pptx', 'html', 'notes'],
        }),
      });

      if (!pptRes.ok) throw new Error('PPT 生成失败: ' + pptRes.status);
      const pptData = await pptRes.json();
      if (!pptData.success) throw new Error(pptData.error || 'PPT 生成失败');

      const pptxUrl = pptData.pptxUrl;
      const htmlUrl = pptData.htmlUrl;
      const notesUrl = pptData.notesUrl;
      const slides = pptData.slides || [];

      setStep('synthesizing');

      // Step 2: Start video synthesis (TTS audio per slide)
      const synthRes = await fetch(`${SUPABASE_URL}/functions/v1/synthesize-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          topic,
          slides: slides.map((s: any) => ({
            title: s.title,
            notes: s.notes || '',
            body: s.body || [],
            type: s.type || 'content',
          })),
          voice: 'x4_lingxiaoxuan',
          speed: 1.0,
        }),
      });

      if (!synthRes.ok) {
        // TTS 失败但 PPT 已生成
        setJob({
          jobId: 'ppt-only',
          status: 'completed',
          slideCount: slides.length,
          pptxUrl,
          htmlUrl,
          notesUrl,
        });
        setStep('ready');
        toast.warning('TTS 音频合成失败，但 PPT 已生成');
        return;
      }

      const synthData = await synthRes.json();
      const jobId = synthData.jobId;

      setJob({ jobId, status: 'generating_audio', slideCount: synthData.slideCount, pptxUrl, htmlUrl, notesUrl });

      // Poll for completion
      pollRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch(`${SUPABASE_URL}/functions/v1/synthesize-video/api/v1/video/synthesize/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!pollRes.ok) return;
          const pollData = await pollRes.json();
          const j = pollData.job;

          if (j.status === 'completed') {
            if (pollRef.current) clearInterval(pollRef.current);
            setJob((prev) => ({
              ...prev!,
              status: 'completed',
              totalDurationSec: j.total_duration_sec,
              audioFiles: typeof j.audio_files === 'string' ? JSON.parse(j.audio_files) : j.audio_files || [],
            }));
            setStep('ready');
            toast.success('视频合成完成！');
          } else if (j.status === 'failed') {
            if (pollRef.current) clearInterval(pollRef.current);
            setJob((prev) => ({ ...prev!, status: 'failed' }));
            setStep('ready');
            setError(j.error_message || 'TTS 合成失败');
          }
        } catch { /* polling error, continue */ }
      }, 2000);

    } catch (e: any) {
      setError(e.message);
      setStep('error');
      toast.error(e.message);
    }
  }, [topic, outline, template, step]);

  // Audio playback
  const playSlide = useCallback((index: number) => {
    if (!job?.audioFiles || job.audioFiles.length === 0) return;
    const segment = job.audioFiles[index];
    if (!segment?.audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(segment.audioUrl);
    audioRef.current = audio;
    audio.onended = () => {
      setIsPlaying(false);
      if (index < job.audioFiles!.length - 1) {
        setCurrentSlide(index + 1);
        playSlide(index + 1);
      }
    };
    audio.onerror = () => toast.error('音频加载失败');
    audio.play().catch(() => {});
    setCurrentSlide(index);
    setIsPlaying(true);
  }, [job]);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const audioFiles = job?.audioFiles || [];
  const currentAudio = audioFiles[currentSlide];

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Video className="w-4 h-4 text-primary" />
            课件视频合成
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{topic}</p>
        </div>
        <div className="flex items-center gap-2">
          {step === 'generating_ppt' && <Badge variant="secondary"><Loader2 className="w-3 h-3 animate-spin mr-1" />生成 PPT</Badge>}
          {step === 'synthesizing' && <Badge variant="secondary"><Music className="w-3 h-3 animate-pulse mr-1" />合成语音</Badge>}
          {step === 'ready' && job?.status === 'completed' && <Badge className="bg-green-500/10 text-green-500 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />完成</Badge>}
          {step === 'error' && <Badge className="bg-red-500/10 text-red-500 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />失败</Badge>}
          {onClose && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>×</Button>}
        </div>
      </div>

      {/* Idle: Start button */}
      {step === 'idle' && (
        <div className="flex flex-col gap-3 items-center py-6">
          <p className="text-sm text-muted-foreground text-center">
            将大纲转化为 PPT 课件，并为每页生成教师讲解语音。
          </p>
          <div className="flex gap-2">
            {TEMPLATES.map((t) => (
              <Button key={t.id} variant="outline" size="sm" onClick={() => startPipeline()}>
                {t.name}
              </Button>
            ))}
          </div>
          <Button onClick={startPipeline} className="gradient-bg text-white">
            <Play className="w-4 h-4 mr-2" />开始合成
          </Button>
        </div>
      )}

      {/* In progress */}
      {(step === 'generating_ppt' || step === 'synthesizing') && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">
            {step === 'generating_ppt' ? '正在生成 PPT 课件和教师讲稿...' : '正在合成语音讲解...'}
          </p>
          {job && (
            <p className="text-xs text-muted-foreground/70">
              {job.slideCount} 页幻灯片
            </p>
          )}
        </div>
      )}

      {/* Ready: Player */}
      {step === 'ready' && job?.status === 'completed' && (
        <>
          {/* Audio player */}
          {audioFiles.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">
                  第 {currentSlide + 1}/{audioFiles.length} 页：{currentAudio?.title || '—'}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {currentAudio?.durationMs ? `${Math.round(currentAudio.durationMs / 1000)}s` : ''}
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-border rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${((currentSlide + 1) / audioFiles.length) * 100}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8"
                  disabled={currentSlide === 0}
                  onClick={() => { stopPlayback(); playSlide(currentSlide - 1); }}>
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button variant="default" size="icon" className="h-10 w-10 rounded-full"
                  onClick={() => isPlaying ? stopPlayback() : playSlide(currentSlide)}>
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"
                  disabled={currentSlide >= audioFiles.length - 1}
                  onClick={() => { stopPlayback(); playSlide(currentSlide + 1); }}>
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Slide list */}
          <div className="max-h-48 overflow-y-auto space-y-1">
            {audioFiles.map((seg, i) => (
              <button
                key={i}
                onClick={() => { stopPlayback(); playSlide(i); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors
                  ${i === currentSlide ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/50 border border-transparent'}`}
              >
                <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono shrink-0">
                  {i + 1}
                </span>
                <span className="truncate flex-1">{seg.title}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {Math.round(seg.durationMs / 1000)}s
                </span>
                {i === currentSlide && isPlaying && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Download links */}
          <div className="flex gap-2 flex-wrap">
            {job.pptxUrl && (
              <a href={job.pptxUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Download className="w-3.5 h-3.5 mr-1.5" />PPTX
                </Button>
              </a>
            )}
            {job.htmlUrl && (
              <a href={job.htmlUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <FileText className="w-3.5 h-3.5 mr-1.5" />HTML 幻灯片
                </Button>
              </a>
            )}
            {job.notesUrl && (
              <a href={job.notesUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <FileText className="w-3.5 h-3.5 mr-1.5" />教师讲稿
                </Button>
              </a>
            )}
          </div>
        </>
      )}

      {/* Error */}
      {step === 'error' && (
        <div className="flex flex-col items-center gap-3 py-6">
          <XCircle className="w-8 h-8 text-red-500" />
          <p className="text-sm text-red-400">{error}</p>
          <Button variant="outline" size="sm" onClick={() => { setStep('idle'); setError(null); }}>
            重试
          </Button>
        </div>
      )}
    </div>
  );
}