import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Sidebar from '@/components/custom/Sidebar';
import Header from '@/components/custom/Header';
import ServicesList from '@/components/custom/ServicesList';
import Starfield from '@/components/Starfield';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Instagram,
  Facebook,
  Send,
  Briefcase,
  Star,
  Gift,
  Music2
} from 'lucide-react';

// Orders View Component
function OrdersView() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();

  const filters = [
    { id: 'all', label: t.allOrders, icon: ShoppingCart, color: 'text-cyan-400', activeBg: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' },
    { id: 'pending', label: t.pending, icon: Clock, color: 'text-yellow-400', activeBg: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' },
    { id: 'completed', label: t.completed, icon: CheckCircle, color: 'text-green-400', activeBg: 'bg-green-500/20 border-green-500/50 text-green-400' },
    { id: 'cancelled', label: t.cancelled, icon: XCircle, color: 'text-red-400', activeBg: 'bg-red-500/20 border-red-500/50 text-red-400' },
  ];

  const allOrders = [
    { id: '#12345', service: 'متابعين انستقرام', quantity: '1000', price: '$5.00', status: 'مكتمل', date: '2025-02-14', statusColor: 'text-green-400 bg-green-500/20 border-green-500/30' },
    { id: '#12344', service: 'لايكات فيسبوك', quantity: '500', price: '$2.50', status: 'قيد الانتظار', date: '2025-02-14', statusColor: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' },
    { id: '#12343', service: 'مشاهدات يوتيوب', quantity: '5000', price: '$10.00', status: 'مكتمل', date: '2025-02-13', statusColor: 'text-green-400 bg-green-500/20 border-green-500/30' },
    { id: '#12342', service: 'متابعين تيك توك', quantity: '2000', price: '$8.00', status: 'ملغي', date: '2025-02-13', statusColor: 'text-red-400 bg-red-500/20 border-red-500/30' },
  ];

  const filteredOrders = allOrders.filter(order => {
    if (searchQuery) {
      return order.id.toLowerCase().includes(searchQuery.toLowerCase().replace('#', ''));
    }
    return true;
  });

  return (
    <div className="p-4 md:p-8 space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = statusFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`
                flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl border transition-all duration-300 whitespace-nowrap text-sm md:text-base
                ${isActive
                  ? `${filter.activeBg} shadow-[0_0_15px_rgba(0,0,0,0.3)]`
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <Icon className={`w-4 h-4 md:w-5 md:h-5 ${isActive ? 'scale-110' : 'opacity-70'} transition-transform`} />
              <span className="font-body font-medium">{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Title */}
      <h3 className="font-space text-2xl md:text-3xl text-white tracking-wide">{t.myOrders}</h3>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <Input
          placeholder={`${t.search} ${t.orderId}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-500/50 focus:ring-cyan-500/20 h-11"
        />
      </div>

      {/* Orders Table */}
      <Card className="bg-white/5 border-white/10 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 md:px-6 py-3 md:py-4 text-right font-body text-white/60 text-xs md:text-sm">{t.orderId}</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right font-body text-white/60 text-xs md:text-sm">{t.service}</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right font-body text-white/60 text-xs md:text-sm">{t.quantity}</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right font-body text-white/60 text-xs md:text-sm">{t.price}</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right font-body text-white/60 text-xs md:text-sm">{t.status}</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right font-body text-white/60 text-xs md:text-sm">{t.date}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="px-4 md:px-6 py-3 md:py-4 font-space text-cyan-400 group-hover:text-cyan-300 transition-colors text-sm">{order.id}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 font-body text-white text-sm">{order.service}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 font-body text-white/80 text-sm">{order.quantity}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 font-space text-white text-sm">{order.price}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-medium border ${order.statusColor}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 font-body text-white/60 text-xs md:text-sm">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// Search View Component
interface SearchViewProps {
  onNavigate: (item: string) => void;
}

function SearchView({ onNavigate }: SearchViewProps) {
  const [query, setQuery] = useState('');
  const { t } = useLanguage();

  const searchableItems = [
    { id: '1', name: (t as any).jerryServicesCard || 'Jerry Services', category: (t as any).categories || 'Categories', target: 'jerry-services', image: '/jerry-services.png' },
    { id: '2', name: (t as any).cardsSection || 'Cards Section', category: (t as any).categories || 'Categories', target: 'new-order', image: '/cards.png' },
    { id: '3', name: (t as any).gamingSection || 'Gaming Section', category: (t as any).categories || 'Categories', target: 'new-order', image: '/games.png' },
    { id: '4', name: (t as any).subscriptionsSection || 'Subscriptions', category: (t as any).categories || 'Categories', target: 'new-order', image: '/subscriptions.png' },
    { id: '5', name: (t as any).phoneTopUp || 'Phone Top-Up', category: (t as any).categories || 'Categories', target: 'new-order' },
    { id: '6', name: (t as any).miscServices || 'Misc Services', category: (t as any).categories || 'Categories', target: 'new-order' },
    // Telegram services
    { id: '1823', name: 'اعضاء تليجرام حسابات محذوفه', category: (t as any).telegramServicesName || 'Telegram', target: 'telegram-services' },
    { id: '1824', name: 'اعضاء تليجرام بدون نزول للابد (مملوكه)', category: (t as any).telegramServicesName || 'Telegram', target: 'telegram-services' },
    { id: '1825', name: 'اعضاء تليجرام بدون نزول للابد للكروبات (مملوكه)', category: (t as any).telegramServicesName || 'Telegram', target: 'telegram-services' },
    { id: '1826', name: 'اعضاء تليجرام رخيص (مملوكه)', category: (t as any).telegramServicesName || 'Telegram', target: 'telegram-services' },
    { id: '1827', name: 'مشاهدات تليجرام', category: (t as any).telegramServicesName || 'Telegram', target: 'telegram-services' },
    // Instagram
    { id: 'insta-1', name: 'متابعين انستقرام', category: (t as any).instaServices || 'Instagram', target: 'jerry-services' },
    { id: 'insta-2', name: 'لايكات انستقرام', category: (t as any).instaServices || 'Instagram', target: 'jerry-services' },
    // TikTok
    { id: 'tiktok-1', name: 'متابعين تيك توك', category: (t as any).tiktokServices || 'TikTok', target: 'jerry-services' },
    { id: 'tiktok-2', name: 'مشاهدات تيك توك', category: (t as any).tiktokServices || 'TikTok', target: 'jerry-services' },
    // Facebook
    { id: 'fb-1', name: 'لايكات فيسبوك', category: (t as any).facebookServices || 'Facebook', target: 'jerry-services' },
    { id: 'fb-2', name: 'متابعين فيسبوك', category: (t as any).facebookServices || 'Facebook', target: 'jerry-services' },
  ];

  const results = query.length > 0
    ? searchableItems.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    )
    : [];

  return (
    <div className="p-4 md:p-8 space-y-4">
      <h2 className="font-space text-2xl md:text-3xl text-white tracking-wide">{t.search}</h2>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <Input
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 w-full h-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-500/50 focus:ring-cyan-500/20 rounded-xl text-base"
          autoFocus
        />
      </div>

      {/* Results */}
      {query.length > 0 && (
        <div className="space-y-2">
          {results.length > 0 ? (
            results.map(item => (
              <Card
                key={item.id}
                className="p-3 bg-white/5 border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all cursor-pointer backdrop-blur-sm"
                onClick={() => onNavigate(item.target)}
              >
                <div className="flex items-center gap-3">
                  {item.image ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                      <Search className="w-5 h-5 text-cyan-400" />
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <h4 className="text-white font-medium text-sm truncate">{item.name}</h4>
                    <p className="text-white/40 text-xs truncate">{item.category}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/40 text-sm">لا توجد نتائج</p>
            </div>
          )}
        </div>
      )}

      {/* Empty state when no query */}
      {query.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <p className="text-white/50 text-base">{t.searchPlaceholder}</p>
        </div>
      )}
    </div>
  );
}

// New Order View Component
interface NewOrderViewProps {
  onServiceClick: (id: string) => void;
}

function NewOrderView({ onServiceClick }: NewOrderViewProps) {
  const { t } = useLanguage();
  return (
    <div className="p-8">
      <h2 className="font-space text-2xl text-white mb-6 tracking-wide drop-shadow-md">{t.newOrder}</h2>
      <ServicesList onServiceClick={onServiceClick} />
    </div>
  );
}

// All Telegram Services Data
const allTelegramServices = [
  {
    id: '1823',
    name: 'اعضاء تليجرام حسابات محذوفه',
    pricePer1000: 2.00,
    oldPrice: 2.02,
    discount: '-1%',
    min: 500,
    max: 60000,
    category: 'خدمات تليجرام | جيري',
    shortDesc: 'حسابات محذوفة، جودة منخفضة، بدء فوري',
    description: `- البداء : 0 -4 ساعات 🚩
- الضمان : حسابات محذوفه ٪0 نزوا 🏮
- الرابط : رابط دعوة 🏮
- الجوده : HQ 🏮
- تقبل كروبات / قنوات 🎉

- توضيح مهم : الحسابات بتدريج راح تنحذف معى مرور الايام . تم التحقق من الخدمه والخدمه 100/100حسابات محذوفه`,
    details: [
      { label: 'سرعة الخدمه', value: 'الخدمة طبيعيه' },
      { label: 'نسبه النزول', value: 'مزيج بين الوهمي والحقيقي' },
      { label: 'ضمان', value: '0 يوم' },
      { label: 'السرعة', value: '50K في اليوم' },
    ]
  },
  {
    id: '1824',
    name: 'اعضاء تليجرام بدون نزول للابد (مملوكه)',
    pricePer1000: 1.20,
    oldPrice: 1.21,
    discount: '-1%',
    min: 50,
    max: 50000,
    category: 'خدمات تليجرام | جيري',
    shortDesc: 'ضمان عدم النزول مدى الحياة، حسابات عالية الجودة',
    description: `- البداء : 0 -2 ساعات 🚩
- الضمان : بدون نزول للابد ♾️ 🏮
- الرابط : رابط دعوة / يوزر 🏮
- الجوده : HQ - حسابات مملوكه 🏮
- تقبل قنوات فقط 🎉

- توضيح مهم : اعضاء حقيقيين بدون نزول نهائياً، خدمة مملوكة بضمان مدى الحياة`,
    details: [
      { label: 'سرعة الخدمه', value: 'سريعة' },
      { label: 'نسبه النزول', value: '0% - بدون نزول' },
      { label: 'ضمان', value: 'مدى الحياة ♾️' },
      { label: 'السرعة', value: '30K في اليوم' },
    ]
  },
  {
    id: '1825',
    name: 'اعضاء تليجرام بدون نزول للابد للكروبات (مملوكه)',
    pricePer1000: 1.20,
    oldPrice: 1.21,
    discount: '-1%',
    min: 50,
    max: 20000,
    category: 'خدمات تليجرام | جيري',
    shortDesc: 'مخصص للمجموعات، ضمان مدى الحياة',
    description: `- البداء : 0 -2 ساعات 🚩
- الضمان : بدون نزول للابد ♾️ 🏮
- الرابط : رابط دعوة كروب 🏮
- الجوده : HQ - حسابات مملوكه 🏮
- تقبل كروبات فقط 🎉

- توضيح مهم : اعضاء حقيقيين مخصصين للكروبات بضمان مدى الحياة بدون نزول`,
    details: [
      { label: 'سرعة الخدمه', value: 'سريعة' },
      { label: 'نسبه النزول', value: '0% - بدون نزول' },
      { label: 'ضمان', value: 'مدى الحياة ♾️' },
      { label: 'السرعة', value: '20K في اليوم' },
    ]
  },
  {
    id: '1826',
    name: 'اعضاء تليجرام رخيص (مملوكه) 〽️',
    pricePer1000: 0.07,
    oldPrice: 0.07,
    discount: '-1%',
    min: 100,
    max: 100000,
    category: 'خدمات تليجرام | جيري',
    shortDesc: 'ارخص خدمة في السوق، سرعة متوسطة',
    description: `- البداء : 0 -6 ساعات 🚩
- الضمان : لا يوجد ضمان 🏮
- الرابط : رابط دعوة / يوزر 🏮
- الجوده : Low - حسابات مملوكه 🏮
- تقبل كروبات / قنوات 🎉

- توضيح مهم : ارخص خدمة اعضاء في السوق، مناسبة لمن يريد ارقام كبيرة بأقل سعر`,
    details: [
      { label: 'سرعة الخدمه', value: 'متوسطة' },
      { label: 'نسبه النزول', value: 'ممكن نزول بسيط' },
      { label: 'ضمان', value: 'لا يوجد' },
      { label: 'السرعة', value: '100K في اليوم' },
    ]
  },
];

// Service Details View Component
interface ServiceDetailsViewProps {
  serviceId: string;
  onBack: () => void;
}

function ServiceDetailsView({ serviceId, onBack }: ServiceDetailsViewProps) {
  const [quantity, setQuantity] = useState<number>(1000);
  const [hasCoupon, setHasCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const { t } = useLanguage();

  const service = allTelegramServices.find(s => s.id === serviceId) || allTelegramServices[0];
  const totalPrice = (quantity / 1000) * service.pricePer1000;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-6 text-white/60 hover:text-white">
        {t.backToList}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Service Details */}
        <div className="space-y-6">
          <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white font-body leading-relaxed flex-1 ml-3">{service.name}</h2>
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-mono border border-cyan-500/30 shrink-0">ID: {service.id}</span>
            </div>

            {/* Price Badge */}
            <div className="flex items-center gap-3 mb-6 p-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/20">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-cyan-400 font-space">${service.pricePer1000}</span>
                <span className="text-white/40 text-sm">/ 1000</span>
              </div>
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500/30">{service.discount}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {service.details.map((detail, index) => (
                <div key={index} className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-xs text-white/40 mb-1">{detail.label}</div>
                  <div className="text-sm text-white font-medium">{detail.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
              <h3 className="text-white/80 font-bold mb-3 text-sm">{t.serviceDesc}</h3>
              <div className="text-white/60 text-sm whitespace-pre-line leading-relaxed font-body">
                {service.description}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Order Form */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border-white/10 backdrop-blur-md shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-cyan-400" />
              {t.createOrder}
            </h3>

            <div className="space-y-5">
              {/* Quantity */}
              <div>
                <label className="flex justify-between text-sm text-white/80 mb-2">
                  <span>{t.quantity}</span>
                  <span className="text-xs text-white/40 font-mono">Min: {service.min} - Max: {service.max.toLocaleString()}</span>
                </label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-black/30 border-white/10 text-white focus:border-cyan-500/50 h-12 text-lg font-mono"
                />
                {/* Quick Quantity Buttons */}
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[service.min, 1000, 5000, 10000].map(q => (
                    <button
                      key={q}
                      onClick={() => setQuantity(q)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-mono transition-all ${quantity === q ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white'}`}
                    >
                      {q.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link */}
              <div>
                <label className="text-sm text-white/80 mb-2 block">{t.link}</label>
                <Input
                  placeholder="https://t.me/..."
                  className="bg-black/30 border-white/10 text-white focus:border-cyan-500/50 h-12 font-body placeholder:text-white/20"
                />
              </div>

              {/* Coupon Toggle */}
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="coupon"
                    checked={hasCoupon}
                    onChange={(e) => setHasCoupon(e.target.checked)}
                    className="w-4 h-4 rounded border-white/30 bg-white/10 text-cyan-500 focus:ring-cyan-500/50"
                  />
                  <label htmlFor="coupon" className="text-sm text-white/70 cursor-pointer select-none">{t.promoCode}</label>
                </div>
                {hasCoupon && (
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder={t.enterPromo}
                    className="mt-2 bg-black/30 border-white/10 text-white focus:border-cyan-500/50 h-10 font-body placeholder:text-white/20"
                  />
                )}
              </div>

              {/* Price Summary */}
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">{t.quantity}</span>
                  <span className="text-white font-mono">{quantity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">{t.pricePer1000}</span>
                  <span className="text-white font-mono">${service.pricePer1000}</span>
                </div>
                <div className="border-t border-cyan-500/20 pt-2 flex justify-between items-center">
                  <span className="text-cyan-200 font-bold">{t.totalCost}</span>
                  <div className="flex items-end gap-2">
                    <span className="text-xs text-cyan-300/50 line-through mb-1">${(totalPrice * 1.01).toFixed(2)}</span>
                    <span className="text-2xl font-bold text-cyan-400 font-mono">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full h-14 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-lg font-bold shadow-lg shadow-cyan-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                {t.confirmOrder}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Telegram Services View Component
interface TelegramServicesViewProps {
  onBack: () => void;
  onServiceClick: (id: string) => void;
}

function TelegramServicesView({ onBack, onServiceClick }: TelegramServicesViewProps) {
  const { t } = useLanguage();
  return (
    <div className="p-8">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 text-white/60 hover:text-white"
      >
        {t.backToJerry}
      </Button>
      <h2 className="font-space text-2xl text-white mb-6 tracking-wide drop-shadow-md">{t.telegramServices}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allTelegramServices.map((service) => (
          <Card
            key={service.id}
            onClick={() => onServiceClick(service.id)}
            className="group relative overflow-hidden bg-white/5 border-white/10 p-6 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer"
          >
            {/* Discount Badge */}
            <div className="absolute top-4 left-4 bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded-full border border-red-500/30">
              {service.discount}
            </div>

            <div className="mb-4">
              <h3 className="font-body text-lg text-white font-bold mb-2 leading-relaxed h-14 line-clamp-2">
                {service.name}
              </h3>
              <p className="text-white/50 text-sm h-10 line-clamp-2">
                {service.shortDesc}
              </p>
            </div>

            <div className="flex items-end justify-between mb-6">
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs line-through">{service.pricePer1000 > 0.1 ? `$${service.oldPrice}` : ''}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-space font-bold text-cyan-400">${service.pricePer1000}</span>
                  <span className="text-white/60 text-xs">/ 1000</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/40 mb-1">{t.quantity}</div>
                <div className="text-xs text-white/80 font-mono bg-white/5 px-2 py-1 rounded border border-white/5">
                  {service.min.toLocaleString()} - {service.max.toLocaleString()}
                </div>
              </div>
            </div>

            <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              {t.buyService}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Jerry Services View Component
interface JerryServicesViewProps {
  onBack: () => void;
  onServiceClick: (id: string) => void;
}

function JerryServicesView({ onBack, onServiceClick }: JerryServicesViewProps) {
  const { t } = useLanguage();
  const services = [
    { id: 'insta', name: t.instaServices, icon: Instagram, color: 'text-pink-500', bg: 'bg-pink-500/10 border-pink-500/20' },
    { id: 'tiktok', name: t.tiktokServices, icon: Music2, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { id: 'facebook', name: t.facebookServices, icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-600/10 border-blue-600/20' },
    { id: 'telegram', name: t.telegramServicesName, icon: Send, image: '/telegram-services.png', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
    { id: 'merchant', name: t.merchantServices, icon: Briefcase, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
    { id: 'telegram-premium', name: t.premiumTelegram, icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
    { id: 'telegram-stars', name: t.telegramStars, icon: Gift, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
  ];

  return (
    <div className="p-8">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 text-white/60 hover:text-white"
      >
        {t.backToCategories}
      </Button>
      <h2 className="font-space text-2xl text-white mb-6 tracking-wide drop-shadow-md">{t.jerryServices}</h2>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              onClick={() => onServiceClick && onServiceClick(service.id)}
              className="flex flex-col gap-3 group cursor-pointer"
            >
              <Card className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl border-0 bg-transparent overflow-hidden shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-cyan-500/20">
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className={`absolute inset-0 w-full h-full flex items-center justify-center ${service.bg} transition-colors`}>
                    <Icon className={`w-16 h-16 md:w-20 md:h-20 ${service.color} transition-transform duration-300 group-hover:scale-110`} />
                  </div>
                )}
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </Card>

              <div className="text-center">
                <h3 className="font-body text-base md:text-lg text-white font-bold group-hover:text-cyan-400 transition-colors">
                  {service.name}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Settings View Component
function SettingsView() {
  const { t } = useLanguage();
  return (
    <div className="p-8">
      <h2 className="font-space text-2xl text-white mb-6 tracking-wide drop-shadow-md">{t.settings}</h2>
      <Card className="p-8 bg-white/5 border-white/10 max-w-2xl backdrop-blur-sm">
        <div className="space-y-6">
          <div>
            <label className="block font-body text-white/80 mb-2">{t.name}</label>
            <Input className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50" placeholder={t.username} />
          </div>
          <div>
            <label className="block font-body text-white/80 mb-2">{t.email}</label>
            <Input className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50" placeholder="email@example.com" />
          </div>
          <div>
            <label className="block font-body text-white/80 mb-2">{t.currentPassword}</label>
            <Input type="password" className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50" placeholder="********" />
          </div>
          <div>
            <label className="block font-body text-white/80 mb-2">{t.newPassword}</label>
            <Input type="password" className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50" placeholder="********" />
          </div>
          <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/20">
            {t.saveChanges}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Add Funds View Component
function AddFundsView() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const { t } = useLanguage();

  const paymentMethods = [
    { id: 'asiacell', name: 'Asiacell', type: 'auto', image: '/asiacell.webp', color: 'bg-purple-600/10 border-purple-500/30', description: t.autoPayment },
    { id: 'zain-cash', name: 'Zain Cash', type: 'manual', image: '/zaincash.jpg', color: 'bg-pink-600/10 border-pink-500/30', description: t.manualPayment },
    { id: 'mastercard', name: 'MasterCard', type: 'auto', image: '/mastercard.png', color: 'bg-orange-500/10 border-orange-500/30', description: t.autoPayment },
    { id: 'usdt', name: 'USDT', type: 'auto', image: '/usdt.png', color: 'bg-green-500/10 border-green-500/30', description: t.autoPayment },
    { id: 'atheer', name: 'Atheer', type: 'auto', image: '/atheer.png', color: 'bg-blue-500/10 border-blue-500/30', description: t.autoPayment },
    { id: 'code', name: 'Coupon Code', type: 'code', image: '/code.png', color: 'bg-cyan-500/10 border-cyan-500/30', description: t.discountCode },
  ];

  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);

  return (
    <div className="p-8">
      <h2 className="font-space text-2xl text-white mb-6 tracking-wide drop-shadow-md">{t.addFunds}</h2>

      {!selectedMethod ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className="flex flex-col gap-3 group cursor-pointer"
            >
              {/* Card Container */}
              <Card className="relative w-full aspect-[4/3] rounded-3xl border-0 bg-transparent overflow-hidden shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-cyan-500/20">
                <img
                  src={method.image}
                  alt={method.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </Card>

              {/* Text Below */}
              <div className="text-center">
                <h3 className="font-body text-base md:text-lg text-white font-bold group-hover:text-cyan-400 transition-colors">
                  {method.name.split('|')[0]}
                </h3>
                <span className="text-xs text-white/50">{method.description}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Button
            variant="ghost"
            onClick={() => setSelectedMethod(null)}
            className="mb-6 text-white/60 hover:text-white"
          >
            {t.backToPayments}
          </Button>

          <Card className="p-8 bg-white/5 border-white/10 backdrop-blur-sm">
            <h3 className="font-space text-xl text-white mb-6 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden p-1">
                <img src={selectedMethodData?.image} alt={selectedMethodData?.name} className="w-full h-full object-contain" />
              </div>
              {selectedMethodData?.name}
            </h3>

            <div className="space-y-6">
              {/* Manual Payment (Zain Cash) */}
              {selectedMethodData?.type === 'manual' && (
                <div className="text-center space-y-4">
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-200">
                    <p className="font-body mb-2">{t.transferTo}</p>
                    <div className="flex items-center justify-center gap-2" dir="ltr">
                      <code className="text-xl font-mono bg-black/30 px-3 py-1 rounded">07800000000</code>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><span className="text-xs">{t.copy}</span></Button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-body text-white/80 mb-2">{t.amountTransferred}</label>
                    <Input type="number" className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50" placeholder="0.00" />
                  </div>

                  <Button
                    className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold gap-2"
                    onClick={() => window.open('https://t.me/your_admin_username', '_blank')}
                  >
                    <span>{t.sendProof}</span>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z" /></svg>
                  </Button>
                </div>
              )}

              {/* Code Payment */}
              {selectedMethodData?.type === 'code' && (
                <div>
                  <label className="block font-body text-white/80 mb-2">{t.code}</label>
                  <Input className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50" placeholder="XXXX-XXXX-XXXX" />
                  <Button className="w-full mt-4 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold shadow-lg shadow-cyan-500/20">
                    {t.redeemCode}
                  </Button>
                </div>
              )}

              {/* Auto Payment (Others) */}
              {selectedMethodData?.type === 'auto' && (
                <div>
                  <label className="block font-body text-white/80 mb-2">{t.amount}</label>
                  <Input type="number" className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50" placeholder="10.00" />

                  <div className="grid grid-cols-4 gap-2 mt-2 mb-6">
                    {[5, 10, 25, 50, 100].map(amount => (
                      <button key={amount} className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-colors text-sm">
                        ${amount}
                      </button>
                    ))}
                  </div>

                  <Button className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold shadow-lg shadow-cyan-500/20">
                    {t.continuePayment}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Support View Component
function SupportView() {
  const { t } = useLanguage();
  return (
    <div className="p-8">
      <h2 className="font-space text-2xl text-white mb-6 tracking-wide drop-shadow-md">{t.support}</h2>
      <Card className="p-8 bg-white/5 border-white/10 max-w-2xl backdrop-blur-sm">
        <div className="space-y-6">
          <div>
            <label className="block font-body text-white/80 mb-2">{t.subject}</label>
            <Input className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50" placeholder={t.ticketSubject} />
          </div>
          <div>
            <label className="block font-body text-white/80 mb-2">{t.message}</label>
            <textarea
              className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-cyan-500/50 focus:outline-none resize-none transition-colors"
              placeholder={t.writeMessage}
            />
          </div>
          <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/20">
            {t.sendTicket}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Terms of Use View
function TermsView() {
  const { t } = useLanguage();
  return (
    <div className="p-4 md:p-8 space-y-4 max-w-3xl">
      <h2 className="font-space text-2xl md:text-3xl text-white tracking-wide">{t.termsOfService}</h2>
      <Card className="p-5 md:p-8 bg-white/5 border-white/10 backdrop-blur-sm space-y-4">
        <div className="space-y-3 text-white/70 text-sm leading-relaxed font-body">
          <h3 className="text-white font-bold text-base">1. القبول بالشروط</h3>
          <p>باستخدامك لمنصة Jerry، فإنك توافق على جميع الشروط والأحكام المذكورة أدناه. يرجى قراءتها بعناية قبل استخدام أي خدمة.</p>

          <h3 className="text-white font-bold text-base">2. الخدمات المقدمة</h3>
          <p>نقدم خدمات التسويق الرقمي بما في ذلك زيادة المتابعين والمشاهدات واللايكات عبر منصات التواصل الاجتماعي المختلفة.</p>

          <h3 className="text-white font-bold text-base">3. سياسة الاسترداد</h3>
          <p>لا يمكن استرداد المبالغ بعد بدء تنفيذ الطلب. في حالة عدم اكتمال الطلب، سيتم إرجاع الرصيد المتبقي إلى حسابك.</p>

          <h3 className="text-white font-bold text-base">4. المسؤولية</h3>
          <p>لا تتحمل المنصة أي مسؤولية عن أي إجراءات تتخذها منصات التواصل الاجتماعي تجاه حساباتك نتيجة استخدام خدماتنا.</p>

          <h3 className="text-white font-bold text-base">5. الخصوصية</h3>
          <p>نحترم خصوصيتك ولا نشارك بياناتك الشخصية مع أي طرف ثالث. يتم استخدام بياناتك فقط لتقديم الخدمات المطلوبة.</p>
        </div>
      </Card>
    </div>
  );
}

// Updates View
function UpdatesView() {
  const { t } = useLanguage();
  const updates = [
    { version: 'v2.5', date: '2025-02-15', title: 'تحسينات واجهة المستخدم', description: 'تحسين التصميم العام وإضافة قائمة جانبية جديدة للموبايل مع تحسين سرعة التطبيق.', type: 'تحسين' },
    { version: 'v2.4', date: '2025-02-10', title: 'إضافة خدمات تليجرام', description: 'تمت إضافة خدمات جديدة لتليجرام تشمل الأعضاء والمشاهدات بضمانات متعددة.', type: 'جديد' },
    { version: 'v2.3', date: '2025-02-01', title: 'نظام البحث الذكي', description: 'إضافة خاصية البحث عن الخدمات والأقسام بالاسم من الشريط السفلي.', type: 'جديد' },
    { version: 'v2.2', date: '2025-01-25', title: 'دعم اللغة الكردية', description: 'إضافة دعم كامل للغة الكردية مع تحسينات على اللغة العربية والإنجليزية.', type: 'جديد' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-4 max-w-3xl">
      <h2 className="font-space text-2xl md:text-3xl text-white tracking-wide">{t.updates}</h2>

      <div className="space-y-3">
        {updates.map((update, i) => (
          <Card key={i} className="p-4 md:p-5 bg-white/5 border-white/10 backdrop-blur-sm hover:border-cyan-500/20 transition-all">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {update.version}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${update.type === 'جديد' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                  {update.type}
                </span>
              </div>
              <span className="text-white/30 text-xs font-mono">{update.date}</span>
            </div>
            <h3 className="text-white font-bold text-sm mb-1">{update.title}</h3>
            <p className="text-white/50 text-xs leading-relaxed">{update.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [activeItem, setActiveItem] = useState('new-order');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const renderContent = () => {
    switch (activeItem) {
      case 'new-order':
        return <NewOrderView onServiceClick={(id) => {
          if (id === '1') setActiveItem('jerry-services');
        }} />;
      case 'jerry-services':
        return <JerryServicesView
          onBack={() => setActiveItem('new-order')}
          onServiceClick={(id) => {
            if (id === 'telegram') setActiveItem('telegram-services');
          }}
        />;
      case 'telegram-services':
        return <TelegramServicesView
          onBack={() => setActiveItem('jerry-services')}
          onServiceClick={(id) => {
            setSelectedService(id);
            setActiveItem('service-details');
          }}
        />;
      case 'service-details':
        return <ServiceDetailsView
          serviceId={selectedService || ''}
          onBack={() => setActiveItem('telegram-services')}
        />;
      case 'search':
        return <SearchView onNavigate={setActiveItem} />;
      case 'orders':
        return <OrdersView />;
      case 'settings':
        return <SettingsView />;
      case 'support':
        return <SupportView />;
      case 'add-funds':
        return <AddFundsView />;
      case 'terms':
        return <TermsView />;
      case 'updates':
        return <UpdatesView />;
      default:
        return <NewOrderView onServiceClick={() => { }} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a1a] relative overflow-hidden">
      {/* Background Starfield - Lower Z-Index */}
      <div className="absolute inset-0 z-0 opacity-50">
        <Starfield starCount={1000} speed={0.03} />
      </div>

      <Sidebar activeItem={activeItem} onItemClick={setActiveItem} hideBottomBar={showMobileMenu} />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 bg-black/20 backdrop-blur-[2px]">
        <Header onAddFundsClick={() => setActiveItem('add-funds')} onNavigate={setActiveItem} showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu} />
        <main className="flex-1 overflow-y-auto custom-scrollbar pb-32 md:pb-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}