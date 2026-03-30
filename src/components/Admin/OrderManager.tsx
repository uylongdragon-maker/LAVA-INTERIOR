
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, Timestamp, addDoc } from 'firebase/firestore';
import { initFirebase } from '../../../services/firebase';
import { Order, OrderStatus } from '../../../types';

import { useAdminLang } from '../../contexts/AdminLanguageContext';

const OrderManager: React.FC = () => {
    const { t } = useAdminLang();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const firebase = initFirebase();

    const fetchOrders = async () => {
        if (!firebase) return;
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(firebase.db, 'orders'));
            const fetchedOrders: Order[] = [];
            querySnapshot.forEach((doc) => {
                fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
            });
            // Sort by date desc
            fetchedOrders.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });
            setOrders(fetchedOrders);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
        if (!firebase) return;
        try {
            await updateDoc(doc(firebase.db, 'orders', orderId), { status: newStatus });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    const analyzeOrderAI = async (orderId: string) => {
        if (!firebase) return;
        const analysis = "AI Suggestion: Khách hàng tiềm năng. Nên gửi ưu đãi cho đơn hàng tiếp theo.";

        try {
            await updateDoc(doc(firebase.db, 'orders', orderId), { aiAnalysis: analysis });
            setOrders(orders.map(o => o.id === orderId ? { ...o, aiAnalysis: analysis } : o));
            alert(analysis);
        } catch (error) {
            console.error("Error saving AI analysis:", error);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-[#1a261f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a4032] mt-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary dark:text-[#6fbe8e]">{t('orders')}</h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-white/10 dark:text-white">
                            <th className="pb-3 pl-2">Khách hàng</th>
                            <th className="pb-3">Sản phẩm</th>
                            <th className="pb-3">Tổng cộng</th>
                            <th className="pb-3">Trạng thái</th>
                            <th className="pb-3">Phân tích AI</th>
                            <th className="pb-3">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {orders.map(order => (
                            <tr key={order.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="py-4 pl-2 dark:text-gray-300">
                                    <div className="font-bold">{order.customerName}</div>
                                    <div className="text-xs text-gray-500">{order.phone}</div>
                                    <div className="text-[10px] text-gray-400">{order.email}</div>
                                </td>
                                <td className="py-4 dark:text-gray-300">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="mb-0.5">
                                            {item.productName} <span className="text-gray-400">x{item.quantity}</span>
                                        </div>
                                    ))}
                                </td>
                                <td className="py-4 dark:text-gray-300">
                                    <div className="font-bold text-primary-dark dark:text-[#6fbe8e]">
                                        {order.totalAmount.toLocaleString()}đ
                                    </div>
                                    {order.discountAmount > 0 && (
                                        <div className="text-[10px] text-red-500">-{(order.discountAmount).toLocaleString()}đ</div>
                                    )}
                                </td>
                                <td className="py-4 px-2">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${order.status === OrderStatus.Completed ? 'bg-green-100 text-green-700' :
                                        order.status === OrderStatus.Pending ? 'bg-yellow-100 text-yellow-700' :
                                            order.status === OrderStatus.Cancelled ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="py-4 max-w-xs text-[11px] text-gray-500 italic leading-snug">
                                    {order.aiAnalysis || "Chưa có phân tích."}
                                </td>
                                <td className="py-4 flex flex-col gap-2 min-w-[120px]">
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                                        className="p-1 px-2 rounded-lg border border-gray-200 dark:border-white/10 text-[11px] dark:bg-black/40 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                        {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <button
                                        onClick={() => analyzeOrderAI(order.id)}
                                        className="text-[10px] bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 px-2 py-1.5 rounded-lg border border-purple-100 dark:border-purple-800/30 hover:bg-purple-100 transition-colors flex items-center justify-center gap-1 font-bold"
                                    >
                                        <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                                        AI Analyze
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {orders.length === 0 && (
                    <div className="text-center py-10 text-gray-400">No orders found.</div>
                )}
            </div>
        </div>
    );
};

export default OrderManager;
