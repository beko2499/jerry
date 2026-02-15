import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminHeader() {
    const { isRTL, t } = useLanguage();

    return (
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md sticky top-0 z-10">
            {/* Search Bar */}
            <div className="relative w-96 hidden md:block">
                <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-white/40`} />
                <Input
                    placeholder={t.searchAdmin}
                    className={`${isRTL ? 'pr-12' : 'pl-12'} bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-red-500/50 focus:ring-red-500/20 rounded-xl h-12`}
                />
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative text-white/60 hover:text-white hover:bg-white/10">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </Button>

                {/* Admin Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-bold text-white font-space">{t.adminUser}</div>
                        <div className="text-xs text-white/50">{t.superAdmin}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-purple-600 p-[1px]">
                        <div className="w-full h-full rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
                            <span className="font-bold text-white text-sm">AU</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
