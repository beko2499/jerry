import { useState, useEffect, useRef } from 'react';
import { Search, Bell, Plus, LogOut, Menu, X, Wallet, MessageCircle, FileText, Megaphone, Globe, ShoppingBag, ClipboardList } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const playNotifSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.24);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) { }
};

interface HeaderProps {
  onAddFundsClick?: () => void;
  onNavigate?: (item: string) => void;
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
}

export default function Header({ onAddFundsClick, onNavigate, showMobileMenu, setShowMobileMenu }: HeaderProps) {
  const { user, logout } = useAuth();
  const { t, isRTL, lang, toggleLanguage } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<{ _id: string; title: string; body: string; sentAt: string }[]>([]);
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const prevCountRef = useRef(0);

  useEffect(() => {
    const fetchNotifs = () => {
      fetch(`${API_URL}/notifications/user${user?._id ? `?userId=${user._id}` : ''}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            if (prevCountRef.current > 0 && data.length > prevCountRef.current) {
              playNotifSound();
            }
            prevCountRef.current = data.length;
            setNotifications(data);
          }
        })
        .catch(console.error);
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [user?._id]);

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
    : '?';

  const mobileMenuItems = [
    { id: 'new-order', label: t.newOrder || 'خدماتنا', icon: ShoppingBag, color: 'text-cyan-400' },
    { id: 'orders', label: t.myOrders || 'سجل الطلبات', icon: ClipboardList, color: 'text-orange-400' },
    { id: 'add-funds', label: t.addFunds || 'شحن الرصيد', icon: Wallet, color: 'text-green-400' },
    { id: 'support', label: t.support || 'الدعم', icon: MessageCircle, color: 'text-yellow-400' },
    { id: 'terms', label: t.termsOfService || 'شروط الاستخدام', icon: FileText, color: 'text-blue-400' },
    { id: 'updates', label: t.updates || 'التحديثات', icon: Megaphone, color: 'text-purple-400' },
  ];

  return (
    <>
      <header dir="ltr" className="h-14 md:h-20 glass border-b border-white/10 px-3 md:px-6 flex items-center justify-between sticky top-0 z-30 bg-black/40 backdrop-blur-xl">

        {/* Mobile: Hamburger Menu — ALWAYS on the left via dir=ltr */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMobileMenu(true)}
          className="md:hidden w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all shrink-0"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Desktop: Search Bar */}
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

        {/* Mobile: Title (Center) */}
        <h1 onClick={() => onNavigate?.('new-order')} className="md:hidden font-space text-lg font-bold text-white tracking-[0.2em] bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent flex-1 text-center cursor-pointer">JERRY</h1>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">

          {/* Add Balance Button */}
          <Button
            onClick={onAddFundsClick}
            variant="outline"
            className="h-9 md:h-11 px-2.5 md:px-5 rounded-lg md:rounded-xl border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300 hover:border-green-500/50 transition-all shadow-[0_0_10px_rgba(34,197,94,0.1)]"
          >
            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4 md:ml-2" />
            <span className="font-space font-bold text-xs md:text-base">${user?.balance?.toFixed(0) || '0'}</span>
            <span className="hidden md:inline font-body mr-2 text-sm">{t.addFunds}</span>
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setShowNotifications(!showNotifications); setLastSeenCount(notifications.length); }}
              className="relative w-9 h-9 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all"
            >
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
              {notifications.length > lastSeenCount && (
                <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]"></span>
              )}
            </Button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="fixed md:absolute top-14 md:top-full right-2 md:right-0 left-2 md:left-auto mt-0 md:mt-2 z-50 md:w-80 max-h-[70vh] md:max-h-96 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 border-b border-white/10">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                      <Bell className="w-4 h-4 text-cyan-400" />
                      {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
                      {notifications.length > 0 && <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full">{notifications.length}</span>}
                    </h3>
                  </div>
                  <div className="overflow-y-auto max-h-80 custom-scrollbar">
                    {notifications.length > 0 ? notifications.slice(0, 20).map(n => (
                      <div key={n._id} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                        <p className="text-white text-xs font-bold">{n.title}</p>
                        <p className="text-white/40 text-[11px] mt-0.5 line-clamp-2">{n.body}</p>
                        <p className="text-white/20 text-[10px] mt-1">{new Date(n.sentAt).toLocaleDateString('ar-IQ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    )) : (
                      <div className="p-6 text-center">
                        <p className="text-white/30 text-xs">{lang === 'ar' ? 'لا توجد إشعارات' : 'No notifications'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Desktop: User Avatar + Dropdown */}
          <div className="relative hidden md:block">
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 cursor-pointer"
            >
              {user && (
                <span className="text-white/80 text-sm font-body">
                  {user.firstName}
                </span>
              )}
              <Avatar className="w-11 h-11 rounded-xl border border-cyan-500/30 cursor-pointer hover:border-cyan-500/60 transition-all shadow-lg shadow-cyan-500/10">
                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white font-space text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Desktop Dropdown Menu */}
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

      {/* Mobile Slide-Out Drawer — ALWAYS from the LEFT side */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Drawer — always left-0 */}
          <div className="fixed top-0 left-0 h-full w-72 bg-[#0d0d1a] border-r border-white/10 z-[210] md:hidden animate-in slide-in-from-left duration-300 flex flex-col">

            {/* Drawer Header */}
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => {
                  setShowMobileMenu(false);
                  onNavigate?.('settings');
                }}
              >
                <Avatar className="w-10 h-10 rounded-xl border border-cyan-500/30">
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-600 text-white font-space text-sm">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {user && (
                  <div>
                    <p className="text-white font-bold text-sm">{user.firstName} {user.lastName}</p>
                    <p className="text-white/40 text-xs">@{user.username}</p>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileMenu(false)}
                className="w-8 h-8 text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Menu Items */}
            <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
              {mobileMenuItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setShowMobileMenu(false);
                      if (item.id === 'add-funds') {
                        onAddFundsClick?.();
                      } else {
                        onNavigate?.(item.id);
                      }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Icon className={`w-5 h-5 ${item.color}`} />
                    <span className="font-body text-sm">{item.label}</span>
                  </button>
                );
              })}

              {/* Language Toggle */}
              <button
                onClick={() => {
                  toggleLanguage();
                }}
                className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  <span className="font-body text-sm">{lang === 'ar' ? 'اللغة' : 'Language'}</span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60 font-space">
                  {lang === 'ar' ? 'EN' : 'عربي'}
                </span>
              </button>
            </nav>

            {/* Logout — pinned to bottom, safe from being cut off */}
            <div className="p-3 border-t border-white/10">
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-body text-sm">{t.logout}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}