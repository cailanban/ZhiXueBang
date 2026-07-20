// MicroLessonsPage — 微课广场/列表页
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, BarChart3, BookOpen, ChevronRight, Sparkles, Plus } from 'lucide-react';
import demoCourse from '@/features/micro-course/data/demo-course.json';
import type { MicroCourse } from '@/features/micro-course/types/course';

// 演示课程 + localStorage 持久化的生成课程
const STORAGE_KEY = 'zhixuebang-micro-courses';

function loadAllCourses() {
  const courses: (MicroCourse & { sceneCount: number; updatedAt: string })[] = [
    {
      ...demoCourse,
      updatedAt: new Date().toISOString(),
      sceneCount: demoCourse.scenes.length,
    },
  ];
  // 读取所有已保存的生成课程
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const saved: MicroCourse[] = JSON.parse(raw);
      for (const gen of saved) {
        courses.unshift({
          ...gen,
          updatedAt: new Date().toISOString(),
          sceneCount: gen.scenes?.length || 0,
        });
      }
    } catch { /* ignore */ }
  }
  // 也兼容旧的 sessionStorage 单课程（迁移）
  const legacy = sessionStorage.getItem('generated-course');
  if (legacy) {
    try {
      const gen = JSON.parse(legacy) as MicroCourse;
      courses.unshift({ ...gen, updatedAt: new Date().toISOString(), sceneCount: gen.scenes?.length || 0 });
      sessionStorage.removeItem('generated-course');
      // 迁移到 localStorage
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as MicroCourse[];
      existing.push(gen);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(-10))); // 最多保留10个
    } catch { /* ignore */ }
  }
  return courses;
}

// 保存生成课程
export function saveGeneratedCourse(course: MicroCourse) {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as MicroCourse[];
  // 去重（同title替换）
  const filtered = existing.filter(c => c.title !== course.title);
  filtered.unshift(course);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, 10)));
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function MicroLessonsPage() {
  const navigate = useNavigate();
  const [courses] = useState(loadAllCourses);

  return (
    <div className="max-w-5xl mx-auto">
      {/* 页头 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">AI 语音微课</h1>
          <p className="text-muted-foreground">
            边讲、边写、边画的智能课堂 — 像老师一样讲解知识
          </p>
        </div>
        <Button onClick={() => navigate('/micro-lessons/create')} className="gradient-bg text-white">
          <Plus className="w-4 h-4 mr-2" /> 生成新课
        </Button>
      </div>

      {/* 课程卡片列表 */}
      <div className="grid gap-4">
        {courses.map((course) => (
          <div key={course.id}
            className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition cursor-pointer"
            onClick={() => navigate(`/micro-lessons/${course.id}/play`)}
          >
            {/* 封面 */}
            <div className="w-32 h-20 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
              <Play className="w-8 h-8 text-white/80" />
            </div>

            {/* 信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{course.title}</h3>
                <Badge variant="outline" className={DIFFICULTY_COLORS[course.difficulty] || ''}>
                  {course.difficulty === 'beginner' ? '初级' : course.difficulty === 'intermediate' ? '中级' : '高级'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{course.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.sceneCount} 个场景</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.round(course.durationSeconds / 60)} 分钟</span>
                <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{course.subject}</span>
              </div>
            </div>

            {/* 操作 */}
            <Button variant="ghost" size="icon" className="shrink-0">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {courses.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">暂无微课</p>
          <p className="text-sm">后续版本将支持从主题生成个性化语音微课</p>
        </div>
      )}

      {/* 底部信息 */}
      <div className="mt-8 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-sm text-muted-foreground">
        <p className="font-medium text-blue-400 mb-1">📢 即将推出</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>输入任意主题，AI 自动生成语音微课</li>
          <li>错题一键生成 3 分钟讲解微课</li>
          <li>支持多种 TTS 音色和语速</li>
          <li>个性化适配学生画像</li>
        </ul>
      </div>
    </div>
  );
}
