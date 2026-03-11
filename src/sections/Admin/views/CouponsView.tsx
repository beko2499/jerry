import { useState, useEffect } from 'react';
import { Ticket, Copy, Trash2, Check, Plus, Percent, Tag, FolderOpen, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

import { adminFetch, API_URL } from '@/lib/api';

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

interface PromoCode {
    _id: string;
    code: string;
    discountPercent: number;
    targetCategories: { _id: string; name: string; nameKey: string }[];
    maxUses: number;
    usedCount: number;
    isActive: boolean;
    expiresAt: string | null;
    note: string;
    createdAt: string;
}

interface CategoryOption {
    _id: string;
    name: string;
    nameKey: string;
}

export default function CouponsView() {
    const { t, lang } = useLanguage();
    const isRTL = lang === 'ar';
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Promo codes state
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [showPromoForm, setShowPromoForm] = useState(false);
    const [promoDiscount, setPromoDiscount] = useState('');
    const [promoNote, setPromoNote] = useState('');
    const [promoMaxUses, setPromoMaxUses] = useState('');
    const [promoExpiry, setPromoExpiry] = useState('');
    const [promoCustomCode, setPromoCustomCode] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [allCategories, setAllCategories] = useState<CategoryOption[]>([]);
    const [isCreatingPromo, setIsCreatingPromo] = useState(false);

    useEffect(() => {
        fetchCoupons();
        fetchPromoCodes();
        fetchCategories();
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

    const fetchPromoCodes = async () => {
        try {
            const res = await adminFetch(`/promocodes`);
            const data = await res.json();
            setPromoCodes(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_URL}/categories?root=true`);
            const rootCats = await res.json();
            const allCats: CategoryOption[] = [...rootCats];
            for (const cat of rootCats) {
                const subRes = await fetch(`${API_URL}/categories?parentId=${cat._id}`);
                const subCats = await subRes.json();
                allCats.push(...subCats);
            }
            setAllCategories(allCats);
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

    const createPromoCode = async () => {
        if (!promoDiscount || parseFloat(promoDiscount) <= 0 || parseFloat(promoDiscount) > 100) return;
        setIsCreatingPromo(true);
        try {
            const res = await adminFetch(`/promocodes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: promoCustomCode.trim() || undefined,
                    discountPercent: parseFloat(promoDiscount),
                    targetCategories: selectedCategories,
                    maxUses: parseInt(promoMaxUses) || 0,
                    expiresAt: promoExpiry || null,
                    note: promoNote,
                }),
            });
            const promo = await res.json();
            setPromoCodes(prev => [promo, ...prev]);
            setPromoDiscount('');
            setPromoNote('');
            setPromoMaxUses('');
            setPromoExpiry('');
            setPromoCustomCode('');
            setSelectedCategories([]);
            setShowPromoForm(false);
        } catch (err) {
            console.error(err);
        }
        setIsCreatingPromo(false);
    };

    const deletePromoCode = async (id: string) => {
        try {
            await adminFetch(`/promocodes/${id}`, { method: 'DELETE' });
            setPromoCodes(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const togglePromoActive = async (promo: PromoCode) => {
        try {
            const res = await adminFetch(`/promocodes/${promo._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !promo.isActive }),
            });
            const updated = await res.json();
            setPromoCodes(prev => prev.map(p => p._id === promo._id ? updated : p));
        } catch (err) {
            console.error(err);
        }
    };

    const toggleCategory = (catId: string) => {
        setSelectedCategories(prev =>
            prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
        );
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
                        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="bg-black/30 border-white/10 text-white" />
                    </div>
                    <div>
                        <label className="block text-white/60 text-xs mb-1">{t.couponNote || 'Note'}</label>
                        <Input value={note} onChange={e => setNote(e.target.value)} placeholder={t.couponNotePlaceholder || 'e.g. Zain Cash transfer'} className="bg-black/30 border-white/10 text-white" />
                    </div>
                    <div className="flex items-end">
                        <Button onClick={generateCoupon} disabled={isGenerating || !amount} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2 h-10">
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
                                    <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full border border-green-500/30">{t.active}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <code className="text-white font-mono text-sm bg-black/40 px-3 py-1.5 rounded-lg flex-1 text-center tracking-widest">{coupon.code}</code>
                                    <Button size="sm" variant="ghost" onClick={() => copyCode(coupon.code, coupon._id)} className="text-white/60 hover:text-white h-8 w-8 p-0">
                                        {copiedId === coupon._id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                                {coupon.note && <p className="text-white/40 text-xs mb-2">📋 {coupon.note}</p>}
                                <div className="flex items-center justify-between">
                                    <span className="text-white/30 text-xs">{new Date(coupon.createdAt).toLocaleDateString('ar')}</span>
                                    <Button size="sm" variant="ghost" onClick={() => deleteCoupon(coupon._id)} className="text-red-400 hover:bg-red-500/10 h-7 gap-1 text-xs">
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
                                    <span className="text-xs text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full border border-red-500/30">{t.used || 'Used'}</span>
                                </div>
                                <code className="text-white/40 font-mono text-xs line-through">{coupon.code}</code>
                                {coupon.usedBy && <p className="text-white/40 text-xs mt-1">👤 {coupon.usedBy.username}</p>}
                                {coupon.usedAt && <p className="text-white/30 text-xs">{new Date(coupon.usedAt).toLocaleString('ar')}</p>}
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* ========= PROMO CODES SECTION ========= */}
            <div className="border-t border-white/10 pt-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <h2 className="font-space text-2xl md:text-3xl text-white tracking-wide flex items-center gap-3">
                        <Percent className="w-7 h-7 text-emerald-400" />
                        {isRTL ? 'الرموز الترويجية' : 'Promotional Codes'}
                    </h2>
                    <Button onClick={() => setShowPromoForm(!showPromoForm)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-sm">
                        <Plus className="w-4 h-4" />
                        {isRTL ? 'إنشاء رمز ترويجي' : 'Create Promo Code'}
                    </Button>
                </div>

                {/* Create Promo Code Form */}
                {showPromoForm && (
                    <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 space-y-4 mb-6">
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <Tag className="w-5 h-5 text-emerald-400" />
                            {isRTL ? 'رمز ترويجي جديد' : 'New Promotional Code'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-white/60 text-xs mb-1">{isRTL ? 'نسبة الخصم (%)' : 'Discount %'} *</label>
                                <Input type="number" min="1" max="100" value={promoDiscount} onChange={e => setPromoDiscount(e.target.value)} placeholder="10" className="bg-black/30 border-white/10 text-white" dir="ltr" />
                            </div>
                            <div>
                                <label className="block text-white/60 text-xs mb-1">{isRTL ? 'رمز مخصص (اختياري)' : 'Custom code (optional)'}</label>
                                <Input value={promoCustomCode} onChange={e => setPromoCustomCode(e.target.value.toUpperCase())} placeholder={isRTL ? 'تلقائي' : 'Auto-generated'} className="bg-black/30 border-white/10 text-white font-mono" dir="ltr" />
                            </div>
                            <div>
                                <label className="block text-white/60 text-xs mb-1">{isRTL ? 'الحد الأقصى للاستخدام' : 'Max Uses'}</label>
                                <Input type="number" value={promoMaxUses} onChange={e => setPromoMaxUses(e.target.value)} placeholder={isRTL ? '0 = غير محدود' : '0 = unlimited'} className="bg-black/30 border-white/10 text-white" dir="ltr" />
                            </div>
                            <div>
                                <label className="block text-white/60 text-xs mb-1">{isRTL ? 'تاريخ الانتهاء (اختياري)' : 'Expiry date (optional)'}</label>
                                <Input type="date" value={promoExpiry} onChange={e => setPromoExpiry(e.target.value)} className="bg-black/30 border-white/10 text-white" dir="ltr" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-white/60 text-xs mb-1">{isRTL ? 'ملاحظة' : 'Note'}</label>
                                <Input value={promoNote} onChange={e => setPromoNote(e.target.value)} placeholder={isRTL ? 'ملاحظة اختيارية...' : 'Optional note...'} className="bg-black/30 border-white/10 text-white" />
                            </div>
                        </div>

                        {/* Category Targeting */}
                        <div>
                            <label className="block text-white/60 text-xs mb-2 flex items-center gap-1">
                                <FolderOpen className="w-3.5 h-3.5" />
                                {isRTL ? 'استهداف أقسام معينة (اختياري — اتركه فارغاً لكل الأقسام)' : 'Target specific categories (optional — leave empty for all)'}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {allCategories.map(cat => {
                                    const isSelected = selectedCategories.includes(cat._id);
                                    return (
                                        <button
                                            key={cat._id}
                                            onClick={() => toggleCategory(cat._id)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                                isSelected
                                                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                                    : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'
                                            }`}
                                        >
                                            {isSelected && <span className="mr-1">✓</span>}
                                            {cat.name || cat.nameKey}
                                        </button>
                                    );
                                })}
                                {allCategories.length === 0 && (
                                    <p className="text-white/30 text-xs">{isRTL ? 'لا توجد أقسام' : 'No categories'}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={createPromoCode} disabled={isCreatingPromo || !promoDiscount} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                                <Plus className="w-4 h-4" />
                                {isCreatingPromo ? '...' : (isRTL ? 'إنشاء' : 'Create')}
                            </Button>
                            <Button variant="ghost" onClick={() => setShowPromoForm(false)} className="text-white/60">
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Promo Codes List */}
                {promoCodes.length === 0 ? (
                    <p className="text-white/30 text-sm text-center py-6">{isRTL ? 'لا توجد رموز ترويجية' : 'No promo codes yet'}</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {promoCodes.map(promo => (
                            <Card key={promo._id} className={`p-4 border transition-all ${promo.isActive ? 'bg-white/5 border-emerald-500/20 hover:border-emerald-500/40' : 'bg-white/5 border-white/10 opacity-50'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-emerald-400 font-bold text-xl">{promo.discountPercent}%</span>
                                        <Percent className="w-4 h-4 text-emerald-400/50" />
                                    </div>
                                    <button onClick={() => togglePromoActive(promo)} title={promo.isActive ? 'Deactivate' : 'Activate'}>
                                        {promo.isActive
                                            ? <ToggleRight className="w-7 h-7 text-emerald-400" />
                                            : <ToggleLeft className="w-7 h-7 text-white/30" />
                                        }
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                    <code className="text-white font-mono text-sm bg-black/40 px-3 py-1.5 rounded-lg flex-1 text-center tracking-widest">{promo.code}</code>
                                    <Button size="sm" variant="ghost" onClick={() => copyCode(promo.code, `promo_${promo._id}`)} className="text-white/60 hover:text-white h-8 w-8 p-0">
                                        {copiedId === `promo_${promo._id}` ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>

                                {/* Target Categories */}
                                {promo.targetCategories.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {promo.targetCategories.map(cat => (
                                            <span key={cat._id} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                {cat.name || cat.nameKey}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-white/30 text-[10px] mb-2">{isRTL ? '✅ كل الأقسام' : '✅ All categories'}</p>
                                )}

                                {promo.note && <p className="text-white/40 text-xs mb-2">📋 {promo.note}</p>}

                                <div className="flex items-center justify-between text-[10px] text-white/30 mb-2">
                                    <span>{isRTL ? 'الاستخدام' : 'Uses'}: {promo.usedCount}{promo.maxUses > 0 ? `/${promo.maxUses}` : ' (∞)'}</span>
                                    {promo.expiresAt && (
                                        <span>{isRTL ? 'ينتهي' : 'Expires'}: {new Date(promo.expiresAt).toLocaleDateString('ar')}</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-white/30 text-xs">{new Date(promo.createdAt).toLocaleDateString('ar')}</span>
                                    <Button size="sm" variant="ghost" onClick={() => deletePromoCode(promo._id)} className="text-red-400 hover:bg-red-500/10 h-7 gap-1 text-xs">
                                        <Trash2 className="w-3 h-3" /> {t.delete}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
