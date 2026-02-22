import { useState, useRef } from 'react';
import { API_URL } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Starfield from '@/components/Starfield';
import { User, Lock, Mail, Phone, UserPlus, LogIn, Eye, EyeOff, AlertCircle, CheckCircle2, Globe, ArrowRight, RefreshCw, KeyRound } from 'lucide-react';
import { Logo } from '@/components/Logo';

type Step = 'login' | 'register' | 'verify' | 'success' | 'forgot-password' | 'reset-code' | 'new-password';

export default function AuthPage() {
    const [step, setStep] = useState<Step>('login');
    const { login, register, verifyEmail, resendCode } = useAuth();
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

    // Verification state
    const [verifyUserId, setVerifyUserId] = useState('');
    const [verifyUserEmail, setVerifyUserEmail] = useState('');
    const [verifyCode, setVerifyCode] = useState(['', '', '', '', '', '']);
    const [verifyError, setVerifyError] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Forgot password state
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotError, setForgotError] = useState('');
    const [forgotUserId, setForgotUserId] = useState('');
    const [forgotUserEmail, setForgotUserEmail] = useState('');
    const [resetCode, setResetCode] = useState(['', '', '', '', '', '']);
    const [resetCodeError, setResetCodeError] = useState('');
    const [resetNewPass, setResetNewPass] = useState('');
    const [resetConfirmPass, setResetConfirmPass] = useState('');
    const [showResetPass, setShowResetPass] = useState(false);
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const resetCodeRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Handle code input
    const handleCodeChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newCode = [...verifyCode];
        newCode[index] = value.slice(-1);
        setVerifyCode(newCode);
        if (value && index < 5) {
            codeInputRefs.current[index + 1]?.focus();
        }
    };

    const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !verifyCode[index] && index > 0) {
            codeInputRefs.current[index - 1]?.focus();
        }
    };

    const handleCodePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newCode = [...verifyCode];
        for (let i = 0; i < 6; i++) {
            newCode[i] = pasted[i] || '';
        }
        setVerifyCode(newCode);
        const nextEmpty = newCode.findIndex(c => !c);
        codeInputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        if (!loginUsername || !loginPassword) {
            setLoginError(t.fillAllFields);
            return;
        }
        setIsLoading(true);
        const result = await login(loginUsername, loginPassword);
        setIsLoading(false);
        if (!result.success) {
            if (result.error === 'not_verified' && result.userId) {
                setVerifyUserId(result.userId);
                setVerifyUserEmail(result.email || '');
                setStep('verify');
            } else {
                setLoginError(t.wrongCredentials);
            }
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
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
        setIsLoading(true);
        const result = await register({
            username: regUsername,
            firstName: regFirstName,
            lastName: regLastName,
            phone: regPhone,
            email: regEmail,
            password: regPassword,
            ref: new URLSearchParams(window.location.search).get('ref') || undefined,
        });
        setIsLoading(false);
        if (result.success) {
            if (result.skipVerification) {
                setStep('success');
            } else {
                setVerifyUserId(result.userId || '');
                setVerifyUserEmail(result.email || regEmail);
                setStep('verify');
            }
        } else {
            if (result.error === 'username_exists') {
                setRegError(t.usernameExists);
            } else if (result.error === 'email_exists') {
                setRegError(t.emailExists || 'هذا البريد الإلكتروني مستخدم بالفعل');
            } else {
                setRegError(result.error || t.usernameExists);
            }
        }
    };

    const handleVerify = async () => {
        const code = verifyCode.join('');
        if (code.length !== 6) {
            setVerifyError(t.enterCode || 'أدخل الكود المكون من 6 أرقام');
            return;
        }
        setIsLoading(true);
        setVerifyError('');
        const result = await verifyEmail(verifyUserId, code);
        setIsLoading(false);
        if (result.success) {
            setStep('success');
        } else {
            if (result.error === 'invalid_code') {
                setVerifyError(t.invalidCode || 'الكود غير صحيح');
            } else if (result.error === 'code_expired') {
                setVerifyError(t.codeExpired || 'انتهت صلاحية الكود، أعد الإرسال');
            } else {
                setVerifyError(t.invalidCode || 'خطأ في التحقق');
            }
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        await resendCode(verifyUserId);
        setIsResending(false);
        setVerifyCode(['', '', '', '', '', '']);
        setVerifyError('');
    };

    const goToLogin = () => {
        setStep('login');
        setVerifyCode(['', '', '', '', '', '']);
        setVerifyError('');
        setForgotError('');
        setResetCodeError('');
        setResetError('');
        setResetSuccess(false);
    };

    // Forgot password handlers
    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotError('');
        if (!forgotEmail) { setForgotError(t.fillAllFields || 'يرجى إدخال البريد الإلكتروني'); return; }
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail }),
            });
            const data = await res.json();
            if (res.ok) {
                setForgotUserId(data.userId);
                setForgotUserEmail(data.email);
                setStep('reset-code');
            } else {
                const errMap: Record<string, string> = {
                    user_not_found: 'لا يوجد حساب مرتبط بهذا البريد الإلكتروني',
                    email_failed: 'فشل في إرسال البريد الإلكتروني، حاول لاحقاً',
                };
                setForgotError(errMap[data.error] || 'حدث خطأ');
            }
        } catch { setForgotError('حدث خطأ في الاتصال'); }
        setIsLoading(false);
    };

    const handleResetCodeChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newCode = [...resetCode];
        newCode[index] = value.slice(-1);
        setResetCode(newCode);
        if (value && index < 5) resetCodeRefs.current[index + 1]?.focus();
    };

    const handleResetCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !resetCode[index] && index > 0) resetCodeRefs.current[index - 1]?.focus();
    };

    const handleResetCodePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newCode = [...resetCode];
        for (let i = 0; i < 6; i++) newCode[i] = pasted[i] || '';
        setResetCode(newCode);
        const nextEmpty = newCode.findIndex(c => !c);
        resetCodeRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    };

    const handleVerifyResetCode = async () => {
        setResetCodeError('');
        const code = resetCode.join('');
        if (code.length !== 6) { setResetCodeError('يرجى إدخال الكود المكون من 6 أرقام'); return; }
        // Just move to new password step — code will be verified on server when setting password
        setStep('new-password');
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetError('');
        if (!resetNewPass || !resetConfirmPass) { setResetError('يرجى ملء جميع الحقول'); return; }
        if (resetNewPass.length < 4) { setResetError('كلمة المرور يجب أن تكون 4 أحرف على الأقل'); return; }
        if (resetNewPass !== resetConfirmPass) { setResetError('كلمات المرور غير متطابقة'); return; }
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: forgotUserId, code: resetCode.join(''), newPassword: resetNewPass }),
            });
            const data = await res.json();
            if (res.ok) {
                setResetSuccess(true);
            } else {
                const errMap: Record<string, string> = {
                    invalid_code: 'الكود غير صحيح',
                    code_expired: 'انتهت صلاحية الكود، أعد المحاولة',
                    password_too_short: 'كلمة المرور قصيرة جداً',
                };
                setResetError(errMap[data.error] || 'حدث خطأ');
            }
        } catch { setResetError('حدث خطأ في الاتصال'); }
        setIsLoading(false);
    };

    const handleResendResetCode = async () => {
        setIsResending(true);
        try {
            await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotUserEmail }),
            });
            setResetCode(['', '', '', '', '', '']);
            setResetCodeError('');
        } catch { /* ignore */ }
        setIsResending(false);
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

                {/* ===== STEP: LOGIN / REGISTER ===== */}
                {(step === 'login' || step === 'register') && (
                    <>
                        {/* Tab Switcher */}
                        <div className="flex bg-white/5 rounded-2xl p-1 mb-6 border border-white/10 backdrop-blur-sm">
                            <button
                                onClick={() => { setStep('login'); setRegError(''); }}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold font-body transition-all duration-300 flex items-center justify-center gap-2 ${step === 'login'
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                                    : 'text-white/50 hover:text-white/80'
                                    }`}
                            >
                                <LogIn className="w-4 h-4" />
                                {t.loginTab}
                            </button>
                            <button
                                onClick={() => { setStep('register'); setLoginError(''); }}
                                className={`flex-1 py-3 rounded-xl text-sm font-bold font-body transition-all duration-300 flex items-center justify-center gap-2 ${step === 'register'
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                                    : 'text-white/50 hover:text-white/80'
                                    }`}
                            >
                                <UserPlus className="w-4 h-4" />
                                {t.registerTab}
                            </button>
                        </div>

                        {/* Login Form */}
                        {step === 'login' && (
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
                                        disabled={isLoading}
                                        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-base font-bold shadow-lg shadow-cyan-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                                            <>
                                                <LogIn className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                                {t.loginBtn}
                                            </>
                                        )}
                                    </Button>
                                    {/* Forgot Password Link */}
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => { setStep('forgot-password' as Step); setForgotError(''); setForgotEmail(''); }}
                                            className="text-cyan-400/70 hover:text-cyan-400 text-sm font-body transition-colors"
                                        >
                                            {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                                        </button>
                                    </div>
                                </form>
                            </Card>
                        )}

                        {/* Register Form */}
                        {step === 'register' && (
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

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-base font-bold shadow-lg shadow-purple-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                                            <>
                                                <UserPlus className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                                {t.registerBtn}
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Card>
                        )}
                    </>
                )}

                {/* ===== STEP: VERIFY EMAIL ===== */}
                {step === 'verify' && (
                    <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-md animate-in fade-in zoom-in-95 duration-500">
                        <div className="text-center space-y-6">
                            {/* Email Icon */}
                            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                                <Mail className="w-10 h-10 text-cyan-400" />
                            </div>

                            <div>
                                <h3 className="text-white text-xl font-bold font-space mb-2">
                                    {t.verifyEmail || 'تأكيد البريد الإلكتروني'}
                                </h3>
                                <p className="text-white/50 text-sm font-body">
                                    {t.codeSentTo || 'تم إرسال كود التأكيد إلى'}
                                </p>
                                <p className="text-cyan-400 font-mono text-sm mt-1">{verifyUserEmail}</p>
                            </div>

                            {/* 6-digit Code Input */}
                            <div className="flex justify-center gap-2" dir="ltr" onPaste={handleCodePaste}>
                                {verifyCode.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={el => { codeInputRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handleCodeChange(index, e.target.value)}
                                        onKeyDown={e => handleCodeKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-2xl font-bold font-mono bg-black/30 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all"
                                    />
                                ))}
                            </div>

                            {verifyError && (
                                <div className="flex items-center justify-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span className="font-body">{verifyError}</span>
                                </div>
                            )}

                            <Button
                                onClick={handleVerify}
                                disabled={isLoading}
                                className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-base font-bold shadow-lg shadow-cyan-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 mr-2" />
                                        {t.verifyBtn || 'تأكيد'}
                                    </>
                                )}
                            </Button>

                            <div className="flex items-center justify-center gap-1 text-sm">
                                <span className="text-white/40 font-body">{t.didntReceive || 'لم يصلك الكود؟'}</span>
                                <button
                                    onClick={handleResend}
                                    disabled={isResending}
                                    className="text-cyan-400 hover:text-cyan-300 font-bold font-body transition-colors disabled:opacity-50"
                                >
                                    {isResending ? (t.sending || 'جاري الإرسال...') : (t.resendCode || 'إعادة الإرسال')}
                                </button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* ===== STEP: SUCCESS ===== */}
                {step === 'success' && (
                    <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-md animate-in fade-in zoom-in-95 duration-500">
                        <div className="text-center space-y-6">
                            {/* Success Animation */}
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-2 border-green-500/40 flex items-center justify-center animate-in zoom-in-50 duration-700">
                                <CheckCircle2 className="w-12 h-12 text-green-400" />
                            </div>

                            <div>
                                <h3 className="text-white text-2xl font-bold font-space mb-3">
                                    {t.accountVerified || 'تم التأكيد بنجاح! 🎉'}
                                </h3>
                                <p className="text-white/60 text-base font-body leading-relaxed">
                                    {t.thankYouMessage || 'شكراً لانضمامك إلى متجر جيري! حسابك جاهز الآن.'}
                                </p>
                            </div>

                            {/* Space alien decoration */}
                            <div className="text-6xl">👽</div>

                            <Button
                                onClick={goToLogin}
                                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-base font-bold shadow-lg shadow-green-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <ArrowRight className="w-5 h-5 mr-2" />
                                {t.continueToLogin || 'متابعة لتسجيل الدخول'}
                            </Button>
                        </div>
                    </Card>
                )}

                {/* ===== STEP: FORGOT PASSWORD ===== */}
                {step === 'forgot-password' && (
                    <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-500/20 to-red-600/20 border-2 border-orange-500/40 flex items-center justify-center mb-4">
                                <KeyRound className="w-8 h-8 text-orange-400" />
                            </div>
                            <h3 className="text-white text-xl font-bold font-space mb-2">
                                {lang === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                            </h3>
                            <p className="text-white/50 text-sm font-body">
                                {lang === 'ar' ? 'أدخل بريدك الإلكتروني وسنرسل لك كود لإعادة تعيين كلمة المرور' : 'Enter your email and we\'ll send you a reset code'}
                            </p>
                        </div>

                        <form onSubmit={handleForgotPassword} className="space-y-5">
                            <div>
                                <label className={`block font-body text-white/70 mb-2 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {t.email || 'البريد الإلكتروني'}
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <Input
                                        type="email"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        placeholder="example@email.com"
                                        className="pl-10 bg-black/30 border-white/10 text-white focus:border-orange-500/50 h-12 font-body placeholder:text-white/20"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {forgotError && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span className="font-body">{forgotError}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-base font-bold shadow-lg shadow-orange-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        <Mail className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                        {lang === 'ar' ? 'إرسال كود الاسترداد' : 'Send Reset Code'}
                                    </>
                                )}
                            </Button>

                            <div className="text-center">
                                <button type="button" onClick={goToLogin} className="text-cyan-400/70 hover:text-cyan-400 text-sm font-body transition-colors">
                                    {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                                </button>
                            </div>
                        </form>
                    </Card>
                )}

                {/* ===== STEP: RESET CODE ===== */}
                {step === 'reset-code' && (
                    <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-500/20 to-red-600/20 border-2 border-orange-500/40 flex items-center justify-center">
                                <Mail className="w-8 h-8 text-orange-400" />
                            </div>

                            <div>
                                <h3 className="text-white text-xl font-bold font-space mb-2">
                                    {lang === 'ar' ? 'تحقق من بريدك' : 'Check Your Email'}
                                </h3>
                                <p className="text-white/50 text-sm font-body">
                                    {lang === 'ar' ? `أرسلنا كود إلى ${forgotUserEmail}` : `We sent a code to ${forgotUserEmail}`}
                                </p>
                            </div>

                            {/* Code Inputs */}
                            <div className="flex justify-center gap-3" dir="ltr">
                                {resetCode.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => { resetCodeRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleResetCodeChange(i, e.target.value)}
                                        onKeyDown={(e) => handleResetCodeKeyDown(i, e)}
                                        onPaste={i === 0 ? handleResetCodePaste : undefined}
                                        className="w-12 h-14 text-center text-2xl font-bold bg-black/40 border-2 border-white/10 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-all duration-200"
                                    />
                                ))}
                            </div>

                            {resetCodeError && (
                                <div className="flex items-center justify-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span className="font-body">{resetCodeError}</span>
                                </div>
                            )}

                            <Button
                                onClick={handleVerifyResetCode}
                                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-base font-bold shadow-lg shadow-orange-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                {lang === 'ar' ? 'تأكيد الكود' : 'Verify Code'}
                            </Button>

                            <div className="flex items-center justify-center gap-1 text-sm">
                                <span className="text-white/40 font-body">{lang === 'ar' ? 'لم يصلك الكود؟' : "Didn't receive?"}</span>
                                <button
                                    onClick={handleResendResetCode}
                                    disabled={isResending}
                                    className="text-orange-400 hover:text-orange-300 font-bold font-body transition-colors disabled:opacity-50"
                                >
                                    {isResending ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...') : (lang === 'ar' ? 'إعادة الإرسال' : 'Resend')}
                                </button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* ===== STEP: NEW PASSWORD ===== */}
                {step === 'new-password' && !resetSuccess && (
                    <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-2 border-green-500/40 flex items-center justify-center mb-4">
                                <Lock className="w-8 h-8 text-green-400" />
                            </div>
                            <h3 className="text-white text-xl font-bold font-space mb-2">
                                {lang === 'ar' ? 'تعيين كلمة مرور جديدة' : 'Set New Password'}
                            </h3>
                        </div>

                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div>
                                <label className={`block font-body text-white/70 mb-2 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {lang === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <Input
                                        type={showResetPass ? 'text' : 'password'}
                                        value={resetNewPass}
                                        onChange={(e) => setResetNewPass(e.target.value)}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10 bg-black/30 border-white/10 text-white focus:border-green-500/50 h-12 font-body placeholder:text-white/20"
                                        dir="ltr"
                                    />
                                    <button type="button" onClick={() => setShowResetPass(!showResetPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                                        {showResetPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className={`block font-body text-white/70 mb-2 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    <Input
                                        type={showResetPass ? 'text' : 'password'}
                                        value={resetConfirmPass}
                                        onChange={(e) => setResetConfirmPass(e.target.value)}
                                        placeholder="••••••••"
                                        className="pl-10 bg-black/30 border-white/10 text-white focus:border-green-500/50 h-12 font-body placeholder:text-white/20"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {resetError && (
                                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span className="font-body">{resetError}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-base font-bold shadow-lg shadow-green-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            >
                                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        <CheckCircle2 className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                                        {lang === 'ar' ? 'تعيين كلمة المرور' : 'Reset Password'}
                                    </>
                                )}
                            </Button>
                        </form>
                    </Card>
                )}

                {/* ===== STEP: RESET SUCCESS ===== */}
                {step === 'new-password' && resetSuccess && (
                    <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-md animate-in fade-in zoom-in-95 duration-500">
                        <div className="text-center space-y-6">
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-2 border-green-500/40 flex items-center justify-center animate-in zoom-in-50 duration-700">
                                <CheckCircle2 className="w-12 h-12 text-green-400" />
                            </div>

                            <div>
                                <h3 className="text-white text-2xl font-bold font-space mb-3">
                                    {lang === 'ar' ? 'تم تغيير كلمة المرور بنجاح! 🎉' : 'Password Reset Successfully! 🎉'}
                                </h3>
                                <p className="text-white/60 text-base font-body leading-relaxed">
                                    {lang === 'ar' ? 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.' : 'You can now login with your new password.'}
                                </p>
                            </div>

                            <div className="text-6xl">🔐</div>

                            <Button
                                onClick={goToLogin}
                                className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-base font-bold shadow-lg shadow-green-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <ArrowRight className="w-5 h-5 mr-2" />
                                {lang === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
