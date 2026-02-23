import { useState, useEffect } from 'react';
import { Folder, ArrowRight, ArrowLeft, Zap, TrendingDown, ShieldCheck, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const BACKEND_URL = API_URL.replace('/api', '');
import { $price } from '@/lib/formatPrice';

interface Category {
    _id: string;
    nameKey: string;
    name: string;
    image?: string;
    parentId: string | null;
}

interface Service {
    _id: string;
    name: string;
    price: number;
    min: number;
    max: number;
    description: string;
    speed?: string;
    dropRate?: string;
    guarantee?: string;
    startTime?: string;
}

interface CategoryBrowserProps {
    initialCategoryId: string;
    initialCategoryName: string;
    onBack: () => void;
    onServiceSelect?: (service: Service) => void;
}

const getImageFullUrl = (img: string) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `${BACKEND_URL}${img}`;
};

export default function CategoryBrowser({ initialCategoryId, initialCategoryName, onBack, onServiceSelect }: CategoryBrowserProps) {
    const { t, isRTL } = useLanguage();

    // Navigation stack
    const [pathStack, setPathStack] = useState<{ id: string; name: string }[]>([
        { id: initialCategoryId, name: initialCategoryName }
    ]);
    const currentId = pathStack[pathStack.length - 1].id;

    // Data
    const [subCategories, setSubCategories] = useState<Category[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [catsRes, svcsRes] = await Promise.all([
                    fetch(`${API_URL}/categories?parentId=${currentId}`).then(r => r.json()),
                    fetch(`${API_URL}/services?categoryId=${currentId}`).then(r => r.json()),
                ]);
                setSubCategories(catsRes);
                setServices(svcsRes);
            } catch (err) { console.error(err); }
            setLoading(false);
        };
        fetchData();
    }, [currentId]);

    const getCategoryName = (cat: Category) => {
        return (t as any)[cat.nameKey] || cat.name || cat.nameKey;
    };

    const handleOpenCategory = (cat: Category) => {
        setPathStack([...pathStack, { id: cat._id, name: getCategoryName(cat) }]);
    };

    const handleBack = () => {
        if (pathStack.length > 1) {
            setPathStack(pathStack.slice(0, -1));
        } else {
            onBack();
        }
    };

    const BackArrow = isRTL ? ArrowRight : ArrowLeft;

    return (
        <div className="p-4 md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Back Button */}
            <Button
                variant="ghost"
                onClick={handleBack}
                className="mb-6 text-white/60 hover:text-white gap-2"
            >
                <BackArrow className="w-4 h-4" />
                {pathStack.length > 1 ? pathStack[pathStack.length - 2].name : (t.backToCategories || 'العودة')}
            </Button>

            {/* Title */}
            <h2 className="font-space text-2xl text-white mb-6 tracking-wide drop-shadow-md">
                {pathStack[pathStack.length - 1].name}
            </h2>

            {loading ? (
                <div className="text-center py-16">
                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            ) : (
                <>
                    {/* Subcategories Grid */}
                    {subCategories.length > 0 && (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {subCategories.map(cat => {
                                const name = getCategoryName(cat);
                                return (
                                    <div
                                        key={cat._id}
                                        onClick={() => handleOpenCategory(cat)}
                                        className="flex flex-col gap-3 group cursor-pointer"
                                    >
                                        <Card className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl border-0 bg-transparent overflow-hidden shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-cyan-500/20">
                                            {cat.image ? (
                                                <img
                                                    src={getImageFullUrl(cat.image)}
                                                    alt={name}
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-white/5 border border-white/10 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                                    <Folder className="w-16 h-16 md:w-20 md:h-20 text-purple-400 drop-shadow-xl transition-transform duration-300 group-hover:scale-110" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                        </Card>
                                        <div className="text-center">
                                            <h3 className="font-arabic text-lg md:text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors tracking-wide">
                                                {name}
                                            </h3>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Services List */}
                    {services.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map(service => (
                                <Card
                                    key={service._id}
                                    onClick={() => onServiceSelect?.(service)}
                                    className="group relative overflow-hidden bg-white/5 border-white/10 p-5 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
                                >
                                    <div className="mb-3">
                                        <h3 className="font-body text-base md:text-lg text-white font-bold mb-1 leading-relaxed line-clamp-2">
                                            {service.name}
                                        </h3>
                                        {service.description && (
                                            <p className="text-white/50 text-sm line-clamp-2">{service.description}</p>
                                        )}
                                    </div>

                                    <div className="flex items-end justify-between mb-4">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-space font-bold text-cyan-400">{$price(Number(service.price))}</span>
                                            <span className="text-white/60 text-xs">/ {t.perUnit || 'لكل وحدة'}</span>
                                        </div>
                                        <div className={`${isRTL ? 'text-left' : 'text-right'}`}>
                                            <div className="text-xs text-white/40 mb-1">{t.quantity || 'الكمية'}</div>
                                            <div className="text-xs text-white/80 font-mono bg-white/5 px-2 py-1 rounded border border-white/5">
                                                {service.min?.toLocaleString()} - {service.max?.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Service Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4 text-[10px]">
                                        {service.speed && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                                <Zap className="w-3 h-3" /> {service.speed}
                                            </span>
                                        )}
                                        {service.dropRate && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                                <TrendingDown className="w-3 h-3" /> {service.dropRate}
                                            </span>
                                        )}
                                        {service.guarantee && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                <ShieldCheck className="w-3 h-3" /> {service.guarantee}
                                            </span>
                                        )}
                                        {service.startTime && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                                <Clock className="w-3 h-3" /> {service.startTime}
                                            </span>
                                        )}
                                    </div>

                                    <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
                                        {t.buyService || 'شراء'}
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {subCategories.length === 0 && services.length === 0 && (
                        <div className="text-center py-16 text-white/30">
                            <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-lg font-medium">{t.emptyFolder || 'هذا القسم فارغ'}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
