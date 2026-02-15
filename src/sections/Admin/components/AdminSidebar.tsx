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
        <aside
            className={`h-screen glass border-r border-white/10 transition-all duration-300 flex flex-col z-20 ${isCollapsed ? 'w-20' : 'w-72'
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
    );
}
