import { useState } from 'react';
import { Plus, Trash2, Edit2, Link, Globe, Save, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

interface Provider {
    id: string;
    name: string;
    url: string;
    apiKey: string;
    balance: string;
    status: 'active' | 'inactive';
}

export default function ProvidersView() {
    const { isRTL, t } = useLanguage();

    // Mock Data
    const [providers, setProviders] = useState<Provider[]>([
        { id: '1', name: 'Rashaqa Panel', url: 'https://rashaqa.com/api/v2', apiKey: 'abc123456', balance: '$120.50', status: 'active' },
        { id: '2', name: 'JustAnotherPanel', url: 'https://jap.com/api/v2', apiKey: 'xyz987654', balance: '$5.00', status: 'active' },
    ]);

    const [isAdding, setIsAdding] = useState(false);
    const [newProvider, setNewProvider] = useState<Partial<Provider>>({});

    const handleAdd = () => {
        if (newProvider.name && newProvider.url && newProvider.apiKey) {
            setProviders([...providers, {
                id: Date.now().toString(),
                name: newProvider.name,
                url: newProvider.url,
                apiKey: newProvider.apiKey,
                balance: '$0.00',
                status: 'active'
            } as Provider]);
            setIsAdding(false);
            setNewProvider({});
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to remove this provider?')) {
            setProviders(providers.filter(p => p.id !== id));
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-space text-3xl text-white tracking-wide">{t.serviceProviders}</h2>
                <Button onClick={() => setIsAdding(true)} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20">
                    <Plus className="w-4 h-4 mr-2" /> {t.addNewProvider}
                </Button>
            </div>

            {/* Add New Provider Form */}
            {isAdding && (
                <Card className="p-6 bg-white/5 border border-cyan-500/30 backdrop-blur-md mb-8 animate-in slide-in-from-top-4">
                    <h3 className="text-xl font-bold text-white mb-4">{t.addNewProvider}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="text-sm text-white/60 mb-1 block">{t.providerName}</label>
                            <Input
                                value={newProvider.name || ''}
                                onChange={e => setNewProvider({ ...newProvider, name: e.target.value })}
                                className="bg-black/30 border-white/10 text-white"
                                placeholder="e.g. BestSMM"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-white/60 mb-1 block">{t.apiUrl}</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <Input
                                    value={newProvider.url || ''}
                                    onChange={e => setNewProvider({ ...newProvider, url: e.target.value })}
                                    className="pl-10 bg-black/30 border-white/10 text-white"
                                    placeholder="https://provider.com/api/v2"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-white/60 mb-1 block">{t.apiKey}</label>
                            <Input
                                value={newProvider.apiKey || ''}
                                onChange={e => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                                className="bg-black/30 border-white/10 text-white"
                                placeholder="Generated API Key"
                                type="password"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsAdding(false)} className="text-white/60 hover:text-white">{t.cancel}</Button>
                        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white">{t.save}</Button>
                    </div>
                </Card>
            )}

            <div className="space-y-4">
                {providers.map((provider) => (
                    <Card key={provider.id} className="p-6 bg-white/5 border border-white/10 backdrop-blur-sm group hover:border-cyan-500/30 transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {provider.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{provider.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-white/50">
                                        <Link className="w-3 h-3" />
                                        <span className="font-mono">{provider.url}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-8">
                                <div className="text-right">
                                    <div className="text-xs text-white/40">{t.balance}</div>
                                    <div className="text-green-400 font-mono font-bold">{provider.balance}</div>
                                </div>

                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" className="text-white/40 hover:text-white hover:bg-white/10">
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => handleDelete(provider.id)} className="text-white/40 hover:text-red-400 hover:bg-red-500/10">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
