// MicroLessonPlayerPage — 沉浸式微课播放页
// 支持 demo 课程和 AI 生成的课程
import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { usePlayback } from '@/features/micro-course/hooks/usePlayback';
import ClassroomShell from '@/features/micro-course/components/ClassroomShell';
import demoCourse from '@/features/micro-course/data/demo-course.json';
import type { MicroCourse } from '@/features/micro-course/types/course';

const DEMO_COURSES: Record<string, MicroCourse> = {
  'demo-java-polymorphism': demoCourse as MicroCourse,
};

export default function MicroLessonPlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const course = useMemo(() => {
    // 优先查 demo 课程
    if (id && DEMO_COURSES[id]) return DEMO_COURSES[id];

    // 查 sessionStorage（AI 生成的课程）
    if (id === 'play-generated') {
      const raw = sessionStorage.getItem('generated-course');
      if (raw) {
        try { return JSON.parse(raw) as MicroCourse; } catch { /* ignore */ }
      }
    }

    return undefined;
  }, [id]);

  const playback = usePlayback(course?.scenes || []);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-4">
        <p>微课未找到</p>
        <button onClick={() => navigate('/micro-lessons/create')}
          className="text-sm text-blue-400 hover:underline">
          去生成新的微课 →
        </button>
      </div>
    );
  }

  return (
    <ClassroomShell
      course={course}
      playback={playback}
      onBack={() => navigate('/micro-lessons')}
    />
  );
}
