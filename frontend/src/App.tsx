import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import './index.css';
import { UserProfile } from './types';
import { TaskProvider } from './contexts/TaskContext';
import { LandingPage } from './pages/Landing';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { ChatPage } from './pages/Chat';
import { SymptomsPage } from './pages/Symptoms';
import { ReportPage } from './pages/Report';
import { LedgerExplorerPage } from './pages/LedgerExplorer';
import { DrugInteractionPage } from './pages/DrugInteraction';
import { NearbyPage } from './pages/Nearby';
import { HealthTrackerPage } from './pages/HealthTracker';
import { Layout } from './components/Layout';

// ── Session restore helper ──────────────────────────────────────────────────
function restoreSession(): UserProfile | null {
  try {
    const saved = localStorage.getItem('medichain_user_enc');
    if (saved) {
      const profile = JSON.parse(atob(saved));
      if (profile?.email && profile?.name && profile?.age) {
        return profile as UserProfile;
      }
    }
  } catch {
    localStorage.removeItem('medichain_user_enc');
  }
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  const [user, setUser] = useState<UserProfile | null>(() => restoreSession());

  const handleSetUser = (profile: UserProfile | null) => {
    if (profile) {
      localStorage.setItem('medichain_user_enc', btoa(JSON.stringify(profile)));
      localStorage.setItem('medichain_last_email', profile.email);
    } else {
      localStorage.removeItem('medichain_user_enc');
      localStorage.removeItem('medichain_last_email');
    }
    setUser(profile);
  };

  useEffect(() => {
    const lastEmail = localStorage.getItem('medichain_last_email');
    if (lastEmail && !user) {
      const saved = localStorage.getItem('medichain_user_enc');
      if (saved) {
        try {
          const profile = JSON.parse(atob(saved));
          if (profile?.email && profile?.name) setUser(profile);
        } catch { /* ignore */ }
      }
    }
  }, []);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" replace /> : <Login setUser={handleSetUser} />
        } />
        <Route path="/onboarding" element={<Onboarding setUser={handleSetUser} />} />

        {/* Protected routes — wrapped in Layout */}
        <Route element={
          user ? <Layout user={user} setUser={handleSetUser} /> : <Navigate to="/login" replace />
        }>
          <Route path="/dashboard" element={<Dashboard user={user!} />} />
          <Route path="/chat" element={<ChatPage user={user!} />} />
          <Route path="/symptoms" element={<SymptomsPage user={user!} />} />
          <Route path="/report" element={<ReportPage user={user!} />} />
          <Route path="/ledger" element={<LedgerExplorerPage />} />
          <Route path="/drug-interaction" element={<DrugInteractionPage />} />
          <Route path="/nearby" element={<NearbyPage user={user!} />} />
          <Route path="/health-tracker" element={<HealthTrackerPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <HashRouter>
      <TaskProvider>
        <Toaster
          position="top-right"
          theme="dark"
          closeButton
          richColors
          toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.96)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              color: '#f1f5f9',
            },
          }}
        />
        <AnimatedRoutes />
      </TaskProvider>
    </HashRouter>
  );
}

export default App;

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { });
  });
}