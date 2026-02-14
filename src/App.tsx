import { useState } from 'react';
import LandingPage from '@/sections/LandingPage';
import Dashboard from '@/sections/Dashboard';
import AuthPage from '@/sections/AuthPage';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

function AppContent() {
  const [showDashboard, setShowDashboard] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleEnter = () => {
    setShowDashboard(true);
  };

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