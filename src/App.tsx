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

  // Admin State
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    // Simple URL check for admin route
    // In a real app with react-router, we'd use Routes
    const checkRoute = () => {
      if (window.location.pathname === '/admin') {
        setIsAdminMode(true);
      }
    };

    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  const handleEnter = () => {
    setShowDashboard(true);
  };

  // Admin Routing Flow
  if (isAdminMode) {
    if (isAdminLoggedIn) {
      return <AdminDashboard onLogout={() => setIsAdminLoggedIn(false)} />;
    }
    return <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />;
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