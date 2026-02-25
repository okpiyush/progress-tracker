import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Mock imports for pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

import JourneyPage from './pages/JourneyPage';
import DayDetailPage from './pages/DayDetailPage';
import BlogListPage from './pages/BlogListPage';
import BlogEditorPage from './pages/BlogEditorPage';
import PublicProfilePage from './pages/PublicProfilePage';
import PublicBlogPage from './pages/PublicBlogPage';
import SettingsPage from './pages/SettingsPage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) fetchUser();
  }, [isAuthenticated]);

  if (isLoading && isAuthenticated) return <div className="p-8 text-accent-green animate-blink">_ loading system</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />


        <Route path="/dashboard" element={
          <PrivateRoute><DashboardPage /></PrivateRoute>
        } />
        <Route path="/journey" element={
          <PrivateRoute><JourneyPage /></PrivateRoute>
        } />
        <Route path="/journey/day/:dayId" element={
          <PrivateRoute><DayDetailPage /></PrivateRoute>
        } />

        {/* Phase 5: Blog */}
        <Route path="/blog" element={
          <PrivateRoute><BlogListPage /></PrivateRoute>
        } />
        <Route path="/blog/:slug/edit" element={
          <PrivateRoute><BlogEditorPage /></PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute><SettingsPage /></PrivateRoute>
        } />

        {/* Phase 6: Public Profiles */}
        <Route path="/u/:username" element={<PublicProfilePage />} />
        <Route path="/u/:username/:slug" element={<PublicBlogPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
