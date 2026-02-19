import { useState } from 'react';
import Starfield from '@/components/Starfield';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import StatsView from './views/StatsView';
import GatewaysView from './views/GatewaysView';
import ProvidersView from './views/ProvidersView';
import ServicesView from './views/ServicesView';
import SupportView from './views/SupportView';
import CouponsView from './views/CouponsView';
import ContentView from './views/ContentView';
import NotificationsView from './views/NotificationsView';
import AdminSettingsView from './views/AdminSettingsView';

interface AdminDashboardProps {
    onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
    const [activeItem, setActiveItem] = useState('stats');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const renderContent = () => {
        switch (activeItem) {
            case 'stats':
                return <StatsView />;
            case 'gateways':
                return <GatewaysView />;
            case 'providers':
                return <ProvidersView onModalChange={setIsModalOpen} />;
            case 'services':
                return <ServicesView />;
            case 'support':
                return <SupportView />;
            case 'coupons':
                return <CouponsView />;
            case 'content':
                return <ContentView />;
            case 'notifications':
                return <NotificationsView />;
            case 'settings':
                return <AdminSettingsView />;
            default:
                return <StatsView />;
        }
    };

    return (
        <div className="flex h-screen bg-[#0a0a1a] relative overflow-hidden font-body">
            {/* Background Starfield (Distinct from User Dashboard if needed, or same) */}
            <div className="absolute inset-0 z-0 opacity-30">
                <Starfield starCount={500} speed={0.01} />
            </div>

            <AdminSidebar
                activeItem={activeItem}
                onItemClick={setActiveItem}
                onLogout={onLogout}
                hideBottomNav={isModalOpen}
            />

            <div className="flex-1 flex flex-col overflow-hidden relative z-10 bg-black/20 backdrop-blur-[2px]">
                <AdminHeader />
                <main className="flex-1 overflow-y-auto custom-scrollbar pb-32 md:pb-0">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
