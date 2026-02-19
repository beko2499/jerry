import { useState, useEffect } from 'react';
import { Bell, Search, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AdminNotification {
    _id: string;
    title: string;
    body: string;
    createdAt: string;
}

export default function AdminHeader() {
    const { isRTL, t } = useLanguage();
    const [showNotifs, setShowNotifs] = useState(false);
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);

    useEffect(() => {
        const fetchAdminNotifs = () => {
            fetch(`${API_URL}/notifications/admin`)
                .then(r => r.json())
                .then(data => { if (Array.isArray(data)) setNotifications(data); })
                .catch(console.error);
        };
        fetchAdminNotifs();
        const interval = setInterval(fetchAdminNotifs, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleDismiss = async (id: string) => {
        await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE' });
        setNotifications(prev => prev.filter(n => n._id !== id));
    };

    const formatDate = (d: string) => {
        const date = new Date(d);
        return date.toLocaleDateString('ar-IQ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <header className="h-16 md:h-20 border-b border-white/10 flex items-center justify-end md:justify-between px-4 md:px-8 bg-black/20 backdrop-blur-md sticky top-0 z-10">
            {/* Search Bar */}
            <div className="relative w-96 hidden md:block">
                <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-white/40`} />
                <Input
                    placeholder={t.searchAdmin}
                    className={`${isRTL ? 'pr-12' : 'pl-12'} bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-red-500/50 focus:ring-red-500/20 rounded-xl h-12`}
                />
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4 relative">
                {/* Notifications Bell */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-white/60 hover:text-white hover:bg-white/10"
                    onClick={() => setShowNotifs(!showNotifs)}
                >
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                            {notifications.length}
                        </span>
                    )}
                </Button>

                {/* Notifications Dropdown */}
                {showNotifs && (
                    <div className="fixed md:absolute top-16 md:top-full left-2 right-2 md:left-auto md:right-0 mt-0 md:mt-2 w-auto md:w-96 bg-[#0d0d1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                        <div className="p-3 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-400" /> تنبيهات النظام
                            </h3>
                            <span className="text-white/40 text-xs">{notifications.length} تنبيه</span>
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-white/30 text-sm">لا توجد تنبيهات</div>
                            ) : (
                                notifications.map(n => (
                                    <div key={n._id} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-bold truncate">{n.title}</p>
                                                <p className="text-white/50 text-xs mt-1 leading-relaxed whitespace-pre-line">{n.body}</p>
                                                <span className="text-white/25 text-[10px] mt-1 block">{formatDate(n.createdAt)}</span>
                                            </div>
                                            <button onClick={() => handleDismiss(n._id)} className="text-white/20 hover:text-red-400 p-1 transition-colors shrink-0">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
