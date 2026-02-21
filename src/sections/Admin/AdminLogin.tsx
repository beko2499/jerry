import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, AlertCircle, Globe } from 'lucide-react';
import Starfield from '@/components/Starfield';
import { useLanguage } from '@/contexts/LanguageContext';
import { Logo } from '@/components/Logo';
import { setAdminToken } from '@/lib/api';

interface AdminLoginProps {
    onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { isRTL, lang, toggleLanguage, t } = useLanguage();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/admin-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.token) setAdminToken(data.token);
                onLogin();
            } else {
                const data = await res.json();
                if (data.error === 'too_many_attempts') {
                    setError(`تم حظر الدخول لمدة ${data.remainingHours} ساعة بسبب كثرة المحاولات الفاشلة`);
                } else if (data.remainingAttempts !== undefined) {
                    setError(`${t.invalidCredentials} — المحاولات المتبقية: ${data.remainingAttempts}`);
                } else {
                    setError(t.invalidCredentials);
                }
            }
        } catch {
            setError('Connection error');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a1a] relative flex items-center justify-center p-4 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0 opacity-40">
                <Starfield starCount={800} speed={0.02} />
            </div>

            {/* Decorative Glows (Red/Purple for Admin to distinguish from User Cyan) */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-8">
                    {/* Language Switcher */}
                    <div className="flex justify-center mb-6">
                        <button
                            onClick={toggleLanguage}
                            className="group relative overflow-hidden flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-red-500/30 rounded-full transition-all duration-300 hover:border-red-400 hover:bg-red-500/10 active:scale-95"
                        >
                            <Globe className="w-4 h-4 text-red-400" />
                            <span className="font-space font-bold text-red-400 text-xs tracking-widest">{lang.toUpperCase()}</span>
                        </button>
                    </div>

                    <div className="flex justify-center mb-4">
                        <Logo />
                    </div>
                    <h1 className="text-3xl font-space font-bold text-white mb-2">
                        {t.adminAccess}
                    </h1>
                    <p className="text-white/50 text-sm font-body">{t.restrictedArea}</p>
                </div>

                <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-md shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className={`block font-body text-white/80 mb-2 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{t.username}</label>
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="admin"
                                className="bg-black/30 border-white/10 text-white focus:border-red-500/50 h-12 font-body placeholder:text-white/20"
                                dir="ltr"
                            />
                        </div>

                        <div>
                            <label className={`block font-body text-white/80 mb-2 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{t.password}</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-10 bg-black/30 border-white/10 text-white focus:border-red-500/50 h-12 font-body placeholder:text-white/20"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-in shake">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span className="font-body">{error}</span>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white text-base font-bold shadow-lg shadow-red-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {t.enterDashboard}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
