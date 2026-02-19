
import React from 'react';
import { useAdminLang } from '../../contexts/AdminLanguageContext';
import { Product, Order, OrderStatus } from '../../../types';

interface DashboardOverviewProps {
    products: Product[];
    orders: Order[];
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ products, orders }) => {
    const { t } = useAdminLang();

    // Calculate Stats
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const lowStockCount = products.filter(p => p.stock < 5).length;
    const pendingOrders = orders.filter(o => o.status === OrderStatus.Pending).length;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue Card */}
                <div className="bg-white dark:bg-[#1a261f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a4032]">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('total_revenue')}</p>
                            <h3 className="text-2xl font-bold text-[#101913] dark:text-white">
                                {totalRevenue.toLocaleString()} <span className="text-sm font-normal text-gray-400">VND</span>
                            </h3>
                        </div>
                    </div>
                    <div className="text-xs text-green-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                        <span>+12.5% from last month</span>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-white dark:bg-[#1a261f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a4032]">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                            <span className="material-symbols-outlined">shopping_bag</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('total_orders')}</p>
                            <h3 className="text-2xl font-bold text-[#101913] dark:text-white">{orders.length}</h3>
                        </div>
                    </div>
                    <div className="text-xs text-blue-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">pending</span>
                        <span>{pendingOrders} pending orders</span>
                    </div>
                </div>

                {/* Inventory Card */}
                <div className="bg-white dark:bg-[#1a261f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a4032]">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                            <span className="material-symbols-outlined">inventory_2</span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('low_stock')}</p>
                            <h3 className="text-2xl font-bold text-[#101913] dark:text-white">{lowStockCount}</h3>
                        </div>
                    </div>
                    <div className="text-xs text-orange-600 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        <span>Needs attention</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity Mock */}
            <div className="bg-white dark:bg-[#1a261f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a4032]">
                <h3 className="font-bold text-lg mb-4 text-[#101913] dark:text-white">{t('recent_activity')}</h3>
                <ul className="space-y-4">
                    <li className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-white/5">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">New order #1023 received from <strong>Nguyen Van A</strong></p>
                        <span className="ml-auto text-xs text-gray-400">2 mins ago</span>
                    </li>
                    <li className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-white/5">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Stock updated for <strong>Cement Plant Pot XL</strong></p>
                        <span className="ml-auto text-xs text-gray-400">1 hour ago</span>
                    </li>
                    <li className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">System backup completed successfully</p>
                        <span className="ml-auto text-xs text-gray-400">3 hours ago</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default DashboardOverview;
