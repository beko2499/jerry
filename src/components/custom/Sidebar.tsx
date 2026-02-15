import { useState } from 'react';
import {
  Plus,
  ShoppingCart,
  Settings,
  MessageCircle,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import useDetectKeyboard from '@/hooks/useDetectKeyboard';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

export default function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useLanguage();

  const menuItems = [
    { id: 'new-order', label: t.newOrder, icon: Plus, color: 'text-cyan-400' },
    { id: 'orders', label: t.myOrders, icon: ShoppingCart, color: 'text-purple-400' },
    { id: 'settings', label: t.settings, icon: Settings, color: 'text-pink-400' },
    { id: 'support', label: t.support, icon: MessageCircle, color: 'text-yellow-400' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex h-screen glass border-r border-white/10 transition-all duration-300 flex-col z-20 ${isCollapsed ? 'w-20' : 'w-72'
          }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10 flex justify-center overflow-hidden">
          {isCollapsed ? (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center flex-shrink-0 glow-cyan">
              <span className="font-space font-bold text-white text-lg">J</span>
            </div>
          ) : (
            <div className="scale-75 origin-left">
              <Logo />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onItemClick(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group ${isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30'
                  : 'hover:bg-white/5 border border-transparent'
                  }`}
              >
                <Icon className={`w-5 h-5 ${item.color} flex-shrink-0`} />
                {!isCollapsed && (
                  <span className={`font-body text-sm ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'} transition-colors`}>
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-4 border-t border-white/10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>
      </aside>

      {/* Mobile Floating Bottom Bar */}
      {!useDetectKeyboard() && (
        <div className="md:hidden fixed bottom-12 left-6 right-6 z-50">
          <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] h-16 px-4 flex items-center justify-between relative">

            {/* Left Side: Search & Orders */}
            <div className="flex items-center gap-1 w-1/3 justify-around">
              <button
                onClick={() => onItemClick('search')}
                className={`p-2 rounded-xl transition-all ${activeItem === 'search' ? 'text-cyan-400' : 'text-white/50'}`}
              >
                <Search className="w-6 h-6" />
              </button>
              <button
                onClick={() => onItemClick('orders')}
                className={`p-2 rounded-xl transition-all ${activeItem === 'orders' ? 'text-cyan-400' : 'text-white/50'}`}
              >
                <ShoppingCart className="w-6 h-6" />
              </button>
            </div>

            {/* Center: New Order (Floating FAB) */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-6">
              <button
                onClick={() => onItemClick('new-order')}
                className={`w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-transform duration-300 ${activeItem === 'new-order' ? 'scale-110 ring-4 ring-black/50' : 'hover:scale-105'}`}
              >
                <Plus className="w-6 h-6 text-white stroke-[3]" />
              </button>
            </div>

            {/* Right Side: Settings & Support */}
            <div className="flex items-center gap-1 w-1/3 justify-around">
              <button
                onClick={() => onItemClick('settings')}
                className={`p-2 rounded-xl transition-all ${activeItem === 'settings' ? 'text-cyan-400' : 'text-white/50'}`}
              >
                <Settings className="w-6 h-6" />
              </button>
              <button
                onClick={() => onItemClick('support')}
                className={`p-2 rounded-xl transition-all ${activeItem === 'support' ? 'text-cyan-400' : 'text-white/50'}`}
              >
                <MessageCircle className="w-6 h-6" />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}