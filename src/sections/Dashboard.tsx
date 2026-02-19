import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/custom/Sidebar';
import Header from '@/components/custom/Header';
import ServicesList from '@/components/custom/ServicesList';
import CategoryBrowser from '@/components/custom/CategoryBrowser';
import Starfield from '@/components/Starfield';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Orders View Component
function OrdersView() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();
  const { user } = useAuth();

  const filters = [
    { id: 'all', label: t.allOrders, icon: ShoppingCart, color: 'text-cyan-400', activeBg: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' },
    { id: 'pending', label: t.pending, icon: Clock, color: 'text-yellow-400', activeBg: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' },
    { id: 'completed', label: t.completed, icon: CheckCircle, color: 'text-green-400', activeBg: 'bg-green-500/20 border-green-500/50 text-green-400' },
    { id: 'cancelled', label: t.cancelled, icon: XCircle, color: 'text-red-400', activeBg: 'bg-red-500/20 border-red-500/50 text-red-400' },
  ];

  const statusColorMap: Record<string, string> = {
    completed: 'text-green-400 bg-green-500/20 border-green-500/30',
    pending: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    processing: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    cancelled: 'text-red-400 bg-red-500/20 border-red-500/30',
  };

  const statusLabelMap: Record<string, string> = {
    completed: t.completed, pending: t.pending, processing: t.processing || 'Processing', cancelled: t.cancelled,
  };

  const [allOrders, setAllOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user?._id) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${API_URL}/orders?userId=${user._id}`)
      .then(r => r.json())
      .then(orders => {
        setAllOrders(orders.map((o: any) => ({
          id: o.orderId,
          service: o.serviceName,
          quantity: String(o.quantity),
          price: `$${o.price.toFixed(2)}`,
          rawStatus: o.status,
          status: statusLabelMap[o.status] || o.status,
          date: new Date(o.createdAt).toISOString().split('T')[0],
          statusColor: statusColorMap[o.status] || statusColorMap.pending,
        })));
      })
      .catch(console.error);
  }, [user?._id]);

  const filteredOrders = allOrders.filter(order => {
    if (statusFilter !== 'all' && order.rawStatus !== statusFilter) return false;
    if (searchQuery) {
      return order.id.toLowerCase().includes(searchQuery.toLowerCase().replace('#', ''));
    }
    return true;
  });

  return (
    <div className="p-4 md:p-8 space-y-4">
      {/* Title */}
      <h3 className="font-space text-xl md:text-3xl text-white tracking-wide">{t.myOrders}</h3>

      {/* Filter Tabs - horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = statusFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-300 whitespace-nowrap text-xs md:text-sm shrink-0
                ${isActive
                  ? `${filter.activeBg} shadow-[0_0_15px_rgba(0,0,0,0.3)]`
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'scale-110' : 'opacity-70'} transition-transform`} />
              <span className="font-body font-medium">{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <Input
          placeholder={`${t.search} ${t.orderId}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-500/50 focus:ring-cyan-500/20 h-10"
        />
      </div>

      {/* Orders - Mobile Cards */}
      <div className="md:hidden space-y-2.5">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-white/30">
            <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t.noResults || 'لا توجد طلبات'}</p>
          </div>
        ) : filteredOrders.map((order) => (
          <Card key={order.id} className="p-3 bg-white/5 border-white/10">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{order.service}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                  <span className="text-cyan-400 font-mono">{order.id}</span>
                  <span>×{order.quantity}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-green-400 font-mono font-bold text-sm">{order.price}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${order.statusColor}`}>
                  {order.status}
                </span>
              </div>
            </div>
            <p className="text-white/30 text-[10px] mt-1.5">{order.date}</p>
          </Card>
        ))}
      </div>

      {/* Orders - Desktop Table */}
      <Card className="hidden md:block bg-white/5 border-white/10 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-right font-body text-white/60 text-sm">{t.orderId}</th>
                <th className="px-6 py-4 text-right font-body text-white/60 text-sm">{t.service}</th>
                <th className="px-6 py-4 text-right font-body text-white/60 text-sm">{t.quantity}</th>
                <th className="px-6 py-4 text-right font-body text-white/60 text-sm">{t.price}</th>
                <th className="px-6 py-4 text-right font-body text-white/60 text-sm">{t.status}</th>
                <th className="px-6 py-4 text-right font-body text-white/60 text-sm">{t.date}</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-space text-cyan-400 group-hover:text-cyan-300 transition-colors text-sm">{order.id}</td>
                  <td className="px-6 py-4 font-body text-white text-sm">{order.service}</td>
                  <td className="px-6 py-4 font-body text-white/80 text-sm">{order.quantity}</td>
                  <td className="px-6 py-4 font-space text-white text-sm">{order.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${order.statusColor} whitespace-nowrap`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-body text-white/60 text-sm whitespace-nowrap">{order.date}</td>
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
    { id: '1823', name: 'ط§ط¹ط¶ط§ط، طھظ„ظٹط¬ط±ط§ظ… ط­ط³ط§ط¨ط§طھ ظ…ط­ط°ظˆظپظ‡', category: (t as any).telegramServicesName || 'Telegram', target: 'telegram-services' },
    { id: '1824', name: 'ط§ط¹ط¶ط§ط، طھظ„ظٹط¬ط±ط§ظ… ط¨ط¯ظˆظ† ظ†ط²ظˆظ„ ظ„ظ„ط§ط¨ط¯ (ظ…ظ…ظ„ظˆظƒظ‡)', category: (t as any).telegramServicesName || 'Telegram', target: 'telegram-services' },
    { id: '1825', name: 'ط§ط¹ط¶ط§ط، طھظ„ظٹط¬ط±ط§ظ… ط¨ط¯ظˆظ† ظ†ط²ظˆظ„ ظ„ظ„ط§ط¨ط¯ ظ„ظ„ظƒط±ظˆط¨ط§طھ (ظ…ظ…ظ„ظˆظƒظ‡)', category: (t as any).telegramServicesName || 'Telegram', target: 'telegram-services' },
    { id: '1826', name: 'ط§ط¹ط¶ط§ط، طھظ„ظٹط¬ط±ط§ظ… ط±ط®ظٹطµ (ظ…ظ…ظ„ظˆظƒظ‡)', category: (t as any).telegramServicesName || 'Telegram', target: 'telegram-services' },
    { id: '1827', name: 'ظ…ط´ط§ظ‡ط¯ط§طھ طھظ„ظٹط¬ط±ط§ظ…', category: (t as any).telegramServicesName || 'Telegram', target: 'telegram-services' },
    // Instagram
    { id: 'insta-1', name: 'ظ…طھط§ط¨ط¹ظٹظ† ط§ظ†ط³طھظ‚ط±ط§ظ…', category: (t as any).instaServices || 'Instagram', target: 'jerry-services' },
    { id: 'insta-2', name: 'ظ„ط§ظٹظƒط§طھ ط§ظ†ط³طھظ‚ط±ط§ظ…', category: (t as any).instaServices || 'Instagram', target: 'jerry-services' },
    // TikTok
    { id: 'tiktok-1', name: 'ظ…طھط§ط¨ط¹ظٹظ† طھظٹظƒ طھظˆظƒ', category: (t as any).tiktokServices || 'TikTok', target: 'jerry-services' },
    { id: 'tiktok-2', name: 'ظ…ط´ط§ظ‡ط¯ط§طھ طھظٹظƒ طھظˆظƒ', category: (t as any).tiktokServices || 'TikTok', target: 'jerry-services' },
    // Facebook
    { id: 'fb-1', name: 'ظ„ط§ظٹظƒط§طھ ظپظٹط³ط¨ظˆظƒ', category: (t as any).facebookServices || 'Facebook', target: 'jerry-services' },
    { id: 'fb-2', name: 'ظ…طھط§ط¨ط¹ظٹظ† ظپظٹط³ط¨ظˆظƒ', category: (t as any).facebookServices || 'Facebook', target: 'jerry-services' },
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
              <p className="text-white/40 text-sm">ظ„ط§ طھظˆط¬ط¯ ظ†طھط§ط¦ط¬</p>
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
  onServiceClick: (id: string, name?: string) => void;
}

function NewOrderView({ onServiceClick }: NewOrderViewProps) {
  const { t } = useLanguage();
  return (
    <div className="p-4 md:p-8">
      <h2 className="font-space text-2xl text-white mb-6 tracking-wide drop-shadow-md">{t.newOrder}</h2>
      <ServicesList onServiceClick={onServiceClick} />
    </div>
  );
}

// All Telegram Services Data
const allTelegramServices = [
  {
    id: '1823',
    name: 'ط§ط¹ط¶ط§ط، طھظ„ظٹط¬ط±ط§ظ… ط­ط³ط§ط¨ط§طھ ظ…ط­ط°ظˆظپظ‡',
    pricePer1000: 2.00,
    oldPrice: 2.02,
    discount: '-1%',
    min: 500,
    max: 60000,
    category: 'ط®ط¯ظ…ط§طھ طھظ„ظٹط¬ط±ط§ظ… | ط¬ظٹط±ظٹ',
    shortDesc: 'ط­ط³ط§ط¨ط§طھ ظ…ط­ط°ظˆظپط©طŒ ط¬ظˆط¯ط© ظ…ظ†ط®ظپط¶ط©طŒ ط¨ط¯ط، ظپظˆط±ظٹ',
    description: `- ط§ظ„ط¨ط¯ط§ط، : 0 -4 ط³ط§ط¹ط§طھ ًںڑ©
- ط§ظ„ط¶ظ…ط§ظ† : ط­ط³ط§ط¨ط§طھ ظ…ط­ط°ظˆظپظ‡ ظھ0 ظ†ط²ظˆط§ ًںڈ®
- ط§ظ„ط±ط§ط¨ط· : ط±ط§ط¨ط· ط¯ط¹ظˆط© ًںڈ®
- ط§ظ„ط¬ظˆط¯ظ‡ : HQ ًںڈ®
- طھظ‚ط¨ظ„ ظƒط±ظˆط¨ط§طھ / ظ‚ظ†ظˆط§طھ ًںژ‰

- طھظˆط¶ظٹط­ ظ…ظ‡ظ… : ط§ظ„ط­ط³ط§ط¨ط§طھ ط¨طھط¯ط±ظٹط¬ ط±ط§ط­ طھظ†ط­ط°ظپ ظ…ط¹ظ‰ ظ…ط±ظˆط± ط§ظ„ط§ظٹط§ظ… . طھظ… ط§ظ„طھط­ظ‚ظ‚ ظ…ظ† ط§ظ„ط®ط¯ظ…ظ‡ ظˆط§ظ„ط®ط¯ظ…ظ‡ 100/100ط­ط³ط§ط¨ط§طھ ظ…ط­ط°ظˆظپظ‡`,
    details: [
      { label: 'ط³ط±ط¹ط© ط§ظ„ط®ط¯ظ…ظ‡', value: 'ط§ظ„ط®ط¯ظ…ط© ط·ط¨ظٹط¹ظٹظ‡' },
      { label: 'ظ†ط³ط¨ظ‡ ط§ظ„ظ†ط²ظˆظ„', value: 'ظ…ط²ظٹط¬ ط¨ظٹظ† ط§ظ„ظˆظ‡ظ…ظٹ ظˆط§ظ„ط­ظ‚ظٹظ‚ظٹ' },
      { label: 'ط¶ظ…ط§ظ†', value: '0 ظٹظˆظ…' },
      { label: 'ط§ظ„ط³ط±ط¹ط©', value: '50K ظپظٹ ط§ظ„ظٹظˆظ…' },
    ]
  },
  {
    id: '1824',
    name: 'ط§ط¹ط¶ط§ط، طھظ„ظٹط¬ط±ط§ظ… ط¨ط¯ظˆظ† ظ†ط²ظˆظ„ ظ„ظ„ط§ط¨ط¯ (ظ…ظ…ظ„ظˆظƒظ‡)',
    pricePer1000: 1.20,
    oldPrice: 1.21,
    discount: '-1%',
    min: 50,
    max: 50000,
    category: 'ط®ط¯ظ…ط§طھ طھظ„ظٹط¬ط±ط§ظ… | ط¬ظٹط±ظٹ',
    shortDesc: 'ط¶ظ…ط§ظ† ط¹ط¯ظ… ط§ظ„ظ†ط²ظˆظ„ ظ…ط¯ظ‰ ط§ظ„ط­ظٹط§ط©طŒ ط­ط³ط§ط¨ط§طھ ط¹ط§ظ„ظٹط© ط§ظ„ط¬ظˆط¯ط©',
    description: `- ط§ظ„ط¨ط¯ط§ط، : 0 -2 ط³ط§ط¹ط§طھ ًںڑ©
- ط§ظ„ط¶ظ…ط§ظ† : ط¨ط¯ظˆظ† ظ†ط²ظˆظ„ ظ„ظ„ط§ط¨ط¯ â™¾ï¸ڈ ًںڈ®
- ط§ظ„ط±ط§ط¨ط· : ط±ط§ط¨ط· ط¯ط¹ظˆط© / ظٹظˆط²ط± ًںڈ®
- ط§ظ„ط¬ظˆط¯ظ‡ : HQ - ط­ط³ط§ط¨ط§طھ ظ…ظ…ظ„ظˆظƒظ‡ ًںڈ®
- طھظ‚ط¨ظ„ ظ‚ظ†ظˆط§طھ ظپظ‚ط· ًںژ‰

- طھظˆط¶ظٹط­ ظ…ظ‡ظ… : ط§ط¹ط¶ط§ط، ط­ظ‚ظٹظ‚ظٹظٹظ† ط¨ط¯ظˆظ† ظ†ط²ظˆظ„ ظ†ظ‡ط§ط¦ظٹط§ظ‹طŒ ط®ط¯ظ…ط© ظ…ظ…ظ„ظˆظƒط© ط¨ط¶ظ…ط§ظ† ظ…ط¯ظ‰ ط§ظ„ط­ظٹط§ط©`,
    details: [
      { label: 'ط³ط±ط¹ط© ط§ظ„ط®ط¯ظ…ظ‡', value: 'ط³ط±ظٹط¹ط©' },
      { label: 'ظ†ط³ط¨ظ‡ ط§ظ„ظ†ط²ظˆظ„', value: '0% - ط¨ط¯ظˆظ† ظ†ط²ظˆظ„' },
      { label: 'ط¶ظ…ط§ظ†', value: 'ظ…ط¯ظ‰ ط§ظ„ط­ظٹط§ط© â™¾ï¸ڈ' },
      { label: 'ط§ظ„ط³ط±ط¹ط©', value: '30K ظپظٹ ط§ظ„ظٹظˆظ…' },
    ]
  },
  {
    id: '1825',
    name: 'ط§ط¹ط¶ط§ط، طھظ„ظٹط¬ط±ط§ظ… ط¨ط¯ظˆظ† ظ†ط²ظˆظ„ ظ„ظ„ط§ط¨ط¯ ظ„ظ„ظƒط±ظˆط¨ط§طھ (ظ…ظ…ظ„ظˆظƒظ‡)',
    pricePer1000: 1.20,
    oldPrice: 1.21,
    discount: '-1%',
    min: 50,
    max: 20000,
    category: 'ط®ط¯ظ…ط§طھ طھظ„ظٹط¬ط±ط§ظ… | ط¬ظٹط±ظٹ',
    shortDesc: 'ظ…ط®طµطµ ظ„ظ„ظ…ط¬ظ…ظˆط¹ط§طھطŒ ط¶ظ…ط§ظ† ظ…ط¯ظ‰ ط§ظ„ط­ظٹط§ط©',
    description: `- ط§ظ„ط¨ط¯ط§ط، : 0 -2 ط³ط§ط¹ط§طھ ًںڑ©
- ط§ظ„ط¶ظ…ط§ظ† : ط¨ط¯ظˆظ† ظ†ط²ظˆظ„ ظ„ظ„ط§ط¨ط¯ â™¾ï¸ڈ ًںڈ®
- ط§ظ„ط±ط§ط¨ط· : ط±ط§ط¨ط· ط¯ط¹ظˆط© ظƒط±ظˆط¨ ًںڈ®
- ط§ظ„ط¬ظˆط¯ظ‡ : HQ - ط­ط³ط§ط¨ط§طھ ظ…ظ…ظ„ظˆظƒظ‡ ًںڈ®
- طھظ‚ط¨ظ„ ظƒط±ظˆط¨ط§طھ ظپظ‚ط· ًںژ‰

- طھظˆط¶ظٹط­ ظ…ظ‡ظ… : ط§ط¹ط¶ط§ط، ط­ظ‚ظٹظ‚ظٹظٹظ† ظ…ط®طµطµظٹظ† ظ„ظ„ظƒط±ظˆط¨ط§طھ ط¨ط¶ظ…ط§ظ† ظ…ط¯ظ‰ ط§ظ„ط­ظٹط§ط© ط¨ط¯ظˆظ† ظ†ط²ظˆظ„`,
    details: [
      { label: 'ط³ط±ط¹ط© ط§ظ„ط®ط¯ظ…ظ‡', value: 'ط³ط±ظٹط¹ط©' },
      { label: 'ظ†ط³ط¨ظ‡ ط§ظ„ظ†ط²ظˆظ„', value: '0% - ط¨ط¯ظˆظ† ظ†ط²ظˆظ„' },
      { label: 'ط¶ظ…ط§ظ†', value: 'ظ…ط¯ظ‰ ط§ظ„ط­ظٹط§ط© â™¾ï¸ڈ' },
      { label: 'ط§ظ„ط³ط±ط¹ط©', value: '20K ظپظٹ ط§ظ„ظٹظˆظ…' },
    ]
  },
  {
    id: '1826',
    name: 'ط§ط¹ط¶ط§ط، طھظ„ظٹط¬ط±ط§ظ… ط±ط®ظٹطµ (ظ…ظ…ظ„ظˆظƒظ‡) م€½ï¸ڈ',
    pricePer1000: 0.07,
    oldPrice: 0.07,
    discount: '-1%',
    min: 100,
    max: 100000,
    category: 'ط®ط¯ظ…ط§طھ طھظ„ظٹط¬ط±ط§ظ… | ط¬ظٹط±ظٹ',
    shortDesc: 'ط§ط±ط®طµ ط®ط¯ظ…ط© ظپظٹ ط§ظ„ط³ظˆظ‚طŒ ط³ط±ط¹ط© ظ…طھظˆط³ط·ط©',
    description: `- ط§ظ„ط¨ط¯ط§ط، : 0 -6 ط³ط§ط¹ط§طھ ًںڑ©
- ط§ظ„ط¶ظ…ط§ظ† : ظ„ط§ ظٹظˆط¬ط¯ ط¶ظ…ط§ظ† ًںڈ®
- ط§ظ„ط±ط§ط¨ط· : ط±ط§ط¨ط· ط¯ط¹ظˆط© / ظٹظˆط²ط± ًںڈ®
- ط§ظ„ط¬ظˆط¯ظ‡ : Low - ط­ط³ط§ط¨ط§طھ ظ…ظ…ظ„ظˆظƒظ‡ ًںڈ®
- طھظ‚ط¨ظ„ ظƒط±ظˆط¨ط§طھ / ظ‚ظ†ظˆط§طھ ًںژ‰

- طھظˆط¶ظٹط­ ظ…ظ‡ظ… : ط§ط±ط®طµ ط®ط¯ظ…ط© ط§ط¹ط¶ط§ط، ظپظٹ ط§ظ„ط³ظˆظ‚طŒ ظ…ظ†ط§ط³ط¨ط© ظ„ظ…ظ† ظٹط±ظٹط¯ ط§ط±ظ‚ط§ظ… ظƒط¨ظٹط±ط© ط¨ط£ظ‚ظ„ ط³ط¹ط±`,
    details: [
      { label: 'ط³ط±ط¹ط© ط§ظ„ط®ط¯ظ…ظ‡', value: 'ظ…طھظˆط³ط·ط©' },
      { label: 'ظ†ط³ط¨ظ‡ ط§ظ„ظ†ط²ظˆظ„', value: 'ظ…ظ…ظƒظ† ظ†ط²ظˆظ„ ط¨ط³ظٹط·' },
      { label: 'ط¶ظ…ط§ظ†', value: 'ظ„ط§ ظٹظˆط¬ط¯' },
      { label: 'ط§ظ„ط³ط±ط¹ط©', value: '100K ظپظٹ ط§ظ„ظٹظˆظ…' },
    ]
  },
];

// Service Details View Component
interface ServiceDetailsViewProps {
  serviceId: string;
  serviceData?: { name: string; price: number; min: number; max: number; description?: string; speed?: string; dropRate?: string; guarantee?: string; startTime?: string; autoId?: string };
  onBack: () => void;
}

function ServiceDetailsView({ serviceId, serviceData, onBack }: ServiceDetailsViewProps) {
  const [quantity, setQuantity] = useState<number>(serviceData?.min || 1000);
  const [link, setLink] = useState('');
  const [hasCoupon, setHasCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<{ success: boolean; message: string; orderId?: string } | null>(null);
  const { t } = useLanguage();
  const { user, refreshUser } = useAuth();

  // Use dynamic service data from API if available, fallback to hardcoded
  const hardcodedService = allTelegramServices.find(s => s.id === serviceId);
  const serviceName = serviceData?.name || hardcodedService?.name || '';
  const servicePrice = Math.round(((serviceData?.price ?? hardcodedService?.pricePer1000 ?? 0)) * 100) / 100;
  const serviceMin = serviceData?.min ?? hardcodedService?.min ?? 100;
  const serviceMax = serviceData?.max ?? hardcodedService?.max ?? 10000;
  const serviceDesc = serviceData?.description || hardcodedService?.description || '';
  const totalPrice = Math.round((quantity / 1000) * servicePrice * 100) / 100;

  const handleSubmitOrder = async () => {
    if (!user) return;
    if (quantity < serviceMin || quantity > serviceMax) {
      setOrderResult({ success: false, message: t.invalidQuantity || `الكمية يجب أن تكون بين ${serviceMin} و ${serviceMax}` });
      return;
    }
    if ((user.balance || 0) < totalPrice) {
      setOrderResult({ success: false, message: t.insufficientBalance || 'رصيدك غير كافي' });
      return;
    }

    setOrderLoading(true);
    setOrderResult(null);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          serviceId: serviceData ? serviceId : '',
          serviceName,
          quantity,
          price: totalPrice,
          link,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOrderResult({ success: false, message: data.error || 'حدث خطأ' });
      } else {
        setOrderResult({ success: true, message: t.orderSuccess || 'تم الطلب بنجاح! ✅', orderId: data.orderId });
        await refreshUser();
      }
    } catch {
      setOrderResult({ success: false, message: t.connectionError || 'خطأ في الاتصال' });
    }
    setOrderLoading(false);
  };

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
              <h2 className="text-xl font-bold text-white font-body leading-relaxed flex-1">{serviceName}</h2>
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-mono border border-cyan-500/30 shrink-0">#{serviceData?.autoId || serviceId.slice(-4)}</span>
            </div>

            {/* Price Badge */}
            <div className="flex items-center gap-3 mb-6 p-3 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/20">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-cyan-400 font-space">${servicePrice}</span>
                <span className="text-white/40 text-sm">/ {t.perUnit || 'لكل وحدة'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {serviceData?.speed && (
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-xs text-white/40 mb-1">âڑ، {t.speed || 'Speed'}</div>
                  <div className="text-sm text-white font-medium">{serviceData.speed}</div>
                </div>
              )}
              {serviceData?.guarantee && (
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-xs text-white/40 mb-1">ًں›،ï¸ڈ {t.guarantee || 'Guarantee'}</div>
                  <div className="text-sm text-white font-medium">{serviceData.guarantee}</div>
                </div>
              )}
              {serviceData?.dropRate && (
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-xs text-white/40 mb-1">ًں“‰ {t.dropRate || 'Drop Rate'}</div>
                  <div className="text-sm text-white font-medium">{serviceData.dropRate}</div>
                </div>
              )}
              {serviceData?.startTime && (
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-xs text-white/40 mb-1">ًں•گ {t.startTime}</div>
                  <div className="text-sm text-white font-medium">{serviceData.startTime}</div>
                </div>
              )}
              {!serviceData && hardcodedService?.details?.map((detail: any, index: number) => (
                <div key={index} className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-xs text-white/40 mb-1">{detail.label}</div>
                  <div className="text-sm text-white font-medium">{detail.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
              <h3 className="text-white/80 font-bold mb-3 text-sm">{t.serviceDesc}</h3>
              <div className="text-white/60 text-sm whitespace-pre-line leading-relaxed font-body">
                {serviceDesc}
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
                  <span className="text-xs text-white/40 font-mono">Min: {serviceMin} - Max: {serviceMax.toLocaleString()}</span>
                </label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-black/30 border-white/10 text-white focus:border-cyan-500/50 h-12 text-lg font-mono"
                />
                {/* Quick Quantity Buttons */}
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[serviceMin, 1000, 5000, 10000].map(q => (
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
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://t.me/..."
                  className="bg-black/30 border-white/10 text-white focus:border-cyan-500/50 h-12 font-body placeholder:text-white/20"
                  dir="ltr"
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
                  <span className="text-white font-mono">${servicePrice}</span>
                </div>
                <div className="border-t border-cyan-500/20 pt-2 flex justify-between items-center">
                  <span className="text-cyan-200 font-bold">{t.totalCost}</span>
                  <div className="flex items-end gap-2">
                    <span className="text-xs text-cyan-300/50 line-through mb-1">${(totalPrice * 1.01).toFixed(2)}</span>
                    <span className="text-2xl font-bold text-cyan-400 font-mono">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {orderResult && (
                <div className={`p-3 rounded-xl text-sm font-bold text-center border ${orderResult.success
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                  {orderResult.message}
                  {orderResult.orderId && <span className="block text-xs mt-1 font-mono text-white/50">{orderResult.orderId}</span>}
                </div>
              )}

              <Button
                onClick={handleSubmitOrder}
                disabled={orderLoading || orderResult?.success}
                className="w-full h-14 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-lg font-bold shadow-lg shadow-cyan-500/20 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {orderLoading ? (
                  <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.processing || 'جاري المعالجة...'}</span>
                ) : orderResult?.success ? (
                  t.orderPlaced || '✅ تم الطلب'
                ) : (
                  t.confirmOrder
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Settings View Component

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
  const [gateways, setGateways] = useState<Array<{
    _id: string; type: string; name: string; nameAr: string; image: string;
    isEnabled: boolean; mode: string; accountNumber: string;
    contactType: string; contactValue: string;
    instructionText: string; instructionTextAr: string; destination: string;
  }>>([]);
  const [autoAmount, setAutoAmount] = useState('');
  const [cryptoPayment, setCryptoPayment] = useState<{
    paymentId: string; payAddress: string; payAmount: number;
    payCurrency: string; priceAmount: number; status: string;
    expirationDate?: string;
  } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [copied, setCopied] = useState(false);
  const [manualAmount, setManualAmount] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  // Asiacell payment state
  const [acStep, setAcStep] = useState<'phone' | 'otp' | 'amount' | 'confirm' | 'success'>('phone');
  const [acPhone, setAcPhone] = useState('');
  const [acOtp, setAcOtp] = useState('');
  const [acAmount, setAcAmount] = useState('');
  const [acConfirmOtp, setAcConfirmOtp] = useState('');
  const [acSessionId, setAcSessionId] = useState('');
  const [acUsername, setAcUsername] = useState('');
  const [acLoading, setAcLoading] = useState(false);
  const [acError, setAcError] = useState('');
  const [acCredited, setAcCredited] = useState(0);
  const { t, lang } = useLanguage();
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    fetch(`${API_URL}/gateways/public`).then(r => r.json()).then(setGateways).catch(console.error);
  }, []);

  // Poll payment status
  useEffect(() => {
    if (!cryptoPayment?.paymentId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/nowpayments/status/${cryptoPayment.paymentId}`);
        const data = await res.json();
        setPaymentStatus(data.status);
        if (data.status === 'finished' || data.status === 'confirmed' || data.status === 'partially_paid') {
          clearInterval(interval);
          await refreshUser();
        }
      } catch { /* ignore */ }
    }, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [cryptoPayment?.paymentId]);

  // Build payment methods from API + built-in coupon option
  const paymentMethods = [
    ...gateways.map(gw => ({
      id: gw._id,
      name: lang === 'ar' && gw.nameAr ? gw.nameAr : gw.name,
      type: gw.type === 'auto' && gw.mode === 'manual' ? 'manual' : gw.type,
      image: gw.image || (/^07\d/.test(gw.destination || '') ? '/asiacell.webp' : '/placeholder.png'),
      accountNumber: gw.accountNumber,
      contactType: gw.contactType,
      contactValue: gw.contactValue,
      instructionText: lang === 'ar' && gw.instructionTextAr ? gw.instructionTextAr : gw.instructionText,
      destination: gw.destination,
      description: gw.type === 'auto' && gw.mode === 'auto' ? t.autoPayment : t.manualPayment,
    })),
    { id: 'coupon', name: lang === 'ar' ? '\u0643\u0648\u0628\u0648\u0646' : 'Coupon Code', type: 'code', image: '/code.png', description: t.discountCode, accountNumber: '', contactType: '', contactValue: '', instructionText: '', destination: '' },
  ];

  const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);
  const isAsiacell = selectedMethodData?.type === 'auto' && /^07\d/.test(selectedMethodData?.destination || '');

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const createCryptoPayment = async () => {
    if (!autoAmount || parseFloat(autoAmount) < 1 || !user?._id) return;
    setPaymentLoading(true);
    setPaymentError('');
    try {
      const res = await fetch(`${API_URL}/nowpayments/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: autoAmount,
          currency: selectedMethodData?.destination || 'usdtarb',
          userId: user._id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCryptoPayment(data);
        setPaymentStatus(data.status);
      } else {
        setPaymentError(data.error || 'Payment creation failed');
      }
    } catch {
      setPaymentError('Connection error');
    }
    setPaymentLoading(false);
  };

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
              <Card className="relative w-full aspect-[4/3] rounded-3xl border-0 bg-transparent overflow-hidden shadow-lg transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-cyan-500/20">
                <img
                  src={method.image}
                  alt={method.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              </Card>
              <div className="text-center">
                <h3 className="font-body text-base md:text-lg text-white font-bold group-hover:text-cyan-400 transition-colors">
                  {method.name}
                </h3>
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
              {/* Manual Payment */}
              {selectedMethodData?.type === 'manual' && (
                <div className="space-y-4">
                  {selectedMethodData.accountNumber && (
                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                      <p className="text-yellow-200 font-body mb-2 text-sm">{t.transferTo}</p>
                      <div className="flex items-center justify-center gap-2" dir="ltr">
                        <code className="text-xl font-mono bg-black/30 px-3 py-1 rounded text-white">{selectedMethodData.accountNumber}</code>
                        <Button size="sm" variant="ghost" onClick={() => copyText(selectedMethodData.accountNumber)} className="h-8 px-2 text-xs text-white/60 hover:text-white">
                          {copied ? '✅' : t.copy}
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedMethodData.instructionText && (
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-white/60 text-sm">📋 {selectedMethodData.instructionText}</p>
                    </div>
                  )}

                  <div>
                    <label className="block font-body text-white/80 mb-2">{t.amountTransferred}</label>
                    <Input type="number" value={manualAmount} onChange={e => setManualAmount(e.target.value)} className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50" placeholder="0.00" />
                  </div>

                  {selectedMethodData.contactType && selectedMethodData.contactValue && (
                    <Button
                      className={`w-full h-12 font-bold gap-2 ${selectedMethodData.contactType === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                      onClick={() => {
                        const msg = lang === 'ar'
                          ? `طلب شحن رصيد\n👤 المستخدم: ${user?.username || ''}\n💳 طريقة الدفع: ${selectedMethodData?.name || ''}\n💰 المبلغ المحول: ${manualAmount || '0'}$\n📋 رقم الحساب: ${selectedMethodData?.accountNumber || ''}`
                          : `Balance top-up request\n👤 Username: ${user?.username || ''}\n💳 Payment method: ${selectedMethodData?.name || ''}\n💰 Amount transferred: $${manualAmount || '0'}\n📋 Account: ${selectedMethodData?.accountNumber || ''}`;
                        const encodedMsg = encodeURIComponent(msg);
                        if (selectedMethodData.contactType === 'whatsapp') {
                          window.open(`https://wa.me/${selectedMethodData.contactValue.replace(/[^0-9]/g, '')}?text=${encodedMsg}`, '_blank');
                        } else {
                          window.open(`https://t.me/${selectedMethodData.contactValue.replace('@', '')}?text=${encodedMsg}`, '_blank');
                        }
                      }}
                    >
                      {t.sendProofVia} {selectedMethodData.contactType === 'whatsapp' ? t.whatsapp : t.telegram}
                      {selectedMethodData.contactType === 'whatsapp' ? (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.66 0-3.203-.51-4.484-1.375l-.32-.191-2.872.855.855-2.872-.191-.32A7.963 7.963 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" /></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z" /></svg>
                      )}
                    </Button>
                  )}
                </div>
              )}

              {/* Code Payment */}
              {selectedMethodData?.type === 'code' && (
                <div>
                  <label className="block font-body text-white/80 mb-2">{t.code}</label>
                  <Input
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 font-mono tracking-widest text-center text-lg"
                    placeholder="XXXX-XXXX-XXXX"
                    dir="ltr"
                  />
                  {couponMsg && (
                    <div className={`mt-3 p-3 rounded-lg text-sm font-body ${couponMsg.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'}`}>
                      {couponMsg.text}
                    </div>
                  )}
                  <Button
                    onClick={async () => {
                      if (!couponCode.trim() || !user?._id) return;
                      setIsRedeeming(true);
                      setCouponMsg(null);
                      try {
                        const res = await fetch(`${API_URL}/coupons/redeem`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ code: couponCode.trim(), userId: user._id }),
                        });
                        const data = await res.json();
                        if (res.ok && data.success) {
                          setCouponMsg({ type: 'success', text: `${t.couponRedeemed} $${data.amount} ${t.balanceAdded}` });
                          setCouponCode('');
                          await refreshUser();
                        } else {
                          setCouponMsg({ type: 'error', text: data.error === 'already_used' ? t.couponAlreadyUsed : t.invalidCode });
                        }
                      } catch {
                        setCouponMsg({ type: 'error', text: 'Connection error' });
                      }
                      setIsRedeeming(false);
                    }}
                    disabled={isRedeeming || !couponCode.trim()}
                    className="w-full mt-4 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                  >
                    {isRedeeming ? t.redeeming : t.redeemCode}
                  </Button>
                </div>
              )}

              {/* Auto Payment (Crypto) */}
              {selectedMethodData?.type === 'auto' && !isAsiacell && (
                <div className="space-y-4">
                  {!cryptoPayment ? (
                    <>
                      <div>
                        <label className="block font-body text-white/80 mb-2">{t.amount} (USD)</label>
                        <Input
                          type="number"
                          value={autoAmount}
                          onChange={e => setAutoAmount(e.target.value)}
                          className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50"
                          placeholder="10.00"
                          min="1"
                        />
                      </div>

                      <div className="grid grid-cols-5 gap-2">
                        {[5, 10, 25, 50, 100].map(amount => (
                          <button
                            key={amount}
                            onClick={() => setAutoAmount(String(amount))}
                            className={`px-3 py-2 rounded-lg border transition-colors text-sm ${autoAmount === String(amount)
                              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                              : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/50 hover:text-white'
                              }`}
                          >
                            ${amount}
                          </button>
                        ))}
                      </div>

                      {paymentError && (
                        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                          {paymentError}
                        </div>
                      )}

                      <Button
                        onClick={createCryptoPayment}
                        disabled={paymentLoading || !autoAmount || parseFloat(autoAmount) < 1}
                        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                      >
                        {paymentLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {lang === 'ar' ? 'جاري إنشاء عنوان الدفع...' : 'Creating payment...'}
                          </span>
                        ) : (
                          t.continuePayment
                        )}
                      </Button>
                    </>
                  ) : (
                    /* Payment Created - Show Address */
                    <div className="space-y-4">
                      {/* Status Badge */}
                      <div className={`p-3 rounded-xl text-center font-bold text-sm ${paymentStatus === 'finished' || paymentStatus === 'confirmed' || paymentStatus === 'partially_paid'
                        ? 'bg-green-500/20 border border-green-500/30 text-green-300'
                        : paymentStatus === 'sending' || paymentStatus === 'confirming'
                          ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300'
                          : 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-300'
                        }`}>
                        {paymentStatus === 'finished' || paymentStatus === 'confirmed' || paymentStatus === 'partially_paid'
                          ? (lang === 'ar' ? '✅ تم استلام الدفعة! تم إضافة الرصيد' : '✅ Payment received! Balance added')
                          : paymentStatus === 'sending' || paymentStatus === 'confirming'
                            ? (lang === 'ar' ? '⏳ جاري تأكيد المعاملة...' : '⏳ Confirming transaction...')
                            : (lang === 'ar' ? '⏳ في انتظار الدفع...' : '⏳ Waiting for payment...')}
                      </div>

                      {/* Payment Details */}
                      {paymentStatus !== 'finished' && paymentStatus !== 'confirmed' && paymentStatus !== 'partially_paid' && (
                        <>
                          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                            <p className="text-yellow-200 font-body mb-1 text-sm">
                              {lang === 'ar' ? 'أرسل بالضبط:' : 'Send exactly:'}
                            </p>
                            <div className="flex items-center justify-center gap-2" dir="ltr">
                              <code className="text-2xl font-mono bg-black/30 px-4 py-2 rounded text-white font-bold">
                                {cryptoPayment.payAmount} {cryptoPayment.payCurrency.toUpperCase()}
                              </code>
                            </div>
                            <p className="text-center text-white/40 text-xs mt-1">≈ ${cryptoPayment.priceAmount}</p>
                          </div>

                          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-white/60 font-body mb-2 text-sm">
                              {lang === 'ar' ? '📋 عنوان الاستلام:' : '📋 Payment address:'}
                            </p>
                            <div className="flex items-center gap-2" dir="ltr">
                              <code className="flex-1 text-xs font-mono bg-black/30 px-3 py-2 rounded text-cyan-300 break-all select-all">
                                {cryptoPayment.payAddress}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyText(cryptoPayment.payAddress)}
                                className="h-9 px-3 text-xs text-white/60 hover:text-white shrink-0"
                              >
                                {copied ? '✅' : (lang === 'ar' ? 'نسخ' : 'Copy')}
                              </Button>
                            </div>
                          </div>

                          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                            <p className="text-orange-200 text-xs text-center">
                              ⚠️ {lang === 'ar'
                                ? `أرسل فقط ${cryptoPayment.payCurrency.toUpperCase()} إلى هذا العنوان. سيتم تحديث الرصيد تلقائياً بعد التأكيد.`
                                : `Only send ${cryptoPayment.payCurrency.toUpperCase()} to this address. Balance will update automatically after confirmation.`}
                            </p>
                          </div>

                          {/* Animated waiting indicator */}
                          <div className="flex items-center justify-center gap-2 text-white/40 text-sm py-2">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                            {lang === 'ar' ? 'يتم التحقق كل 10 ثوانٍ تلقائياً...' : 'Auto-checking every 10 seconds...'}
                          </div>

                          {/* Cancel Button */}
                          <Button
                            onClick={() => { setCryptoPayment(null); setAutoAmount(''); setPaymentStatus(''); setPaymentError(''); }}
                            variant="ghost"
                            className="w-full mt-2 text-white/40 hover:text-white/70 hover:bg-white/5 border border-white/10"
                          >
                            {lang === 'ar' ? '✕ إلغاء' : '✕ Cancel'}
                          </Button>
                        </>
                      )}

                      {/* Success State */}
                      {(paymentStatus === 'finished' || paymentStatus === 'confirmed' || paymentStatus === 'partially_paid') && (
                        <div className="text-center py-4">
                          <p className="text-green-300 text-lg font-bold mb-2">
                            🎉 {lang === 'ar' ? `تم إضافة $${cryptoPayment.priceAmount} لرصيدك!` : `$${cryptoPayment.priceAmount} added to your balance!`}
                          </p>
                          <Button
                            onClick={() => { setCryptoPayment(null); setAutoAmount(''); setPaymentStatus(''); }}
                            className="mt-2 bg-white/10 hover:bg-white/20 text-white"
                          >
                            {lang === 'ar' ? 'دفعة جديدة' : 'New Payment'}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Asiacell Balance Transfer */}
              {isAsiacell && (
                <div className="space-y-4">
                  {/* Step indicator */}
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {['phone', 'otp', 'amount', 'confirm'].map((s, i) => (
                      <div key={s} className="flex items-center gap-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${acStep === s ? 'bg-cyan-500 text-white scale-110' :
                          ['phone', 'otp', 'amount', 'confirm'].indexOf(acStep) > i || acStep === 'success' ? 'bg-green-500 text-white' :
                            'bg-white/10 text-white/30'
                          }`}>{i + 1}</div>
                        {i < 3 && <div className={`w-6 h-0.5 ${['phone', 'otp', 'amount', 'confirm'].indexOf(acStep) > i || acStep === 'success' ? 'bg-green-500' : 'bg-white/10'}`} />}
                      </div>
                    ))}
                  </div>

                  {acError && (
                    <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm">{acError}</div>
                  )}

                  {/* Step 1: Phone Number */}
                  {acStep === 'phone' && (
                    <div className="space-y-3">
                      <label className="block font-body text-white/80 mb-1">
                        {lang === 'ar' ? '📱 رقم الهاتف (آسياسيل)' : '📱 Phone Number (Asiacell)'}
                      </label>
                      <Input
                        value={acPhone}
                        onChange={e => setAcPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 font-mono text-center text-lg tracking-wider"
                        placeholder="07XXXXXXXXX"
                        maxLength={11}
                        dir="ltr"
                      />
                      <Button
                        onClick={async () => {
                          if (!/^07\d{9}$/.test(acPhone) || !user?._id) return;
                          setAcLoading(true); setAcError('');
                          try {
                            const res = await fetch(`${API_URL}/asiacell/login`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ phone: acPhone, userId: user._id }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              setAcSessionId(data.sessionId);
                              setAcStep('otp');
                            } else {
                              setAcError(data.error || data.message || 'Login failed');
                            }
                          } catch { setAcError('Connection error'); }
                          setAcLoading(false);
                        }}
                        disabled={acLoading || !/^07\d{9}$/.test(acPhone)}
                        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold disabled:opacity-50"
                      >
                        {acLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {lang === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                          </span>
                        ) : (lang === 'ar' ? 'إرسال رمز التحقق' : 'Send OTP')}
                      </Button>
                    </div>
                  )}

                  {/* Step 2: OTP Verification */}
                  {acStep === 'otp' && (
                    <div className="space-y-3">
                      <label className="block font-body text-white/80 mb-1">
                        {lang === 'ar' ? '🔐 أدخل رمز التحقق المرسل إلى' : '🔐 Enter OTP sent to'} <span className="text-cyan-400 font-mono" dir="ltr">{acPhone}</span>
                      </label>
                      <Input
                        value={acOtp}
                        onChange={e => setAcOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 font-mono text-center text-2xl tracking-[0.5em]"
                        placeholder="000000"
                        maxLength={6}
                        dir="ltr"
                      />
                      <Button
                        onClick={async () => {
                          if (acOtp.length !== 6) return;
                          setAcLoading(true); setAcError('');
                          try {
                            const res = await fetch(`${API_URL}/asiacell/verify-otp`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ sessionId: acSessionId, otp: acOtp }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              setAcStep('amount');
                            } else {
                              setAcError(data.message || 'Invalid OTP');
                            }
                          } catch { setAcError('Connection error'); }
                          setAcLoading(false);
                        }}
                        disabled={acLoading || acOtp.length !== 6}
                        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold disabled:opacity-50"
                      >
                        {acLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {lang === 'ar' ? 'جاري التحقق...' : 'Verifying...'}
                          </span>
                        ) : (lang === 'ar' ? 'تأكيد الرمز' : 'Verify OTP')}
                      </Button>
                    </div>
                  )}

                  {/* Step 3: Amount Selection */}
                  {acStep === 'amount' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                        <p className="text-green-300 text-sm">✅ {lang === 'ar' ? 'تم التحقق بنجاح!' : 'Verified successfully!'}</p>
                      </div>
                      <label className="block font-body text-white/80 mb-1">
                        {lang === 'ar' ? '👤 اسم المستخدم' : '👤 Username'}
                      </label>
                      <Input
                        value={acUsername || user?.username || ''}
                        onChange={e => setAcUsername(e.target.value)}
                        className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 text-center"
                        placeholder={lang === 'ar' ? 'اسم المستخدم' : 'Your username'}
                        dir="ltr"
                      />
                      <label className="block font-body text-white/80 mb-1">
                        {lang === 'ar' ? '💰 المبلغ بالدينار العراقي (IQD)' : '💰 Amount in Iraqi Dinar (IQD)'}
                      </label>
                      <Input
                        type="number"
                        value={acAmount}
                        onChange={e => setAcAmount(e.target.value)}
                        className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 text-center text-lg"
                        placeholder="1000"
                        min="250"
                        dir="ltr"
                      />
                      <div className="grid grid-cols-5 gap-2">
                        {[1000, 2000, 5000, 10000, 25000].map(amt => (
                          <button
                            key={amt}
                            onClick={() => setAcAmount(String(amt))}
                            className={`px-2 py-2 rounded-lg border transition-colors text-xs ${acAmount === String(amt)
                              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                              : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/50 hover:text-white'
                              }`}
                          >
                            {amt.toLocaleString()}
                          </button>
                        ))}
                      </div>
                      {acAmount && parseInt(acAmount) >= 250 && (
                        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-center">
                          <p className="text-cyan-300 text-sm">
                            {parseInt(acAmount).toLocaleString()} IQD = <span className="font-bold text-white">${(parseInt(acAmount) / 1000).toFixed(2)}</span>
                          </p>
                        </div>
                      )}
                      <Button
                        onClick={async () => {
                          const amt = parseInt(acAmount);
                          if (!amt || amt < 250) return;
                          setAcLoading(true); setAcError('');
                          try {
                            const res = await fetch(`${API_URL}/asiacell/transfer`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ sessionId: acSessionId, amount: amt, username: acUsername || user?.username }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              setAcStep('confirm');
                            } else {
                              setAcError(data.error || data.message || 'Transfer failed');
                            }
                          } catch { setAcError('Connection error'); }
                          setAcLoading(false);
                        }}
                        disabled={acLoading || !acAmount || parseInt(acAmount) < 250}
                        className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold disabled:opacity-50"
                      >
                        {acLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {lang === 'ar' ? 'جاري التحويل...' : 'Processing...'}
                          </span>
                        ) : (lang === 'ar' ? `تحويل ${acAmount ? parseInt(acAmount).toLocaleString() : '0'} IQD` : `Transfer ${acAmount ? parseInt(acAmount).toLocaleString() : '0'} IQD`)}
                      </Button>
                    </div>
                  )}

                  {/* Step 4: Confirmation OTP */}
                  {acStep === 'confirm' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
                        <p className="text-yellow-300 text-sm">
                          ⚠️ {lang === 'ar'
                            ? `سيتم تحويل ${parseInt(acAmount).toLocaleString()} IQD ($${(parseInt(acAmount) / 1000).toFixed(2)})`
                            : `Transferring ${parseInt(acAmount).toLocaleString()} IQD ($${(parseInt(acAmount) / 1000).toFixed(2)})`}
                        </p>
                      </div>
                      <label className="block font-body text-white/80 mb-1">
                        {lang === 'ar' ? '� أدخل رمز التأكيد' : '🔐 Enter confirmation OTP'}
                      </label>
                      <Input
                        value={acConfirmOtp}
                        onChange={e => setAcConfirmOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 font-mono text-center text-2xl tracking-[0.5em]"
                        placeholder="000000"
                        maxLength={6}
                        dir="ltr"
                      />
                      <Button
                        onClick={async () => {
                          if (acConfirmOtp.length !== 6) return;
                          setAcLoading(true); setAcError('');
                          try {
                            const res = await fetch(`${API_URL}/asiacell/confirm`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ sessionId: acSessionId, otp: acConfirmOtp }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              setAcCredited(data.credited);
                              setAcStep('success');
                              await refreshUser();
                            } else {
                              setAcError(data.error || data.message || 'Confirmation failed');
                            }
                          } catch { setAcError('Connection error'); }
                          setAcLoading(false);
                        }}
                        disabled={acLoading || acConfirmOtp.length !== 6}
                        className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold disabled:opacity-50"
                      >
                        {acLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {lang === 'ar' ? 'جاري التأكيد...' : 'Confirming...'}
                          </span>
                        ) : (lang === 'ar' ? 'تأكيد التحويل' : 'Confirm Transfer')}
                      </Button>
                    </div>
                  )}

                  {/* Success */}
                  {acStep === 'success' && (
                    <div className="text-center py-4 space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-3xl">🎉</span>
                      </div>
                      <p className="text-green-300 text-lg font-bold">
                        {lang === 'ar' ? `تم إضافة $${acCredited} لرصيدك!` : `$${acCredited} added to your balance!`}
                      </p>
                      <p className="text-white/40 text-sm">
                        {parseInt(acAmount).toLocaleString()} IQD → ${acCredited}
                      </p>
                      <Button
                        onClick={() => {
                          setAcStep('phone'); setAcPhone(''); setAcOtp(''); setAcAmount(''); setAcUsername('');
                          setAcConfirmOtp(''); setAcSessionId(''); setAcError(''); setAcCredited(0);
                        }}
                        className="mt-2 bg-white/10 hover:bg-white/20 text-white"
                      >
                        {lang === 'ar' ? 'عملية جديدة' : 'New Transfer'}
                      </Button>
                    </div>
                  )}

                  {/* Cancel button (not on success) */}
                  {acStep !== 'phone' && acStep !== 'success' && (
                    <Button
                      onClick={() => {
                        setAcStep('phone'); setAcOtp(''); setAcAmount('');
                        setAcConfirmOtp(''); setAcSessionId(''); setAcError('');
                      }}
                      variant="ghost"
                      className="w-full text-white/40 hover:text-white/70 hover:bg-white/5 border border-white/10"
                    >
                      {lang === 'ar' ? '✕ إلغاء' : '✕ Cancel'}
                    </Button>
                  )}
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
  const { t, lang } = useLanguage();
  const [config, setConfig] = useState<{ whatsapp?: string; telegram?: string; email?: string; supportMessage?: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/settings/support`)
      .then(r => r.json())
      .then(data => { if (data) setConfig(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-2xl">
      <h2 className="font-space text-2xl md:text-3xl text-white tracking-wide">{t.support}</h2>

      {config.supportMessage && (
        <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-sm">
          <p className="text-white/70 text-sm font-body leading-relaxed">{config.supportMessage}</p>
        </Card>
      )}

      <div className="space-y-3">
        {config.whatsapp && (
          <button
            onClick={() => window.open(`https://wa.me/${config.whatsapp!.replace(/[^0-9]/g, '')}`, '_blank')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-green-400"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.66 0-3.203-.51-4.484-1.375l-.32-.191-2.872.855.855-2.872-.191-.32A7.963 7.963 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" /></svg>
            </div>
            <div className="flex-1 text-start">
              <p className="text-white font-bold text-sm">{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</p>
              <p className="text-white/40 text-xs" dir="ltr">{config.whatsapp}</p>
            </div>
          </button>
        )}

        {config.telegram && (
          <button
            onClick={() => window.open(`https://t.me/${config.telegram!.replace('@', '')}`, '_blank')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-400"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z" /></svg>
            </div>
            <div className="flex-1 text-start">
              <p className="text-white font-bold text-sm">{lang === 'ar' ? 'تلجرام' : 'Telegram'}</p>
              <p className="text-white/40 text-xs">{config.telegram}</p>
            </div>
          </button>
        )}

        {config.email && (
          <button
            onClick={() => window.open(`mailto:${config.email}`, '_blank')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <span className="text-2xl">📧</span>
            </div>
            <div className="flex-1 text-start">
              <p className="text-white font-bold text-sm">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</p>
              <p className="text-white/40 text-xs">{config.email}</p>
            </div>
          </button>
        )}

        {!loading && !config.whatsapp && !config.telegram && !config.email && (
          <Card className="p-6 bg-white/5 border-white/10 text-center">
            <p className="text-white/40 text-sm">{lang === 'ar' ? 'لا توجد وسائل اتصال متاحة حالياً' : 'No contact channels available'}</p>
          </Card>
        )}
      </div>
    </div>
  );
}

// Terms of Use View
function TermsView() {
  const { t } = useLanguage();
  const [sections, setSections] = useState<{ title: string; body: string }[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/settings/terms`)
      .then(r => r.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) setSections(data);
        else setSections([
          { title: '1. القبول بالشروط', body: 'باستخدامك لمنصة Jerry، فإنك توافق على جميع الشروط والأحكام المذكورة أدناه. يرجى قراءتها بعناية قبل استخدام أي خدمة.' },
          { title: '2. الخدمات المقدمة', body: 'نقدم خدمات التسويق الرقمي بما في ذلك زيادة المتابعين والمشاهدات واللايكات عبر منصات التواصل الاجتماعي المختلفة.' },
          { title: '3. سياسة الاسترداد', body: 'لا يمكن استرداد المبالغ بعد بدء تنفيذ الطلب. في حالة عدم اكتمال الطلب، سيتم إرجاع الرصيد المتبقي إلى حسابك.' },
          { title: '4. المسؤولية', body: 'لا تتحمل المنصة أي مسؤولية عن أي إجراءات تتخذها منصات التواصل الاجتماعي تجاه حساباتك نتيجة استخدام خدماتنا.' },
          { title: '5. الخصوصية', body: 'نحترم خصوصيتك ولا نشارك بياناتك الشخصية مع أي طرف ثالث. يتم استخدام بياناتك فقط لتقديم الخدمات المطلوبة.' },
        ]);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-4 max-w-3xl">
      <h2 className="font-space text-2xl md:text-3xl text-white tracking-wide">{t.termsOfService}</h2>
      <Card className="p-5 md:p-8 bg-white/5 border-white/10 backdrop-blur-sm space-y-4">
        <div className="space-y-3 text-white/70 text-sm leading-relaxed font-body">
          {sections.map((s, i) => (
            <div key={i}>
              <h3 className="text-white font-bold text-base">{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Updates View
function UpdatesView() {
  const { t } = useLanguage();
  const [updates, setUpdates] = useState<{ version: string; date: string; title: string; description: string; type: string }[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/settings/updates`)
      .then(r => r.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) setUpdates(data);
        else setUpdates([
          { version: 'v2.5', date: '2025-02-15', title: 'تحسينات واجهة المستخدم', description: 'تحسين التصميم العام وإضافة قائمة جانبية جديدة للموبايل مع تحسين سرعة التطبيق.', type: 'تحسين' },
          { version: 'v2.4', date: '2025-02-10', title: 'إضافة خدمات تليجرام', description: 'تمت إضافة خدمات جديدة لتليجرام تشمل الأعضاء والمشاهدات بضمانات متعددة.', type: 'جديد' },
          { version: 'v2.3', date: '2025-02-01', title: 'نظام البحث الذكي', description: 'إضافة خاصية البحث عن الخدمات والأقسام بالاسم من الشريط السفلي.', type: 'جديد' },
        ]);
      })
      .catch(console.error);
  }, []);

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
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${update.type === 'جديد' ? 'bg-green-500/20 text-green-400 border-green-500/30' : update.type === 'إصلاح' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
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
  const [selectedServiceData, setSelectedServiceData] = useState<any>(null);
  const [browseCategoryId, setBrowseCategoryId] = useState<string | null>(null);
  const [browseCategoryName, setBrowseCategoryName] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const renderContent = () => {
    switch (activeItem) {
      case 'new-order':
        return <NewOrderView onServiceClick={(id, name) => {
          setBrowseCategoryId(id);
          setBrowseCategoryName(name || '');
          setActiveItem('browse-category');
        }} />;
      case 'browse-category':
        return browseCategoryId ? (
          <CategoryBrowser
            initialCategoryId={browseCategoryId}
            initialCategoryName={browseCategoryName}
            onBack={() => setActiveItem('new-order')}
            onServiceSelect={(service) => {
              setSelectedService(service._id);
              setSelectedServiceData(service);
              setActiveItem('service-details');
            }}
          />
        ) : <NewOrderView onServiceClick={() => { }} />;
      case 'service-details':
        return <ServiceDetailsView
          serviceId={selectedService || ''}
          serviceData={selectedServiceData}
          onBack={() => {
            if (browseCategoryId) setActiveItem('browse-category');
            else setActiveItem('new-order');
          }}
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
