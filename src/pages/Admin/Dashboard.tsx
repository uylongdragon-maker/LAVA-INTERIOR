import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminLanguageProvider } from '../../contexts/AdminLanguageContext';
import AdminShell from '../../components/Admin/AdminShell';
import DashboardOverview from '../../components/Admin/DashboardOverview';
import ProductManager from '../../components/Admin/ProductManager';
import ContentManager from '../../components/Admin/ContentManager';
import OrderManager from '../../components/Admin/OrderManager';
import BlogManager from '../../components/Admin/BlogManager';
import { collection, getDocs } from 'firebase/firestore';
import { initFirebase } from '../../../services/firebase';
import { Product, Order } from '../../../types';
import { PRODUCTS } from '../../../constants';
import ErrorBoundary from '../../components/ErrorBoundary';

const DashboardContent: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // Data state for Overview
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        if (!user) {
            navigate('/admin/login');
        }
    }, [user, navigate]);

    // Fetch data for overview
    useEffect(() => {
        const fetchData = async () => {
            const firebase = initFirebase();
            if (!firebase) return;

            // Products
            const pSnap = await getDocs(collection(firebase.db, 'products'));
            const fetchedProducts: Product[] = [];
            pSnap.forEach((doc) => fetchedProducts.push({ id: doc.id, ...doc.data() } as Product));
            setProducts([...fetchedProducts, ...PRODUCTS]);

            // Orders
            const oSnap = await getDocs(collection(firebase.db, 'orders'));
            const fetchedOrders: Order[] = [];
            oSnap.forEach((doc) => fetchedOrders.push({ id: doc.id, ...doc.data() } as Order));
            setOrders(fetchedOrders);
        };
        fetchData();
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <DashboardOverview products={products} orders={orders} />;
            case 'products': return <ProductManager />;
            case 'orders': return <OrderManager />;
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
