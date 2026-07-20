import type { MicroScene } from './scene';

export interface MicroCourse {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  durationSeconds: number;
  status: 'draft' | 'generating' | 'ready' | 'failed' | 'published';
  coverUrl?: string;
  voiceProvider: string;
  voiceId: string;
  species: number;
  schemaVersion: number;
  scenes: MicroScene[];
}

export interface MicroCourseMeta {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: string;
  durationSeconds: number;
  sceneCount: number;
  status: string;
  updatedAt: string;
}
