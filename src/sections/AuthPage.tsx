import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Starfield from '@/components/Starfield';
import { User, Lock, Mail, Phone, UserPlus, LogIn, Eye, EyeOff, AlertCircle, CheckCircle2, Globe } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function AuthPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const { login, register } = useAuth();
    const { lang, t, isRTL, toggleLanguage } = useLanguage();

    // Login state
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [loginError, setLoginError] = useState('');

    // Register state
    const [regUsername, setRegUsername] = useState('');
    const [regFirstName, setRegFirstName] = useState('');
    const [regLastName, setRegLastName] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');
    const [showRegPassword, setShowRegPassword] = useState(false);
    const [regError, setRegError] = useState('');
    const [regSuccess, setRegSuccess] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        if (!loginUsername || !loginPassword) {
            setLoginError(t.fillAllFields);
            return;
        }
        const success = login(loginUsername, loginPassword);
        if (!success) {
            setLoginError(t.wrongCredentials);
        }
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setRegError('');
        if (!regUsername || !regFirstName || !regLastName || !regPhone || !regEmail || !regPassword || !regConfirmPassword) {
            setRegError(t.fillAllFields);
            return;
        }
        if (regPassword !== regConfirmPassword) {
            setRegError(t.passwordMismatch);
            return;
        }
        if (regPassword.length < 4) {
            setRegError(t.passwordTooShort);
            return;
        }
        const success = register({
            username: regUsername,
            firstName: regFirstName,
            lastName: regLastName,
            phone: regPhone,
            email: regEmail,
            password: regPassword,
        });
        if (!success) {
            setRegError(t.usernameExists);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a1a] relative flex items-center justify-center p-4 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0 opacity-40">
                <Starfield starCount={800} speed={0.02} />
            </div>

            {/* Decorative Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Logo + Language Switcher */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <button
                            onClick={toggleLanguage}
                            className="group relative overflow-hidden flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-cyan-500/30 rounded-full transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500/10 active:scale-95"
                        >
                            <Globe className="w-4 h-4 text-cyan-400" />
                            <span className="font-space font-bold text-cyan-400 text-xs tracking-widest">{lang.toUpperCase()}</span>
                        </button>
                    </div>
                    <div className="flex justify-center mb-6 scale-110">
                        <Logo />
                    </div>
                    <p className="text-white/50 text-sm font-body">{t.authTitle}</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-white/5 rounded-2xl p-1 mb-6 border border-white/10 backdrop-blur-sm">
                    <button
                        onClick={() => { setMode('login'); setRegError(''); setRegSuccess(false); }}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold font-body transition-all duration-300 flex items-center justify-center gap-2 ${mode === 'login'
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                            : 'text-white/50 hover:text-white/80'
                            }`}
                    >
                        <LogIn className="w-4 h-4" />
                        {t.loginTab}
                    </button>
                    <button
                        onClick={() => { setMode('register'); setLoginError(''); }}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold font-body transition-all duration-300 flex items-center justify-center gap-2 ${mode === 'register'
                            ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                            : 'text-white/50 hover:text-white/80'
                            }`}
                    >
                        <UserPlus className="w-4 h-4" />
                        {t.registerTab}
                    </button>
                </div>

                {/* Login Form */}
                {mode === 'login' && (
                    <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-md animate-in fade-in slide-in-from-left-4 duration-500">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className={`block font-body text-white/80 mb-2 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{t.username}</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <Input
                                        value={loginUsername}
                                        onChange={(e) => setLoginUsername(e.target.value)}
                                        placeholder="XXXX1"
                                        className="pl-10 bg-black/30 border-white/10 text-white focus:border-cyan-500/50 h-12 font-body placeholder:text-white/20"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block font-body text-white/80 mb-2 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{t.password}</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <Input
                                        type={showLoginPassword ? 'text' : 'password'}
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        placeholder="••••••"
                                        className="pl-10 pr-10 bg-black/30 border-white/10 text-white focus:border-cyan-500/50 h-12 font-body placeholder:text-white/20"
                                        dir="ltr"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                    >
                                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {loginError && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span className="font-body">{loginError}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-base font-bold shadow-lg shadow-cyan-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <LogIn className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                {t.loginBtn}
                            </Button>

                            <p className="text-center text-white/40 text-xs font-body mt-4">
                                {t.testAccount}: <span className="text-cyan-400 font-mono">jerry</span> / <span className="text-cyan-400 font-mono">1234</span>
                            </p>
                        </form>
                    </Card>
                )}

                {/* Register Form */}
                {mode === 'register' && (
                    <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-md animate-in fade-in slide-in-from-right-4 duration-500">
                        <form onSubmit={handleRegister} className="space-y-4">

                            {/* Username */}
                            <div>
                                <label className={`block font-body text-white/80 mb-1.5 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{t.username}</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <Input
                                        value={regUsername}
                                        onChange={(e) => setRegUsername(e.target.value)}
                                        placeholder="XXXX1"
                                        className="pl-10 bg-black/30 border-white/10 text-white focus:border-purple-500/50 h-11 font-body placeholder:text-white/20"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* First & Last Name */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={`block font-body text-white/80 mb-1.5 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{t.firstName}</label>
                                    <Input
                                        value={regFirstName}
                                        onChange={(e) => setRegFirstName(e.target.value)}
                                        placeholder={isRTL ? 'أحمد' : 'John'}
                                        className="bg-black/30 border-white/10 text-white focus:border-purple-500/50 h-11 font-body placeholder:text-white/20"
                                        dir={isRTL ? 'rtl' : 'ltr'}
                                    />
                                </div>
                                <div>
                                    <label className={`block font-body text-white/80 mb-1.5 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{t.lastName}</label>
                                    <Input
                                        value={regLastName}
                                        onChange={(e) => setRegLastName(e.target.value)}
                                        placeholder={isRTL ? 'عبدلله' : 'Doe'}
                                        className="bg-black/30 border-white/10 text-white focus:border-purple-500/50 h-11 font-body placeholder:text-white/20"
                                        dir={isRTL ? 'rtl' : 'ltr'}
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className={`block font-body text-white/80 mb-1.5 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{t.phone}</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <Input
                                        value={regPhone}
                                        onChange={(e) => setRegPhone(e.target.value)}
                                        placeholder="07XXXXXXXXX"
                                        className="pl-10 bg-black/30 border-white/10 text-white focus:border-purple-500/50 h-11 font-body placeholder:text-white/20"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className={`block font-body text-white/80 mb-1.5 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{t.email}</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <Input
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                        placeholder="XXXX@gmail.com"
                                        className="pl-10 bg-black/30 border-white/10 text-white focus:border-purple-500/50 h-11 font-body placeholder:text-white/20"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className={`block font-body text-white/80 mb-1.5 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{t.password}</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <Input
                                        type={showRegPassword ? 'text' : 'password'}
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                        placeholder="1234"
                                        className="pl-10 pr-10 bg-black/30 border-white/10 text-white focus:border-purple-500/50 h-11 font-body placeholder:text-white/20"
                                        dir="ltr"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowRegPassword(!showRegPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                    >
                                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className={`block font-body text-white/80 mb-1.5 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>{t.confirmPassword}</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <Input
                                        type={showRegPassword ? 'text' : 'password'}
                                        value={regConfirmPassword}
                                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                                        placeholder="1234"
                                        className="pl-10 bg-black/30 border-white/10 text-white focus:border-purple-500/50 h-11 font-body placeholder:text-white/20"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {regError && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span className="font-body">{regError}</span>
                                </div>
                            )}

                            {regSuccess && (
                                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    <span className="font-body">{t.accountCreated}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-base font-bold shadow-lg shadow-purple-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <UserPlus className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                {t.registerBtn}
                            </Button>
                        </form>
                    </Card>
                )}
            </div>
        </div>
    );
}
