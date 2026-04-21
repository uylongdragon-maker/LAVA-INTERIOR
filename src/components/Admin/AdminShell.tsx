
import React, { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminLang } from '../../contexts/AdminLanguageContext';
import { useRouter } from 'next/navigation';
import { initFirebase } from '../../../services/firebase';
import { useState, useEffect } from 'react';

// Controlled shell component for Admin Dashboard
interface AdminShellProps {
    children: ReactNode;
    activeTab: string;
    onTabChange: (tab: any) => void;
}

export const AdminShell: React.FC<AdminShellProps> = ({ children, activeTab, onTabChange }) => {
    const { logout, user } = useAuth();
    const { language, setLanguage, t } = useAdminLang();
    const router = useRouter();
    const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

    useEffect(() => {
        setIsFirebaseConnected(!!initFirebase());
    }, []);

    const menuItems = [
        { id: 'overview', label: t('dashboard'), icon: 'dashboard' },
        { id: 'products', label: t('products'), icon: 'inventory_2' },
        { id: 'orders', label: t('orders'), icon: 'shopping_cart' },
        { id: 'promotions', label: 'Khuyến mãi', icon: 'sell' },
        { id: 'social', label: 'Social Hub', icon: 'share' },
        { id: 'chat', label: 'Live Chat', icon: 'forum' },
        { id: 'content', label: t('content'), icon: 'edit_document' },
        { id: 'blog', label: 'Blog', icon: 'rss_feed' },
    ];

    const handleLogout = async () => {
        await logout();
        router.push('/admin/login');
    };

    return (
        <div className="flex h-screen bg-background-light dark:bg-background-dark overflow-hidden font-body">
            {/* Sidebar */}
            <aside className="w-72 bg-white dark:bg-surface-dark border-r border-gray-100 dark:border-white/5 flex flex-col transition-all duration-300 shadow-soft z-20">
                {/* Logo */}
                <div className="p-8 border-b border-gray-50 dark:border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">L</div>
                    <h1 className="text-2xl font-display font-bold text-primary dark:text-white tracking-tight">Lava Admin</h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">Menu</p>
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group ${activeTab === item.id
                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-primary'
                                }`}
                        >
                            <span className={`material-symbols-outlined transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-primary'}`}>{item.icon}</span>
                            {item.label}
                            {activeTab === item.id && <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></span>}
                        </button>
                    ))}
                </nav>

                {/* User & Logout */}
                <div className="p-6 border-t border-gray-50 dark:border-white/5 space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold border border-primary/20">
                            A
                        </div>
                        <div className="overflow-hidden flex-1">
                            <p className="text-sm font-bold truncate dark:text-white">Admin</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-bold"
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        {t('logout')}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

                {/* Topbar */}
                <header className="h-20 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 flex justify-between items-center px-8 z-10 sticky top-0">
                    <div>
                        <h2 className="text-2xl font-display font-bold text-gray-800 dark:text-white capitalize">
                            {menuItems.find(i => i.id === activeTab)?.label}
                        </h2>
                        <p className="text-xs text-gray-400 font-light">Manage your store efficiently</p>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Search */}
                        <div className="hidden md:flex items-center bg-gray-50 dark:bg-black/20 px-4 py-2.5 rounded-full border border-gray-100 dark:border-white/10 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all w-64">
                            <span className="material-symbols-outlined text-gray-400 text-lg">search</span>
                            <input
                                type="text"
                                placeholder={t('search_placeholder')}
                                className="bg-transparent border-none outline-none text-sm ml-3 w-full placeholder:text-gray-400 dark:text-white"
                            />
                        </div>

                        {/* Language Toggle */}
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors bg-white dark:bg-transparent shadow-sm"
                        >
                            <span className="text-lg">{language === 'en' ? '🇬🇧' : '🇻🇳'}</span>
                            <span className="text-xs font-bold uppercase text-gray-600 dark:text-gray-300">{language}</span>
                        </button>

                        {/* Connection Status */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isFirebaseConnected ? 'bg-green-500/5 border-green-500/20 text-green-600' : 'bg-red-500/5 border-red-500/20 text-red-600'} transition-all`}>
                            <div className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{isFirebaseConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-8 relative z-0">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminShell;
