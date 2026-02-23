import { useState, useEffect, useRef } from 'react';
import {
    Folder,
    FileText,
    Plus,
    ChevronRight,
    ChevronLeft,
    Clock,
    TrendingDown,
    ShieldCheck,
    Zap,
    DollarSign,
    Trash,
    Pencil,
    Upload,
    X,
    ImageIcon,
    Lock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

const BACKEND_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

import { adminFetch, API_URL } from '@/lib/api';
import { $price } from '@/lib/formatPrice';

interface Category {
    _id: string;
    nameKey: string;
    name: string;
    image?: string;
    parentId: string | null;
    order: number;
}

interface Service {
    _id: string;
    categoryId: string;
    name: string;
    price: number;
    min: number;
    max: number;
    description: string;
    providerId: string;
    autoId: string;
    speed?: string;
    dropRate?: string;
    guarantee?: string;
    startTime?: string;
}

export default function ServicesView() {
    const { t, isRTL } = useLanguage();

    // Navigation: stack of category IDs
    const [pathStack, setPathStack] = useState<{ id: string; name: string }[]>([]);
    const currentParentId = pathStack.length > 0 ? pathStack[pathStack.length - 1].id : null;

    // Data
    const [subCategories, setSubCategories] = useState<Category[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [providers, setProviders] = useState<{ _id: string; name: string }[]>([]);

    // UI State
    const [isAddingFolder, setIsAddingFolder] = useState(false);
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [isAddingFile, setIsAddingFile] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderImage, setNewFolderImage] = useState('');
    const [uploading, setUploading] = useState(false);
    const folderImageRef = useRef<HTMLInputElement>(null);
    const [newService, setNewService] = useState<Partial<Service>>({
        name: '', price: 0, min: 100, max: 1000, description: '',
        providerId: '', autoId: '', speed: '', dropRate: '', guarantee: '', startTime: ''
    });

    // Image upload handler
    const handleImageUpload = async (file: File, onUrl: (url: string) => void) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await adminFetch(`/upload`, { method: 'POST', body: formData });
            const data = await res.json();
            if (data.url) onUrl(data.url);
        } catch (err) { console.error(err); }
        setUploading(false);
    };

    const getImageFullUrl = (img: string) => {
        if (!img) return '';
        if (img.startsWith('http')) return img;
        return `${BACKEND_URL}${img}`;
    };

    // Fetch data when navigation changes
    useEffect(() => {
        const fetchData = async () => {
            try {
                const catUrl = currentParentId
                    ? `${API_URL}/categories?parentId=${currentParentId}`
                    : `${API_URL}/categories?root=true`;
                const cats = await fetch(catUrl).then(r => r.json());
                setSubCategories(cats);

                if (currentParentId) {
                    const svcs = await adminFetch(`/services?categoryId=${currentParentId}`).then(r => r.json());
                    setServices(svcs);
                } else {
                    setServices([]);
                }
            } catch (err) { console.error(err); }
        };
        fetchData();
    }, [currentParentId]);

    // Fetch providers once
    useEffect(() => {
        adminFetch(`/providers`).then(r => r.json()).then(setProviders).catch(console.error);
    }, []);

    // Helpers
    const getCategoryName = (cat: Category) => {
        return (t as any)[cat.nameKey] || cat.name || cat.nameKey;
    };

    const Chevron = isRTL ? ChevronLeft : ChevronRight;

    // Navigation
    const handleOpenFolder = (cat: Category) => {
        setPathStack([...pathStack, { id: cat._id, name: getCategoryName(cat) }]);
    };

    const handleBreadcrumbClick = (index: number) => {
        setPathStack(pathStack.slice(0, index + 1));
    };

    const handleGoRoot = () => setPathStack([]);

    // Folder CRUD
    const handleCreateFolder = async () => {
        if (!newFolderName) return;

        if (editingFolderId) {
            const res = await adminFetch(`/categories/${editingFolderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newFolderName, nameKey: newFolderName, image: newFolderImage })
            });
            const updated = await res.json();
            setSubCategories(prev => prev.map(c => c._id === editingFolderId ? updated : c));
            setEditingFolderId(null);
        } else {
            const res = await adminFetch(`/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newFolderName, nameKey: newFolderName,
                    image: newFolderImage, parentId: currentParentId
                })
            });
            const created = await res.json();
            setSubCategories(prev => [...prev, created]);
        }

        setIsAddingFolder(false);
        setNewFolderName('');
        setNewFolderImage('');
    };

    const handleDeleteFolder = async (e: React.MouseEvent, folderId: string) => {
        e.stopPropagation();
        if (!window.confirm(t.confirmDelete)) return;
        await adminFetch(`/categories/${folderId}`, { method: 'DELETE' });
        setSubCategories(prev => prev.filter(c => c._id !== folderId));
    };

    const startEditFolder = (e: React.MouseEvent, cat: Category) => {
        e.stopPropagation();
        setEditingFolderId(cat._id);
        setNewFolderName(cat.name || cat.nameKey);
        setNewFolderImage(cat.image || '');
        setIsAddingFolder(true);
    };

    // Service CRUD
    const handleCreateService = async () => {
        if (!newService.name || !currentParentId) return;

        if (editingServiceId) {
            const res = await adminFetch(`/services/${editingServiceId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newService)
            });
            const updated = await res.json();
            setServices(prev => prev.map(s => s._id === editingServiceId ? updated : s));
            setEditingServiceId(null);
        } else {
            const res = await adminFetch(`/services`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newService, categoryId: currentParentId })
            });
            const created = await res.json();
            setServices(prev => [...prev, created]);
        }

        setIsAddingFile(false);
        setNewService({ name: '', price: 0, min: 100, max: 1000, description: '', providerId: '', autoId: '', speed: '', dropRate: '', guarantee: '', startTime: '' });
    };

    const handleDeleteService = async (serviceId: string) => {
        if (!window.confirm(t.confirmDelete)) return;
        await adminFetch(`/services/${serviceId}`, { method: 'DELETE' });
        setServices(prev => prev.filter(s => s._id !== serviceId));
    };

    const handleEditService = (service: Service) => {
        setEditingServiceId(service._id);
        setNewService({ ...service });
        setIsAddingFile(true);
    };

    return (
        <div className="p-4 md:p-8 space-y-4 md:space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 flex-wrap text-sm text-white/60">
                <button onClick={handleGoRoot} className="hover:text-cyan-400 transition-colors font-bold">
                    🏠 {t.serviceManager}
                </button>
                {pathStack.map((crumb, index) => (
                    <span key={crumb.id} className="flex items-center gap-2">
                        <Chevron className="w-3 h-3" />
                        <button onClick={() => handleBreadcrumbClick(index)} className="hover:text-cyan-400 transition-colors">
                            {crumb.name}
                        </button>
                    </span>
                ))}
            </div>

            {/* Title & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="font-space text-2xl md:text-3xl text-white">
                    {pathStack.length > 0 ? pathStack[pathStack.length - 1].name : t.serviceManager}
                </h2>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button onClick={() => { setIsAddingFolder(true); setEditingFolderId(null); setNewFolderName(''); setNewFolderImage(''); }} className="flex-1 md:flex-none bg-purple-600 hover:bg-purple-700 text-white gap-2 text-xs md:text-sm">
                        <Plus className="w-3.5 h-3.5" /> {t.addFolder}
                    </Button>
                    {currentParentId && (
                        <Button onClick={() => { setIsAddingFile(true); setEditingServiceId(null); setNewService({ name: '', price: 0, min: 100, max: 1000, description: '', providerId: '', autoId: '', speed: '', dropRate: '', guarantee: '', startTime: '' }); }} className="flex-1 md:flex-none bg-cyan-600 hover:bg-cyan-700 text-white gap-2 text-xs md:text-sm">
                            <Plus className="w-3.5 h-3.5" /> {t.addService}
                        </Button>
                    )}
                </div>
            </div>

            {/* Add/Edit Folder Modal */}
            {isAddingFolder && (
                <Card className="p-4 md:p-6 bg-white/5 border border-dashed border-purple-500/30 space-y-4">
                    <h3 className="text-white font-bold text-sm md:text-base">{editingFolderId ? `✏️ ${t.editFolder}` : `📁 ${t.newFolder}`}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder={t.folderName} value={newFolderName} onChange={e => setNewFolderName(e.target.value)} className="bg-black/30 border-white/10 text-white text-sm" />
                        <div className="flex items-center gap-3">
                            {/* Upload Button */}
                            <input ref={folderImageRef} type="file" accept="image/*" className="hidden" onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, url => setNewFolderImage(url));
                            }} />
                            <button
                                onClick={() => folderImageRef.current?.click()}
                                disabled={uploading}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 transition-colors text-sm disabled:opacity-50"
                            >
                                {uploading ? <span className="animate-spin">⏳</span> : <Upload className="w-4 h-4" />}
                                {t.uploadImage || 'رفع صورة'}
                            </button>
                            {/* Preview */}
                            {newFolderImage && (
                                <div className="relative">
                                    <img src={getImageFullUrl(newFolderImage)} alt="" className="w-12 h-12 object-cover rounded-lg border border-white/10" />
                                    <button onClick={() => setNewFolderImage('')} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            )}
                            {!newFolderImage && !uploading && (
                                <div className="w-12 h-12 rounded-lg border border-dashed border-white/10 flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-white/20" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleCreateFolder} className="bg-green-600 hover:bg-green-700 text-white text-sm gap-1"><Plus className="w-3.5 h-3.5" /> {editingFolderId ? t.saveChanges : t.create}</Button>
                        <Button variant="ghost" onClick={() => { setIsAddingFolder(false); setEditingFolderId(null); }} className="text-white/60 text-sm">{t.cancel}</Button>
                    </div>
                </Card>
            )}

            {/* Add/Edit Service Modal */}
            {isAddingFile && (
                <Card className="p-4 md:p-6 bg-white/5 border border-dashed border-cyan-500/30 space-y-4">
                    <h3 className="text-white font-bold text-sm md:text-base">{editingServiceId ? `✏️ ${t.editService}` : `📄 ${t.newServiceTitle}`}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input placeholder={t.serviceName} value={newService.name || ''} onChange={e => setNewService(p => ({ ...p, name: e.target.value }))} className="bg-black/30 border-white/10 text-white text-sm" />
                        <Input type="number" placeholder={t.price} value={newService.price || ''} onChange={e => setNewService(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} className="bg-black/30 border-white/10 text-white text-sm" dir="ltr" />
                        <select value={newService.providerId || ''} onChange={e => setNewService(p => ({ ...p, providerId: e.target.value }))} className="bg-black/30 border border-white/10 text-white rounded-lg px-3 h-10 text-sm">
                            <option value="">{t.providerInstructions || 'معرف المزود'}</option>
                            {providers.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                        <Input type="number" placeholder={t.minMax?.split('/')[0]?.trim() || 'Min'} value={newService.min || ''} onChange={e => setNewService(p => ({ ...p, min: parseInt(e.target.value) || 0 }))} className="bg-black/30 border-white/10 text-white text-sm" dir="ltr" />
                        <Input type="number" placeholder={t.minMax?.split('/')[1]?.trim() || 'Max'} value={newService.max || ''} onChange={e => setNewService(p => ({ ...p, max: parseInt(e.target.value) || 0 }))} className="bg-black/30 border-white/10 text-white text-sm" dir="ltr" />
                        <div className="relative">
                            <Input placeholder={t.autoId} value={newService.autoId || ''} disabled className="bg-black/30 border-white/10 text-white/40 text-sm cursor-not-allowed" dir="ltr" />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                        </div>
                        <Input placeholder={`⚡ ${t.speed || 'Speed'}`} value={newService.speed || ''} onChange={e => setNewService(p => ({ ...p, speed: e.target.value }))} className="bg-black/30 border-white/10 text-white text-sm" />
                        <Input placeholder={`📉 ${t.dropRate || 'Drop rate'}`} value={newService.dropRate || ''} onChange={e => setNewService(p => ({ ...p, dropRate: e.target.value }))} className="bg-black/30 border-white/10 text-white text-sm" />
                        <Input placeholder={`🛡️ ${t.guarantee || 'Guarantee'}`} value={newService.guarantee || ''} onChange={e => setNewService(p => ({ ...p, guarantee: e.target.value }))} className="bg-black/30 border-white/10 text-white text-sm" />
                    </div>
                    <Input placeholder={t.description || 'Description'} value={newService.description || ''} onChange={e => setNewService(p => ({ ...p, description: e.target.value }))} className="bg-black/30 border-white/10 text-white text-sm" />
                    <div className="flex gap-3">
                        <Button onClick={handleCreateService} className="bg-green-600 hover:bg-green-700 text-white text-sm gap-1"><Plus className="w-3.5 h-3.5" /> {editingServiceId ? t.saveChanges : t.create}</Button>
                        <Button variant="ghost" onClick={() => { setIsAddingFile(false); setEditingServiceId(null); }} className="text-white/60 text-sm">{t.cancel}</Button>
                    </div>
                </Card>
            )}

            {/* Folders */}
            {subCategories.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {subCategories.map(cat => (
                        <Card key={cat._id} onClick={() => handleOpenFolder(cat)} className="p-3 md:p-4 bg-white/5 border-white/10 hover:border-purple-500/30 cursor-pointer transition-all group relative">
                            {/* Action Buttons */}
                            <div className={`absolute top-1 ${isRTL ? 'left-1' : 'right-1'} flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
                                <button onClick={(e) => startEditFolder(e, cat)} className="p-1 rounded bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30">
                                    <Pencil className="w-3 h-3" />
                                </button>
                                <button onClick={(e) => handleDeleteFolder(e, cat._id)} className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">
                                    <Trash className="w-3 h-3" />
                                </button>
                            </div>

                            <div className="flex flex-col items-center text-center gap-2">
                                {cat.image ? (
                                    <img src={getImageFullUrl(cat.image)} alt={getCategoryName(cat)} className="w-12 h-12 md:w-16 md:h-16 object-contain rounded-xl" />
                                ) : (
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                        <Folder className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
                                    </div>
                                )}
                                <p className="text-white text-xs md:text-sm font-medium truncate w-full">{getCategoryName(cat)}</p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Services */}
            {services.length > 0 && (
                <div className="space-y-3 md:space-y-4">
                    <h3 className="text-white/60 text-sm font-bold">{t.services || 'Services'} ({services.length})</h3>
                    {services.map(service => (
                        <Card key={service._id} className="p-3 md:p-5 bg-white/5 border-white/10 hover:border-cyan-500/20 transition-all">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="p-2 md:p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mt-0.5 flex-shrink-0">
                                        <FileText className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-medium text-sm md:text-base truncate">{service.name}</h4>
                                        {service.description && <p className="text-white/40 text-xs md:text-sm mt-0.5 line-clamp-2">{service.description}</p>}
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] md:text-xs">
                                            <span className="text-green-400 flex items-center gap-1"><DollarSign className="w-3 h-3" /> {$price(service.price)}</span>
                                            <span className="text-white/40">{t.minMax}: {service.min} — {service.max}</span>
                                            {service.speed && <span className="text-yellow-400 flex items-center gap-1"><Zap className="w-3 h-3" /> {service.speed}</span>}
                                            {service.dropRate && <span className="text-red-400 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> {service.dropRate}</span>}
                                            {service.guarantee && <span className="text-blue-400 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> {service.guarantee}</span>}
                                            {service.startTime && <span className="text-purple-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {service.startTime}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <button onClick={() => handleEditService(service)} className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDeleteService(service._id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                                        <Trash className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {subCategories.length === 0 && services.length === 0 && !isAddingFolder && !isAddingFile && (
                <div className="text-center py-16 text-white/30">
                    <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">{currentParentId ? t.emptyFolder : t.noCategoriesYet}</p>
                    <p className="text-sm mt-1">{t.clickToAdd}</p>
                </div>
            )}
        </div>
    );
}
