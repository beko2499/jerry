import { useState, useEffect } from 'react';
import { apiFetch, API_URL } from '@/lib/api';
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

    apiFetch(`/orders?userId=${user._id}`)
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
            <p className="text-sm">{t.noResults || '·«  ÊÃœ ÿ·»« '}</p>
          </div>
        ) : filteredOrders.map((order) => (
          <Card key={order.id} className="p-3 bg-white/5 border-white/10">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{order.service}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                  <span className="text-cyan-400 font-mono">{order.id}</span>
                  <span>◊{order.quantity}</span>
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
  onServiceSelect?: (service: any) => void;
  onCategorySelect?: (categoryId: string, categoryName: string) => void;
}

function SearchView({ onNavigate: _onNavigate, onServiceSelect, onCategorySelect }: SearchViewProps) {
  const [query, setQuery] = useState('');
  const { t } = useLanguage();
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [svcRes, catRes] = await Promise.all([
          fetch(`${API_URL_RAW}/services`),
          fetch(`${API_URL_RAW}/categories`),
        ]);
        const svcData = await svcRes.json();
        const catData = await catRes.json();
        setServices(Array.isArray(svcData) ? svcData : []);
        setCategories(Array.isArray(catData) ? catData : []);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredServices = query.length > 0
    ? services.filter(s => s.name?.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredCategories = query.length > 0
    ? categories.filter(c => c.name?.toLowerCase().includes(query.toLowerCase()))
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

      {loading && <p className="text-white/40 text-sm text-center py-8">Ã«—Ì «· Õ„Ì·...</p>}

      {/* Results */}
      {query.length > 0 && !loading && (
        <div className="space-y-3">
          {/* Categories */}
          {filteredCategories.length > 0 && (
            <div>
              <p className="text-white/40 text-xs mb-2 font-medium">«·√ﬁ”«„</p>
              <div className="space-y-2">
                {filteredCategories.map(cat => (
                  <Card
                    key={cat._id}
                    className="p-3 bg-white/5 border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all cursor-pointer backdrop-blur-sm"
                    onClick={() => {
                      if (onCategorySelect) onCategorySelect(cat._id, cat.name);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        {cat.image ? <img src={`${API_URL.replace('/api', '')}${cat.image}`} alt={cat.name} className="w-full h-full object-cover" /> : <span className="text-xl">??</span>}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-white font-medium text-sm truncate">{cat.name}</h4>
                        <p className="text-white/40 text-xs">ﬁ”„</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {filteredServices.length > 0 && (
            <div>
              <p className="text-white/40 text-xs mb-2 font-medium">«·Œœ„«  ({filteredServices.length})</p>
              <div className="space-y-2">
                {filteredServices.slice(0, 20).map(svc => (
                  <Card
                    key={svc._id}
                    className="p-3 bg-white/5 border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all cursor-pointer backdrop-blur-sm"
                    onClick={() => {
                      if (onServiceSelect) onServiceSelect(svc);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                        <span className="text-xl">?</span>
                      </div>
                      <div className="overflow-hidden flex-1">
                        <h4 className="text-white font-medium text-sm truncate">{svc.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-white/40 text-xs truncate">{svc.description || ''}</span>
                          <span className="text-cyan-400 text-xs font-bold shrink-0" dir="ltr">${svc.price?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {filteredServices.length > 20 && (
                  <p className="text-white/30 text-xs text-center">+{filteredServices.length - 20} ‰ ÌÃ… √Œ—Ï</p>
                )}
              </div>
            </div>
          )}

          {filteredServices.length === 0 && filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/40 text-sm">·«  ÊÃœ ‰ «∆Ã</p>
            </div>
          )}
        </div>
      )}

      {/* Empty state when no query */}
      {query.length === 0 && !loading && (
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
    name: 'ÿßÿπÿ∂ÿßÿ° ÿ™ŸÑŸäÿ¨ÿ±ÿßŸÖ ÿ≠ÿ≥ÿßÿ®ÿßÿ™ ŸÖÿ≠ÿ∞ŸàŸÅŸá',
    pricePer1000: 2.00,
    oldPrice: 2.02,
    discount: '-1%',
    min: 500,
    max: 60000,
    category: 'ÿÆÿØŸÖÿßÿ™ ÿ™ŸÑŸäÿ¨ÿ±ÿßŸÖ | ÿ¨Ÿäÿ±Ÿä',
    shortDesc: 'ÿ≠ÿ≥ÿßÿ®ÿßÿ™ ŸÖÿ≠ÿ∞ŸàŸÅÿ©ÿå ÿ¨ŸàÿØÿ© ŸÖŸÜÿÆŸÅÿ∂ÿ©ÿå ÿ®ÿØÿ° ŸÅŸàÿ±Ÿä',
    description: `- ÿßŸÑÿ®ÿØÿßÿ° : 0 -4 ÿ≥ÿßÿπÿßÿ™ üö©
- ÿßŸÑÿ∂ŸÖÿßŸÜ : ÿ≠ÿ≥ÿßÿ®ÿßÿ™ ŸÖÿ≠ÿ∞ŸàŸÅŸá Ÿ™0 ŸÜÿ≤Ÿàÿß üèÆ
- ÿßŸÑÿ±ÿßÿ®ÿ∑ : ÿ±ÿßÿ®ÿ∑ ÿØÿπŸàÿ© üèÆ
- ÿßŸÑÿ¨ŸàÿØŸá : HQ üèÆ
- ÿ™ŸÇÿ®ŸÑ ŸÉÿ±Ÿàÿ®ÿßÿ™ / ŸÇŸÜŸàÿßÿ™ üéâ

- ÿ™Ÿàÿ∂Ÿäÿ≠ ŸÖŸáŸÖ : ÿßŸÑÿ≠ÿ≥ÿßÿ®ÿßÿ™ ÿ®ÿ™ÿØÿ±Ÿäÿ¨ ÿ±ÿßÿ≠ ÿ™ŸÜÿ≠ÿ∞ŸÅ ŸÖÿπŸâ ŸÖÿ±Ÿàÿ± ÿßŸÑÿßŸäÿßŸÖ . ÿ™ŸÖ ÿßŸÑÿ™ÿ≠ŸÇŸÇ ŸÖŸÜ ÿßŸÑÿÆÿØŸÖŸá ŸàÿßŸÑÿÆÿØŸÖŸá 100/100ÿ≠ÿ≥ÿßÿ®ÿßÿ™ ŸÖÿ≠ÿ∞ŸàŸÅŸá`,
    details: [
      { label: 'ÿ≥ÿ±ÿπÿ© ÿßŸÑÿÆÿØŸÖŸá', value: 'ÿßŸÑÿÆÿØŸÖÿ© ÿ∑ÿ®ŸäÿπŸäŸá' },
      { label: 'ŸÜÿ≥ÿ®Ÿá ÿßŸÑŸÜÿ≤ŸàŸÑ', value: 'ŸÖÿ≤Ÿäÿ¨ ÿ®ŸäŸÜ ÿßŸÑŸàŸáŸÖŸä ŸàÿßŸÑÿ≠ŸÇŸäŸÇŸä' },
      { label: 'ÿ∂ŸÖÿßŸÜ', value: '0 ŸäŸàŸÖ' },
      { label: 'ÿßŸÑÿ≥ÿ±ÿπÿ©', value: '50K ŸÅŸä ÿßŸÑŸäŸàŸÖ' },
    ]
  },
  {
    id: '1824',
    name: 'ÿßÿπÿ∂ÿßÿ° ÿ™ŸÑŸäÿ¨ÿ±ÿßŸÖ ÿ®ÿØŸàŸÜ ŸÜÿ≤ŸàŸÑ ŸÑŸÑÿßÿ®ÿØ (ŸÖŸÖŸÑŸàŸÉŸá)',
    pricePer1000: 1.20,
    oldPrice: 1.21,
    discount: '-1%',
    min: 50,
    max: 50000,
    category: 'ÿÆÿØŸÖÿßÿ™ ÿ™ŸÑŸäÿ¨ÿ±ÿßŸÖ | ÿ¨Ÿäÿ±Ÿä',
    shortDesc: 'ÿ∂ŸÖÿßŸÜ ÿπÿØŸÖ ÿßŸÑŸÜÿ≤ŸàŸÑ ŸÖÿØŸâ ÿßŸÑÿ≠Ÿäÿßÿ©ÿå ÿ≠ÿ≥ÿßÿ®ÿßÿ™ ÿπÿßŸÑŸäÿ© ÿßŸÑÿ¨ŸàÿØÿ©',
    description: `- ÿßŸÑÿ®ÿØÿßÿ° : 0 -2 ÿ≥ÿßÿπÿßÿ™ üö©
- ÿßŸÑÿ∂ŸÖÿßŸÜ : ÿ®ÿØŸàŸÜ ŸÜÿ≤ŸàŸÑ ŸÑŸÑÿßÿ®ÿØ ‚ôæÔ∏è üèÆ
- ÿßŸÑÿ±ÿßÿ®ÿ∑ : ÿ±ÿßÿ®ÿ∑ ÿØÿπŸàÿ© / ŸäŸàÿ≤ÿ± üèÆ
- ÿßŸÑÿ¨ŸàÿØŸá : HQ - ÿ≠ÿ≥ÿßÿ®ÿßÿ™ ŸÖŸÖŸÑŸàŸÉŸá üèÆ
- ÿ™ŸÇÿ®ŸÑ ŸÇŸÜŸàÿßÿ™ ŸÅŸÇÿ∑ üéâ

- ÿ™Ÿàÿ∂Ÿäÿ≠ ŸÖŸáŸÖ : ÿßÿπÿ∂ÿßÿ° ÿ≠ŸÇŸäŸÇŸäŸäŸÜ ÿ®ÿØŸàŸÜ ŸÜÿ≤ŸàŸÑ ŸÜŸáÿßÿ¶ŸäÿßŸãÿå ÿÆÿØŸÖÿ© ŸÖŸÖŸÑŸàŸÉÿ© ÿ®ÿ∂ŸÖÿßŸÜ ŸÖÿØŸâ ÿßŸÑÿ≠Ÿäÿßÿ©`,
    details: [
      { label: 'ÿ≥ÿ±ÿπÿ© ÿßŸÑÿÆÿØŸÖŸá', value: 'ÿ≥ÿ±Ÿäÿπÿ©' },
      { label: 'ŸÜÿ≥ÿ®Ÿá ÿßŸÑŸÜÿ≤ŸàŸÑ', value: '0% - ÿ®ÿØŸàŸÜ ŸÜÿ≤ŸàŸÑ' },
      { label: 'ÿ∂ŸÖÿßŸÜ', value: 'ŸÖÿØŸâ ÿßŸÑÿ≠Ÿäÿßÿ© ‚ôæÔ∏è' },
      { label: 'ÿßŸÑÿ≥ÿ±ÿπÿ©', value: '30K ŸÅŸä ÿßŸÑŸäŸàŸÖ' },
    ]
  },
  {
    id: '1825',
    name: 'ÿßÿπÿ∂ÿßÿ° ÿ™ŸÑŸäÿ¨ÿ±ÿßŸÖ ÿ®ÿØŸàŸÜ ŸÜÿ≤ŸàŸÑ ŸÑŸÑÿßÿ®ÿØ ŸÑŸÑŸÉÿ±Ÿàÿ®ÿßÿ™ (ŸÖŸÖŸÑŸàŸÉŸá)',
    pricePer1000: 1.20,
    oldPrice: 1.21,
    discount: '-1%',
    min: 50,
    max: 20000,
    category: 'ÿÆÿØŸÖÿßÿ™ ÿ™ŸÑŸäÿ¨ÿ±ÿßŸÖ | ÿ¨Ÿäÿ±Ÿä',
    shortDesc: 'ŸÖÿÆÿµÿµ ŸÑŸÑŸÖÿ¨ŸÖŸàÿπÿßÿ™ÿå ÿ∂ŸÖÿßŸÜ ŸÖÿØŸâ ÿßŸÑÿ≠Ÿäÿßÿ©',
    description: `- ÿßŸÑÿ®ÿØÿßÿ° : 0 -2 ÿ≥ÿßÿπÿßÿ™ üö©
- ÿßŸÑÿ∂ŸÖÿßŸÜ : ÿ®ÿØŸàŸÜ ŸÜÿ≤ŸàŸÑ ŸÑŸÑÿßÿ®ÿØ ‚ôæÔ∏è üèÆ
- ÿßŸÑÿ±ÿßÿ®ÿ∑ : ÿ±ÿßÿ®ÿ∑ ÿØÿπŸàÿ© ŸÉÿ±Ÿàÿ® üèÆ
- ÿßŸÑÿ¨ŸàÿØŸá : HQ - ÿ≠ÿ≥ÿßÿ®ÿßÿ™ ŸÖŸÖŸÑŸàŸÉŸá üèÆ
- ÿ™ŸÇÿ®ŸÑ ŸÉÿ±Ÿàÿ®ÿßÿ™ ŸÅŸÇÿ∑ üéâ

- ÿ™Ÿàÿ∂Ÿäÿ≠ ŸÖŸáŸÖ : ÿßÿπÿ∂ÿßÿ° ÿ≠ŸÇŸäŸÇŸäŸäŸÜ ŸÖÿÆÿµÿµŸäŸÜ ŸÑŸÑŸÉÿ±Ÿàÿ®ÿßÿ™ ÿ®ÿ∂ŸÖÿßŸÜ ŸÖÿØŸâ ÿßŸÑÿ≠Ÿäÿßÿ© ÿ®ÿØŸàŸÜ ŸÜÿ≤ŸàŸÑ`,
    details: [
      { label: 'ÿ≥ÿ±ÿπÿ© ÿßŸÑÿÆÿØŸÖŸá', value: 'ÿ≥ÿ±Ÿäÿπÿ©' },
      { label: 'ŸÜÿ≥ÿ®Ÿá ÿßŸÑŸÜÿ≤ŸàŸÑ', value: '0% - ÿ®ÿØŸàŸÜ ŸÜÿ≤ŸàŸÑ' },
      { label: 'ÿ∂ŸÖÿßŸÜ', value: 'ŸÖÿØŸâ ÿßŸÑÿ≠Ÿäÿßÿ© ‚ôæÔ∏è' },
      { label: 'ÿßŸÑÿ≥ÿ±ÿπÿ©', value: '20K ŸÅŸä ÿßŸÑŸäŸàŸÖ' },
    ]
  },
  {
    id: '1826',
    name: 'ÿßÿπÿ∂ÿßÿ° ÿ™ŸÑŸäÿ¨ÿ±ÿßŸÖ ÿ±ÿÆŸäÿµ (ŸÖŸÖŸÑŸàŸÉŸá) „ÄΩÔ∏è',
    pricePer1000: 0.07,
    oldPrice: 0.07,
    discount: '-1%',
    min: 100,
    max: 100000,
    category: 'ÿÆÿØŸÖÿßÿ™ ÿ™ŸÑŸäÿ¨ÿ±ÿßŸÖ | ÿ¨Ÿäÿ±Ÿä',
    shortDesc: 'ÿßÿ±ÿÆÿµ ÿÆÿØŸÖÿ© ŸÅŸä ÿßŸÑÿ≥ŸàŸÇÿå ÿ≥ÿ±ÿπÿ© ŸÖÿ™Ÿàÿ≥ÿ∑ÿ©',
    description: `- ÿßŸÑÿ®ÿØÿßÿ° : 0 -6 ÿ≥ÿßÿπÿßÿ™ üö©
- ÿßŸÑÿ∂ŸÖÿßŸÜ : ŸÑÿß ŸäŸàÿ¨ÿØ ÿ∂ŸÖÿßŸÜ üèÆ
- ÿßŸÑÿ±ÿßÿ®ÿ∑ : ÿ±ÿßÿ®ÿ∑ ÿØÿπŸàÿ© / ŸäŸàÿ≤ÿ± üèÆ
- ÿßŸÑÿ¨ŸàÿØŸá : Low - ÿ≠ÿ≥ÿßÿ®ÿßÿ™ ŸÖŸÖŸÑŸàŸÉŸá üèÆ
- ÿ™ŸÇÿ®ŸÑ ŸÉÿ±Ÿàÿ®ÿßÿ™ / ŸÇŸÜŸàÿßÿ™ üéâ

- ÿ™Ÿàÿ∂Ÿäÿ≠ ŸÖŸáŸÖ : ÿßÿ±ÿÆÿµ ÿÆÿØŸÖÿ© ÿßÿπÿ∂ÿßÿ° ŸÅŸä ÿßŸÑÿ≥ŸàŸÇÿå ŸÖŸÜÿßÿ≥ÿ®ÿ© ŸÑŸÖŸÜ Ÿäÿ±ŸäÿØ ÿßÿ±ŸÇÿßŸÖ ŸÉÿ®Ÿäÿ±ÿ© ÿ®ÿ£ŸÇŸÑ ÿ≥ÿπÿ±`,
    details: [
      { label: 'ÿ≥ÿ±ÿπÿ© ÿßŸÑÿÆÿØŸÖŸá', value: 'ŸÖÿ™Ÿàÿ≥ÿ∑ÿ©' },
      { label: 'ŸÜÿ≥ÿ®Ÿá ÿßŸÑŸÜÿ≤ŸàŸÑ', value: 'ŸÖŸÖŸÉŸÜ ŸÜÿ≤ŸàŸÑ ÿ®ÿ≥Ÿäÿ∑' },
      { label: 'ÿ∂ŸÖÿßŸÜ', value: 'ŸÑÿß ŸäŸàÿ¨ÿØ' },
      { label: 'ÿßŸÑÿ≥ÿ±ÿπÿ©', value: '100K ŸÅŸä ÿßŸÑŸäŸàŸÖ' },
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
      setOrderResult({ success: false, message: t.invalidQuantity || `«·ﬂ„Ì… ÌÃ» √‰  ﬂÊ‰ »Ì‰ ${serviceMin} Ê ${serviceMax}` });
      return;
    }
    if ((user.balance || 0) < totalPrice) {
      setOrderResult({ success: false, message: t.insufficientBalance || '—’Ìœﬂ €Ì— ﬂ«›Ì' });
      return;
    }

    setOrderLoading(true);
    setOrderResult(null);
    try {
      const res = await apiFetch(`/orders`, {
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
        setOrderResult({ success: false, message: data.error || 'ÕœÀ Œÿ√' });
      } else {
        setOrderResult({ success: true, message: t.orderSuccess || ' „ «·ÿ·» »‰Ã«Õ! ?', orderId: data.orderId });
        await refreshUser();
      }
    } catch {
      setOrderResult({ success: false, message: t.connectionError || 'Œÿ√ ›Ì «·« ’«·' });
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
                <span className="text-white/40 text-sm">/ {t.perUnit || '·ﬂ· ÊÕœ…'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {serviceData?.speed && (
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-xs text-white/40 mb-1">‚ö° {t.speed || 'Speed'}</div>
                  <div className="text-sm text-white font-medium">{serviceData.speed}</div>
                </div>
              )}
              {serviceData?.guarantee && (
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-xs text-white/40 mb-1">üõ°Ô∏è {t.guarantee || 'Guarantee'}</div>
                  <div className="text-sm text-white font-medium">{serviceData.guarantee}</div>
                </div>
              )}
              {serviceData?.dropRate && (
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-xs text-white/40 mb-1">üìâ {t.dropRate || 'Drop Rate'}</div>
                  <div className="text-sm text-white font-medium">{serviceData.dropRate}</div>
                </div>
              )}
              {serviceData?.startTime && (
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="text-xs text-white/40 mb-1">üïê {t.startTime}</div>
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
                  <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.processing || 'Ã«—Ì «·„⁄«·Ã…...'}</span>
                ) : orderResult?.success ? (
                  t.orderPlaced || '?  „ «·ÿ·»'
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
function SettingsView({ defaultTab = 'referral' }: { defaultTab?: 'settings' | 'referral' | 'api' }) {
  const { t } = useLanguage();
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState<'settings' | 'referral' | 'api'>(defaultTab);
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  // Referral states
  const [refStats, setRefStats] = useState<{ referralCode: string; totalReferrals: number; totalEarnings: number; commissionRate: number } | null>(null);
  const [copied, setCopied] = useState(false);
  // API states
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiCopied, setApiCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (user?._id) {
      apiFetch(`/referrals/stats/${user._id}`)
        .then(r => r.json())
        .then(data => { if (data.referralCode) setRefStats(data); })
        .catch(console.error);
      apiFetch(`/v2/key/${user._id}`)
        .then(r => r.json())
        .then(data => { if (data.apiKey) setApiKey(data.apiKey); })
        .catch(console.error);
    }
  }, [user?._id]);

  const handleSave = async () => {
    setMessage(null);
    if (newPassword && newPassword !== confirmPassword) { setMessage({ type: 'error', text: 'ﬂ·„«  «·„—Ê— €Ì— „ ÿ«»ﬁ…' }); return; }
    if (newPassword && !currentPassword) { setMessage({ type: 'error', text: 'Ì—ÃÏ ≈œŒ«· ﬂ·„… «·„—Ê— «·Õ«·Ì…' }); return; }
    if (!email && !newPassword) { setMessage({ type: 'error', text: '·«  ÊÃœ  €ÌÌ—«  ·Õ›ŸÂ«' }); return; }
    setSaving(true);
    try {
      const body: any = {};
      if (email !== user?.email) body.email = email;
      if (newPassword) { body.newPassword = newPassword; body.currentPassword = currentPassword; }
      else if (currentPassword) body.currentPassword = currentPassword;
      if (Object.keys(body).length === 0) { setMessage({ type: 'error', text: '·«  ÊÃœ  €ÌÌ—«  ·Õ›ŸÂ«' }); setSaving(false); return; }
      const res = await apiFetch(`/auth/profile/${user?._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) {
        const errMap: Record<string, string> = { wrong_password: 'ﬂ·„… «·„—Ê— «·Õ«·Ì… €Ì— ’ÕÌÕ…', email_exists: '«·»—Ìœ «·≈·ﬂ —Ê‰Ì „” Œœ„ »«·›⁄·', current_password_required: 'Ì—ÃÏ ≈œŒ«· ﬂ·„… «·„—Ê— «·Õ«·Ì…' };
        setMessage({ type: 'error', text: errMap[data.error] || data.error });
      } else {
        setMessage({ type: 'success', text: ' „ Õ›Ÿ «· €ÌÌ—«  »‰Ã«Õ ?' });
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        await refreshUser();
      }
    } catch { setMessage({ type: 'error', text: 'ÕœÀ Œÿ√ ›Ì «·« ’«·' }); }
    setSaving(false);
  };

  const siteUrl = window.location.origin;
  const refLink = refStats ? `${siteUrl}/?ref=${refStats.referralCode}` : '';

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(refLink);
    } catch {
      const ta = document.createElement('textarea'); ta.value = refLink; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-8">
      <h2 className="font-space text-xl md:text-2xl text-white mb-4 tracking-wide">{t.settings}</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('referral')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'referral' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'}`}>
          ‰Ÿ«„ «·«Õ«·…
        </button>
        <button onClick={() => setTab('settings')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'settings' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'}`}>
          «·«⁄œ«œ« 
        </button>
        <button onClick={() => setTab('api')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'api' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'}`}>
          API
        </button>
      </div>

      {tab === 'settings' && (
        <Card className="p-5 md:p-8 bg-white/5 border-white/10 max-w-lg backdrop-blur-sm">
          <div className="space-y-5">
            <div>
              <label className="block font-body text-white/50 text-sm mb-1.5">{t.username}</label>
              <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-sm font-mono">@{user?.username}</div>
            </div>
            <div>
              <label className="block font-body text-white/80 text-sm mb-1.5">{t.email}</label>
              <Input value={email} onChange={e => setEmail(e.target.value)} className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 h-10" dir="ltr" />
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="text-white/50 text-xs mb-3">· €ÌÌ— ﬂ·„… «·„—Ê— √Ê «·»—Ìœ° √œŒ· ﬂ·„… «·„—Ê— «·Õ«·Ì…</p>
            </div>
            <div>
              <label className="block font-body text-white/80 text-sm mb-1.5">{t.currentPassword}</label>
              <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 h-10" placeholder="ïïïïïïïï" />
            </div>
            <div>
              <label className="block font-body text-white/80 text-sm mb-1.5">{t.newPassword}</label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 h-10" placeholder="ïïïïïïïï" />
            </div>
            <div>
              <label className="block font-body text-white/80 text-sm mb-1.5"> √ﬂÌœ ﬂ·„… «·„—Ê— «·ÃœÌœ…</label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 h-10" placeholder="ïïïïïïïï" />
            </div>
            {message && <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{message.text}</div>}
            <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-lg shadow-cyan-500/20 h-11">
              {saving ? '...' : t.saveChanges}
            </Button>
          </div>
        </Card>
      )}

      {tab === 'referral' && (
        <div className="max-w-lg space-y-4">
          {/* Referral Info */}
          <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-lg shrink-0">??</div>
              <div>
                <h3 className="text-white font-bold text-sm">‰Ÿ«„ «·«‰ ”«»</h3>
                <p className="text-white/50 text-xs mt-1">”Ì „ ≈÷«›… «·—’Ìœ ·Õ”«»ﬂ  ·ﬁ«∆Ì« ⁄‰œ ‘Õ‰ «·„œ⁄ÊÌ‰</p>
              </div>
            </div>

            {/* Referral Link */}
            <div>
              <label className="block text-white/40 text-xs mb-2">«·—«»ÿ «·Œ«’ »ﬂ</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-mono truncate" dir="ltr">
                  {refLink || '...'}
                </div>
                <button onClick={handleCopy} className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all shrink-0">
                  {copied ? <span className="text-green-400 text-sm">?</span> : <span className="text-white/40 text-sm">??</span>}
                </button>
              </div>
            </div>
          </Card>

          {/* Balance */}
          <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-sm">«·—’Ìœ „‰ «·≈Õ«·« </span>
              <span className="text-green-400 font-bold text-lg" dir="ltr">${(refStats?.totalEarnings || 0).toFixed(2)}</span>
            </div>
            <p className="text-white/30 text-xs mt-1">‰”»… «·⁄„Ê·…: {refStats?.commissionRate || 5}% „‰ ﬂ· ‘Õ‰…</p>
          </Card>

          {/* Statistics */}
          <h3 className="text-white font-bold text-sm pt-2">«·≈Õ’«∆Ì« </h3>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 bg-white/5 border-white/10 text-center">
              <p className="text-white/40 text-xs mb-1">«·√‘Œ«’ «·„œ⁄ÊÌ‰</p>
              <p className="text-white font-bold text-2xl">{refStats?.totalReferrals || 0}</p>
            </Card>
            <Card className="p-4 bg-white/5 border-white/10 text-center">
              <p className="text-white/40 text-xs mb-1">≈Ã„«·Ì «·œŒ·</p>
              <p className="text-green-400 font-bold text-2xl" dir="ltr">${(refStats?.totalEarnings || 0).toFixed(2)}</p>
            </Card>
          </div>
        </div>
      )}

      {tab === 'api' && (() => {
        const apiBase = window.location.origin.replace(/:\d+$/, '').replace('http://', 'https://') + '/api/v2';
        return (
          <div className="max-w-2xl space-y-4">
            {/* API Key Card */}
            <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-lg shrink-0">??</div>
                <div>
                  <h3 className="text-white font-bold text-sm">API</h3>
                  <p className="text-white/50 text-xs mt-1">«” Œœ„ „› «Õ API ·—»ÿ Œœ„« ‰« „⁄ „Êﬁ⁄ﬂ</p>
                </div>
              </div>
              <div>
                <label className="block text-white/40 text-xs mb-2">«·—„“ «·Œ«’ »ﬂ</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-mono truncate" dir="ltr">
                    {apiKey ? (showApiKey ? apiKey : apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 6)) : '...'}
                  </div>
                  <button onClick={() => setShowApiKey(!showApiKey)} className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all shrink-0">
                    <span className="text-white/40 text-sm">{showApiKey ? '??' : '???'}</span>
                  </button>
                  <button onClick={() => { try { navigator.clipboard.writeText(apiKey); } catch { const ta = document.createElement('textarea'); ta.value = apiKey; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); } setApiCopied(true); setTimeout(() => setApiCopied(false), 2000); }} className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all shrink-0">
                    {apiCopied ? <span className="text-green-400 text-sm">?</span> : <span className="text-white/40 text-sm">??</span>}
                  </button>
                </div>
              </div>
              <button
                onClick={async () => {
                  setRegenerating(true);
                  try {
                    const res = await apiFetch(`/v2/generate-key`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user?._id }) });
                    const data = await res.json();
                    if (data.apiKey) setApiKey(data.apiKey);
                  } catch (e) { console.error(e); }
                  setRegenerating(false);
                }}
                disabled={regenerating}
                className="mt-3 w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-all"
              >
                {regenerating ? '...' : ' €ÌÌ— «·—„“ «·„„Ì“'}
              </button>
            </Card>

            {/* API Endpoint */}
            <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-sm">
              <h3 className="text-white font-bold text-sm mb-3">?? ⁄‰Ê«‰ API</h3>
              <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-cyan-400 text-sm font-mono" dir="ltr">
                {apiBase}
              </div>
              <p className="text-white/30 text-xs mt-2">«” Œœ„ Â–« «·⁄‰Ê«‰ „⁄ «·„› «Õ ··Ê’Ê· ≈·Ï Œœ„« ‰« ⁄»— API</p>
            </Card>

            {/* ====== API DOCUMENTATION ====== */}
            <div className="pt-2">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">??  ÊÀÌﬁ API</h3>
            </div>

            {/* Service List */}
            <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-sm">
              <h4 className="text-cyan-400 font-bold text-sm mb-1 flex items-center gap-2">?? ﬁ«∆„… «·Œœ„«  ó Service list</h4>
              <p className="text-white/40 text-xs mb-3">«” Œœ„ Â–Â «·ÿ—Ìﬁ… ··Õ’Ê· ⁄·Ï ﬁ«∆„… «·Œœ„« </p>
              <div className="mb-3">
                <p className="text-white/50 text-xs mb-1">ÿ·» ⁄Ì‰…:</p>
                <div className="bg-black/40 rounded-lg px-3 py-2 text-xs font-mono text-green-400 break-all" dir="ltr">
                  {apiBase}?action=services&key=yourKey
                </div>
              </div>
              <div className="mb-3">
                <p className="text-white/50 text-xs mb-1">⁄Ì‰… «·«” Ã«»…:</p>
                <pre className="bg-black/40 rounded-lg px-3 py-2 text-xs font-mono text-yellow-300 overflow-x-auto" dir="ltr">{`[
  {
    "service": 1,
    "name": "Followers",
    "type": "default",
    "category": "Instagram",
    "rate": "100.00",
    "min": 10,
    "max": 15000,
    "refill": false,
    "cancel": false
  }
]`}</pre>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-white/40 border-b border-white/10"><th className="text-right py-1.5 px-2">«·Õﬁ·</th><th className="text-right py-1.5 px-2">«·‰Ê⁄</th><th className="text-right py-1.5 px-2">«·Ê’›</th></tr></thead>
                  <tbody className="text-white/60">
                    <tr className="border-b border-white/5"><td className="py-1.5 px-2 font-mono text-cyan-400">service</td><td className="py-1.5 px-2">Integer</td><td className="py-1.5 px-2">ÂÊÌ… «·Œœ„…</td></tr>
                    <tr className="border-b border-white/5"><td className="py-1.5 px-2 font-mono text-cyan-400">name</td><td className="py-1.5 px-2">String</td><td className="py-1.5 px-2">«”„ «·Œœ„…</td></tr>
                    <tr className="border-b border-white/5"><td className="py-1.5 px-2 font-mono text-cyan-400">category</td><td className="py-1.5 px-2">String</td><td className="py-1.5 px-2">«·’‰›</td></tr>
                    <tr className="border-b border-white/5"><td className="py-1.5 px-2 font-mono text-cyan-400">rate</td><td className="py-1.5 px-2">Double</td><td className="py-1.5 px-2">«·”⁄— ·ﬂ· 1000</td></tr>
                    <tr className="border-b border-white/5"><td className="py-1.5 px-2 font-mono text-cyan-400">min</td><td className="py-1.5 px-2">Integer</td><td className="py-1.5 px-2">√ﬁ· ﬂ„Ì…</td></tr>
                    <tr><td className="py-1.5 px-2 font-mono text-cyan-400">max</td><td className="py-1.5 px-2">Integer</td><td className="py-1.5 px-2">√ﬁ’Ï ﬂ„Ì…</td></tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Add Order */}
            <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-sm">
              <h4 className="text-green-400 font-bold text-sm mb-1 flex items-center gap-2">?? ≈‰‘«¡ ÿ·» ó Add order</h4>
              <p className="text-white/40 text-xs mb-3">«” Œœ„ Â–Â «·ÿ—Ìﬁ… ·≈‰‘«¡ ÿ·» ÃœÌœ</p>
              <div className="mb-3">
                <p className="text-white/50 text-xs mb-1">ÿ·» ⁄Ì‰…:</p>
                <div className="bg-black/40 rounded-lg px-3 py-2 text-xs font-mono text-green-400 break-all" dir="ltr">
                  {apiBase}?action=add&service=1&link=instagram.com/username&quantity=100&key=yourKey
                </div>
              </div>
              <div className="mb-3">
                <p className="text-white/50 text-xs mb-1">⁄Ì‰… «·«” Ã«»…:</p>
                <pre className="bg-black/40 rounded-lg px-3 py-2 text-xs font-mono text-yellow-300" dir="ltr">{`{
  "order": 10001
}`}</pre>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-white/40 border-b border-white/10"><th className="text-right py-1.5 px-2">«·„⁄«„·</th><th className="text-right py-1.5 px-2">«·‰Ê⁄</th><th className="text-right py-1.5 px-2">«·Ê’›</th></tr></thead>
                  <tbody className="text-white/60">
                    <tr className="border-b border-white/5"><td className="py-1.5 px-2 font-mono text-green-400">service</td><td className="py-1.5 px-2">Integer</td><td className="py-1.5 px-2">ÂÊÌ… «·Œœ„…</td></tr>
                    <tr className="border-b border-white/5"><td className="py-1.5 px-2 font-mono text-green-400">link</td><td className="py-1.5 px-2">String</td><td className="py-1.5 px-2">—«»ÿ «·Õ”«» / «·„‰‘Ê—</td></tr>
                    <tr><td className="py-1.5 px-2 font-mono text-green-400">quantity</td><td className="py-1.5 px-2">Integer</td><td className="py-1.5 px-2">«·ﬂ„Ì… «·„ÿ·Ê»…</td></tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Order Status */}
            <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-sm">
              <h4 className="text-purple-400 font-bold text-sm mb-1 flex items-center gap-2">?? Õ«·… «·ÿ·» ó Order status</h4>
              <p className="text-white/40 text-xs mb-3">«” Œœ„ Â–Â «·ÿ—Ìﬁ… ··Õ’Ê· ⁄·Ï „⁄·Ê„«  ÕÊ· «·ÿ·»</p>
              <div className="mb-3">
                <p className="text-white/50 text-xs mb-1">ÿ·» ⁄Ì‰…:</p>
                <div className="bg-black/40 rounded-lg px-3 py-2 text-xs font-mono text-green-400 break-all" dir="ltr">
                  {apiBase}?action=status&order=10001&key=yourKey
                </div>
              </div>
              <div className="mb-3">
                <p className="text-white/50 text-xs mb-1">⁄Ì‰… «·«” Ã«»…:</p>
                <pre className="bg-black/40 rounded-lg px-3 py-2 text-xs font-mono text-yellow-300" dir="ltr">{`{
  "charge": "0.27819",
  "start_count": "0",
  "status": "In progress",
  "remains": "0",
  "currency": "USD"
}`}</pre>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-white/40 border-b border-white/10"><th className="text-right py-1.5 px-2">«·Õﬁ·</th><th className="text-right py-1.5 px-2">«·‰Ê⁄</th><th className="text-right py-1.5 px-2">«·Ê’›</th></tr></thead>
                  <tbody className="text-white/60">
                    <tr className="border-b border-white/5"><td className="py-1.5 px-2 font-mono text-purple-400">charge</td><td className="py-1.5 px-2">Double</td><td className="py-1.5 px-2">«·„»·€ «·„’—Ê›</td></tr>
                    <tr className="border-b border-white/5"><td className="py-1.5 px-2 font-mono text-purple-400">status</td><td className="py-1.5 px-2">String</td><td className="py-1.5 px-2">In progress, Completed, Awaiting, Canceled, Partial</td></tr>
                    <tr className="border-b border-white/5"><td className="py-1.5 px-2 font-mono text-purple-400">remains</td><td className="py-1.5 px-2">Integer</td><td className="py-1.5 px-2">«·ﬂ„Ì… «·„ »ﬁÌ…</td></tr>
                    <tr><td className="py-1.5 px-2 font-mono text-purple-400">currency</td><td className="py-1.5 px-2">String</td><td className="py-1.5 px-2">«·⁄„·…</td></tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Multiple Status */}
            <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-sm">
              <h4 className="text-purple-400 font-bold text-sm mb-1 flex items-center gap-2">?? Õ«·… ÿ·»«  „ ⁄œœ… ó Multiple status</h4>
              <p className="text-white/40 text-xs mb-3">«” Œœ„ Â–Â «·ÿ—Ìﬁ… ··Õ’Ê· ⁄·Ï Õ«·… ⁄œ… ÿ·»« </p>
              <div className="mb-3">
                <p className="text-white/50 text-xs mb-1">ÿ·» ⁄Ì‰…:</p>
                <div className="bg-black/40 rounded-lg px-3 py-2 text-xs font-mono text-green-400 break-all" dir="ltr">
                  {apiBase}?action=status&orders=10001,10002,10003&key=yourKey
                </div>
              </div>
              <div>
                <p className="text-white/50 text-xs mb-1">⁄Ì‰… «·«” Ã«»…:</p>
                <pre className="bg-black/40 rounded-lg px-3 py-2 text-xs font-mono text-yellow-300 overflow-x-auto" dir="ltr">{`{
  "10001": {
    "charge": "0.27",
    "start_count": "0",
    "status": "Completed",
    "remains": "0",
    "currency": "USD"
  },
  "10002": "Incorrect order ID"
}`}</pre>
              </div>
            </Card>

            {/* Balance */}
            <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-sm">
              <h4 className="text-yellow-400 font-bold text-sm mb-1 flex items-center gap-2">?? «·—’Ìœ ó Balance</h4>
              <p className="text-white/40 text-xs mb-3">«” Œœ„ Â–Â «·ÿ—Ìﬁ… ·«” —œ«œ —’Ìœ Õ”«»ﬂ</p>
              <div className="mb-3">
                <p className="text-white/50 text-xs mb-1">ÿ·» ⁄Ì‰…:</p>
                <div className="bg-black/40 rounded-lg px-3 py-2 text-xs font-mono text-green-400 break-all" dir="ltr">
                  {apiBase}?action=balance&key=yourKey
                </div>
              </div>
              <div>
                <p className="text-white/50 text-xs mb-1">⁄Ì‰… «·«” Ã«»…:</p>
                <pre className="bg-black/40 rounded-lg px-3 py-2 text-xs font-mono text-yellow-300" dir="ltr">{`{
  "balance": "99.80",
  "currency": "USD"
}`}</pre>
              </div>
            </Card>

            {/* Refill */}
            <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-sm">
              <h4 className="text-blue-400 font-bold text-sm mb-1 flex items-center gap-2">?? ≈⁄«œ…  ⁄»∆… ó Refill</h4>
              <p className="text-white/40 text-xs mb-3">«” Œœ„ Â–Â «·ÿ—Ìﬁ… ·≈‰‘«¡ ≈⁄«œ…  ⁄»∆… ··ÿ·»</p>
              <div className="mb-3">
                <p className="text-white/50 text-xs mb-1">ÿ·» ⁄Ì‰…:</p>
                <div className="bg-black/40 rounded-lg px-3 py-2 text-xs font-mono text-green-400 break-all" dir="ltr">
                  {apiBase}?action=refill&order=10001&key=yourKey
                </div>
              </div>
              <div>
                <p className="text-white/50 text-xs mb-1">⁄Ì‰… «·«” Ã«»…:</p>
                <pre className="bg-black/40 rounded-lg px-3 py-2 text-xs font-mono text-yellow-300" dir="ltr">{`{
  "refill": 1
}`}</pre>
              </div>
            </Card>

            {/* Cancel */}
            <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-sm">
              <h4 className="text-red-400 font-bold text-sm mb-1 flex items-center gap-2">? ≈·€«¡ «·ÿ·» ó Cancel</h4>
              <p className="text-white/40 text-xs mb-3">«” Œœ„ Â–Â «·ÿ—Ìﬁ… ·≈·€«¡ ÿ·» Ê«” —œ«œ «·„»·€</p>
              <div className="mb-3">
                <p className="text-white/50 text-xs mb-1">ÿ·» ⁄Ì‰…:</p>
                <div className="bg-black/40 rounded-lg px-3 py-2 text-xs font-mono text-green-400 break-all" dir="ltr">
                  {apiBase}?action=cancel&order=10001&key=yourKey
                </div>
              </div>
              <div>
                <p className="text-white/50 text-xs mb-1">⁄Ì‰… «·«” Ã«»…:</p>
                <pre className="bg-black/40 rounded-lg px-3 py-2 text-xs font-mono text-yellow-300" dir="ltr">{`{
  "ok": true
}`}</pre>
              </div>
            </Card>
          </div>
        );
      })()}
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
    fetch(`${API_URL_RAW}/gateways/public`).then(r => r.json()).then(setGateways).catch(console.error);
  }, []);

  // Poll payment status
  useEffect(() => {
    if (!cryptoPayment?.paymentId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL_RAW}/nowpayments/status/${cryptoPayment.paymentId}`);
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
    try {
      navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const createCryptoPayment = async () => {
    if (!autoAmount || parseFloat(autoAmount) < 1 || !user?._id) return;
    setPaymentLoading(true);
    setPaymentError('');
    try {
      const res = await fetch(`${API_URL_RAW}/nowpayments/create-payment`, {
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
                          {copied ? '?' : t.copy}
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedMethodData.instructionText && (
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-white/60 text-sm">?? {selectedMethodData.instructionText}</p>
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
                          ? `ÿ·» ‘Õ‰ —’Ìœ\n?? «·„” Œœ„: ${user?.username || ''}\n?? ÿ—Ìﬁ… «·œ›⁄: ${selectedMethodData?.name || ''}\n?? «·„»·€ «·„ÕÊ·: ${manualAmount || '0'}$\n?? —ﬁ„ «·Õ”«»: ${selectedMethodData?.accountNumber || ''}`
                          : `Balance top-up request\n?? Username: ${user?.username || ''}\n?? Payment method: ${selectedMethodData?.name || ''}\n?? Amount transferred: $${manualAmount || '0'}\n?? Account: ${selectedMethodData?.accountNumber || ''}`;
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
                        const res = await apiFetch(`/coupons/redeem`, {
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
                            {lang === 'ar' ? 'Ã«—Ì ≈‰‘«¡ ⁄‰Ê«‰ «·œ›⁄...' : 'Creating payment...'}
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
                          ? (lang === 'ar' ? '?  „ «” ·«„ «·œ›⁄…!  „ ≈÷«›… «·—’Ìœ' : '? Payment received! Balance added')
                          : paymentStatus === 'sending' || paymentStatus === 'confirming'
                            ? (lang === 'ar' ? '? Ã«—Ì  √ﬂÌœ «·„⁄«„·…...' : '? Confirming transaction...')
                            : (lang === 'ar' ? '? ›Ì «‰ Ÿ«— «·œ›⁄...' : '? Waiting for payment...')}
                      </div>

                      {/* Payment Details */}
                      {paymentStatus !== 'finished' && paymentStatus !== 'confirmed' && paymentStatus !== 'partially_paid' && (
                        <>
                          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                            <p className="text-yellow-200 font-body mb-1 text-sm">
                              {lang === 'ar' ? '√—”· »«·÷»ÿ:' : 'Send exactly:'}
                            </p>
                            <div className="flex items-center justify-center gap-2" dir="ltr">
                              <code className="text-2xl font-mono bg-black/30 px-4 py-2 rounded text-white font-bold">
                                {cryptoPayment.payAmount} {cryptoPayment.payCurrency.toUpperCase()}
                              </code>
                            </div>
                            <p className="text-center text-white/40 text-xs mt-1">? ${cryptoPayment.priceAmount}</p>
                          </div>

                          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-white/60 font-body mb-2 text-sm">
                              {lang === 'ar' ? '?? ⁄‰Ê«‰ «·«” ·«„:' : '?? Payment address:'}
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
                                {copied ? '?' : (lang === 'ar' ? '‰”Œ' : 'Copy')}
                              </Button>
                            </div>
                          </div>

                          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                            <p className="text-orange-200 text-xs text-center">
                              ?? {lang === 'ar'
                                ? `√—”· ›ﬁÿ ${cryptoPayment.payCurrency.toUpperCase()} ≈·Ï Â–« «·⁄‰Ê«‰. ”Ì „  ÕœÌÀ «·—’Ìœ  ·ﬁ«∆Ì« »⁄œ «· √ﬂÌœ.`
                                : `Only send ${cryptoPayment.payCurrency.toUpperCase()} to this address. Balance will update automatically after confirmation.`}
                            </p>
                          </div>

                          {/* Animated waiting indicator */}
                          <div className="flex items-center justify-center gap-2 text-white/40 text-sm py-2">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                            {lang === 'ar' ? 'Ì „ «· Õﬁﬁ ﬂ· 10 ÀÊ«‰Ú  ·ﬁ«∆Ì«...' : 'Auto-checking every 10 seconds...'}
                          </div>

                          {/* Cancel Button */}
                          <Button
                            onClick={() => { setCryptoPayment(null); setAutoAmount(''); setPaymentStatus(''); setPaymentError(''); }}
                            variant="ghost"
                            className="w-full mt-2 text-white/40 hover:text-white/70 hover:bg-white/5 border border-white/10"
                          >
                            {lang === 'ar' ? '? ≈·€«¡' : '? Cancel'}
                          </Button>
                        </>
                      )}

                      {/* Success State */}
                      {(paymentStatus === 'finished' || paymentStatus === 'confirmed' || paymentStatus === 'partially_paid') && (
                        <div className="text-center py-4">
                          <p className="text-green-300 text-lg font-bold mb-2">
                            ?? {lang === 'ar' ? ` „ ≈÷«›… $${cryptoPayment.priceAmount} ·—’Ìœﬂ!` : `$${cryptoPayment.priceAmount} added to your balance!`}
                          </p>
                          <Button
                            onClick={() => { setCryptoPayment(null); setAutoAmount(''); setPaymentStatus(''); }}
                            className="mt-2 bg-white/10 hover:bg-white/20 text-white"
                          >
                            {lang === 'ar' ? 'œ›⁄… ÃœÌœ…' : 'New Payment'}
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
                        {lang === 'ar' ? '?? —ﬁ„ «·Â« › (¬”Ì«”Ì·)' : '?? Phone Number (Asiacell)'}
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
                            const res = await fetch(`${API_URL_RAW}/asiacell/login`, {
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
                            {lang === 'ar' ? 'Ã«—Ì «·≈—”«·...' : 'Sending...'}
                          </span>
                        ) : (lang === 'ar' ? '≈—”«· —„“ «· Õﬁﬁ' : 'Send OTP')}
                      </Button>
                    </div>
                  )}

                  {/* Step 2: OTP Verification */}
                  {acStep === 'otp' && (
                    <div className="space-y-3">
                      <label className="block font-body text-white/80 mb-1">
                        {lang === 'ar' ? '?? √œŒ· —„“ «· Õﬁﬁ «·„—”· ≈·Ï' : '?? Enter OTP sent to'} <span className="text-cyan-400 font-mono" dir="ltr">{acPhone}</span>
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
                            const res = await fetch(`${API_URL_RAW}/asiacell/verify-otp`, {
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
                            {lang === 'ar' ? 'Ã«—Ì «· Õﬁﬁ...' : 'Verifying...'}
                          </span>
                        ) : (lang === 'ar' ? ' √ﬂÌœ «·—„“' : 'Verify OTP')}
                      </Button>
                    </div>
                  )}

                  {/* Step 3: Amount Selection */}
                  {acStep === 'amount' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                        <p className="text-green-300 text-sm">? {lang === 'ar' ? ' „ «· Õﬁﬁ »‰Ã«Õ!' : 'Verified successfully!'}</p>
                      </div>
                      <label className="block font-body text-white/80 mb-1">
                        {lang === 'ar' ? '?? «”„ «·„” Œœ„' : '?? Username'}
                      </label>
                      <Input
                        value={acUsername || user?.username || ''}
                        onChange={e => setAcUsername(e.target.value)}
                        className="bg-white/5 border-white/10 text-white focus:border-cyan-500/50 text-center"
                        placeholder={lang === 'ar' ? '«”„ «·„” Œœ„' : 'Your username'}
                        dir="ltr"
                      />
                      <label className="block font-body text-white/80 mb-1">
                        {lang === 'ar' ? '?? «·„»·€ »«·œÌ‰«— «·⁄—«ﬁÌ (IQD)' : '?? Amount in Iraqi Dinar (IQD)'}
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
                            const res = await fetch(`${API_URL_RAW}/asiacell/transfer`, {
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
                            {lang === 'ar' ? 'Ã«—Ì «· ÕÊÌ·...' : 'Processing...'}
                          </span>
                        ) : (lang === 'ar' ? ` ÕÊÌ· ${acAmount ? parseInt(acAmount).toLocaleString() : '0'} IQD` : `Transfer ${acAmount ? parseInt(acAmount).toLocaleString() : '0'} IQD`)}
                      </Button>
                    </div>
                  )}

                  {/* Step 4: Confirmation OTP */}
                  {acStep === 'confirm' && (
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-center">
                        <p className="text-yellow-300 text-sm">
                          ?? {lang === 'ar'
                            ? `”Ì „  ÕÊÌ· ${parseInt(acAmount).toLocaleString()} IQD ($${(parseInt(acAmount) / 1000).toFixed(2)})`
                            : `Transferring ${parseInt(acAmount).toLocaleString()} IQD ($${(parseInt(acAmount) / 1000).toFixed(2)})`}
                        </p>
                      </div>
                      <label className="block font-body text-white/80 mb-1">
                        {lang === 'ar' ? '? √œŒ· —„“ «· √ﬂÌœ' : '?? Enter confirmation OTP'}
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
                            const res = await fetch(`${API_URL_RAW}/asiacell/confirm`, {
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
                            {lang === 'ar' ? 'Ã«—Ì «· √ﬂÌœ...' : 'Confirming...'}
                          </span>
                        ) : (lang === 'ar' ? ' √ﬂÌœ «· ÕÊÌ·' : 'Confirm Transfer')}
                      </Button>
                    </div>
                  )}

                  {/* Success */}
                  {acStep === 'success' && (
                    <div className="text-center py-4 space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-3xl">??</span>
                      </div>
                      <p className="text-green-300 text-lg font-bold">
                        {lang === 'ar' ? ` „ ≈÷«›… $${acCredited} ·—’Ìœﬂ!` : `$${acCredited} added to your balance!`}
                      </p>
                      <p className="text-white/40 text-sm">
                        {parseInt(acAmount).toLocaleString()} IQD ? ${acCredited}
                      </p>
                      <Button
                        onClick={() => {
                          setAcStep('phone'); setAcPhone(''); setAcOtp(''); setAcAmount(''); setAcUsername('');
                          setAcConfirmOtp(''); setAcSessionId(''); setAcError(''); setAcCredited(0);
                        }}
                        className="mt-2 bg-white/10 hover:bg-white/20 text-white"
                      >
                        {lang === 'ar' ? '⁄„·Ì… ÃœÌœ…' : 'New Transfer'}
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
                      {lang === 'ar' ? '? ≈·€«¡' : '? Cancel'}
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
  const { user } = useAuth();
  const [config, setConfig] = useState<{ whatsapp?: string; telegram?: string; email?: string; supportMessage?: string }>({});
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketTopic, setTicketTopic] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [sendingTicket, setSendingTicket] = useState(false);
  const [ticketMsg, setTicketMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const topics = ['„‘ﬂ·… ›Ì ÿ·»', '„‘ﬂ·… ›Ì «·œ›⁄', '„‘ﬂ·… ›Ì «·Õ”«»', '«” ›”«— ⁄«„', '«ﬁ —«Õ √Ê „·«ÕŸ…'];

  useEffect(() => {
    fetch(`${API_URL_RAW}/settings/public/support`).then(r => r.json()).then(data => { if (data) setConfig(data); }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const fetchTickets = () => {
    if (!user?._id) return;
    apiFetch(`/tickets/user/${user._id}`).then(r => r.json()).then(data => { if (Array.isArray(data)) setTickets(data); }).catch(console.error);
  };
  useEffect(() => { fetchTickets(); }, [user?._id]);

  const handleSubmitTicket = async () => {
    if (!ticketTopic || !ticketMessage.trim()) { setTicketMsg({ type: 'error', text: 'Ì—ÃÏ «Œ Ì«— «·„Ê÷Ê⁄ Êﬂ «»… «·—”«·…' }); return; }
    setSendingTicket(true); setTicketMsg(null);
    try {
      const res = await apiFetch(`/tickets`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user?._id, topic: ticketTopic, message: ticketMessage }) });
      if (res.ok) { setTicketMsg({ type: 'success', text: ' „ ≈—”«· «· –ﬂ—… »‰Ã«Õ ?' }); setTicketTopic(''); setTicketMessage(''); fetchTickets(); }
      else { setTicketMsg({ type: 'error', text: '›‘· ≈—”«· «· –ﬂ—…' }); }
    } catch { setTicketMsg({ type: 'error', text: 'Œÿ√ ›Ì «·« ’«·' }); }
    setSendingTicket(false);
  };

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
          <button onClick={() => window.open(`https://wa.me/${config.whatsapp!.replace(/[^0-9]/g, '')}`, '_blank')} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-green-400"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.66 0-3.203-.51-4.484-1.375l-.32-.191-2.872.855.855-2.872-.191-.32A7.963 7.963 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" /></svg>
            </div>
            <div className="flex-1 text-start"><p className="text-white font-bold text-sm">{lang === 'ar' ? 'Ê« ”«»' : 'WhatsApp'}</p><p className="text-white/40 text-xs" dir="ltr">{config.whatsapp}</p></div>
          </button>
        )}
        {config.telegram && (
          <button onClick={() => window.open(`https://t.me/${config.telegram!.replace('@', '')}`, '_blank')} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-400"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z" /></svg>
            </div>
            <div className="flex-1 text-start"><p className="text-white font-bold text-sm">{lang === 'ar' ? ' ·Ã—«„' : 'Telegram'}</p><p className="text-white/40 text-xs">{config.telegram}</p></div>
          </button>
        )}
        {config.email && (
          <button onClick={() => window.open(`mailto:${config.email}`, '_blank')} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center"><span className="text-2xl">??</span></div>
            <div className="flex-1 text-start"><p className="text-white font-bold text-sm">{lang === 'ar' ? '«·»—Ìœ «·≈·ﬂ —Ê‰Ì' : 'Email'}</p><p className="text-white/40 text-xs">{config.email}</p></div>
          </button>
        )}
        {!loading && !config.whatsapp && !config.telegram && !config.email && (
          <Card className="p-6 bg-white/5 border-white/10 text-center"><p className="text-white/40 text-sm">{lang === 'ar' ? '·«  ÊÃœ Ê”«∆· « ’«· „ «Õ… Õ«·Ì«' : 'No contact channels available'}</p></Card>
        )}
      </div>

      {/* Ticket Form */}
      <Card className="p-5 bg-white/5 border-white/10 backdrop-blur-sm space-y-4">
        <h3 className="text-white font-bold text-base flex items-center gap-2">?? ≈—”«·  –ﬂ—… œ⁄„</h3>
        <div>
          <label className="block text-white/60 text-sm mb-2">{t.ticketSubject || '„Ê÷Ê⁄ «· –ﬂ—…'}</label>
          <div className="relative">
            <select
              value={ticketTopic}
              onChange={e => setTicketTopic(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 appearance-none"
              style={{ paddingInlineEnd: '2.5rem' }}
            >
              <option value="" disabled className="bg-[#0a0a1a] text-white/50">{lang === 'ar' ? '«Œ — «·„Ê÷Ê⁄...' : 'Select a topic...'}</option>
              {topics.map(tp => (
                <option key={tp} value={tp} className="bg-[#0a0a1a] text-white">
                  {tp}
                </option>
              ))}
            </select>
            <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none text-white/50 ${lang === 'ar' ? 'left-4' : 'right-4'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-white/60 text-sm mb-2">—”«·… «·„”«⁄œ…</label>
          <textarea value={ticketMessage} onChange={e => setTicketMessage(e.target.value)} placeholder="«ﬂ » —”«· ﬂ Â‰«..." rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm resize-none focus:outline-none focus:border-cyan-500/50" />
        </div>
        {ticketMsg && <div className={`p-3 rounded-xl text-sm ${ticketMsg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{ticketMsg.text}</div>}
        <Button onClick={handleSubmitTicket} disabled={sendingTicket || !ticketTopic || !ticketMessage.trim()} className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white h-11 disabled:opacity-50">
          {sendingTicket ? '...' : '?? ≈—”«· «· –ﬂ—…'}
        </Button>
      </Card>

      {/* Tickets List */}
      {tickets.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white font-bold text-base">??  –«ﬂ—Ì</h3>
          {tickets.map(ticket => (
            <Card key={ticket._id} className="p-4 bg-white/5 border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium text-sm">{ticket.topic}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${ticket.status === 'closed' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'}`}>
                  {ticket.status === 'closed' ? ' „ «·—œ ?' : 'ﬁÌœ «·„—«Ã⁄… ?'}
                </span>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <p className="text-white/40 text-[10px] mb-1">—”«· ﬂ:</p>
                <p className="text-white/80 text-sm leading-relaxed">{ticket.message}</p>
              </div>
              {ticket.adminReply && (
                <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl p-3 border border-cyan-500/20">
                  <p className="text-cyan-400 text-[10px] mb-1 font-bold">—œ «·√œ„‰:</p>
                  <p className="text-white text-sm leading-relaxed">{ticket.adminReply}</p>
                  {ticket.repliedAt && <p className="text-white/25 text-[10px] mt-2">{new Date(ticket.repliedAt).toLocaleString('ar-IQ')}</p>}
                </div>
              )}
              <p className="text-white/20 text-[10px]">{new Date(ticket.createdAt).toLocaleString('ar-IQ')}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}



// Terms of Use View
function TermsView() {
  const { t } = useLanguage();
  const [sections, setSections] = useState<{ title: string; body: string }[]>([]);

  useEffect(() => {
    fetch(`${API_URL_RAW}/settings/public/terms`)
      .then(r => r.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) setSections(data);
        else setSections([
          { title: '1. «·ﬁ»Ê· »«·‘—Êÿ', body: '»«” Œœ«„ﬂ ·„‰’… Jerry° ›≈‰ﬂ  Ê«›ﬁ ⁄·Ï Ã„Ì⁄ «·‘—Êÿ Ê«·√Õﬂ«„ «·„–ﬂÊ—… √œ‰«Â. Ì—ÃÏ ﬁ—«¡ Â« »⁄‰«Ì… ﬁ»· «” Œœ«„ √Ì Œœ„….' },
          { title: '2. «·Œœ„«  «·„ﬁœ„…', body: '‰ﬁœ„ Œœ„«  «· ”ÊÌﬁ «·—ﬁ„Ì »„« ›Ì –·ﬂ “Ì«œ… «·„ «»⁄Ì‰ Ê«·„‘«Âœ«  Ê«··«Ìﬂ«  ⁄»— „‰’«  «· Ê«’· «·«Ã „«⁄Ì «·„Œ ·›….' },
          { title: '3. ”Ì«”… «·«” —œ«œ', body: '·« Ì„ﬂ‰ «” —œ«œ «·„»«·€ »⁄œ »œ¡  ‰›Ì– «·ÿ·». ›Ì Õ«·… ⁄œ„ «ﬂ „«· «·ÿ·»° ”Ì „ ≈—Ã«⁄ «·—’Ìœ «·„ »ﬁÌ ≈·Ï Õ”«»ﬂ.' },
          { title: '4. «·„”ƒÊ·Ì…', body: '·«   Õ„· «·„‰’… √Ì „”ƒÊ·Ì… ⁄‰ √Ì ≈Ã—«¡«    Œ–Â« „‰’«  «· Ê«’· «·«Ã „«⁄Ì  Ã«Â Õ”«»« ﬂ ‰ ÌÃ… «” Œœ«„ Œœ„« ‰«.' },
          { title: '5. «·Œ’Ê’Ì…', body: '‰Õ —„ Œ’Ê’Ì ﬂ Ê·« ‰‘«—ﬂ »Ì«‰« ﬂ «·‘Œ’Ì… „⁄ √Ì ÿ—› À«·À. Ì „ «” Œœ«„ »Ì«‰« ﬂ ›ﬁÿ · ﬁœÌ„ «·Œœ„«  «·„ÿ·Ê»….' },
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
    fetch(`${API_URL_RAW}/settings/public/updates`)
      .then(r => r.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) setUpdates(data);
        else setUpdates([
          { version: 'v2.5', date: '2025-02-15', title: ' Õ”Ì‰«  Ê«ÃÂ… «·„” Œœ„', description: ' Õ”Ì‰ «· ’„Ì„ «·⁄«„ Ê≈÷«›… ﬁ«∆„… Ã«‰»Ì… ÃœÌœ… ··„Ê»«Ì· „⁄  Õ”Ì‰ ”—⁄… «· ÿ»Ìﬁ.', type: ' Õ”Ì‰' },
          { version: 'v2.4', date: '2025-02-10', title: '≈÷«›… Œœ„«   ·ÌÃ—«„', description: ' „  ≈÷«›… Œœ„«  ÃœÌœ… · ·ÌÃ—«„  ‘„· «·√⁄÷«¡ Ê«·„‘«Âœ«  »÷„«‰«  „ ⁄œœ….', type: 'ÃœÌœ' },
          { version: 'v2.3', date: '2025-02-01', title: '‰Ÿ«„ «·»ÕÀ «·–ﬂÌ', description: '≈÷«›… Œ«’Ì… «·»ÕÀ ⁄‰ «·Œœ„«  Ê«·√ﬁ”«„ »«·«”„ „‰ «·‘—Ìÿ «·”›·Ì.', type: 'ÃœÌœ' },
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
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${update.type === 'ÃœÌœ' ? 'bg-green-500/20 text-green-400 border-green-500/30' : update.type === '≈’·«Õ' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
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
        return <SearchView
          onNavigate={setActiveItem}
          onServiceSelect={(svc) => {
            setSelectedService(svc._id);
            setSelectedServiceData(svc);
            setActiveItem('service-details');
          }}
          onCategorySelect={(catId, catName) => {
            setBrowseCategoryId(catId);
            setBrowseCategoryName(catName);
            setActiveItem('browse-category');
          }}
        />;
      case 'orders':
        return <OrdersView />;
      case 'settings':
        return <SettingsView />;
      case 'api':
        return <SettingsView defaultTab="api" />;
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