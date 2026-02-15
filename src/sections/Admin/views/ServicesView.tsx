import { useState } from 'react';
import {
    Folder,
    FileText,
    Plus,
    ChevronRight,
    Clock,
    TrendingDown,
    ShieldCheck,
    Zap,
    DollarSign,
    Edit,
    Trash,
    Pencil
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

// Types
interface Category {
    id: string;
    nameKey: string; // Translation key
    image?: string;
    icon?: React.ElementType; // For cases without image
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
    providerId: string;
    autoId: string;
    speed?: string;
    dropRate?: string;
    guarantee?: string;
    startTime?: string;
}

export default function ServicesView() {
    const { t, isRTL } = useLanguage();

    // Navigation State
    // We store IDs path to easily reconstruct the view from source validation
    const [currentPathIds, setCurrentPathIds] = useState<string[]>([]);

    // Data State
    const [categories, setCategories] = useState<Category[]>([
        {
            id: 'cat_jerry',
            nameKey: 'jerryServicesCard',
            image: '/jerry-services.png',
            subCategories: [],
            services: []
        },
        {
            id: 'cat_cards',
            nameKey: 'cardsSection',
            image: '/cards.png',
            subCategories: [],
            services: []
        },
        {
            id: 'cat_gaming',
            nameKey: 'gamingSection',
            image: '/games.png',
            subCategories: [],
            services: []
        },
        {
            id: 'cat_subs',
            nameKey: 'subscriptionsSection',
            image: '/subscriptions.png',
            subCategories: [],
            services: []
        },
        {
            id: 'cat_phone',
            nameKey: 'phoneTopUp',
            // No image in original for this one, typically icon
            subCategories: [],
            services: []
        },
        {
            id: 'cat_misc',
            nameKey: 'miscServices',
            // No image in original for this one
            subCategories: [],
            services: []
        }
    ]);

    // UI Modals State
    const [isAddingFolder, setIsAddingFolder] = useState(false);
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [isAddingFile, setIsAddingFile] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderImage, setNewFolderImage] = useState('');

    // Service Form State
    const [newService, setNewService] = useState<Partial<Service>>({
        name: '',
        price: 0,
        min: 100,
        max: 1000,
        description: '',
        providerId: '',
        autoId: '',
        speed: '',
        dropRate: '',
        guarantee: '',
        startTime: ''
    });

    // Determine Current View Data
    const getCurrentCategory = (ids: string[], cats: Category[]): Category | null => {
        if (ids.length === 0) return null;
        let current: Category | undefined = cats.find(c => c.id === ids[0]);
        for (let i = 1; i < ids.length; i++) {
            if (!current) break;
            current = current.subCategories.find(c => c.id === ids[i]);
        }
        return current || null;
    };

    const currentCategory = getCurrentCategory(currentPathIds, categories);
    const currentViewItems = currentCategory ? { folders: currentCategory.subCategories, files: currentCategory.services } : { folders: categories, files: [] };

    // Helpers
    const getCategoryName = (cat: Category) => {
        return (t as any)[cat.nameKey] || cat.nameKey;
    };

    // Recursive Update - Supports Deletion if updateFn returns null
    const updateCategoryRecursive = (cats: Category[], targetId: string | null, updateFn: (cat: Category) => Category | null): Category[] => {
        if (targetId === null) return cats;

        return cats.map(cat => {
            if (cat.id === targetId) {
                return updateFn(cat);
            }
            if (cat.subCategories.length > 0) {
                const updatedSub = updateCategoryRecursive(cat.subCategories, targetId, updateFn);
                return { ...cat, subCategories: updatedSub };
            }
            return cat;
        }).filter(Boolean) as Category[]; // Remove nulls (deleted items)
    };

    // Handlers
    const handleDeleteFolder = (e: React.MouseEvent, folderId: string) => {
        e.stopPropagation();
        if (window.confirm(t.confirmDelete || 'Are you sure you want to delete this folder?')) {
            if (!currentCategory) {
                // Root level
                setCategories(categories.filter(c => c.id !== folderId));
            } else {
                // Nested
                setCategories(updateCategoryRecursive(categories, folderId, () => null));
            }
        }
    };

    const handleDeleteService = (serviceId: string) => {
        if (window.confirm(t.confirmDelete || 'Are you sure you want to delete this service?')) {
            const updatedCats = updateCategoryRecursive(categories, currentCategory!.id, (cat) => ({
                ...cat,
                services: cat.services.filter(s => s.id !== serviceId)
            }));
            setCategories(updatedCats);
        }
    };
    const handleOpenFolder = (category: Category) => {
        setCurrentPathIds([...currentPathIds, category.id]);
    };

    const handleBreadcrumbClick = (index: number) => {
        setCurrentPathIds(currentPathIds.slice(0, index + 1));
    };

    const handleCreateFolder = () => {
        if (!newFolderName) return;

        if (editingFolderId) {
            // Update existing folder
            if (!currentCategory) {
                // Root level update
                setCategories(categories.map(c => c.id === editingFolderId ? { ...c, nameKey: newFolderName, image: newFolderImage } : c));
            } else {
                // Nested level update
                setCategories(updateCategoryRecursive(categories, editingFolderId, (cat) => ({
                    ...cat,
                    nameKey: newFolderName,
                    image: newFolderImage
                })));
            }
            setEditingFolderId(null);
        } else {
            // Create new folder
            const newCat: Category = {
                id: Date.now().toString(),
                nameKey: newFolderName,
                image: newFolderImage,
                subCategories: [],
                services: []
            };

            if (!currentCategory) {
                setCategories([...categories, newCat]);
            } else {
                const updatedCats = updateCategoryRecursive(categories, currentCategory.id, (cat) => ({
                    ...cat,
                    subCategories: [...cat.subCategories, newCat]
                }));
                setCategories(updatedCats);
            }
        }

        setNewFolderName('');
        setNewFolderImage('');
        setIsAddingFolder(false);
    };

    const handleEditFolder = (e: React.MouseEvent, folder: Category) => {
        e.stopPropagation();
        setNewFolderName(getCategoryName(folder));
        setNewFolderImage(folder.image || '');
        setEditingFolderId(folder.id);
        setIsAddingFolder(true);
    };

    const handleCreateService = () => {
        if (!newService.name || !currentCategory) return;

        if (editingServiceId) {
            // Update existing service
            const updatedCats = updateCategoryRecursive(categories, currentCategory.id, (cat) => ({
                ...cat,
                services: cat.services.map(s => s.id === editingServiceId ? { ...s, ...newService } as Service : s)
            }));
            setCategories(updatedCats);
            setEditingServiceId(null);
        } else {
            // Create new service
            const serviceToAdd: Service = {
                id: Date.now().toString(),
                name: newService.name || 'New Service',
                price: newService.price || 0,
                min: newService.min || 100,
                max: newService.max || 1000,
                description: newService.description || '',
                providerId: newService.providerId || '',
                autoId: Math.floor(1000 + Math.random() * 9000).toString(),
                speed: newService.speed,
                dropRate: newService.dropRate,
                guarantee: newService.guarantee,
                startTime: newService.startTime
            };

            const updatedCats = updateCategoryRecursive(categories, currentCategory.id, (cat) => ({
                ...cat,
                services: [...cat.services, serviceToAdd]
            }));
            setCategories(updatedCats);
        }

        setNewService({
            name: '',
            price: 0,
            min: 100,
            max: 1000,
            description: '',
            providerId: '',
            autoId: '',
            speed: '',
            dropRate: '',
            guarantee: '',
            startTime: ''
        });
        setIsAddingFile(false);
    };

    const handleEditService = (service: Service) => {
        setNewService(service);
        setEditingServiceId(service.id);
        setIsAddingFile(true);
    };

    return (
        <div className="p-4 md:p-8 h-full flex flex-col">
            {/* Header & Navigation */}
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="font-space text-xl md:text-3xl text-white tracking-wide break-words max-w-full">
                        {currentCategory ? getCategoryName(currentCategory) : t.servicesCategories}
                    </h2>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <Button onClick={() => setIsAddingFolder(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2 flex-1 md:flex-none">
                            <Plus className="w-4 h-4" /> {t.add} {t.folderName}
                        </Button>
                        {currentCategory && (
                            <Button onClick={() => setIsAddingFile(true)} className="bg-green-600 hover:bg-green-700 text-white gap-2 flex-1 md:flex-none">
                                <Plus className="w-4 h-4" /> {t.add} {t.serviceName}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Breadcrumbs / File Path */}
                <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPathIds([])}
                        className={`text-white/60 hover:text-white ${currentPathIds.length === 0 ? 'bg-white/10 text-white' : ''}`}
                    >
                        Home
                    </Button>
                    {currentPathIds.map((id, index) => {
                        // Reconstruct path object for display
                        // This is a bit inefficient but safe for display
                        const pathSoFar = currentPathIds.slice(0, index + 1);
                        const cat = getCurrentCategory(pathSoFar, categories);
                        if (!cat) return null;

                        return (
                            <div key={id} className="flex items-center gap-2 shrink-0">
                                <ChevronRight className={`w-4 h-4 text-white/40 ${isRTL ? 'rotate-180' : ''}`} />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleBreadcrumbClick(index)}
                                    className={`text-white/60 hover:text-white ${index === currentPathIds.length - 1 ? 'bg-white/10 text-white font-bold' : ''}`}
                                >
                                    {getCategoryName(cat)}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">

                {/* New Folder Modal (Inline) */}
                {isAddingFolder && (
                    <Card className="p-4 mb-6 bg-black/40 border border-cyan-500/30 animate-in fade-in">
                        <h4 className="text-white font-bold mb-4">{editingFolderId ? t.edit : t.add} {t.folderName}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-xs text-white/40 mb-1 block">{t.folderName}</label>
                                <Input
                                    value={newFolderName}
                                    onChange={e => setNewFolderName(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="text-xs text-white/40 mb-1 block">{t.serviceImage} (URL)</label>
                                <Input
                                    value={newFolderImage}
                                    onChange={e => setNewFolderImage(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setIsAddingFolder(false)} className="text-white/60">{t.cancel}</Button>
                            <Button size="sm" onClick={handleCreateFolder} className="bg-cyan-600 text-white">{t.save}</Button>
                        </div>
                    </Card>
                )}

                {/* MIXED View: Folders and Files */}
                <div className="space-y-8">

                    {/* Folders Grid */}
                    {currentViewItems.folders.length > 0 && (
                        <div>
                            <h3 className="text-white/40 text-sm font-bold mb-3 uppercase tracking-wider">{t.folderName}s</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                {currentViewItems.folders.map(cat => (
                                    <div
                                        key={cat.id}
                                        onClick={() => handleOpenFolder(cat)}
                                        className="group cursor-pointer"
                                    >
                                        <Card className="relative aspect-square mb-2 bg-white/5 border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all overflow-hidden group/card">
                                            {cat.image ? (
                                                <img src={cat.image} alt={cat.nameKey} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-white/5">
                                                    <Folder className="w-16 h-16 text-cyan-400/50 group-hover:text-cyan-400 transition-colors" />
                                                </div>
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                                                <p className="text-xs text-white/60">{cat.subCategories.length + cat.services.length} items</p>
                                            </div>

                                            {/* Edit/Delete Actions */}
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 bg-black/50 text-white hover:bg-cyan-500 hover:text-white rounded-full backdrop-blur-sm"
                                                    onClick={(e) => handleEditFolder(e, cat)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 bg-black/50 text-white hover:bg-red-500 hover:text-white rounded-full backdrop-blur-sm"
                                                    onClick={(e) => handleDeleteFolder(e, cat.id)}
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </Card>
                                        <h3 className="text-center text-white font-medium group-hover:text-cyan-400 transition-colors truncate px-2">{getCategoryName(cat)}</h3>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Files Grid (Services) */}
                    {(currentViewItems.files.length > 0 || isAddingFile) && (
                        <div>
                            {currentCategory && <h3 className="text-white/40 text-sm font-bold mb-3 uppercase tracking-wider">{t.servicesCategories}</h3>}

                            {isAddingFile && (
                                <Card className="p-4 bg-black/40 border border-green-500/30 animate-in fade-in mb-6">
                                    <h4 className="text-white font-bold mb-4">{editingServiceId ? t.edit : t.createService}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="col-span-1 md:col-span-2">
                                            <label className="text-xs text-white/40 mb-1 block">{t.serviceName}</label>
                                            <Input
                                                value={newService.name}
                                                onChange={e => setNewService({ ...newService, name: e.target.value })}
                                                className="bg-black/40 border-white/10 text-white"
                                                placeholder="e.g. Instagram Followers (HQ)"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs text-white/40 mb-1 block">{t.pricePer1000}</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
                                                <Input
                                                    type="number"
                                                    value={newService.price}
                                                    onChange={e => setNewService({ ...newService, price: parseFloat(e.target.value) })}
                                                    className="pl-8 bg-black/40 border-white/10 text-white"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <label className="text-xs text-white/40 mb-1 block">Min</label>
                                                <Input
                                                    type="number"
                                                    value={newService.min}
                                                    onChange={e => setNewService({ ...newService, min: parseInt(e.target.value) })}
                                                    className="bg-black/40 border-white/10 text-white"
                                                    placeholder="100"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-xs text-white/40 mb-1 block">Max</label>
                                                <Input
                                                    type="number"
                                                    value={newService.max}
                                                    onChange={e => setNewService({ ...newService, max: parseInt(e.target.value) })}
                                                    className="bg-black/40 border-white/10 text-white"
                                                    placeholder="10000"
                                                />
                                            </div>
                                        </div>

                                        {/* New SMM Fields */}
                                        <div>
                                            <label className="text-xs text-white/40 mb-1 block">{t.startTime}</label>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
                                                <Input
                                                    value={newService.startTime}
                                                    onChange={e => setNewService({ ...newService, startTime: e.target.value })}
                                                    className="pl-8 bg-black/40 border-white/10 text-white"
                                                    placeholder="e.g. Instant - 1 Hour"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs text-white/40 mb-1 block">{t.speed}</label>
                                            <div className="relative">
                                                <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
                                                <Input
                                                    value={newService.speed}
                                                    onChange={e => setNewService({ ...newService, speed: e.target.value })}
                                                    className="pl-8 bg-black/40 border-white/10 text-white"
                                                    placeholder="e.g. 10k/Day"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs text-white/40 mb-1 block">{t.dropRate}</label>
                                            <div className="relative">
                                                <TrendingDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
                                                <Input
                                                    value={newService.dropRate}
                                                    onChange={e => setNewService({ ...newService, dropRate: e.target.value })}
                                                    className="pl-8 bg-black/40 border-white/10 text-white"
                                                    placeholder="e.g. Non-Drop, 5%"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs text-white/40 mb-1 block">{t.guarantee}</label>
                                            <div className="relative">
                                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40" />
                                                <Input
                                                    value={newService.guarantee}
                                                    onChange={e => setNewService({ ...newService, guarantee: e.target.value })}
                                                    className="pl-8 bg-black/40 border-white/10 text-white"
                                                    placeholder="e.g. 30 Days, Lifetime"
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-1 md:col-span-2">
                                            <label className="text-xs text-white/40 mb-1 block">{t.serviceDesc}</label>
                                            <Input
                                                value={newService.description}
                                                onChange={e => setNewService({ ...newService, description: e.target.value })}
                                                className="bg-black/40 border-white/10 text-white"
                                                placeholder="Service description..."
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs text-white/40 mb-1 block">{t.providerIntegration}</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={newService.providerId}
                                                    onChange={e => setNewService({ ...newService, providerId: e.target.value })}
                                                    className="flex-1 bg-black/40 border-white/10 text-white"
                                                    placeholder="Provider ID"
                                                />
                                                <Button variant="outline" className="border-white/10 text-white/60">{t.autoFetch}</Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => setIsAddingFile(false)} className="text-white/60">{t.cancel}</Button>
                                        <Button size="sm" onClick={handleCreateService} className="bg-green-600 hover:bg-green-700 text-white">{t.save}</Button>
                                    </div>
                                </Card>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {currentViewItems.files.map(srv => (
                                    <Card key={srv.id} className="bg-white/5 border border-white/10 hover:border-white/20 p-4 transition-all group relative overflow-hidden">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white line-clamp-1">{srv.name}</h4>
                                                    <span className="text-xs font-mono text-white/40">ID: {srv.autoId}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-white/40 hover:text-white"
                                                    onClick={() => handleEditService(srv)}
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-white/40 hover:text-red-400"
                                                    onClick={() => handleDeleteService(srv.id)}
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                            <div className="bg-black/20 p-2 rounded flex items-center gap-2">
                                                <DollarSign className="w-3 h-3 text-green-400" />
                                                <span className="text-white">${srv.price}</span>
                                            </div>
                                            <div className="bg-black/20 p-2 rounded flex items-center gap-2">
                                                <Zap className="w-3 h-3 text-yellow-400" />
                                                <span className="text-white truncate">{srv.speed || 'N/A'}</span>
                                            </div>
                                            <div className="bg-black/20 p-2 rounded flex items-center gap-2">
                                                <TrendingDown className="w-3 h-3 text-red-400" />
                                                <span className="text-white truncate">{srv.dropRate || 'N/A'}</span>
                                            </div>
                                            <div className="bg-black/20 p-2 rounded flex items-center gap-2">
                                                <ShieldCheck className="w-3 h-3 text-blue-400" />
                                                <span className="text-white truncate">{srv.guarantee || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <p className="text-white/60 text-xs line-clamp-2">{srv.description}</p>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {currentViewItems.folders.length === 0 && currentViewItems.files.length === 0 && !isAddingFile && (
                        <div className="col-span-full py-20 text-center text-white/30">
                            <Folder className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p>{t.noServices || "Empty Folder"}</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
