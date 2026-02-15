import { Smartphone, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface Service {
  id: string;
  nameKey: string;
  icon?: React.ElementType;
  image?: string;
  iconBg: string;
  iconColor: string;
}

const serviceKeys: Service[] = [
  {
    id: '1',
    nameKey: 'jerryServicesCard',
    image: '/jerry-services.png',
    iconBg: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-400'
  },
  {
    id: '2',
    nameKey: 'cardsSection',
    image: '/cards.png',
    iconBg: 'from-cyan-500/20 to-blue-500/20',
    iconColor: 'text-cyan-400'
  },
  {
    id: '3',
    nameKey: 'gamingSection',
    image: '/games.png',
    iconBg: 'from-green-500/20 to-emerald-500/20',
    iconColor: 'text-green-400'
  },
  {
    id: '4',
    nameKey: 'subscriptionsSection',
    image: '/subscriptions.png',
    iconBg: 'from-orange-500/20 to-red-500/20',
    iconColor: 'text-orange-400'
  },
  {
    id: '5',
    nameKey: 'phoneTopUp',
    icon: Smartphone,
    iconBg: 'from-yellow-500/20 to-amber-500/20',
    iconColor: 'text-yellow-400'
  },
  {
    id: '6',
    nameKey: 'miscServices',
    icon: Sparkles,
    iconBg: 'from-pink-500/20 to-rose-500/20',
    iconColor: 'text-pink-400'
  },
];

interface ServicesListProps {
  onServiceClick?: (serviceId: string) => void;
}

export default function ServicesList({ onServiceClick }: ServicesListProps) {
  const { t } = useLanguage();

  return (
    <div className="p-8">
      <h2 className="font-space text-2xl text-white mb-6 tracking-wide drop-shadow-md">{t.categories}</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {serviceKeys.map((service) => {
          const Icon = service.icon;
          const name = (t as any)[service.nameKey] || service.nameKey;
          return (
            <div
              key={service.id}
              onClick={() => onServiceClick?.(service.id)}
              className="flex flex-col gap-3 group cursor-pointer"
            >
              {/* Card Container */}
              <Card className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl border-0 bg-transparent overflow-hidden shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-cyan-500/20">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className={`absolute inset-0 w-full h-full flex items-center justify-center bg-white/5 border border-white/10 ${service.iconBg ? `bg-gradient-to-br ${service.iconBg}` : ''}`}>
                    {Icon && <Icon className={`w-20 h-20 md:w-24 md:h-24 ${service.iconColor} drop-shadow-xl transition-transform duration-300 group-hover:scale-110`} />}
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
    </div>
  );
}