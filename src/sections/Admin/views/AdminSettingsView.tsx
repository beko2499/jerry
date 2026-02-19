import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminSettingsView() {
    const { t } = useLanguage();
    const { user, refreshUser } = useAuth();
    const [username, setUsername] = useState(user?.username || '');
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setMessage(null);
        if (newPassword && newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'كلمات المرور غير متطابقة' });
            return;
        }
        if (newPassword && !currentPassword) {
            setMessage({ type: 'error', text: 'يرجى إدخال كلمة المرور الحالية' });
            return;
        }

        setSaving(true);
        try {
            const body: any = {};
            if (username !== user?.username) body.username = username;
            if (firstName !== user?.firstName) body.firstName = firstName;
            if (lastName !== user?.lastName) body.lastName = lastName;
            if (newPassword) { body.newPassword = newPassword; body.currentPassword = currentPassword; }
            else if (currentPassword) body.currentPassword = currentPassword;

            if (Object.keys(body).length === 0) {
                setMessage({ type: 'error', text: 'لا توجد تغييرات لحفظها' });
                setSaving(false);
                return;
            }

            const res = await fetch(`${API_URL}/auth/profile/${user?._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) {
                const errMap: Record<string, string> = {
                    wrong_password: 'كلمة المرور الحالية غير صحيحة',
                    username_exists: 'اسم المستخدم مستخدم بالفعل',
                    current_password_required: 'يرجى إدخال كلمة المرور الحالية',
                };
                setMessage({ type: 'error', text: errMap[data.error] || data.error });
            } else {
                setMessage({ type: 'success', text: 'تم حفظ التغييرات بنجاح ✅' });
                setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                await refreshUser();
            }
        } catch { setMessage({ type: 'error', text: 'حدث خطأ في الاتصال' }); }
        setSaving(false);
    };

    return (
        <div className="p-4 md:p-8">
            <h2 className="font-space text-xl md:text-2xl text-white mb-6 tracking-wide">{t.settings || 'الإعدادات'}</h2>
            <Card className="p-5 md:p-8 bg-white/5 border-white/10 max-w-lg backdrop-blur-sm">
                <div className="space-y-5">
                    {/* Username */}
                    <div>
                        <label className="block font-body text-white/80 text-sm mb-1.5">{t.username || 'اسم المستخدم'}</label>
                        <Input value={username} onChange={e => setUsername(e.target.value)} className="bg-white/5 border-white/10 text-white focus:border-red-500/50 h-10" dir="ltr" />
                    </div>

                    {/* First Name */}
                    <div>
                        <label className="block font-body text-white/80 text-sm mb-1.5">{t.firstName || 'الاسم الأول'}</label>
                        <Input value={firstName} onChange={e => setFirstName(e.target.value)} className="bg-white/5 border-white/10 text-white focus:border-red-500/50 h-10" />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block font-body text-white/80 text-sm mb-1.5">{t.lastName || 'اسم العائلة'}</label>
                        <Input value={lastName} onChange={e => setLastName(e.target.value)} className="bg-white/5 border-white/10 text-white focus:border-red-500/50 h-10" />
                    </div>

                    <div className="border-t border-white/10 pt-4">
                        <p className="text-white/50 text-xs mb-3">تغيير كلمة المرور</p>
                    </div>

                    {/* Current Password */}
                    <div>
                        <label className="block font-body text-white/80 text-sm mb-1.5">{t.currentPassword || 'كلمة المرور الحالية'}</label>
                        <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="bg-white/5 border-white/10 text-white focus:border-red-500/50 h-10" placeholder="••••••••" />
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block font-body text-white/80 text-sm mb-1.5">{t.newPassword || 'كلمة المرور الجديدة'}</label>
                        <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-white/5 border-white/10 text-white focus:border-red-500/50 h-10" placeholder="••••••••" />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block font-body text-white/80 text-sm mb-1.5">تأكيد كلمة المرور الجديدة</label>
                        <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-white/5 border-white/10 text-white focus:border-red-500/50 h-10" placeholder="••••••••" />
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {message.text}
                        </div>
                    )}

                    <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white shadow-lg shadow-red-500/20 h-11">
                        {saving ? '...' : (t.saveChanges || 'حفظ التغييرات')}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
