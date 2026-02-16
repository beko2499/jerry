import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Settings, Save, Plus, Trash2, Upload, ArrowUpDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Gateway {
    _id: string;
    type: 'auto' | 'manual';
    name: string;
    nameAr: string;
    isEnabled: boolean;
    isConnected: boolean;
    destination: string;
    instructionText: string;
    instructionTextAr: string;
    image: string;
    accountNumber: string;
    contactType: 'whatsapp' | 'telegram' | '';
    contactValue: string;
    apiKey: string;
    apiSecret: string;
    mode: 'auto' | 'manual';
    sortOrder: number;
}

const emptyGateway: Partial<Gateway> = {
    type: 'manual',
    name: '',
    nameAr: '',
    destination: '',
    instructionText: '',
    instructionTextAr: '',
    image: '',
    accountNumber: '',
    contactType: '',
    contactValue: '',
    apiKey: '',
    apiSecret: '',
    mode: 'auto',
    isEnabled: false,
    isConnected: false,
    sortOrder: 0,
};

export default function GatewaysView() {
    const { t, lang } = useLanguage();
    const [gateways, setGateways] = useState<Gateway[]>([]);
    const [activeTab, setActiveTab] = useState<'auto' | 'manual'>('auto');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Gateway>>({});
    const [isAdding, setIsAdding] = useState(false);
    const [newGateway, setNewGateway] = useState<Partial<Gateway>>({ ...emptyGateway });
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        fetch(`${API_URL}/gateways`).then(r => r.json()).then(setGateways).catch(console.error);
    }, []);

    const autoGateways = gateways.filter(g => g.type === 'auto');
    const manualGateways = gateways.filter(g => g.type === 'manual');

    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        return data.url;
    };

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

    const toggleMode = async (id: string) => {
        const gw = gateways.find(g => g._id === id);
        if (!gw) return;
        const newMode = gw.mode === 'auto' ? 'manual' : 'auto';
        const res = await fetch(`${API_URL}/gateways/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: newMode })
        });
        const updated = await res.json();
        setGateways(prev => prev.map(g => g._id === id ? updated : g));
    };

    const startEdit = (gateway: Gateway) => {
        setEditingId(gateway._id);
        setEditForm({ ...gateway });
    };

    const saveEdit = async () => {
        if (!editingId) return;
        let imageUrl = editForm.image;
        if (imageFile) {
            imageUrl = await uploadImage(imageFile);
            setImageFile(null);
        }
        const res = await fetch(`${API_URL}/gateways/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...editForm, image: imageUrl })
        });
        const updated = await res.json();
        setGateways(prev => prev.map(g => g._id === editingId ? updated : g));
        setEditingId(null);
    };

    const handleAdd = async () => {
        let imageUrl = newGateway.image || '';
        if (imageFile) {
            imageUrl = await uploadImage(imageFile);
            setImageFile(null);
        }
        const payload = { ...newGateway, type: activeTab, image: imageUrl };
        if (activeTab === 'auto') payload.mode = 'auto';
        const res = await fetch(`${API_URL}/gateways`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const created = await res.json();
        setGateways(prev => [...prev, created]);
        setIsAdding(false);
        setNewGateway({ ...emptyGateway });
    };

    const handleDelete = async (id: string) => {
        await fetch(`${API_URL}/gateways/${id}`, { method: 'DELETE' });
        setGateways(prev => prev.filter(g => g._id !== id));
    };

    const currentGateways = activeTab === 'auto' ? autoGateways : manualGateways;

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="font-space text-2xl md:text-3xl text-white tracking-wide">{t.paymentGateways}</h2>
                <Button onClick={() => { setIsAdding(true); setNewGateway({ ...emptyGateway, type: activeTab }); }} className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-700 text-white gap-2">
                    <Plus className="w-4 h-4" /> {t.addGateway}
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
                <button
                    onClick={() => setActiveTab('auto')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'auto' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                    ⚡ {t.autoGateways}
                </button>
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'manual' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                    ✋ {t.manualGateways}
                </button>
            </div>

            {/* Add New Form */}
            {isAdding && (
                <Card className="p-6 bg-white/5 border border-cyan-500/20 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-white font-bold text-lg">{t.addGateway} — {activeTab === 'auto' ? t.automatic : t.manual}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-white/60 text-xs mb-1">{t.gatewayName}</label>
                            <Input value={newGateway.name || ''} onChange={e => setNewGateway(p => ({ ...p, name: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                        </div>
                        <div>
                            <label className="block text-white/60 text-xs mb-1">{t.gatewayNameAr}</label>
                            <Input dir="rtl" value={newGateway.nameAr || ''} onChange={e => setNewGateway(p => ({ ...p, nameAr: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                        </div>
                        <div>
                            <label className="block text-white/60 text-xs mb-1">{t.gatewayImage}</label>
                            <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="bg-black/30 border-white/10 text-white" />
                        </div>

                        {activeTab === 'manual' && (
                            <>
                                <div>
                                    <label className="block text-white/60 text-xs mb-1">{t.accountNumber}</label>
                                    <Input value={newGateway.accountNumber || ''} onChange={e => setNewGateway(p => ({ ...p, accountNumber: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                                </div>
                                <div>
                                    <label className="block text-white/60 text-xs mb-1">{t.contactType}</label>
                                    <select
                                        value={newGateway.contactType || ''}
                                        onChange={e => setNewGateway(p => ({ ...p, contactType: e.target.value as Gateway['contactType'] }))}
                                        className="w-full h-10 px-3 rounded-md bg-black/30 border border-white/10 text-white text-sm"
                                    >
                                        <option value="">—</option>
                                        <option value="whatsapp">{t.whatsapp}</option>
                                        <option value="telegram">{t.telegram}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-white/60 text-xs mb-1">{t.contactValue}</label>
                                    <Input value={newGateway.contactValue || ''} onChange={e => setNewGateway(p => ({ ...p, contactValue: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-white/60 text-xs mb-1">{t.paymentInstructions}</label>
                                    <Input value={newGateway.instructionText || ''} onChange={e => setNewGateway(p => ({ ...p, instructionText: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-white/60 text-xs mb-1">{t.paymentInstructions} ({t.gatewayNameAr})</label>
                                    <Input dir="rtl" value={newGateway.instructionTextAr || ''} onChange={e => setNewGateway(p => ({ ...p, instructionTextAr: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                                </div>
                            </>
                        )}

                        {activeTab === 'auto' && (
                            <>
                                <div>
                                    <label className="block text-white/60 text-xs mb-1">API Key</label>
                                    <Input value={newGateway.apiKey || ''} onChange={e => setNewGateway(p => ({ ...p, apiKey: e.target.value }))} className="bg-black/30 border-white/10 text-white font-mono text-xs" />
                                </div>
                                <div>
                                    <label className="block text-white/60 text-xs mb-1">API Secret</label>
                                    <Input type="password" value={newGateway.apiSecret || ''} onChange={e => setNewGateway(p => ({ ...p, apiSecret: e.target.value }))} className="bg-black/30 border-white/10 text-white font-mono text-xs" />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700 text-white gap-2"><Save className="w-4 h-4" /> {t.saveChanges}</Button>
                        <Button variant="ghost" onClick={() => setIsAdding(false)} className="text-white/60">{t.cancel}</Button>
                    </div>
                </Card>
            )}

            {/* Gateway Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {currentGateways.map(gateway => (
                    <Card key={gateway._id} className={`p-4 md:p-6 bg-white/5 border transition-all ${gateway.isEnabled ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-white/10'}`}>
                        {editingId === gateway._id ? (
                            /* Edit Mode */
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-white/60 text-xs mb-1">{t.gatewayName}</label>
                                        <Input value={editForm.name || ''} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-white/60 text-xs mb-1">{t.gatewayNameAr}</label>
                                        <Input dir="rtl" value={editForm.nameAr || ''} onChange={e => setEditForm(p => ({ ...p, nameAr: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-white/60 text-xs mb-1">{t.gatewayImage}</label>
                                        <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="bg-black/30 border-white/10 text-white" />
                                    </div>

                                    {gateway.type === 'manual' && (
                                        <>
                                            <div>
                                                <label className="block text-white/60 text-xs mb-1">{t.accountNumber}</label>
                                                <Input value={editForm.accountNumber || ''} onChange={e => setEditForm(p => ({ ...p, accountNumber: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                                            </div>
                                            <div>
                                                <label className="block text-white/60 text-xs mb-1">{t.contactType}</label>
                                                <select value={editForm.contactType || ''} onChange={e => setEditForm(p => ({ ...p, contactType: e.target.value as Gateway['contactType'] }))} className="w-full h-10 px-3 rounded-md bg-black/30 border border-white/10 text-white text-sm">
                                                    <option value="">—</option>
                                                    <option value="whatsapp">{t.whatsapp}</option>
                                                    <option value="telegram">{t.telegram}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-white/60 text-xs mb-1">{t.contactValue}</label>
                                                <Input value={editForm.contactValue || ''} onChange={e => setEditForm(p => ({ ...p, contactValue: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-white/60 text-xs mb-1">{t.paymentInstructions}</label>
                                                <Input value={editForm.instructionText || ''} onChange={e => setEditForm(p => ({ ...p, instructionText: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                                            </div>
                                        </>
                                    )}

                                    {gateway.type === 'auto' && (
                                        <>
                                            <div>
                                                <label className="block text-white/60 text-xs mb-1">API Key</label>
                                                <Input value={editForm.apiKey || ''} onChange={e => setEditForm(p => ({ ...p, apiKey: e.target.value }))} className="bg-black/30 border-white/10 text-white font-mono text-xs" />
                                            </div>
                                            <div>
                                                <label className="block text-white/60 text-xs mb-1">API Secret</label>
                                                <Input type="password" value={editForm.apiSecret || ''} onChange={e => setEditForm(p => ({ ...p, apiSecret: e.target.value }))} className="bg-black/30 border-white/10 text-white font-mono text-xs" />
                                            </div>
                                            <div>
                                                <label className="block text-white/60 text-xs mb-1">{t.destination}</label>
                                                <Input value={editForm.destination || ''} onChange={e => setEditForm(p => ({ ...p, destination: e.target.value }))} className="bg-black/30 border-white/10 text-white" />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={saveEdit} size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1"><Save className="w-3 h-3" /> {t.saveChanges}</Button>
                                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="text-white/60">{t.cancel}</Button>
                                </div>
                            </div>
                        ) : (
                            /* View Mode */
                            <>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        {gateway.image && <img src={gateway.image} alt={gateway.name} className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1" />}
                                        <div>
                                            <h3 className="text-white font-bold text-sm md:text-lg">
                                                {lang === 'ar' && gateway.nameAr ? gateway.nameAr : gateway.name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                {gateway.type === 'auto' && (
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${gateway.mode === 'auto' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                                                        {gateway.mode === 'auto' ? '⚡ ' + t.automatic : '✋ ' + t.manual}
                                                    </span>
                                                )}
                                                {gateway.isEnabled
                                                    ? <><CheckCircle className="w-3 h-3 text-green-400" /><span className="text-green-400 text-xs">{t.active}</span></>
                                                    : <><XCircle className="w-3 h-3 text-red-400" /><span className="text-red-400 text-xs">{t.inactive}</span></>}
                                            </div>
                                        </div>
                                    </div>
                                    <Switch checked={gateway.isEnabled} onCheckedChange={() => toggleGateway(gateway._id)} />
                                </div>

                                {/* Details */}
                                <div className="space-y-1.5 mb-3">
                                    {gateway.type === 'manual' && gateway.accountNumber && (
                                        <p className="text-white/60 text-xs">💳 {t.accountNumber}: <span className="text-white/90 font-mono">{gateway.accountNumber}</span></p>
                                    )}
                                    {gateway.type === 'manual' && gateway.contactType && (
                                        <p className="text-white/60 text-xs">
                                            {gateway.contactType === 'whatsapp' ? '📱' : '✈️'} {gateway.contactType === 'whatsapp' ? t.whatsapp : t.telegram}: <span className="text-white/90">{gateway.contactValue}</span>
                                        </p>
                                    )}
                                    {gateway.instructionText && (
                                        <p className="text-white/40 text-xs">📋 {lang === 'ar' && gateway.instructionTextAr ? gateway.instructionTextAr : gateway.instructionText}</p>
                                    )}
                                    {gateway.type === 'auto' && gateway.destination && (
                                        <p className="text-white/60 text-xs">📍 {gateway.destination}</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Button variant="ghost" size="sm" onClick={() => startEdit(gateway)} className="text-cyan-400 hover:bg-cyan-500/10 gap-1">
                                        <Settings className="w-3 h-3" /> {t.configure}
                                    </Button>
                                    {gateway.type === 'auto' && (
                                        <Button variant="ghost" size="sm" onClick={() => toggleMode(gateway._id)} className="text-yellow-400 hover:bg-yellow-500/10 gap-1">
                                            <ArrowUpDown className="w-3 h-3" /> {gateway.mode === 'auto' ? t.switchToManual : t.switchToAuto}
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(gateway._id)} className="text-red-400 hover:bg-red-500/10 gap-1">
                                        <Trash2 className="w-3 h-3" /> {t.delete}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Card>
                ))}
            </div>

            {currentGateways.length === 0 && !isAdding && (
                <div className="text-center py-12 text-white/40">
                    <p className="text-4xl mb-3">{activeTab === 'auto' ? '⚡' : '✋'}</p>
                    <p className="text-lg">{t.noGateways}</p>
                    <p className="text-sm mt-1">{t.addGateway}</p>
                </div>
            )}
        </div>
    );
}
