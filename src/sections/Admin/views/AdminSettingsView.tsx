import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { adminFetch } from '@/lib/api';

interface TopReferrer {
    username: string;
    name: string;
    earnings: number;
    referrals: number;
}

interface RefAdminStats {
    totalReferred: number;
    totalPaid: number;
    commissionRate: number;
    topReferrers: TopReferrer[];
}

export default function AdminSettingsView() {
    const { t } = useLanguage();
    const { user, refreshUser } = useAuth();
    const [tab, setTab] = useState<'settings' | 'referral'>('settings');

    // Settings states
    const [username, setUsername] = useState(user?.username || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [saving, setSaving] = useState(false);

    // Referral states
    const [refStats, setRefStats] = useState<RefAdminStats | null>(null);
    const [newRate, setNewRate] = useState('');
    const [rateMsg, setRateMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [savingRate, setSavingRate] = useState(false);

    useEffect(() => {
        if (tab === 'referral') {
            adminFetch(`/referrals/admin-stats`)
                .then(r => r.json())
                .then(data => {
                    if (data.totalReferred !== undefined) {
                        setRefStats(data);
                        setNewRate(String(data.commissionRate));
                    }
                })
                .catch(console.error);
        }
    }, [tab]);

    const handleSave = async () => {
        setMessage(null);
        if (newPassword && newPassword !== confirmPassword) { setMessage({ type: 'error', text: 'كلمات المرور غير متطابقة' }); return; }
        if (newPassword && !currentPassword) { setMessage({ type: 'error', text: 'يرجى إدخال كلمة المرور الحالية' }); return; }
        setSaving(true);
        try {
            const body: any = {};
            if (username !== user?.username) body.username = username;
            if (newPassword) { body.newPassword = newPassword; body.currentPassword = currentPassword; }
            else if (currentPassword) body.currentPassword = currentPassword;
            if (Object.keys(body).length === 0) { setMessage({ type: 'error', text: 'لا توجد تغييرات لحفظها' }); setSaving(false); return; }
            const res = await adminFetch(`/auth/profile/${user?._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const data = await res.json();
            if (!res.ok) {
                const errMap: Record<string, string> = { wrong_password: 'كلمة المرور الحالية غير صحيحة', username_exists: 'اسم المستخدم مستخدم بالفعل', current_password_required: 'يرجى إدخال كلمة المرور الحالية' };
                setMessage({ type: 'error', text: errMap[data.error] || data.error });
            } else {
                setMessage({ type: 'success', text: 'تم حفظ التغييرات بنجاح ✅' });
                setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                await refreshUser();
            }
        } catch { setMessage({ type: 'error', text: 'حدث خطأ في الاتصال' }); }
        setSaving(false);
    };

    const handleSaveRate = async () => {
        const rate = parseFloat(newRate);
        if (isNaN(rate) || rate < 0 || rate > 100) { setRateMsg({ type: 'error', text: 'أدخل نسبة صحيحة بين 0 و 100' }); return; }
        setSavingRate(true);
        setRateMsg(null);
        try {
            const res = await adminFetch(`/referrals/commission`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rate }),
            });
            if (res.ok) {
                setRateMsg({ type: 'success', text: `تم تحديث النسبة إلى ${rate}% ✅` });
                if (refStats) setRefStats({ ...refStats, commissionRate: rate });
            } else {
                setRateMsg({ type: 'error', text: 'فشل التحديث' });
            }
        } catch { setRateMsg({ type: 'error', text: 'خطأ في الاتصال' }); }
        setSavingRate(false);
    };

    return (
        <div className="p-4 md:p-8">
            <h2 className="font-space text-xl md:text-2xl text-white mb-4 tracking-wide">{t.settings || 'الإعدادات'}</h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button onClick={() => setTab('settings')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'settings' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'}`}>
                    الاعدادات
                </button>
                <button onClick={() => setTab('referral')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'referral' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'}`}>
                    نظام الانتساب
                </button>
            </div>

            {/* Settings Tab */}
            {tab === 'settings' && (
                <Card className="p-5 md:p-8 bg-white/5 border-white/10 max-w-lg backdrop-blur-sm">
                    <div className="space-y-5">
                        <div>
                            <label className="block font-body text-white/80 text-sm mb-1.5">{t.username || 'اسم المستخدم'}</label>
                            <Input value={username} onChange={e => setUsername(e.target.value)} className="bg-white/5 border-white/10 text-white focus:border-red-500/50 h-10" dir="ltr" />
                        </div>

                        <div className="border-t border-white/10 pt-4">
                            <p className="text-white/50 text-xs mb-3">تغيير كلمة المرور</p>
                        </div>
                        <div>
                            <label className="block font-body text-white/80 text-sm mb-1.5">{t.currentPassword || 'كلمة المرور الحالية'}</label>
                            <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="bg-white/5 border-white/10 text-white focus:border-red-500/50 h-10" placeholder="••••••••" />
                        </div>
                        <div>
                            <label className="block font-body text-white/80 text-sm mb-1.5">{t.newPassword || 'كلمة المرور الجديدة'}</label>
                            <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-white/5 border-white/10 text-white focus:border-red-500/50 h-10" placeholder="••••••••" />
                        </div>
                        <div>
                            <label className="block font-body text-white/80 text-sm mb-1.5">تأكيد كلمة المرور الجديدة</label>
                            <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-white/5 border-white/10 text-white focus:border-red-500/50 h-10" placeholder="••••••••" />
                        </div>
                        {message && <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{message.text}</div>}
                        <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white shadow-lg shadow-red-500/20 h-11">
                            {saving ? '...' : (t.saveChanges || 'حفظ التغييرات')}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Referral Tab */}
            {tab === 'referral' && (
                <div className="max-w-2xl space-y-4">
                    {/* Commission Rate Control */}
                    <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-sm">
                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">⚙️ التحكم بنسبة العمولة</h3>
                        <div className="flex items-end gap-3">
                            <div className="flex-1">
                                <label className="block text-white/50 text-xs mb-1.5">نسبة العمولة (%)</label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={newRate}
                                    onChange={e => setNewRate(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white focus:border-red-500/50 h-10"
                                    dir="ltr"
                                />
                            </div>
                            <Button onClick={handleSaveRate} disabled={savingRate} className="bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white h-10 px-6">
                                {savingRate ? '...' : 'حفظ'}
                            </Button>
                        </div>
                        {rateMsg && <div className={`mt-3 p-2 rounded-lg text-xs ${rateMsg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{rateMsg.text}</div>}
                        <p className="text-white/30 text-xs mt-2">النسبة الحالية: <span className="text-red-400 font-bold">{refStats?.commissionRate ?? 5}%</span> — تُخصم من كل عملية شحن للمستخدم المُحال وتُضاف لرصيد المُحيل</p>
                    </Card>

                    {/* Statistics Overview */}
                    <div className="grid grid-cols-3 gap-3">
                        <Card className="p-4 bg-white/5 border-white/10 text-center">
                            <p className="text-white/40 text-xs mb-1">إجمالي المُحالين</p>
                            <p className="text-white font-bold text-2xl">{refStats?.totalReferred ?? 0}</p>
                        </Card>
                        <Card className="p-4 bg-white/5 border-white/10 text-center">
                            <p className="text-white/40 text-xs mb-1">إجمالي العمولات المدفوعة</p>
                            <p className="text-red-400 font-bold text-2xl" dir="ltr">${refStats?.totalPaid?.toFixed(2) ?? '0.00'}</p>
                        </Card>
                        <Card className="p-4 bg-white/5 border-white/10 text-center">
                            <p className="text-white/40 text-xs mb-1">نسبة العمولة</p>
                            <p className="text-purple-400 font-bold text-2xl">{refStats?.commissionRate ?? 5}%</p>
                        </Card>
                    </div>

                    {/* Top Referrers Table */}
                    <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-sm">
                        <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">🏆 أفضل المُحيلين</h3>
                        {refStats && refStats.topReferrers.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-white/40 text-xs border-b border-white/10">
                                            <th className="text-right py-2 px-2">#</th>
                                            <th className="text-right py-2 px-2">المستخدم</th>
                                            <th className="text-right py-2 px-2">الاسم</th>
                                            <th className="text-center py-2 px-2">المُحالين</th>
                                            <th className="text-left py-2 px-2">الأرباح</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {refStats.topReferrers.map((r, i) => (
                                            <tr key={r.username} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="py-2.5 px-2 text-white/40">{i + 1}</td>
                                                <td className="py-2.5 px-2 text-white font-mono text-xs">@{r.username}</td>
                                                <td className="py-2.5 px-2 text-white/70">{r.name}</td>
                                                <td className="py-2.5 px-2 text-center text-cyan-400 font-bold">{r.referrals}</td>
                                                <td className="py-2.5 px-2 text-left text-green-400 font-bold" dir="ltr">${r.earnings.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-white/30 text-sm text-center py-6">لا توجد إحالات بعد</p>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}
