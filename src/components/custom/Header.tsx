import { useState } from 'react';
import { Search, Bell, Plus, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  onAddFundsClick?: () => void;
}

export default function Header({ onAddFundsClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { t, isRTL } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
    : '?';

  return (
    <header className="h-16 md:h-20 glass border-b border-white/10 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 bg-black/20 backdrop-blur-md">
      {/* Search Bar - Hidden on Mobile */}
      <div className="hidden md:block flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            type="text"
            placeholder={t.searchPlaceholder}
            className="w-full h-12 pl-12 pr-4 bg-white/5 border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all font-body"
          />
        </div>
      </div>

      {/* Mobile Title (Optional, or just spacer) */}
      <div className="md:hidden">
        <h1 className="font-space text-xl font-bold text-white tracking-widest">JERRY</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 md:gap-4 ml-auto">
        {/* Mobile Search Toggle (Optional) */}
        <Button variant="ghost" size="icon" className="md:hidden text-white/70 hover:text-white hover:bg-white/10 rounded-xl">
          <Search className="w-5 h-5" />
        </Button>

        {/* Add Balance Button */}
        <Button
          onClick={onAddFundsClick}
          variant="outline"
          className="h-10 md:h-11 px-3 md:px-5 rounded-xl border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300 hover:border-green-500/50 transition-all shadow-[0_0_10px_rgba(34,197,94,0.1)]"
        >
          <Plus className="w-4 h-4 md:ml-2" />
          <span className="font-space font-bold text-sm md:text-base">$0</span>
          <span className="hidden md:inline font-body mr-2 text-sm">{t.addFunds}</span>
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative w-10 h-10 md:w-11 md:h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 md:top-2 md:right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]"></span>
        </Button>

        {/* User Avatar + Dropdown */}
        <div className="relative">
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 cursor-pointer"
          >
            {user && (
              <span className="hidden md:inline text-white/80 text-sm font-body">
                {user.firstName}
              </span>
            )}
            <Avatar className="w-10 h-10 md:w-11 md:h-11 rounded-xl border border-cyan-500/30 cursor-pointer hover:border-cyan-500/60 transition-all shadow-lg shadow-cyan-500/10">
              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white font-space text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className={`absolute top-full mt-2 z-50 w-56 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${isRTL ? 'left-0' : 'right-0'}`}>
                {user && (
                  <div className="p-4 border-b border-white/10">
                    <p className="text-white font-bold font-body text-sm align-start text-start">{user.firstName} {user.lastName}</p>
                    <p className="text-white/50 text-xs mt-1 font-mono align-start text-start">@{user.username}</p>
                    <p className="text-white/40 text-xs mt-0.5 align-start text-start">{user.email}</p>
                  </div>
                )}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-body"
                >
                  <LogOut className="w-4 h-4" />
                  {t.logout}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}