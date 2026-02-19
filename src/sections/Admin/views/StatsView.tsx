import { useState, useEffect } from 'react';
import { Users, ShoppingCart, DollarSign, Activity, ArrowLeft, Search, Mail, Phone, Calendar, Hash, CheckCircle, Clock, XCircle, CreditCard, Wallet, X, Edit3, Trash2, Ban, ShieldCheck, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type DetailView = null | 'users' | 'orders' | 'revenue' | 'rechargeRevenue' | 'active';

export default function StatsView() {
    const { t, isRTL } = useLanguage();
    const [detailView, setDetailView] = useState<DetailView>(null);
    const [data, setData] = useState({
        totalUsers: 0, totalOrders: 0, totalRevenue: '$0.00', activeNow: 0,
        completedRevenue: '0.00', pendingRevenue: '0.00', cancelledRevenue: '0.00', profits: '0.00',
        rechargeRevenue: '0.00', rechargeCount: 0,
        recentActivity: [] as { user: string; action: string; time: string }[]
    });

    // Detail data
    const [users, setUsers] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // User modal state
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', email: '', balance: '' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/stats`).then(r => r.json()).then(setData).catch(console.error);
    }, []);

    const fetchUsers = async () => {
        const res = await fetch(`${API_URL}/auth/users`);
        const data = await res.json();
        setUsers(data);
    };

    const fetchOrders = async () => {
        const res = await fetch(`${API_URL}/orders`);
        const data = await res.json();
        setOrders(data);
    };

    const handleCardClick = async (view: DetailView) => {
        setDetailView(view);
        setSearchQuery('');
        if (view === 'users' || view === 'active') await fetchUsers();
        if (view === 'orders' || view === 'revenue') await fetchOrders();
    };

    const stats = [
        { key: 'users' as DetailView, label: t.totalUsers, value: data.totalUsers.toLocaleString(), icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', hoverBorder: 'hover:border-cyan-500/50' },
        { key: 'orders' as DetailView, label: t.totalOrders, value: data.totalOrders.toLocaleString(), icon: ShoppingCart, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', hoverBorder: 'hover:border-purple-500/50' },
        { key: 'revenue' as DetailView, label: t.orderRevenue || 'إيرادات الطلبات', value: data.totalRevenue, icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', hoverBorder: 'hover:border-green-500/50' },
        { key: 'rechargeRevenue' as DetailView, label: t.rechargeRevenue || 'إيرادات الشحن', value: `$${data.rechargeRevenue}`, icon: Wallet, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', hoverBorder: 'hover:border-amber-500/50' },
        { key: 'active' as DetailView, label: t.activeNow, value: data.activeNow.toLocaleString(), icon: Activity, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', hoverBorder: 'hover:border-red-500/50' },
    ];

    const timeAgo = (time: string) => {
        const diff = Date.now() - new Date(time).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return t.justNow || 'الآن';
        if (mins < 60) return `${mins} ${t.minutesAgo || 'دقيقة'}`;
        return `${Math.floor(mins / 60)} ${t.hoursAgo || 'ساعة'}`;
    };

    const statusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
            case 'cancelled': return <XCircle className="w-4 h-4 text-red-400" />;
            default: return <Clock className="w-4 h-4 text-blue-400" />;
        }
    };

    const statusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'cancelled': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        }
    };

    // Filter logic
    const filteredUsers = users.filter(u => {
        if (!searchQuery) return detailView === 'active'
            ? (Date.now() - new Date(u.updatedAt).getTime()) < 15 * 60 * 1000
            : true;
        const q = searchQuery.toLowerCase();
        return u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.firstName?.toLowerCase().includes(q);
    });

    const filteredOrders = orders.filter(o => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return o.orderId?.toLowerCase().includes(q) || o.serviceName?.toLowerCase().includes(q);
    });

    // ===== User Management Functions =====
    const openUserModal = (user: any) => {
        setSelectedUser(user);
        setEditForm({
            firstName: user.firstName || '', lastName: user.lastName || '',
            phone: user.phone || '', email: user.email || '',
            balance: user.balance?.toString() || '0',
        });
        setIsEditing(false);
        setShowDeleteConfirm(false);
    };

    const closeUserModal = () => {
        setSelectedUser(null);
        setIsEditing(false);
        setShowDeleteConfirm(false);
    };

    const handleSaveUser = async () => {
        if (!selectedUser) return;
        try {
            const res = await fetch(`${API_URL}/auth/users/${selectedUser._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                const updated = await res.json();
                setUsers(prev => prev.map(u => u._id === updated._id ? updated : u));
                setSelectedUser(updated);
                setIsEditing(false);
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            await fetch(`${API_URL}/auth/users/${selectedUser._id}`, { method: 'DELETE' });
            setUsers(prev => prev.filter(u => u._id !== selectedUser._id));
            closeUserModal();
        } catch (err) { console.error(err); }
    };

    const handleToggleBan = async () => {
        if (!selectedUser) return;
        try {
            const res = await fetch(`${API_URL}/auth/users/${selectedUser._id}/ban`, { method: 'PATCH' });
            if (res.ok) {
                const { banned } = await res.json();
                const updated = { ...selectedUser, banned };
                setSelectedUser(updated);
                setUsers(prev => prev.map(u => u._id === updated._id ? updated : u));
            }
        } catch (err) { console.error(err); }
    };

    // ===== DETAIL VIEWS =====
    if (detailView) {
        const currentStat = stats.find(s => s.key === detailView)!;
        const Icon = currentStat.icon;

        return (
            <div className="p-4 md:p-8 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
                {/* Back Button + Title */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setDetailView(null)}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className={`w-5 h-5 text-white ${isRTL ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`p-2 rounded-xl ${currentStat.bg}`}>
                        <Icon className={`w-5 h-5 ${currentStat.color}`} />
                    </div>
                    <h2 className="font-space text-xl md:text-2xl text-white">{currentStat.label}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${currentStat.bg} ${currentStat.color}`}>
                        {currentStat.value}
                    </span>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-white/30`} />
                    <Input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={t.search || 'بحث...'}
                        className={`${isRTL ? 'pr-10' : 'pl-10'} bg-black/30 border-white/10 text-white h-11 placeholder:text-white/20`}
                        dir={isRTL ? 'rtl' : 'ltr'}
                    />
                </div>

                {/* ===== Users Detail ===== */}
                {(detailView === 'users' || detailView === 'active') && (
                    <div className="space-y-3">
                        {filteredUsers.length === 0 ? (
                            <div className="text-center py-12 text-white/30">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>{t.noResults || 'لا توجد نتائج'}</p>
                            </div>
                        ) : filteredUsers.map(user => (
                            <Card
                                key={user._id}
                                onClick={() => openUserModal(user)}
                                className={`p-4 border cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] ${user.banned
                                        ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                                        : 'bg-white/5 border-white/10 hover:border-cyan-500/30'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className={`w-11 h-11 rounded-full border flex items-center justify-center text-white font-bold text-sm shrink-0 ${user.banned
                                            ? 'bg-red-500/20 border-red-500/30'
                                            : 'bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-white/10'
                                        }`}>
                                        {user.banned ? <Ban className="w-5 h-5 text-red-400" /> : <>{user.firstName?.charAt(0) || '?'}{user.lastName?.charAt(0) || ''}</>}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-white font-medium text-sm">{user.firstName} {user.lastName}</span>
                                            <span className="text-cyan-400 font-mono text-xs bg-cyan-500/10 px-2 py-0.5 rounded-full">@{user.username}</span>
                                            {user.banned && (
                                                <span className="text-red-400 text-[10px] bg-red-500/10 px-1.5 py-0.5 rounded-full font-bold">🚫 محظور</span>
                                            )}
                                            {!user.banned && user.isVerified && (
                                                <span className="text-green-400 text-[10px] bg-green-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                                    <CheckCircle className="w-3 h-3" /> {t.verified || 'مؤكد'}
                                                </span>
                                            )}
                                            {!user.banned && !user.isVerified && (
                                                <span className="text-yellow-400 text-[10px] bg-yellow-500/10 px-1.5 py-0.5 rounded-full">
                                                    {t.unverified || 'غير مؤكد'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-white/40 text-xs flex-wrap">
                                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</span>
                                            {user.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {user.phone}</span>}
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(user.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Balance */}
                                    <div className="text-right shrink-0">
                                        <p className="text-green-400 font-bold font-mono text-sm">${user.balance?.toFixed(2) || '0.00'}</p>
                                        <p className="text-white/30 text-[10px]">{t.balance || 'الرصيد'}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        <p className="text-center text-white/20 text-xs pt-2">
                            {filteredUsers.length} {t.totalUsers || 'مستخدم'}
                        </p>

                        {/* ===== USER DETAIL MODAL ===== */}
                        {selectedUser && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeUserModal}>
                                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                                <div
                                    className="relative w-full max-w-lg bg-[#0d0d1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto"
                                    onClick={e => e.stopPropagation()}
                                >
                                    {/* Header */}
                                    <div className={`p-5 border-b border-white/10 ${selectedUser.banned ? 'bg-red-500/10' : 'bg-gradient-to-r from-cyan-500/10 to-purple-500/10'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-white font-bold text-lg ${selectedUser.banned ? 'bg-red-500/20 border-red-500/40' : 'bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-cyan-500/30'
                                                    }`}>
                                                    {selectedUser.banned ? <Ban className="w-7 h-7 text-red-400" /> : <>{selectedUser.firstName?.charAt(0)}{selectedUser.lastName?.charAt(0)}</>}
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold text-lg">{selectedUser.firstName} {selectedUser.lastName}</h3>
                                                    <p className="text-cyan-400 font-mono text-sm">@{selectedUser.username}</p>
                                                </div>
                                            </div>
                                            <button onClick={closeUserModal} className="p-2 rounded-xl hover:bg-white/10 transition-colors">
                                                <X className="w-5 h-5 text-white/50" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 space-y-4">
                                        {/* Status Badges */}
                                        <div className="flex flex-wrap gap-2">
                                            {selectedUser.banned && <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">🚫 محظور</span>}
                                            {selectedUser.isVerified
                                                ? <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> مؤكد</span>
                                                : <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">غير مؤكد</span>
                                            }
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">{selectedUser.role}</span>
                                        </div>

                                        {/* Info Fields */}
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-white/50 text-xs mb-1 block">الاسم الأول</label>
                                                        <Input value={editForm.firstName} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))} className="bg-black/40 border-white/10 text-white h-10" />
                                                    </div>
                                                    <div>
                                                        <label className="text-white/50 text-xs mb-1 block">الاسم الأخير</label>
                                                        <Input value={editForm.lastName} onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))} className="bg-black/40 border-white/10 text-white h-10" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-white/50 text-xs mb-1 block">البريد الإلكتروني</label>
                                                    <Input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} className="bg-black/40 border-white/10 text-white h-10" dir="ltr" />
                                                </div>
                                                <div>
                                                    <label className="text-white/50 text-xs mb-1 block">رقم الهاتف</label>
                                                    <Input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} className="bg-black/40 border-white/10 text-white h-10" dir="ltr" />
                                                </div>
                                                <div>
                                                    <label className="text-white/50 text-xs mb-1 block">الرصيد ($)</label>
                                                    <Input type="number" step="0.01" value={editForm.balance} onChange={e => setEditForm(p => ({ ...p, balance: e.target.value }))} className="bg-black/40 border-white/10 text-white h-10" dir="ltr" />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button onClick={handleSaveUser} className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2">
                                                        <Save className="w-4 h-4" /> حفظ
                                                    </Button>
                                                    <Button onClick={() => setIsEditing(false)} variant="ghost" className="flex-1 text-white/60 hover:bg-white/5">
                                                        إلغاء
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {[
                                                    { icon: <Mail className="w-4 h-4 text-cyan-400" />, label: 'البريد', value: selectedUser.email },
                                                    { icon: <Phone className="w-4 h-4 text-green-400" />, label: 'الهاتف', value: selectedUser.phone || '—' },
                                                    { icon: <DollarSign className="w-4 h-4 text-yellow-400" />, label: 'الرصيد', value: `$${selectedUser.balance?.toFixed(2) || '0.00'}` },
                                                    { icon: <Calendar className="w-4 h-4 text-purple-400" />, label: 'تاريخ التسجيل', value: new Date(selectedUser.createdAt).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' }) },
                                                    { icon: <Clock className="w-4 h-4 text-blue-400" />, label: 'آخر تحديث', value: new Date(selectedUser.updatedAt).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
                                                ].map((item, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                                        {item.icon}
                                                        <span className="text-white/40 text-xs w-24 shrink-0">{item.label}</span>
                                                        <span className="text-white text-sm font-medium" dir="ltr">{item.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Delete Confirmation */}
                                        {showDeleteConfirm && (
                                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-3">
                                                <p className="text-red-400 text-sm font-bold">⚠️ هل أنت متأكد من حذف هذا المستخدم نهائياً؟</p>
                                                <p className="text-white/40 text-xs">سيتم حذف جميع بيانات المستخدم ولا يمكن التراجع.</p>
                                                <div className="flex gap-2">
                                                    <Button onClick={handleDeleteUser} className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2">
                                                        <Trash2 className="w-4 h-4" /> نعم، احذف
                                                    </Button>
                                                    <Button onClick={() => setShowDeleteConfirm(false)} variant="ghost" className="flex-1 text-white/60 hover:bg-white/5">
                                                        إلغاء
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        {!isEditing && !showDeleteConfirm && (
                                            <div className="grid grid-cols-3 gap-2 pt-2">
                                                <Button onClick={() => setIsEditing(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white gap-1.5 text-xs h-10">
                                                    <Edit3 className="w-3.5 h-3.5" /> تعديل
                                                </Button>
                                                <Button onClick={handleToggleBan} className={`gap-1.5 text-xs h-10 ${selectedUser.banned ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'
                                                    } text-white`}>
                                                    {selectedUser.banned ? <ShieldCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                                                    {selectedUser.banned ? 'رفع الحظر' : 'حظر'}
                                                </Button>
                                                <Button onClick={() => setShowDeleteConfirm(true)} className="bg-red-600 hover:bg-red-700 text-white gap-1.5 text-xs h-10">
                                                    <Trash2 className="w-3.5 h-3.5" /> حذف
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ===== Orders Detail ===== */}
                {detailView === 'orders' && (
                    <div className="space-y-3">
                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-12 text-white/30">
                                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>{t.noResults || 'لا توجد نتائج'}</p>
                            </div>
                        ) : filteredOrders.map(order => (
                            <Card key={order._id} className="p-4 bg-white/5 border-white/10 hover:border-white/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 shrink-0">
                                        <Hash className="w-5 h-5 text-purple-400" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-white font-medium text-sm">{order.serviceName}</span>
                                            <span className="text-purple-400 font-mono text-xs">{order.orderId}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-white/40 text-xs flex-wrap">
                                            <span>{t.quantity || 'الكمية'}: {order.quantity}</span>
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                                            {order.link && <span className="truncate max-w-[150px]">🔗 {order.link}</span>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className="text-green-400 font-bold font-mono text-sm">${order.price?.toFixed(2)}</span>
                                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor(order.status)}`}>
                                            {statusIcon(order.status)}
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        <p className="text-center text-white/20 text-xs pt-2">
                            {filteredOrders.length} {t.totalOrders || 'طلب'}
                        </p>
                    </div>
                )}

                {/* ===== Revenue Detail ===== */}
                {detailView === 'revenue' && (
                    <div className="space-y-4">
                        {/* Revenue Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Card className="p-4 bg-green-500/5 border-green-500/20">
                                <p className="text-white/50 text-xs mb-1">{t.completedRevenue || 'إيرادات مكتملة'}</p>
                                <p className="text-green-400 font-bold font-mono text-lg">${data.completedRevenue}</p>
                            </Card>
                            <Card className="p-4 bg-yellow-500/5 border-yellow-500/20">
                                <p className="text-white/50 text-xs mb-1">{t.pendingRevenue || 'إيرادات معلقة'}</p>
                                <p className="text-yellow-400 font-bold font-mono text-lg">${data.pendingRevenue}</p>
                            </Card>
                            <Card className="p-4 bg-red-500/5 border-red-500/20">
                                <p className="text-white/50 text-xs mb-1">{t.cancelledRevenue || 'إيرادات ملغاة'}</p>
                                <p className="text-red-400 font-bold font-mono text-lg">${data.cancelledRevenue}</p>
                            </Card>
                            <Card className="p-4 bg-cyan-500/5 border-cyan-500/20">
                                <p className="text-white/50 text-xs mb-1">{t.profits || 'الأرباح'}</p>
                                <p className="text-cyan-400 font-bold font-mono text-lg">${data.profits}</p>
                            </Card>
                        </div>

                        {/* Orders contributing to revenue */}
                        <h3 className="text-white/60 text-sm font-bold">{t.revenueDetails || 'تفاصيل الإيرادات'}</h3>
                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-12 text-white/30">
                                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>{t.noResults || 'لا توجد نتائج'}</p>
                            </div>
                        ) : filteredOrders.map(order => (
                            <Card key={order._id} className="p-3 bg-white/5 border-white/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="w-4 h-4 text-green-400" />
                                        <div>
                                            <span className="text-white text-sm">{order.serviceName}</span>
                                            <span className="text-white/30 text-xs mx-2">×{order.quantity}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${statusColor(order.status)}`}>
                                            {statusIcon(order.status)} {order.status}
                                        </span>
                                        <span className="text-green-400 font-mono font-bold text-sm">${order.price?.toFixed(2)}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* ===== Recharge Revenue Detail ===== */}
                {detailView === 'rechargeRevenue' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Card className="p-4 bg-amber-500/5 border-amber-500/20">
                                <p className="text-white/50 text-xs mb-1">{t.totalRecharges || 'إجمالي الشحن'}</p>
                                <p className="text-amber-400 font-bold font-mono text-lg">${data.rechargeRevenue}</p>
                            </Card>
                            <Card className="p-4 bg-amber-500/5 border-amber-500/20">
                                <p className="text-white/50 text-xs mb-1">{t.rechargeCount || 'عدد العمليات'}</p>
                                <p className="text-amber-400 font-bold font-mono text-lg">{data.rechargeCount}</p>
                            </Card>
                        </div>
                        <p className="text-white/40 text-sm text-center">{t.rechargeNote || 'يتم تسجيل عمليات الشحن الجديدة تلقائياً'}</p>
                    </div>
                )}
            </div>
        );
    }

    // ===== MAIN OVERVIEW =====
    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <h2 className="font-space text-2xl md:text-3xl text-white tracking-wide">{t.dashboardOverview}</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={index}
                            onClick={() => handleCardClick(stat.key)}
                            className={`p-3 md:p-6 border ${stat.bg} backdrop-blur-sm cursor-pointer transition-all duration-300 ${stat.hoverBorder} hover:scale-[1.03] active:scale-[0.98]`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white/60 text-xs md:text-sm font-body mb-1">{stat.label}</p>
                                    <h3 className="text-xl md:text-3xl font-bold text-white font-space">{stat.value}</h3>
                                </div>
                                <div className={`p-1.5 md:p-3 rounded-xl bg-white/5 ${stat.color}`}>
                                    <Icon className="w-4 h-4 md:w-6 md:h-6" />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Card className="p-4 md:p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                <h3 className="text-base md:text-xl font-bold text-white mb-4">{t.recentActivity}</h3>
                <div className="space-y-3 md:space-y-4">
                    {data.recentActivity.length > 0 ? data.recentActivity.map((activity, i) => (
                        <div key={i} className="flex items-center gap-3 md:gap-4 p-2 md:p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs md:text-sm">
                                {activity.user.charAt(0)}
                            </div>
                            <div>
                                <p className="text-white font-medium text-xs md:text-base">{activity.user} {activity.action}</p>
                                <p className="text-white/40 text-[10px] md:text-xs">{timeAgo(activity.time)}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-white/40 text-center py-4">{t.noActivity || 'لا يوجد نشاط حديث'}</p>
                    )}
                </div>
            </Card>
        </div>
    );
}
