import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Settings, Save, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Gateway {
    _id: string;
    name: string;
    isEnabled: boolean;
    isConnected: boolean;
    destination: string;
    instructionText: string;
    image: string;
}

export default function GatewaysView() {
    const { t } = useLanguage();
    const [gateways, setGateways] = useState<Gateway[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Gateway>>({});
    const [isAdding, setIsAdding] = useState(false);
    const [newGateway, setNewGateway] = useState<Partial<Gateway>>({ name: '', destination: '', instructionText: '', image: '', isEnabled: false, isConnected: false });

    useEffect(() => {
        fetch(`${API_URL}/gateways`).then(r => r.json()).then(setGateways).catch(console.error);
    }, []);

    const toggleGateway = async (id: string) => {
        const gw = gateways.find(g => g._id === id);
        if (!gw) return;
        const res = await fetch(`${API_URL}/gateways/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isEnabled: !gw.isEnabled })
        });
        const updated = await res.json();
        setGateways(prev => prev.map(g => g._id === id ? updated : g));
    };

    const startEdit = (gateway: Gateway) => {
        setEditingId(gateway._id);
        setEditForm({ destination: gateway.destination, instructionText: gateway.instructionText, image: gateway.image });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        const res = await fetch(`${API_URL}/gateways/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm)
        });
        const updated = await res.json();
        setGateways(prev => prev.map(g => g._id === editingId ? updated : g));
        setEditingId(null);
    };

    const handleAdd = async () => {
        const res = await fetch(`${API_URL}/gateways`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newGateway)
        });
        const created = await res.json();
        setGateways(prev => [...prev, created]);
        setIsAdding(false);
        setNewGateway({ name: '', destination: '', instructionText: '', image: '', isEnabled: false, isConnected: false });
    };

    const handleDelete = async (id: string) => {
        await fetch(`${API_URL}/gateways/${id}`, { method: 'DELETE' });
        setGateways(prev => prev.filter(g => g._id !== id));
    };

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="font-space text-2xl md:text-3xl text-white tracking-wide">{t.paymentGateways}</h2>
                <Button onClick={() => setIsAdding(true)} className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-700 text-white gap-2">
                    <Plus className="w-4 h-4" /> {t.addNew}
                </Button>
            </div>

            {/* Add New Form */}
            {isAdding && (
                <Card className="p-6 bg-white/5 border border-white/10 space-y-4">
                    <h3 className="text-white font-bold">{t.addNew} Gateway</h3>
                    <Input placeholder="Name" value={newGateway.name || ''} onChange={e => setNewGateway(p => ({ ...p, name: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                    <Input placeholder="Destination" value={newGateway.destination || ''} onChange={e => setNewGateway(p => ({ ...p, destination: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                    <Input placeholder="Instructions" value={newGateway.instructionText || ''} onChange={e => setNewGateway(p => ({ ...p, instructionText: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                    <Input placeholder="Image URL" value={newGateway.image || ''} onChange={e => setNewGateway(p => ({ ...p, image: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                    <div className="flex gap-2">
                        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white gap-2"><Save className="w-4 h-4" /> {t.saveChanges}</Button>
                        <Button variant="ghost" onClick={() => setIsAdding(false)} className="text-white/60">{t.cancel}</Button>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {gateways.map(gateway => (
                    <Card key={gateway._id} className={`p-4 md:p-6 bg-white/5 border transition-all ${gateway.isEnabled ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-white/10'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {gateway.image && <img src={gateway.image} alt={gateway.name} className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1" />}
                                <div>
                                    <h3 className="text-white font-bold text-sm md:text-lg">{gateway.name}</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {gateway.isConnected
                                            ? <><CheckCircle className="w-3 h-3 text-green-400" /><span className="text-green-400 text-xs">{t.connected}</span></>
                                            : <><XCircle className="w-3 h-3 text-red-400" /><span className="text-red-400 text-xs">{t.disconnected}</span></>}
                                    </div>
                                </div>
                            </div>
                            <Switch checked={gateway.isEnabled} onCheckedChange={() => toggleGateway(gateway._id)} />
                        </div>

                        {editingId === gateway._id ? (
                            <div className="space-y-3">
                                <Input value={editForm.destination || ''} onChange={e => setEditForm(p => ({ ...p, destination: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                                <Input value={editForm.instructionText || ''} onChange={e => setEditForm(p => ({ ...p, instructionText: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                                <div className="flex gap-2">
                                    <Button onClick={saveEdit} size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1"><Save className="w-3 h-3" /> {t.saveChanges}</Button>
                                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="text-white/60">{t.cancel}</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-white/60 text-xs md:text-sm">📍 {gateway.destination}</p>
                                <p className="text-white/40 text-xs">{gateway.instructionText}</p>
                                <div className="flex gap-2 mt-3">
                                    <Button variant="ghost" size="sm" onClick={() => startEdit(gateway)} className="text-cyan-400 hover:bg-cyan-500/10 gap-1">
                                        <Settings className="w-3 h-3" /> {t.configure}
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(gateway._id)} className="text-red-400 hover:bg-red-500/10">
                                        {t.delete}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {gateways.length === 0 && !isAdding && (
                <div className="text-center py-12 text-white/40">
                    <p className="text-lg">No gateways configured yet</p>
                    <p className="text-sm mt-1">Click "Add New" to add a payment gateway</p>
                </div>
            )}
        </div>
    );
}
