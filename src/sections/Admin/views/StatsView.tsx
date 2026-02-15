import { Users, ShoppingCart, DollarSign, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export default function StatsView() {
    const { t } = useLanguage();

    const stats = [
        { label: t.totalUsers, value: '1,234', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
        { label: t.totalOrders, value: '856', icon: ShoppingCart, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
        { label: t.totalRevenue, value: '$12,450', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
        { label: t.activeNow, value: '42', icon: Activity, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    ];

    return (
        <div className="p-8 space-y-8">
            <h2 className="font-space text-3xl text-white tracking-wide">{t.dashboardOverview}</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className={`p-6 border ${stat.bg} backdrop-blur-sm`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-white/60 text-sm font-body mb-1">{stat.label}</p>
                                    <h3 className="text-3xl font-bold text-white font-space">{stat.value}</h3>
                                </div>
                                <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Recent Activity Placeholder */}
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-4">{t.recentActivity}</h3>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">U{i}</div>
                            <div>
                                <p className="text-white font-medium">User #{i} placed a new order</p>
                                <p className="text-white/40 text-xs">2 minutes ago</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
