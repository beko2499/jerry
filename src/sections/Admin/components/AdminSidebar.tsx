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
    ShieldAlert,
    Ticket,
    FileText,
    Bell,
    Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';


interface AdminSidebarProps {
    activeItem: string;
    onItemClick: (item: string) => void;
    onLogout: () => void;
    hideBottomNav?: boolean;
}

export default function AdminSidebar({ activeItem, onItemClick, onLogout, hideBottomNav }: AdminSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { t, isRTL } = useLanguage();

    const menuItems = [
        { id: 'stats', label: t.overview, icon: LayoutDashboard, color: 'text-cyan-400' },
        { id: 'gateways', label: t.gateways, icon: CreditCard, color: 'text-purple-400' },
        { id: 'providers', label: t.providers, icon: Users, color: 'text-pink-400' },
        { id: 'services', label: t.adminServices, icon: Layers, color: 'text-yellow-400' },
        { id: 'coupons', label: t.coupons || 'Coupons', icon: Ticket, color: 'text-amber-400' },
        { id: 'content', label: 'المحتوى', icon: FileText, color: 'text-orange-400' },
        { id: 'notifications', label: 'الإشعارات', icon: Bell, color: 'text-red-400' },
        { id: 'support', label: t.adminSupport, icon: MessageCircle, color: 'text-green-400' },
        { id: 'tickets', label: 'التذاكر', icon: Ticket, color: 'text-teal-400' },
        { id: 'settings', label: t.settings || 'الإعدادات', icon: Settings, color: 'text-slate-400' },
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

            {/* Mobile Sidebar Overlay */}
            <div className={`md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} onClick={() => setIsCollapsed(true)} />

            {/* Mobile Sidebar */}
            <aside
                className={`md:hidden fixed top-0 left-0 h-full w-72 bg-[#0d0d1a] border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}`}
            >
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                    <span className="font-space font-bold text-white text-lg tracking-wide">{t.adminPanel}</span>
                    <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(true)} className="text-white/60 hover:text-white">
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                </div>

                <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeItem === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => { onItemClick(item.id); setIsCollapsed(true); }}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                            >
                                <Icon className={`w-5 h-5 ${item.color}`} />
                                <span className="font-body text-sm font-medium">{item.label}</span>
                            </button>
                        );
                    })}

                    <div className="pt-4 mt-4 border-t border-white/10">
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-body text-sm font-medium">{t.logout}</span>
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Mobile Bottom Navigation Bar (Restored) */}
            {!hideBottomNav && (
                <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 glass rounded-2xl border border-white/10 z-30 flex items-center justify-around px-4 shadow-2xl backdrop-blur-xl">
                    {menuItems.slice(0, 4).map((item) => {
                        const Icon = item.icon;
                        const isActive = activeItem === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onItemClick(item.id)}
                                className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isActive ? 'text-red-500 scale-110' : 'text-white/40 hover:text-white'}`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] font-medium font-body">{item.label}</span>
                            </button>
                        );
                    })}
                    {/* Toggle Button for Side Menu - Integrated into Bottom Bar or separate? 
                   User said "keep side menu", so I'll keep the side toggle. 
                   The user's screenshot shows the toggle at the top left. 
                   I'll move it slightly or adjust its styling so it doesn't look like "double". */}
                </nav>
            )}

            {/* Mobile Header Toggle (Floating Hamburger) */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`md:hidden fixed top-4 ${isRTL ? 'right-4' : 'left-4'} z-30 p-2.5 rounded-xl bg-red-500/20 backdrop-blur-md border border-red-500/30 text-white shadow-lg transition-all duration-300 active:scale-95`}
            >
                <Layers className="w-6 h-6" />
            </button>
        </>
    );
}
