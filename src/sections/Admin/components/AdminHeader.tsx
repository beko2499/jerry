import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminHeader() {
    const { isRTL, t } = useLanguage();

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
            <div className="flex items-center gap-4">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative text-white/60 hover:text-white hover:bg-white/10">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </Button>
            </div>
        </header>
    );
}
