import { useState, useEffect } from 'react';
import { Bell, Send, Clock, Trash2, Plus, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Notification {
    _id: string;
    title: string;
    body: string;
    type: 'instant' | 'scheduled';
    scheduledAt?: string;
    sentAt?: string;
    status: 'pending' | 'sent';
    createdAt: string;
}

export default function NotificationsView() {
    const { } = useLanguage();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', body: '', type: 'instant' as 'instant' | 'scheduled', scheduledAt: '' });
    const [sending, setSending] = useState(false);

    const fetchNotifications = () => {
        fetch(`${API_URL}/notifications`)
            .then(r => r.json())
            .then(setNotifications)
            .catch(console.error);
    };

    useEffect(() => { fetchNotifications(); }, []);

    const handleSend = async () => {
        if (!form.title.trim() || !form.body.trim()) return alert('يرجى ملء العنوان والمحتوى');
        if (form.type === 'scheduled' && !form.scheduledAt) return alert('يرجى تحديد موعد الإرسال');

        setSending(true);
        try {
            await fetch(`${API_URL}/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            setForm({ title: '', body: '', type: 'instant', scheduledAt: '' });
            setShowForm(false);
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
        setSending(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('حذف هذا الإشعار؟')) return;
        await fetch(`${API_URL}/notifications/${id}`, { method: 'DELETE' });
        fetchNotifications();
    };

    const formatDate = (d: string) => {
        const date = new Date(d);
        return date.toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="font-space text-2xl md:text-3xl text-white tracking-wide">الإشعارات</h2>
                <Button onClick={() => setShowForm(!showForm)} className="bg-cyan-600 hover:bg-cyan-700 text-white gap-1.5">
                    <Plus className="w-4 h-4" /> إشعار جديد
                </Button>
            </div>

            {/* Create Form */}
            {showForm && (
                <Card className="p-5 bg-white/5 border border-white/10 backdrop-blur-md space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Bell className="w-5 h-5 text-cyan-400" /> إنشاء إشعار
                    </h3>

                    <Input
                        value={form.title}
                        onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="عنوان الإشعار"
                        className="bg-black/30 border-white/10 text-white"
                    />

                    <textarea
                        value={form.body}
                        onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                        placeholder="محتوى الإشعار..."
                        className="w-full h-24 p-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-cyan-500/50 resize-none"
                    />

                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setForm(p => ({ ...p, type: 'instant', scheduledAt: '' }))}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${form.type === 'instant' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-white/50 border border-white/10'}`}
                            >
                                <Send className="w-3 h-3 inline mr-1" /> إرسال فوري
                            </button>
                            <button
                                onClick={() => setForm(p => ({ ...p, type: 'scheduled' }))}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${form.type === 'scheduled' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/5 text-white/50 border border-white/10'}`}
                            >
                                <Clock className="w-3 h-3 inline mr-1" /> جدولة
                            </button>
                        </div>

                        {form.type === 'scheduled' && (
                            <Input
                                type="datetime-local"
                                value={form.scheduledAt}
                                onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))}
                                className="bg-black/30 border-white/10 text-white w-auto"
                            />
                        )}
                    </div>

                    <Button onClick={handleSend} disabled={sending} className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white gap-2">
                        {form.type === 'instant' ? <Send className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                        {sending ? 'جاري...' : form.type === 'instant' ? 'إرسال الآن' : 'جدولة الإشعار'}
                    </Button>
                </Card>
            )}

            {/* Notifications List */}
            <div className="space-y-3">
                {notifications.map(notif => (
                    <Card key={notif._id} className="p-4 bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${notif.status === 'sent'
                                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                        }`}>
                                        {notif.status === 'sent' ? '✅ تم الإرسال' : '⏳ مجدول'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${notif.type === 'instant'
                                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                                        : 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                        }`}>
                                        {notif.type === 'instant' ? '⚡ فوري' : '📅 مجدول'}
                                    </span>
                                </div>
                                <h4 className="text-white font-bold text-sm">{notif.title}</h4>
                                <p className="text-white/50 text-xs mt-1 leading-relaxed">{notif.body}</p>
                                <div className="flex gap-4 mt-2 text-[11px] text-white/30">
                                    <span>أُنشئ: {formatDate(notif.createdAt)}</span>
                                    {notif.sentAt && <span>أُرسل: {formatDate(notif.sentAt)}</span>}
                                    {notif.scheduledAt && notif.status === 'pending' && <span>موعد الإرسال: {formatDate(notif.scheduledAt)}</span>}
                                </div>
                            </div>
                            <button onClick={() => handleDelete(notif._id)} className="text-red-400/50 hover:text-red-400 p-1.5 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </Card>
                ))}

                {notifications.length === 0 && (
                    <Card className="p-8 bg-white/5 border border-white/10 text-center">
                        <Bell className="w-12 h-12 text-white/10 mx-auto mb-3" />
                        <p className="text-white/40 text-sm">لا توجد إشعارات</p>
                    </Card>
                )}
            </div>
        </div>
    );
}
