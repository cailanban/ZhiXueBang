import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DigitalHumanProvider } from '@/contexts/DigitalHumanContext';
import AppLayout from '@/components/layouts/AppLayout';
// 预初始化 mermaid，消除首次图表渲染的懒加载延迟
import mermaid from 'mermaid';
mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose', fontFamily: 'inherit' });

import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import PrivacyPage from '@/pages/PrivacyPage';
import TermsPage from '@/pages/TermsPage';
import DashboardPage from '@/pages/DashboardPage';
import ChatPage from '@/pages/ChatPage';
import TutorPage from '@/pages/TutorPage';
import NotesPage from '@/pages/NotesPage';
import MistakesPage from '@/pages/MistakesPage';
import ProfilePage from '@/pages/ProfilePage';
import KnowledgePage from '@/pages/KnowledgePage';
import ResourcesPage from '@/pages/ResourcesPage';
import PathPage from '@/pages/PathPage';
import CoursesPage from '@/pages/CoursesPage';
import CourseDetailPage from '@/pages/CourseDetailPage';
import InsightPage from '@/pages/InsightPage';
import InterviewPage from '@/pages/InterviewPage';
import EvaluationPage from '@/pages/EvaluationPage';
import VisualizationPage from '@/pages/VisualizationPage';
import StatusPage from '@/pages/StatusPage';
import SettingsPage from '@/pages/SettingsPage';
import AdminPage from '@/pages/AdminPage';
import HistoryPage from '@/pages/HistoryPage';
import ExamCramPage from '@/pages/ExamCramPage';
import AssetsPage from '@/pages/AssetsPage';
import MicroLessonsPage from '@/pages/MicroLessonsPage';
import MicroLessonPlayerPage from '@/pages/MicroLessonPlayerPage';
import MicroLessonCreatePage from '@/pages/MicroLessonCreatePage';

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <DigitalHumanProvider>
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/tutor" element={<TutorPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/mistakes" element={<MistakesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/path" element={<PathPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/evaluation" element={<EvaluationPage />} />
        <Route path="/insight" element={<InsightPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/visualization" element={<VisualizationPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/exam-cram" element={<ExamCramPage />} />
        <Route path="/micro-lessons" element={<MicroLessonsPage />} />
        <Route path="/micro-lessons/create" element={<MicroLessonCreatePage />} />
        <Route path="/micro-lessons/:id/play" element={<MicroLessonPlayerPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
    </DigitalHumanProvider>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/status" element={<StatusPage />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter basename="/">
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
