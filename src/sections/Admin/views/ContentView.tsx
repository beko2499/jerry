import { useState, useEffect } from 'react';
import { FileText, Save, Plus, Trash2, Megaphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

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
    const { } = useLanguage();
    const [tab, setTab] = useState<'terms' | 'updates'>('terms');

    // Terms state
    const [termsSections, setTermsSections] = useState<TermSection[]>([
        { title: '', body: '' }
    ]);

    // Updates state
    const [updates, setUpdates] = useState<UpdateEntry[]>([]);

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Load terms
        fetch(`${API_URL}/settings/terms`)
            .then(r => r.json())
            .then(data => { if (data && Array.isArray(data)) setTermsSections(data); })
            .catch(console.error);

        // Load updates
        fetch(`${API_URL}/settings/updates`)
            .then(r => r.json())
            .then(data => { if (data && Array.isArray(data)) setUpdates(data); })
            .catch(console.error);
    }, []);

    const saveTerms = async () => {
        setSaving(true);
        await fetch(`${API_URL}/settings/terms`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: termsSections })
        });
        setSaving(false);
        alert('تم حفظ شروط الاستخدام!');
    };

    const saveUpdates = async () => {
        setSaving(true);
        await fetch(`${API_URL}/settings/updates`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: updates })
        });
        setSaving(false);
        alert('تم حفظ التحديثات!');
    };

    // Terms handlers
    const addSection = () => setTermsSections(prev => [...prev, { title: '', body: '' }]);
    const removeSection = (i: number) => setTermsSections(prev => prev.filter((_, idx) => idx !== i));
    const updateSection = (i: number, key: keyof TermSection, val: string) => {
        setTermsSections(prev => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s));
    };

    // Updates handlers
    const addUpdate = () => setUpdates(prev => [{ version: '', date: new Date().toISOString().split('T')[0], title: '', description: '', type: 'جديد' }, ...prev]);
    const removeUpdate = (i: number) => setUpdates(prev => prev.filter((_, idx) => idx !== i));
    const updateEntry = (i: number, key: keyof UpdateEntry, val: string) => {
        setUpdates(prev => prev.map((u, idx) => idx === i ? { ...u, [key]: val } : u));
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="font-space text-2xl md:text-3xl text-white tracking-wide">إدارة المحتوى</h2>
            </div>

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

            {/* Terms Tab */}
            {tab === 'terms' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-white/50 text-sm">أقسام شروط الاستخدام التي تظهر للمستخدم</p>
                        <div className="flex gap-2">
                            <Button onClick={addSection} size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white gap-1.5">
                                <Plus className="w-3.5 h-3.5" /> إضافة قسم
                            </Button>
                            <Button onClick={saveTerms} disabled={saving} size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
                                <Save className="w-3.5 h-3.5" /> حفظ
                            </Button>
                        </div>
                    </div>

                    {termsSections.map((section, i) => (
                        <Card key={i} className="p-4 bg-white/5 border border-white/10 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-white/40 text-xs font-mono">القسم {i + 1}</span>
                                {termsSections.length > 1 && (
                                    <button onClick={() => removeSection(i)} className="text-red-400 hover:text-red-300 p-1">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <Input
                                value={section.title}
                                onChange={e => updateSection(i, 'title', e.target.value)}
                                placeholder="عنوان القسم"
                                className="bg-black/30 border-white/10 text-white"
                            />
                            <textarea
                                value={section.body}
                                onChange={e => updateSection(i, 'body', e.target.value)}
                                placeholder="محتوى القسم..."
                                className="w-full h-24 p-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-cyan-500/50 resize-none"
                            />
                        </Card>
                    ))}
                </div>
            )}

            {/* Updates Tab */}
            {tab === 'updates' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-white/50 text-sm">قائمة التحديثات التي تظهر للمستخدم</p>
                        <div className="flex gap-2">
                            <Button onClick={addUpdate} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5">
                                <Plus className="w-3.5 h-3.5" /> إضافة تحديث
                            </Button>
                            <Button onClick={saveUpdates} disabled={saving} size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
                                <Save className="w-3.5 h-3.5" /> حفظ
                            </Button>
                        </div>
                    </div>

                    {updates.map((update, i) => (
                        <Card key={i} className="p-4 bg-white/5 border border-white/10 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-white/40 text-xs font-mono">{update.version || `تحديث ${i + 1}`}</span>
                                <button onClick={() => removeUpdate(i)} className="text-red-400 hover:text-red-300 p-1">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Input
                                    value={update.version}
                                    onChange={e => updateEntry(i, 'version', e.target.value)}
                                    placeholder="v2.6"
                                    className="bg-black/30 border-white/10 text-white"
                                />
                                <Input
                                    type="date"
                                    value={update.date}
                                    onChange={e => updateEntry(i, 'date', e.target.value)}
                                    className="bg-black/30 border-white/10 text-white"
                                />
                                <select
                                    value={update.type}
                                    onChange={e => updateEntry(i, 'type', e.target.value)}
                                    className="h-10 px-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm outline-none"
                                >
                                    <option value="جديد">جديد</option>
                                    <option value="تحسين">تحسين</option>
                                    <option value="إصلاح">إصلاح</option>
                                </select>
                            </div>
                            <Input
                                value={update.title}
                                onChange={e => updateEntry(i, 'title', e.target.value)}
                                placeholder="عنوان التحديث"
                                className="bg-black/30 border-white/10 text-white"
                            />
                            <textarea
                                value={update.description}
                                onChange={e => updateEntry(i, 'description', e.target.value)}
                                placeholder="وصف التحديث..."
                                className="w-full h-20 p-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-cyan-500/50 resize-none"
                            />
                        </Card>
                    ))}

                    {updates.length === 0 && (
                        <Card className="p-8 bg-white/5 border border-white/10 text-center">
                            <p className="text-white/40">لا توجد تحديثات. اضغط "إضافة تحديث" لإنشاء أول تحديث.</p>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
