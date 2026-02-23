import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Globe, RefreshCw, Download, Check, X, Search, Save, ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

import { adminFetch } from '@/lib/api';
import { formatPrice } from '@/lib/formatPrice';

interface Provider {
    _id: string;
    name: string;
    url: string;
    apiKey: string;
    balance: string;
    status: 'active' | 'inactive';
    image?: string;
}

interface SmmService {
    service: number;
    name: string;
    type: string;
    category: string;
    rate: string;
    min: number | string;
    max: number | string;
    refill: boolean;
    cancel: boolean;
}

interface Category {
    _id: string;
    name: string;
    nameKey: string;
    parentId: string | null;
}

export default function ProvidersView({ onModalChange }: { onModalChange?: (open: boolean) => void }) {
    const { t, lang } = useLanguage();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newProvider, setNewProvider] = useState<Partial<Provider>>({ status: 'active' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Provider>>({});

    // Import state
    const [importingProviderId, setImportingProviderId] = useState<string | null>(null);
    const [smmServices, setSmmServices] = useState<SmmService[]>([]);
    const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set());
    const [categories, setCategories] = useState<Category[]>([]);
    const [importCategoryId, setImportCategoryId] = useState('');
    const [priceMultiplier, setPriceMultiplier] = useState(1.5);
    const [loadingServices, setLoadingServices] = useState(false);
    const [importingStatus, setImportingStatus] = useState('');
    const [searchFilter, setSearchFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [balanceLoading, setBalanceLoading] = useState<string | null>(null);
    const [expandedCatIds, setExpandedCatIds] = useState<Set<string>>(new Set());
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    useEffect(() => {
        adminFetch(`/providers`).then(r => r.json()).then(setProviders).catch(console.error);
        adminFetch(`/categories`).then(r => r.json()).then(setCategories).catch(console.error);
    }, []);

    const handleAdd = async () => {
        if (!newProvider.name || !newProvider.url || !newProvider.apiKey) return;
        const res = await adminFetch(`/providers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProvider)
        });
        const created = await res.json();
        setProviders(prev => [created, ...prev]);
        setIsAdding(false);
        setNewProvider({ status: 'active' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t.confirmDelete)) return;
        await adminFetch(`/providers/${id}`, { method: 'DELETE' });
        setProviders(prev => prev.filter(p => p._id !== id));
    };

    const handleSaveEdit = async (id: string) => {
        const res = await adminFetch(`/providers/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm)
        });
        const updated = await res.json();
        setProviders(prev => prev.map(p => p._id === id ? updated : p));
        setEditingId(null);
        setEditForm({});
    };

    const handleCheckBalance = async (id: string) => {
        setBalanceLoading(id);
        try {
            const res = await adminFetch(`/providers/${id}/balance`);
            const data = await res.json();
            if (data.balance) {
                setProviders(prev => prev.map(p => p._id === id ? { ...p, balance: `$${formatPrice(parseFloat(data.balance))}` } : p));
            }
        } catch (err) {
            console.error(err);
        }
        setBalanceLoading(null);
    };

    const handleFetchServices = async (id: string) => {
        setLoadingServices(true);
        setImportingProviderId(id);
        onModalChange?.(true);
        setSmmServices([]);
        setSelectedServices(new Set());
        setSearchFilter('');
        setCategoryFilter('');
        try {
            const res = await adminFetch(`/providers/${id}/services`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setSmmServices(data);
            } else {
                alert(lang === 'ar' ? 'خطأ في جلب الخدمات' : 'Error fetching services');
            }
        } catch (err) {
            alert(lang === 'ar' ? 'فشل الاتصال بالمزود' : 'Failed to connect to provider');
        }
        setLoadingServices(false);
    };

    const handleImportSelected = async () => {
        if (!importCategoryId || selectedServices.size === 0) return;
        setImportingStatus(lang === 'ar' ? 'جاري الاستيراد...' : 'Importing...');

        const toImport = smmServices.filter(s => selectedServices.has(s.service));
        try {
            const res = await adminFetch(`/providers/${importingProviderId}/import-services`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    services: toImport,
                    categoryId: importCategoryId,
                    priceMultiplier,
                })
            });
            const data = await res.json();
            setImportingStatus(lang === 'ar' ? `✅ تم استيراد ${data.imported} خدمة` : `✅ Imported ${data.imported} services`);
            setSelectedServices(new Set());
        } catch (err) {
            setImportingStatus(lang === 'ar' ? '❌ خطأ' : '❌ Error');
        }
    };

    const toggleService = (id: number) => {
        setSelectedServices(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selectedServices.size === filteredServices.length) {
            setSelectedServices(new Set());
        } else {
            setSelectedServices(new Set(filteredServices.map(s => s.service)));
        }
    };

    // Get unique categories from SMM services
    const smmCategories = [...new Set(smmServices.map(s => s.category))];

    // Filter services
    const filteredServices = smmServices.filter(s => {
        const matchSearch = !searchFilter || s.name.toLowerCase().includes(searchFilter.toLowerCase()) || String(s.service).includes(searchFilter);
        const matchCategory = !categoryFilter || s.category === categoryFilter;
        return matchSearch && matchCategory;
    });

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="font-space text-2xl md:text-3xl text-white tracking-wide">{t.providers}</h2>
                <Button onClick={() => setIsAdding(!isAdding)} className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-700 text-white gap-2">
                    <Plus className="w-4 h-4" /> {t.addNew}
                </Button>
            </div>

            {/* Add new provider */}
            {isAdding && (
                <Card className="p-4 md:p-6 bg-white/5 border border-dashed border-cyan-500/30 space-y-4">
                    <h3 className="text-white font-bold">{lang === 'ar' ? 'إضافة مزود جديد' : 'Add New Provider'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder={lang === 'ar' ? 'اسم المزود' : 'Provider Name'} value={newProvider.name || ''} onChange={e => setNewProvider(p => ({ ...p, name: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                        <Input placeholder="API URL (e.g. https://fast70.com/api/v2)" value={newProvider.url || ''} onChange={e => setNewProvider(p => ({ ...p, url: e.target.value }))} className="bg-black/30 border-white/10 text-white font-mono text-sm" dir="ltr" />
                        <Input placeholder="API Key" value={newProvider.apiKey || ''} onChange={e => setNewProvider(p => ({ ...p, apiKey: e.target.value }))} className="bg-black/30 border-white/10 text-white font-mono text-sm" dir="ltr" />
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white">{t.saveChanges}</Button>
                        <Button variant="ghost" onClick={() => setIsAdding(false)} className="text-white/60">{t.cancel}</Button>
                    </div>
                </Card>
            )}

            {/* Provider cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {providers.map(provider => (
                    <Card key={provider._id} className="p-4 md:p-6 bg-white/5 border-white/10 backdrop-blur-sm hover:border-cyan-500/20 transition-all">
                        {editingId === provider._id ? (
                            <div className="space-y-3">
                                <Input value={editForm.name || ''} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder={lang === 'ar' ? 'اسم المزود' : 'Name'} className="bg-black/30 border-white/10 text-white" />
                                <Input value={editForm.url || ''} onChange={e => setEditForm(p => ({ ...p, url: e.target.value }))} placeholder="API URL" className="bg-black/30 border-white/10 text-white font-mono text-sm" dir="ltr" />
                                <Input value={editForm.apiKey || ''} onChange={e => setEditForm(p => ({ ...p, apiKey: e.target.value }))} placeholder="API Key" className="bg-black/30 border-white/10 text-white font-mono text-sm" dir="ltr" />
                                <div className="flex gap-2">
                                    <Button onClick={() => handleSaveEdit(provider._id)} size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1"><Save className="w-3 h-3" /> {t.saveChanges}</Button>
                                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="text-white/60 gap-1"><X className="w-3 h-3" /> {t.cancel}</Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center border border-white/10">
                                            <Globe className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-sm md:text-base">{provider.name}</h3>
                                            <p className="text-white/40 text-xs font-mono" dir="ltr">{provider.url}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${provider.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                                        {provider.status === 'active' ? t.active : t.inactive}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-green-400 font-space font-bold text-lg">{provider.balance || '$0.00'}</span>
                                        <Button variant="ghost" size="sm" disabled={balanceLoading === provider._id}
                                            onClick={() => handleCheckBalance(provider._id)}
                                            className="text-cyan-400 hover:bg-cyan-500/10 p-1 h-7 w-7">
                                            <RefreshCw className={`w-3.5 h-3.5 ${balanceLoading === provider._id ? 'animate-spin' : ''}`} />
                                        </Button>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => handleFetchServices(provider._id)} className="text-purple-400 hover:bg-purple-500/10 gap-1 text-xs">
                                            <Download className="w-3 h-3" /> {lang === 'ar' ? 'استيراد' : 'Import'}
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => { setEditingId(provider._id); setEditForm({ name: provider.name, url: provider.url, apiKey: provider.apiKey }); }} className="text-cyan-400 hover:bg-cyan-500/10 gap-1 text-xs">
                                            <Edit2 className="w-3 h-3" /> {t.edit}
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(provider._id)} className="text-red-400 hover:bg-red-500/10 gap-1 text-xs">
                                            <Trash2 className="w-3 h-3" /> {t.delete}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </Card>
                ))}
            </div>

            {providers.length === 0 && !isAdding && (
                <div className="text-center py-12 text-white/40">
                    <p className="text-lg">{lang === 'ar' ? 'لا يوجد مزودين بعد' : 'No providers configured yet'}</p>
                    <p className="text-sm mt-1">{lang === 'ar' ? 'اضغط "إضافة" لإضافة مزود API' : 'Click "Add New" to add an API provider'}</p>
                </div>
            )}

            {/* Import Services Modal */}
            {importingProviderId && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4" onClick={() => { setImportingProviderId(null); setSmmServices([]); onModalChange?.(false); }}>
                    <div className="bg-[#0d1117] border-t md:border border-white/10 md:rounded-2xl w-full md:max-w-4xl h-[100dvh] md:h-auto md:max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-3 md:p-6 border-b border-white/10 flex-shrink-0">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-white font-bold text-base md:text-lg">{lang === 'ar' ? '📦 استيراد الخدمات من المزود' : '📦 Import Services from Provider'}</h3>
                                <Button variant="ghost" size="sm" onClick={() => { setImportingProviderId(null); setSmmServices([]); onModalChange?.(false); }} className="text-white/40 hover:text-white">
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {smmServices.length > 0 && (
                                <div className="space-y-2">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        {/* Search */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                            <Input value={searchFilter} onChange={e => setSearchFilter(e.target.value)}
                                                placeholder={lang === 'ar' ? 'بحث بالاسم أو الرقم...' : 'Search by name or ID...'}
                                                className="bg-black/30 border-white/10 text-white pl-9 text-sm h-10" dir="ltr" />
                                        </div>
                                        {/* Category filter */}
                                        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                                            className="bg-black/30 border border-white/10 text-white rounded-lg px-3 h-10 text-sm w-full">
                                            <option value="">{lang === 'ar' ? 'كل الأقسام' : 'All Categories'}</option>
                                            {smmCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        {/* Stats */}
                                        <div className="flex items-center gap-3 text-sm justify-between md:justify-start">
                                            <span className="text-white/50">{filteredServices.length} / {smmServices.length}</span>
                                            <span className="text-cyan-400 font-bold">{selectedServices.size} {lang === 'ar' ? 'محدد' : 'selected'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Services list */}
                        <div className="flex-1 overflow-y-auto p-2 md:p-6 overscroll-contain">
                            {loadingServices ? (
                                <div className="flex items-center justify-center py-20">
                                    <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                                    <span className="text-white/60 ml-3">{lang === 'ar' ? 'جاري جلب الخدمات...' : 'Fetching services...'}</span>
                                </div>
                            ) : smmServices.length > 0 ? (
                                <div className="space-y-1">
                                    {/* Select all */}
                                    <div className="flex items-center gap-3 p-2.5 bg-white/5 rounded-lg mb-2 sticky top-0 z-10 backdrop-blur-sm">
                                        <button onClick={toggleAll} className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${selectedServices.size === filteredServices.length && filteredServices.length > 0 ? 'bg-cyan-500 border-cyan-500' : 'border-white/20 hover:border-white/40'}`}>
                                            {selectedServices.size === filteredServices.length && filteredServices.length > 0 && <Check className="w-4 h-4 text-white" />}
                                        </button>
                                        <span className="text-white/70 text-sm font-bold">{lang === 'ar' ? 'تحديد الكل' : 'Select All'}</span>
                                    </div>

                                    {filteredServices.map(svc => (
                                        <div key={svc.service} onClick={() => toggleService(svc.service)}
                                            className={`flex items-start gap-3 p-3 md:p-3.5 rounded-xl cursor-pointer transition-all active:scale-[0.98] ${selectedServices.has(svc.service) ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-white/[0.02] border border-transparent hover:bg-white/5'}`}>
                                            <div className={`w-6 h-6 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all mt-0.5 ${selectedServices.has(svc.service) ? 'bg-cyan-500 border-cyan-500' : 'border-white/20'}`}>
                                                {selectedServices.has(svc.service) && <Check className="w-4 h-4 text-white" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm leading-relaxed break-words">{svc.name}</p>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <span className="text-white/30 text-xs">{svc.category}</span>
                                                    <span className="text-white/10">•</span>
                                                    <span className="text-green-400 font-mono text-xs font-bold">${formatPrice(parseFloat(svc.rate))}</span>
                                                    <span className="text-white/10">•</span>
                                                    <span className="text-white/30 text-xs">{svc.min}-{svc.max}</span>
                                                    <span className="text-white/20 font-mono text-xs">#{svc.service}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-white/40">
                                    <p>{lang === 'ar' ? 'لا توجد خدمات' : 'No services found'}</p>
                                </div>
                            )}
                        </div>

                        {/* Import controls */}
                        {smmServices.length > 0 && (
                            <div className="p-3 md:p-6 border-t border-white/10 flex-shrink-0 space-y-3 bg-[#0d1117]">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {/* Category to import into */}
                                    <div>
                                        <label className="text-white/50 text-xs mb-1 block">{lang === 'ar' ? 'استيراد إلى قسم' : 'Import to Category'}</label>
                                        {(() => {
                                            const selectedCat = categories.find(c => c._id === importCategoryId);

                                            const toggleExpand = (id: string) => {
                                                setExpandedCatIds(prev => {
                                                    const next = new Set(prev);
                                                    if (next.has(id)) next.delete(id); else next.add(id);
                                                    return next;
                                                });
                                            };

                                            const renderNode = (cat: Category, depth: number = 0): React.ReactNode => {
                                                const children = categories.filter(c => c.parentId === cat._id);
                                                const isExpanded = expandedCatIds.has(cat._id);
                                                const isSelected = importCategoryId === cat._id;
                                                const hasChildren = children.length > 0;

                                                return (
                                                    <div key={cat._id}>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (hasChildren) {
                                                                    toggleExpand(cat._id);
                                                                } else {
                                                                    setImportCategoryId(cat._id);
                                                                    setShowCategoryPicker(false);
                                                                }
                                                            }}
                                                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-all rounded-lg ${isSelected ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-white/80 hover:bg-white/5'}`}
                                                            style={{ paddingInlineStart: `${depth * 20 + 12}px` }}
                                                        >
                                                            {hasChildren ? (
                                                                isExpanded ? <ChevronDown className="w-4 h-4 text-white/40 shrink-0" /> : <ChevronRight className="w-4 h-4 text-white/40 shrink-0" />
                                                            ) : (
                                                                <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-cyan-400' : 'bg-white/20'}`} />
                                                            )}
                                                            <span className="truncate">{cat.name || cat.nameKey}</span>
                                                            {hasChildren && <span className="text-white/20 text-[10px] ml-auto">{children.length}</span>}
                                                        </button>
                                                        {hasChildren && isExpanded && (
                                                            <div>{children.map(child => renderNode(child, depth + 1))}</div>
                                                        )}
                                                    </div>
                                                );
                                            };

                                            const roots = categories.filter(c => !c.parentId);

                                            return (
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                                                        className="w-full bg-black/30 border border-white/10 text-white rounded-lg px-3 h-10 text-sm flex items-center justify-between"
                                                    >
                                                        <span className={selectedCat ? 'text-white' : 'text-white/40'}>
                                                            {selectedCat ? (selectedCat.name || selectedCat.nameKey) : (lang === 'ar' ? 'اختر القسم...' : 'Select category...')}
                                                        </span>
                                                        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showCategoryPicker ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    {showCategoryPicker && (
                                                        <>
                                                            <div className="fixed inset-0 z-40" onClick={() => setShowCategoryPicker(false)} />
                                                            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl max-h-72 overflow-y-auto custom-scrollbar p-1">
                                                                {roots.map(root => renderNode(root, 0))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                    {/* Price multiplier */}
                                    <div>
                                        <label className="text-white/50 text-xs mb-1 block">{lang === 'ar' ? 'مضاعف السعر' : 'Price Multiplier'}</label>
                                        <div className="flex items-center gap-2">
                                            <Input type="number" step="0.1" min="1" value={priceMultiplier} onChange={e => setPriceMultiplier(parseFloat(e.target.value) || 1)}
                                                className="bg-black/30 border-white/10 text-white text-center text-sm h-10" dir="ltr" />
                                            <span className="text-white/40 text-xs whitespace-nowrap">× {lang === 'ar' ? 'سعر المزود' : 'provider price'}</span>
                                        </div>
                                    </div>
                                    {/* Import button */}
                                    <div className="flex items-end">
                                        <Button onClick={handleImportSelected} disabled={!importCategoryId || selectedServices.size === 0}
                                            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-30 text-white gap-2 h-10">
                                            <Download className="w-4 h-4" /> {lang === 'ar' ? `استيراد (${selectedServices.size})` : `Import (${selectedServices.size})`}
                                        </Button>
                                    </div>
                                </div>
                                {importingStatus && <p className="text-center text-sm text-green-400">{importingStatus}</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
