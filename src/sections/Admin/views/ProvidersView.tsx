import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Link, Globe } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Provider {
    _id: string;
    name: string;
    url: string;
    apiKey: string;
    balance: string;
    status: 'active' | 'inactive';
    image?: string;
}

export default function ProvidersView() {
    const { t } = useLanguage();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newProvider, setNewProvider] = useState<Partial<Provider>>({ status: 'active' });

    useEffect(() => {
        fetch(`${API_URL}/providers`).then(r => r.json()).then(setProviders).catch(console.error);
    }, []);

    const handleAdd = async () => {
        if (!newProvider.name || !newProvider.url || !newProvider.apiKey) return;
        const res = await fetch(`${API_URL}/providers`, {
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
        await fetch(`${API_URL}/providers/${id}`, { method: 'DELETE' });
        setProviders(prev => prev.filter(p => p._id !== id));
    };

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="font-space text-2xl md:text-3xl text-white tracking-wide">{t.providers}</h2>
                <Button onClick={() => setIsAdding(!isAdding)} className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-700 text-white gap-2">
                    <Plus className="w-4 h-4" /> {t.addNew}
                </Button>
            </div>

            {isAdding && (
                <Card className="p-4 md:p-6 bg-white/5 border border-dashed border-cyan-500/30 space-y-4">
                    <h3 className="text-white font-bold">{t.addNew} Provider</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder={t.providerName} value={newProvider.name || ''} onChange={e => setNewProvider(p => ({ ...p, name: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                        <Input placeholder="API URL" value={newProvider.url || ''} onChange={e => setNewProvider(p => ({ ...p, url: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                        <Input placeholder="API Key" value={newProvider.apiKey || ''} onChange={e => setNewProvider(p => ({ ...p, apiKey: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                        <Input placeholder="Balance" value={newProvider.balance || ''} onChange={e => setNewProvider(p => ({ ...p, balance: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white">{t.saveChanges}</Button>
                        <Button variant="ghost" onClick={() => setIsAdding(false)} className="text-white/60">{t.cancel}</Button>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {providers.map(provider => (
                    <Card key={provider._id} className="p-4 md:p-6 bg-white/5 border-white/10 backdrop-blur-sm hover:border-cyan-500/20 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center border border-white/10">
                                    <Globe className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm md:text-base">{provider.name}</h3>
                                    <p className="text-white/40 text-xs flex items-center gap-1"><Link className="w-3 h-3" /> {provider.url}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${provider.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                                {provider.status === 'active' ? t.active : t.inactive}
                            </span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                            <span className="text-green-400 font-space font-bold">{provider.balance}</span>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="text-cyan-400 hover:bg-cyan-500/10 gap-1">
                                    <Edit2 className="w-3 h-3" /> {t.edit}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(provider._id)} className="text-red-400 hover:bg-red-500/10 gap-1">
                                    <Trash2 className="w-3 h-3" /> {t.delete}
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {providers.length === 0 && !isAdding && (
                <div className="text-center py-12 text-white/40">
                    <p className="text-lg">No providers configured yet</p>
                    <p className="text-sm mt-1">Click "Add New" to add an API provider</p>
                </div>
            )}
        </div>
    );
}
