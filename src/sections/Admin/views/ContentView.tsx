import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Megaphone, Pencil, X, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface TermSection {
    title: string;
    body: string;
}

interface UpdateEntry {
    version: string;
    date: string;
    title: string;
    description: string;
    type: string;
}

export default function ContentView() {
    const [tab, setTab] = useState<'terms' | 'updates'>('terms');

    // Terms state
    const [termsSections, setTermsSections] = useState<TermSection[]>([]);
    const [termForm, setTermForm] = useState<TermSection>({ title: '', body: '' });
    const [editingTermIdx, setEditingTermIdx] = useState<number | null>(null);

    // Updates state
    const [updates, setUpdates] = useState<UpdateEntry[]>([]);
    const [updateForm, setUpdateForm] = useState<UpdateEntry>({ version: '', date: new Date().toISOString().split('T')[0], title: '', description: '', type: 'جديد' });
    const [editingUpdateIdx, setEditingUpdateIdx] = useState<number | null>(null);

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/settings/terms`)
            .then(r => r.json())
            .then(data => { if (data && Array.isArray(data)) setTermsSections(data); })
            .catch(console.error);

        fetch(`${API_URL}/settings/updates`)
            .then(r => r.json())
            .then(data => { if (data && Array.isArray(data)) setUpdates(data); })
            .catch(console.error);
    }, []);

    // --- Terms ---
    const saveTermsToDB = async (sections: TermSection[]) => {
        setSaving(true);
        await fetch(`${API_URL}/settings/terms`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: sections })
        });
        setSaving(false);
    };

    const addTerm = async () => {
        if (!termForm.title.trim() || !termForm.body.trim()) return;
        const newSections = [...termsSections, termForm];
        setTermsSections(newSections);
        setTermForm({ title: '', body: '' });
        await saveTermsToDB(newSections);
    };

    const startEditTerm = (i: number) => {
        setEditingTermIdx(i);
        setTermForm({ ...termsSections[i] });
    };

    const saveEditTerm = async () => {
        if (editingTermIdx === null) return;
        const newSections = termsSections.map((s, idx) => idx === editingTermIdx ? termForm : s);
        setTermsSections(newSections);
        setEditingTermIdx(null);
        setTermForm({ title: '', body: '' });
        await saveTermsToDB(newSections);
    };

    const cancelEditTerm = () => {
        setEditingTermIdx(null);
        setTermForm({ title: '', body: '' });
    };

    const removeTerm = async (i: number) => {
        const newSections = termsSections.filter((_, idx) => idx !== i);
        setTermsSections(newSections);
        await saveTermsToDB(newSections);
    };

    // --- Updates ---
    const saveUpdatesToDB = async (entries: UpdateEntry[]) => {
        setSaving(true);
        await fetch(`${API_URL}/settings/updates`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: entries })
        });
        setSaving(false);
    };

    const addUpdateEntry = async () => {
        if (!updateForm.title.trim()) return;
        const newUpdates = [updateForm, ...updates];
        setUpdates(newUpdates);
        setUpdateForm({ version: '', date: new Date().toISOString().split('T')[0], title: '', description: '', type: 'جديد' });
        await saveUpdatesToDB(newUpdates);
    };

    const startEditUpdate = (i: number) => {
        setEditingUpdateIdx(i);
        setUpdateForm({ ...updates[i] });
    };

    const saveEditUpdate = async () => {
        if (editingUpdateIdx === null) return;
        const newUpdates = updates.map((u, idx) => idx === editingUpdateIdx ? updateForm : u);
        setUpdates(newUpdates);
        setEditingUpdateIdx(null);
        setUpdateForm({ version: '', date: new Date().toISOString().split('T')[0], title: '', description: '', type: 'جديد' });
        await saveUpdatesToDB(newUpdates);
    };

    const cancelEditUpdate = () => {
        setEditingUpdateIdx(null);
        setUpdateForm({ version: '', date: new Date().toISOString().split('T')[0], title: '', description: '', type: 'جديد' });
    };

    const removeUpdate = async (i: number) => {
        const newUpdates = updates.filter((_, idx) => idx !== i);
        setUpdates(newUpdates);
        await saveUpdatesToDB(newUpdates);
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <h2 className="font-space text-2xl md:text-3xl text-white tracking-wide">إدارة المحتوى</h2>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setTab('terms')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'terms' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'}`}
                >
                    <FileText className="w-4 h-4 inline mr-1.5" /> شروط الاستخدام
                </button>
                <button
                    onClick={() => setTab('updates')}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'updates' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'}`}
                >
                    <Megaphone className="w-4 h-4 inline mr-1.5" /> التحديثات
                </button>
            </div>

            {/* ===================== TERMS TAB ===================== */}
            {tab === 'terms' && (
                <div className="space-y-4">
                    {/* Input Form */}
                    <Card className="p-4 bg-cyan-500/5 border border-cyan-500/20 space-y-3">
                        <h3 className="text-white font-bold text-sm">{editingTermIdx !== null ? '✏️ تعديل القسم' : '➕ إضافة قسم جديد'}</h3>
                        <Input
                            value={termForm.title}
                            onChange={e => setTermForm(p => ({ ...p, title: e.target.value }))}
                            placeholder="عنوان القسم"
                            className="bg-black/30 border-white/10 text-white"
                        />
                        <textarea
                            value={termForm.body}
                            onChange={e => setTermForm(p => ({ ...p, body: e.target.value }))}
                            placeholder="محتوى القسم..."
                            className="w-full h-24 p-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-cyan-500/50 resize-none"
                        />
                        <div className="flex gap-2">
                            {editingTermIdx !== null ? (
                                <>
                                    <Button onClick={saveEditTerm} disabled={saving} size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
                                        <Check className="w-3.5 h-3.5" /> حفظ التعديل
                                    </Button>
                                    <Button onClick={cancelEditTerm} size="sm" variant="outline" className="border-white/20 text-white/60 gap-1.5">
                                        <X className="w-3.5 h-3.5" /> إلغاء
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={addTerm} disabled={saving || !termForm.title.trim()} size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white gap-1.5">
                                    <Plus className="w-3.5 h-3.5" /> إضافة
                                </Button>
                            )}
                        </div>
                    </Card>

                    {/* Saved Cards */}
                    {termsSections.map((section, i) => (
                        <Card key={i} className="p-4 bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <span className="text-white/30 text-[10px] font-mono">القسم {i + 1}</span>
                                    <h4 className="text-white font-bold text-sm">{section.title}</h4>
                                    <p className="text-white/50 text-xs mt-1 leading-relaxed">{section.body}</p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => startEditTerm(i)} className="text-cyan-400/60 hover:text-cyan-400 p-1.5 transition-colors">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => removeTerm(i)} className="text-red-400/60 hover:text-red-400 p-1.5 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {termsSections.length === 0 && (
                        <Card className="p-8 bg-white/5 border border-white/10 text-center">
                            <p className="text-white/40 text-sm">لا توجد أقسام. أضف قسم جديد من الأعلى.</p>
                        </Card>
                    )}
                </div>
            )}

            {/* ===================== UPDATES TAB ===================== */}
            {tab === 'updates' && (
                <div className="space-y-4">
                    {/* Input Form */}
                    <Card className="p-4 bg-purple-500/5 border border-purple-500/20 space-y-3">
                        <h3 className="text-white font-bold text-sm">{editingUpdateIdx !== null ? '✏️ تعديل التحديث' : '➕ إضافة تحديث جديد'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <Input
                                value={updateForm.version}
                                onChange={e => setUpdateForm(p => ({ ...p, version: e.target.value }))}
                                placeholder="v2.6"
                                className="bg-black/30 border-white/10 text-white"
                            />
                            <Input
                                type="date"
                                value={updateForm.date}
                                onChange={e => setUpdateForm(p => ({ ...p, date: e.target.value }))}
                                className="bg-black/30 border-white/10 text-white"
                            />
                            <select
                                value={updateForm.type}
                                onChange={e => setUpdateForm(p => ({ ...p, type: e.target.value }))}
                                className="h-10 px-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm outline-none"
                            >
                                <option value="جديد">جديد</option>
                                <option value="تحسين">تحسين</option>
                                <option value="إصلاح">إصلاح</option>
                            </select>
                        </div>
                        <Input
                            value={updateForm.title}
                            onChange={e => setUpdateForm(p => ({ ...p, title: e.target.value }))}
                            placeholder="عنوان التحديث"
                            className="bg-black/30 border-white/10 text-white"
                        />
                        <textarea
                            value={updateForm.description}
                            onChange={e => setUpdateForm(p => ({ ...p, description: e.target.value }))}
                            placeholder="وصف التحديث..."
                            className="w-full h-20 p-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-cyan-500/50 resize-none"
                        />
                        <div className="flex gap-2">
                            {editingUpdateIdx !== null ? (
                                <>
                                    <Button onClick={saveEditUpdate} disabled={saving} size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
                                        <Check className="w-3.5 h-3.5" /> حفظ التعديل
                                    </Button>
                                    <Button onClick={cancelEditUpdate} size="sm" variant="outline" className="border-white/20 text-white/60 gap-1.5">
                                        <X className="w-3.5 h-3.5" /> إلغاء
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={addUpdateEntry} disabled={saving || !updateForm.title.trim()} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5">
                                    <Plus className="w-3.5 h-3.5" /> إضافة
                                </Button>
                            )}
                        </div>
                    </Card>

                    {/* Saved Cards */}
                    {updates.map((update, i) => (
                        <Card key={i} className="p-4 bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {update.version && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">{update.version}</span>}
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${update.type === 'جديد' ? 'bg-green-500/20 text-green-400 border-green-500/30' : update.type === 'إصلاح' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>{update.type}</span>
                                        <span className="text-white/20 text-[10px] font-mono">{update.date}</span>
                                    </div>
                                    <h4 className="text-white font-bold text-sm">{update.title}</h4>
                                    {update.description && <p className="text-white/50 text-xs mt-1 leading-relaxed">{update.description}</p>}
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => startEditUpdate(i)} className="text-purple-400/60 hover:text-purple-400 p-1.5 transition-colors">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => removeUpdate(i)} className="text-red-400/60 hover:text-red-400 p-1.5 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {updates.length === 0 && (
                        <Card className="p-8 bg-white/5 border border-white/10 text-center">
                            <p className="text-white/40 text-sm">لا توجد تحديثات. أضف تحديث جديد من الأعلى.</p>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
