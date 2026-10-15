import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { JobsPage } from './pages/JobsPage';
import { AiMatcherPage } from './pages/AiMatcherPage';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { useAuth } from './context/AuthContext';

export const App: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const { isAuthenticated, isCandidate, isRecruiter } = useAuth();

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Navbar onOpenAuth={handleOpenAuth} />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage onOpenAuth={() => handleOpenAuth('register')} />} />
          <Route path="/jobs" element={<JobsPage onOpenAuth={() => handleOpenAuth('login')} />} />
          <Route path="/ai-matcher" element={<AiMatcherPage />} />
          
          <Route
            path="/candidate"
            element={
              isAuthenticated && isCandidate ? (
                <CandidateDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route
            path="/recruiter"
            element={
              isAuthenticated && isRecruiter ? (
                <RecruiterDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultTab={authTab}
      />
    </div>
  );
};

export default App;
