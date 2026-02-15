import { useState } from 'react';
import {
    LayoutDashboard,
    CreditCard,
    Users,
    Layers,
    MessageCircle,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdminSidebarProps {
    activeItem: string;
    onItemClick: (item: string) => void;
    onLogout: () => void;
}

export default function AdminSidebar({ activeItem, onItemClick, onLogout }: AdminSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { t, isRTL } = useLanguage();

    const menuItems = [
        { id: 'stats', label: t.overview, icon: LayoutDashboard, color: 'text-cyan-400' },
        { id: 'gateways', label: t.gateways, icon: CreditCard, color: 'text-purple-400' },
        { id: 'providers', label: t.providers, icon: Users, color: 'text-pink-400' },
        { id: 'services', label: t.adminServices, icon: Layers, color: 'text-yellow-400' },
        { id: 'support', label: t.adminSupport, icon: MessageCircle, color: 'text-green-400' },
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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <ShieldAlert className="w-6 h-6 text-white" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20">
                                <ShieldAlert className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-space font-bold text-white text-lg tracking-wide whitespace-nowrap">{t.adminPanel}</span>
                            </div>
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
                                    ? 'bg-gradient-to-r from-red-500/20 to-purple-500/20 border border-red-500/30'
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

                {/* Footer / Logout */}
                <div className="p-4 border-t border-white/10 space-y-2">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all border border-transparent hover:border-red-500/20"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="font-body text-sm">{t.logout}</span>}
                    </button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                        {isCollapsed ?
                            (isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />) :
                            (isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />)
                        }
                    </Button>
                </div>
            </aside>

            {/* Mobile Floating Bottom Bar */}
            <div className="md:hidden fixed bottom-12 left-6 right-6 z-50">
                <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] h-16 px-4 flex items-center justify-between relative">

                    {/* Left Side: Gateways & Services */}
                    <div className="flex items-center gap-1 w-1/3 justify-around">
                        <button
                            onClick={() => onItemClick('gateways')}
                            className={`p-2 rounded-xl transition-all ${activeItem === 'gateways' ? 'text-purple-400' : 'text-white/50'}`}
                        >
                            <CreditCard className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => onItemClick('services')}
                            className={`p-2 rounded-xl transition-all ${activeItem === 'services' ? 'text-yellow-400' : 'text-white/50'}`}
                        >
                            <Layers className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Center: Dashboard/Stats (Floating FAB) */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-6">
                        <button
                            onClick={() => onItemClick('stats')}
                            className={`w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-transform duration-300 ${activeItem === 'stats' ? 'scale-110 ring-4 ring-black/50' : 'hover:scale-105'}`}
                        >
                            <LayoutDashboard className="w-8 h-8 text-white stroke-[2]" />
                        </button>
                    </div>

                    {/* Right Side: Providers & Support */}
                    <div className="flex items-center gap-1 w-1/3 justify-around">
                        <button
                            onClick={() => onItemClick('providers')}
                            className={`p-2 rounded-xl transition-all ${activeItem === 'providers' ? 'text-pink-400' : 'text-white/50'}`}
                        >
                            <Users className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => onItemClick('support')}
                            className={`p-2 rounded-xl transition-all ${activeItem === 'support' ? 'text-green-400' : 'text-white/50'}`}
                        >
                            <MessageCircle className="w-6 h-6" />
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}
