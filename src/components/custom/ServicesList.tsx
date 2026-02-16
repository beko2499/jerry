import { useState, useEffect } from 'react';
import { Folder } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_URL.replace('/api', '');

const getImageFullUrl = (img: string) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  return `${BACKEND_URL}${img}`;
};

interface CategoryData {
  _id: string;
  nameKey: string;
  name: string;
  image?: string;
  parentId: string | null;
  order: number;
}

interface ServicesListProps {
  onServiceClick?: (categoryId: string, categoryName?: string) => void;
}

export default function ServicesList({ onServiceClick }: ServicesListProps) {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<CategoryData[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/categories?root=true`)
      .then(r => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const getCategoryName = (cat: CategoryData) => {
    return (t as any)[cat.nameKey] || cat.name || cat.nameKey;
  };

  return (
    <>
      <h2 className="font-space text-2xl text-white mb-6 tracking-wide drop-shadow-md">{t.categories}</h2>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const name = getCategoryName(cat);
          return (
            <div
              key={cat._id}
              onClick={() => onServiceClick?.(cat._id, getCategoryName(cat))}
              className="flex flex-col gap-3 group cursor-pointer"
            >
              {/* Card Container */}
              <Card className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl border-0 bg-transparent overflow-hidden shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-cyan-500/20">
                {cat.image ? (
                  <img
                    src={getImageFullUrl(cat.image)}
                    alt={name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-white/5 border border-white/10 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <Folder className="w-20 h-20 md:w-24 md:h-24 text-purple-400 drop-shadow-xl transition-transform duration-300 group-hover:scale-110" />
                  </div>
                )}

                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </Card>

              {/* Service Name (Below Card) */}
              <div className="text-center">
                <h3 className="font-arabic text-lg md:text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors tracking-wide">
                  {name}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}