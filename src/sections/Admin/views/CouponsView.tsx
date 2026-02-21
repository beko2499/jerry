import { useState, useEffect } from 'react';
import { Ticket, Copy, Trash2, Check, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

import { adminFetch } from '@/lib/api';

interface Coupon {
    _id: string;
    code: string;
    amount: number;
    isUsed: boolean;
    usedBy?: { username: string; email: string } | null;
    usedAt?: string | null;
    note: string;
    createdAt: string;
}

export default function CouponsView() {
    const { t } = useLanguage();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await adminFetch(`/coupons`);
            const data = await res.json();
            setCoupons(data);
        } catch (err) {
            console.error(err);
        }
    };

    const generateCoupon = async () => {
        if (!amount || parseFloat(amount) <= 0) return;
        setIsGenerating(true);
        try {
            const res = await adminFetch(`/coupons/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parseFloat(amount), note }),
            });
            const coupon = await res.json();
            setCoupons(prev => [coupon, ...prev]);
            setAmount('');
            setNote('');
        } catch (err) {
            console.error(err);
        }
        setIsGenerating(false);
    };

    const deleteCoupon = async (id: string) => {
        try {
            await adminFetch(`/coupons/${id}`, { method: 'DELETE' });
            setCoupons(prev => prev.filter(c => c._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const copyCode = (code: string, id: string) => {
        try {
            navigator.clipboard.writeText(code);
        } catch {
            const ta = document.createElement('textarea'); ta.value = code; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        }
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const unusedCoupons = coupons.filter(c => !c.isUsed);
    const usedCoupons = coupons.filter(c => c.isUsed);

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="font-space text-2xl md:text-3xl text-white tracking-wide flex items-center gap-3">
                    <Ticket className="w-7 h-7 text-amber-400" />
                    {t.coupons || 'Coupons'}
                </h2>
            </div>

            {/* Generate Coupon */}
            <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-amber-400" />
                    {t.generateCoupon || 'Generate Coupon'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-white/60 text-xs mb-1">{t.amount}</label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="bg-black/30 border-white/10 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-white/60 text-xs mb-1">{t.couponNote || 'Note'}</label>
                        <Input
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder={t.couponNotePlaceholder || 'e.g. Zain Cash transfer'}
                            className="bg-black/30 border-white/10 text-white"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button
                            onClick={generateCoupon}
                            disabled={isGenerating || !amount}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2 h-10"
                        >
                            <Ticket className="w-4 h-4" />
                            {isGenerating ? '...' : (t.generate || 'Generate')}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Active Coupons */}
            <div>
                <h3 className="text-white/80 font-bold text-sm mb-3">{t.activeCoupons || 'Active Coupons'} ({unusedCoupons.length})</h3>
                {unusedCoupons.length === 0 ? (
                    <p className="text-white/30 text-sm">{t.noActiveCoupons || 'No active coupons'}</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {unusedCoupons.map(coupon => (
                            <Card key={coupon._id} className="p-4 bg-white/5 border border-amber-500/20 hover:border-amber-500/40 transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-amber-400 font-bold text-xl">${coupon.amount.toFixed(2)}</span>
                                    <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full border border-green-500/30">
                                        {t.active}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <code className="text-white font-mono text-sm bg-black/40 px-3 py-1.5 rounded-lg flex-1 text-center tracking-widest">
                                        {coupon.code}
                                    </code>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => copyCode(coupon.code, coupon._id)}
                                        className="text-white/60 hover:text-white h-8 w-8 p-0"
                                    >
                                        {copiedId === coupon._id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                                {coupon.note && <p className="text-white/40 text-xs mb-2">📋 {coupon.note}</p>}
                                <div className="flex items-center justify-between">
                                    <span className="text-white/30 text-xs">{new Date(coupon.createdAt).toLocaleDateString('ar')}</span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => deleteCoupon(coupon._id)}
                                        className="text-red-400 hover:bg-red-500/10 h-7 gap-1 text-xs"
                                    >
                                        <Trash2 className="w-3 h-3" /> {t.delete}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Used Coupons */}
            {usedCoupons.length > 0 && (
                <div>
                    <h3 className="text-white/80 font-bold text-sm mb-3">{t.usedCoupons || 'Used Coupons'} ({usedCoupons.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {usedCoupons.map(coupon => (
                            <Card key={coupon._id} className="p-4 bg-white/5 border border-white/10 opacity-60">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white/60 font-bold">${coupon.amount.toFixed(2)}</span>
                                    <span className="text-xs text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/30">
                                        {t.used || 'Used'}
                                    </span>
                                </div>
                                <code className="text-white/40 font-mono text-xs line-through">{coupon.code}</code>
                                {coupon.usedBy && (
                                    <p className="text-white/40 text-xs mt-1">👤 {coupon.usedBy.username}</p>
                                )}
                                {coupon.usedAt && (
                                    <p className="text-white/30 text-xs">{new Date(coupon.usedAt).toLocaleString('ar')}</p>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
