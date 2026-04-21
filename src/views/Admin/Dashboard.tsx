import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { AdminLanguageProvider } from '../../contexts/AdminLanguageContext';
import AdminShell from '../../components/Admin/AdminShell';
import DashboardOverview from '../../components/Admin/DashboardOverview';
import ProductManager from '../../components/Admin/ProductManager';
import ContentManager from '../../components/Admin/ContentManager';
import OrderManager from '../../components/Admin/OrderManager';
import BlogManager from '../../components/Admin/BlogManager';
import SocialManager from '../../components/Admin/SocialManager';
import ChatManager from '../../components/Admin/ChatManager';
import PromotionManager from '../../components/Admin/PromotionManager';
import { collection, getDocs } from 'firebase/firestore';
import { initFirebase } from '../../../services/firebase';
import { Product, Order } from '../../../types';
import ErrorBoundary from '../../components/ErrorBoundary';

const DashboardContent: React.FC = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');

    // Data state for Overview
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        if (!user) {
            router.push('/admin/login');
        }
    }, [user, router]);

    // Fetch data for overview
    useEffect(() => {
        const fetchData = async () => {
            try {
                const firebase = initFirebase();
                if (!firebase) {
                    console.error("Dashboard: Firebase not initialized. Check your environment variables.");
                    return;
                }

                // Products
                const pSnap = await getDocs(collection(firebase.db, 'products'));
                const fetchedProducts: Product[] = [];
                pSnap.forEach((doc) => fetchedProducts.push({ id: doc.id, ...doc.data() } as Product));
                setProducts(fetchedProducts);

                // Orders
                const oSnap = await getDocs(collection(firebase.db, 'orders'));
                const fetchedOrders: Order[] = [];
                oSnap.forEach((doc) => fetchedOrders.push({ id: doc.id, ...doc.data() } as Order));
                setOrders(fetchedOrders);
            } catch (error) {
                console.error("Dashboard: Error fetching dashboard data:", error);
            }
        };
        fetchData();
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <DashboardOverview products={products} orders={orders} />;
            case 'products': return <ProductManager />;
            case 'orders': return <OrderManager />;
            case 'promotions': return <PromotionManager />;
            case 'social': return <SocialManager />;
            case 'chat': return <ChatManager />;
            case 'content': return <ContentManager />;
            case 'blog': return <BlogManager />;
            default: return <DashboardOverview products={products} orders={orders} />;
        }
    };

    return (
        <AdminShell activeTab={activeTab} onTabChange={setActiveTab}>
            {renderContent()}
        </AdminShell>
    );
};

const AdminDashboard: React.FC = () => {
    return (
        <AdminLanguageProvider>
            <ErrorBoundary>
                <DashboardContent />
            </ErrorBoundary>
        </AdminLanguageProvider>
    );
};

export default AdminDashboard;
