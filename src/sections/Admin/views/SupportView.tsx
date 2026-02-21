import { useState, useEffect } from 'react';
import { MessageCircle, Send, Save, Phone, Mail, Eye, EyeOff, Info, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';

import { adminFetch } from '@/lib/api';

export default function SupportView() {
    const { t } = useLanguage();

    const [supportConfig, setSupportConfig] = useState({
        whatsapp: '',
        telegram: '',
        email: '',
        supportMessage: ''
    });

    const [emailConfig, setEmailConfig] = useState({
        gmailUser: '',
        gmailPass: '',
        senderName: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [emailVerificationEnabled, setEmailVerificationEnabled] = useState(true);

    useEffect(() => {
        adminFetch(`/settings/support`)
            .then(r => r.json())
            .then(data => { if (data) setSupportConfig(data); })
            .catch(console.error);

        adminFetch(`/settings/email`)
            .then(r => r.json())
            .then(data => { if (data) setEmailConfig(data); })
            .catch(console.error);

        adminFetch(`/settings/emailVerification`)
            .then(r => r.json())
            .then(data => { if (data !== null) setEmailVerificationEnabled(data); })
            .catch(console.error);
    }, []);

    const handleChange = (key: string, value: string) => {
        setSupportConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleEmailChange = (key: string, value: string) => {
        setEmailConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        await adminFetch(`/settings/support`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: supportConfig })
        });
        alert('Support settings saved!');
    };

    const handleSaveEmail = async () => {
        await adminFetch(`/settings/email`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: emailConfig })
        });
        alert('Email settings saved!');
    };

    const toggleEmailVerification = async (enabled: boolean) => {
        setEmailVerificationEnabled(enabled);
        await adminFetch(`/settings/emailVerification`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: enabled })
        });
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="font-space text-2xl md:text-3xl text-white tracking-wide">{t.supportSettings}</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Contact Channels */}
                <Card className="p-6 bg-white/5 border border-white/10 backdrop-blur-md space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Phone className="w-5 h-5 text-cyan-400" /> {t.contactChannels}
                        </h3>
                        <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
                            <Save className="w-3.5 h-3.5" /> {t.saveChanges}
                        </Button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-white/60 mb-1.5 block">{t.whatsappNumber}</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <MessageCircle className="w-4 h-4 text-green-400" />
                                </div>
                                <Input value={supportConfig.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} className="pl-14 bg-black/30 border-white/10 text-white" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-white/60 mb-1.5 block">{t.telegramUsername}</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Send className="w-4 h-4 text-blue-400" />
                                </div>
                                <Input value={supportConfig.telegram} onChange={e => handleChange('telegram', e.target.value)} className="pl-14 bg-black/30 border-white/10 text-white" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-white/60 mb-1.5 block">{t.supportEmail}</label>
                            <Input value={supportConfig.email} onChange={e => handleChange('email', e.target.value)} className="bg-black/30 border-white/10 text-white" />
                        </div>
                        <div>
                            <label className="text-sm text-white/60 mb-1.5 block">{t.supportIntroMessage}</label>
                            <textarea
                                value={supportConfig.supportMessage}
                                onChange={e => handleChange('supportMessage', e.target.value)}
                                className="w-full h-24 p-4 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-500/50 resize-none font-body"
                            />
                        </div>
                    </div>
                </Card>

                {/* Email SMTP Config */}
                <Card className="p-6 bg-white/5 border border-white/10 backdrop-blur-md space-y-6 lg:col-span-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Mail className="w-5 h-5 text-cyan-400" /> إعدادات البريد الإلكتروني (SMTP)
                        </h3>
                        <Button onClick={handleSaveEmail} size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
                            <Save className="w-3.5 h-3.5" /> {t.saveChanges}
                        </Button>
                    </div>

                    {/* Verification Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className={`w-5 h-5 ${emailVerificationEnabled ? 'text-green-400' : 'text-red-400'}`} />
                            <div>
                                <p className="text-white text-sm font-bold">التحقق من البريد عند التسجيل</p>
                                <p className="text-white/40 text-xs">{emailVerificationEnabled ? 'مفعّل — يتم إرسال كود تحقق للبريد' : 'معطّل — التسجيل بدون تحقق'}</p>
                            </div>
                        </div>
                        <Switch
                            checked={emailVerificationEnabled}
                            onCheckedChange={toggleEmailVerification}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm text-white/60 mb-1.5 block">بريد Gmail</label>
                            <Input
                                value={emailConfig.gmailUser}
                                onChange={e => handleEmailChange('gmailUser', e.target.value)}
                                placeholder="example@gmail.com"
                                className="bg-black/30 border-white/10 text-white"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-white/60 mb-1.5 block">كلمة مرور التطبيق (App Password)</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={emailConfig.gmailPass}
                                    onChange={e => handleEmailChange('gmailPass', e.target.value)}
                                    placeholder="xxxx xxxx xxxx xxxx"
                                    className="bg-black/30 border-white/10 text-white pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-white/60 mb-1.5 block">اسم المرسل</label>
                            <Input
                                value={emailConfig.senderName}
                                onChange={e => handleEmailChange('senderName', e.target.value)}
                                placeholder="Jerry Store"
                                className="bg-black/30 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    {/* Guide Toggle */}
                    <button
                        onClick={() => setShowGuide(!showGuide)}
                        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                    >
                        <Info className="w-4 h-4" />
                        {showGuide ? 'إخفاء الشرح' : 'كيف أحصل على كلمة مرور التطبيق؟'}
                    </button>

                    {showGuide && (
                        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-3 text-sm text-white/70">
                            <p className="font-bold text-white">خطوات الحصول على App Password من Google:</p>
                            <ol className="list-decimal list-inside space-y-2 pr-2">
                                <li>ادخل إلى حسابك في Google → <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">إعدادات الأمان</a></li>
                                <li>فعّل <strong className="text-white">التحقق بخطوتين</strong> (2-Step Verification) إذا لم يكن مفعّلاً</li>
                                <li>ابحث عن <strong className="text-white">App Passwords</strong> أو <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">اضغط هنا مباشرة</a></li>
                                <li>اختر اسم التطبيق (مثلاً: Jerry Store) واضغط <strong className="text-white">Create</strong></li>
                                <li>سيظهر لك كود مكون من <strong className="text-white">16 حرف</strong> — انسخه والصقه في خانة "كلمة مرور التطبيق" أعلاه</li>
                            </ol>
                            <p className="text-yellow-400/80 text-xs">⚠️ هذا الكود يختلف عن كلمة مرور حسابك العادية. يُستخدم فقط لإرسال الإيميلات من التطبيق.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
