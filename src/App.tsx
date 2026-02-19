import { useState, useEffect } from 'react';
import LandingPage from '@/sections/LandingPage';
import Dashboard from '@/sections/Dashboard';
import AuthPage from '@/sections/AuthPage';
import AdminLogin from '@/sections/Admin/AdminLogin';
import AdminDashboard from '@/sections/Admin/AdminDashboard';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

function AppContent() {
  const [showDashboard, setShowDashboard] = useState(false);
  const { isAuthenticated } = useAuth();

  // Admin State — persist with 24h expiry
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    const session = localStorage.getItem('adminSession');
    if (session) {
      const { timestamp } = JSON.parse(session);
      const hoursElapsed = (Date.now() - timestamp) / (1000 * 60 * 60);
      if (hoursElapsed < 24) return true;
      localStorage.removeItem('adminSession');
    }
    return false;
  });

  const handleAdminLogin = () => {
    localStorage.setItem('adminSession', JSON.stringify({ timestamp: Date.now() }));
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminSession');
    setIsAdminLoggedIn(false);
  };

  useEffect(() => {
    // Simple URL check for admin route
    // Using Hash routing to avoid 404s on static hosting (Render)
    const checkRoute = () => {
      if (window.location.hash === '#/admin' || window.location.pathname === '/admin') {
        setIsAdminMode(true);
      }
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, []);

  const handleEnter = () => {
    setShowDashboard(true);
  };

  // Admin Routing Flow
  if (isAdminMode) {
    if (isAdminLoggedIn) {
      return <AdminDashboard onLogout={handleAdminLogout} />;
    }
    return <AdminLogin onLogin={handleAdminLogin} />;
  }

  // User Routing Flow
  // If user navigated to dashboard but is not authenticated, show auth page
  if (showDashboard && !isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {showDashboard ? (
        <Dashboard />
      ) : (
        <LandingPage onEnter={handleEnter} />
      )}
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;