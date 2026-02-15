import { useState } from 'react';
import { CheckCircle, XCircle, Settings, Save, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';

interface Gateway {
    id: string;
    name: string;
    isEnabled: boolean;
    isConnected: boolean;
    destination: string;
    instructionText: string;
    image: string;
}

export default function GatewaysView() {
    const { t } = useLanguage();

    // Mock Data
    const [gateways, setGateways] = useState<Gateway[]>([
        {
            id: 'zain-cash',
            name: 'Zain Cash',
            isEnabled: true,
            isConnected: true,
            destination: '07800000000',
            instructionText: 'Please transfer the amount to the number above and send a screenshot.',
            image: '/zaincash.jpg'
        },
        {
            id: 'asiacell',
            name: 'AsiaCell',
            isEnabled: true,
            isConnected: true,
            destination: '07700000000',
            instructionText: 'Auto-payment integration active.',
            image: '/asiacell.webp'
        },
        {
            id: 'usdt',
            name: 'USDT (TRC20)',
            isEnabled: false,
            isConnected: false,
            destination: 'TVxxxxxxxxxxxxxxxxxxxxxx',
            instructionText: 'Send exact amount to the address.',
            image: '/usdt.png'
        }
    ]);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Gateway>>({});

    const toggleGateway = (id: string) => {
        setGateways(gateways.map(g => g.id === id ? { ...g, isEnabled: !g.isEnabled } : g));
    };

    const startEdit = (gateway: Gateway) => {
        setEditingId(gateway.id);
        setEditForm(gateway);
    };

    const saveEdit = () => {
        if (editingId) {
            setGateways(gateways.map(g => g.id === editingId ? { ...g, ...editForm } : g));
            setEditingId(null);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="font-space text-2xl md:text-3xl text-white tracking-wide">{t.paymentGateways}</h2>
                <Button className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20">
                    <Plus className="w-4 h-4 mr-2" />
                    <span>{t.addNewGateway}</span>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {gateways.map((gateway) => (
                    <Card key={gateway.id} className={`p-4 md:p-6 border transition-all ${gateway.isEnabled ? 'bg-white/5 border-white/10' : 'bg-white/5 border-red-500/20 opacity-70'} backdrop-blur-sm`}>
                        {editingId === gateway.id ? (
                            // Edit Mode
                            <div className="space-y-4 animate-in fade-in">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-white">{gateway.name}</h3>
                                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="text-white/60">{t.cancel}</Button>
                                </div>

                                <div>
                                    <label className="text-sm text-white/60 mb-1 block">{t.destination}</label>
                                    <Input
                                        value={editForm.destination}
                                        onChange={e => setEditForm({ ...editForm, destination: e.target.value })}
                                        className="bg-black/30 border-white/10 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-white/60 mb-1 block">{t.instructionText}</label>
                                    <textarea
                                        value={editForm.instructionText}
                                        onChange={e => setEditForm({ ...editForm, instructionText: e.target.value })}
                                        className="w-full h-24 p-3 bg-black/30 border border-white/10 rounded-xl text-white focus:border-red-500/50 outline-none resize-none"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={editForm.isConnected}
                                            onCheckedChange={(c) => setEditForm({ ...editForm, isConnected: c })}
                                        />
                                        <span className="text-sm text-white/80">{t.apiConnected}</span>
                                    </div>
                                    <Button onClick={saveEdit} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                                        <Save className="w-4 h-4" /> {t.save}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white/10 p-2 border border-white/5 shrink-0">
                                            <img src={gateway.image} alt={gateway.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg md:text-xl font-bold text-white">{gateway.name}</h3>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                {gateway.isConnected ? (
                                                    <span className="flex items-center gap-1 text-[10px] md:text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                                                        <CheckCircle className="w-3 h-3" /> Connected
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[10px] md:text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                                                        <XCircle className="w-3 h-3" /> Offline
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={gateway.isEnabled}
                                            onChange={() => toggleGateway(gateway.id)}
                                        />
                                        <div className="w-14 h-8 bg-black/40 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white/50 after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600/20 peer-checked:border-green-500/50 border border-white/10 peer-checked:after:bg-green-500 hover:border-white/30 transition-all shadow-inner"></div>
                                        <span className="absolute left-2 text-[10px] font-bold text-white/20 peer-checked:opacity-0 transition-opacity">OFF</span>
                                        <span className="absolute right-2 text-[10px] font-bold text-green-400 opacity-0 peer-checked:opacity-100 transition-opacity">ON</span>
                                    </label>
                                </div>

                                <div className="p-3 md:p-4 rounded-xl bg-black/20 border border-white/5 space-y-2">
                                    <div className="flex flex-col md:flex-row md:justify-between text-sm gap-1">
                                        <span className="text-white/40">Destination:</span>
                                        <span className="text-white font-mono break-all">{gateway.destination}</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-white/40 block mb-1">Cliché:</span>
                                        <p className="text-white/80 italic text-sm line-clamp-2">"{gateway.instructionText}"</p>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => startEdit(gateway)}
                                    className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
                                >
                                    <Settings className="w-4 h-4 mr-2" /> {t.configure}
                                </Button>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
