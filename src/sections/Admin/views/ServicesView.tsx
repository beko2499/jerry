import { useState } from 'react';
import {
    Folder,
    FileText,
    Plus,
    ChevronRight,
    Edit,
    Trash,
    Save,
    DollarSign
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';


// Types
interface Category {
    id: string;
    name: string;
    image?: string;
    subCategories: Category[];
    services: Service[];
}

interface Service {
    id: string;
    name: string;
    price: number;
    min: number;
    max: number;
    description: string;
    thumbnail?: string;
    providerId: string;
    providerLink?: string;
    autoId: string; // Read-only internal ID
}

export default function ServicesView() {
    const { t } = useLanguage();
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // Mock Data
    const [categories, setCategories] = useState<Category[]>([
        {
            id: 'cat1',
            name: 'Instagram Services',
            subCategories: [],
            services: [
                { id: 'srv1', name: 'Instagram Followers (HQ)', price: 0.50, min: 100, max: 10000, description: 'High quality followers', providerId: '1', autoId: '1001' }
            ]
        },
        {
            id: 'cat2',
            name: 'Telegram Services',
            subCategories: [
                { id: 'sub1', name: 'Telegram Members', subCategories: [], services: [] }
            ],
            services: []
        }
    ]);

    // UI State
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isAddingService, setIsAddingService] = useState(false);
    const [newCatName, setNewCatName] = useState('');



    const handleAddCategory = () => {
        if (!newCatName) return;
        const newCat: Category = {
            id: Date.now().toString(),
            name: newCatName,
            subCategories: [],
            services: []
        };

        if (selectedCategory) {
            // Add as sub-category
            // Note: For simplicity in this mock, this logic might need deep update recursion 
            // but here we just update topmost or selected for demo
            alert("Sub-category logic would go here in full implementation");
        } else {
            setCategories([...categories, newCat]);
        }
        setNewCatName('');
        setIsAddingCategory(false);
    };

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-space text-3xl text-white tracking-wide">{t.servicesCategories}</h2>
            </div>

            <div className="flex gap-6 h-[calc(100vh-200px)]">
                {/* Left Column: Categories Tree */}
                <Card className="w-1/3 bg-white/5 border border-white/10 backdrop-blur-md flex flex-col">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                        <span className="font-bold text-white">{t.servicesCategories}</span>
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedCategory(null); setIsAddingCategory(true); }}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {/* Add Category Input */}
                        {isAddingCategory && !selectedCategory && (
                            <div className="p-2 mb-2 flex gap-2 animate-in fade-in">
                                <Input
                                    value={newCatName}
                                    onChange={e => setNewCatName(e.target.value)}
                                    placeholder={t.categoryName}
                                    className="h-8 bg-black/40 border-white/20 text-white text-xs"
                                    autoFocus
                                />
                                <Button size="sm" className="h-8 w-8 p-0 bg-green-600" onClick={handleAddCategory}>
                                    <Save className="w-3 h-3" />
                                </Button>
                            </div>
                        )}

                        {categories.map(cat => (
                            <div
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat)}
                                className={`p-3 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${selectedCategory?.id === cat.id ? 'bg-cyan-500/20 border border-cyan-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Folder className={`w-4 h-4 ${selectedCategory?.id === cat.id ? 'text-cyan-400' : 'text-white/40'}`} />
                                    <span className={`text-sm ${selectedCategory?.id === cat.id ? 'text-white font-bold' : 'text-white/80'}`}>{cat.name}</span>
                                </div>
                                <ChevronRight className="w-3 h-3 text-white/20" />
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Right Column: Content (Services or Subcats) */}
                <Card className="flex-1 bg-white/5 border border-white/10 backdrop-blur-md flex flex-col overflow-hidden">
                    {selectedCategory ? (
                        <>
                            <div className="p-6 border-b border-white/10 bg-black/20">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-1">{selectedCategory.name}</h3>
                                        <p className="text-white/40 text-sm">ID: {selectedCategory.id} • {selectedCategory.services.length} {t.adminServices}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                                            {t.edit}
                                        </Button>
                                        <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-0 shadow-lg shadow-cyan-500/20" onClick={() => setIsAddingService(true)}>
                                            <Plus className="w-4 h-4 mr-2" /> {t.createService}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                {isAddingService && (
                                    <Card className="p-4 mb-6 bg-black/20 border border-dashed border-cyan-500/30 animate-in zoom-in-95">
                                        <h4 className="text-white font-bold mb-4">{t.createService}</h4>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="col-span-2">
                                                <label className="text-xs text-white/40 mb-1 block">{t.serviceName}</label>
                                                <Input className="bg-black/40 border-white/10 text-white" placeholder="e.g. 1000 Likes" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-white/40 mb-1 block">{t.amount} / 1000</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
                                                    <Input className="pl-8 bg-black/40 border-white/10 text-white" placeholder="0.00" type="number" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-white/40 mb-1 block">{t.minMax}</label>
                                                <div className="flex gap-2">
                                                    <Input className="bg-black/40 border-white/10 text-white" placeholder="Min" type="number" />
                                                    <Input className="bg-black/40 border-white/10 text-white" placeholder="Max" type="number" />
                                                </div>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs text-white/40 mb-1 block">{t.providerIntegration}</label>
                                                <div className="flex gap-2">
                                                    <Input className="flex-1 bg-black/40 border-white/10 text-white" placeholder="Provider ID" />
                                                    <Button variant="outline" className="border-white/10 text-white/60">{t.autoFetch}</Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => setIsAddingService(false)} className="text-white/60">{t.cancel}</Button>
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">{t.save}</Button>
                                        </div>
                                    </Card>
                                )}

                                <div className="space-y-3">
                                    {selectedCategory.services.length === 0 && !isAddingService && (
                                        <div className="text-center py-20 text-white/20">
                                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No services in this category yet.</p>
                                        </div>
                                    )}

                                    {selectedCategory.services.map(srv => (
                                        <div key={srv.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center text-white/40">
                                                    <span className="font-mono text-xs">#{srv.autoId}</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold">{srv.name}</h4>
                                                    <p className="text-white/40 text-xs">${srv.price} / 1000 • Min: {srv.min} - Max: {srv.max}</p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-white/40 hover:text-cyan-400">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-white/40 hover:text-red-400">
                                                    <Trash className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
                            <Folder className="w-16 h-16 mb-4 opacity-50" />
                            <p>Select a category to manage services</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
