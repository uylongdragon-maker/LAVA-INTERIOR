
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, Timestamp, addDoc } from 'firebase/firestore';
import { initFirebase } from '../../../services/firebase';
import { Order, OrderStatus } from '../../../types';

const OrderManager: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const firebase = initFirebase();

    // Mock Data Generator (for testing since we don't have real checkout yet)
    const generateMockOrder = async () => {
        if (!firebase) return;
        const mockOrder = {
            customerName: "Nguyen Van A",
            email: "nguyenvana@example.com",
            phone: "0909000111",
            address: "123 Le Loi, District 1, HCMC",
            items: [
                { productId: "1", productName: "Modern Concrete Table", quantity: 1, price: 5500000 }
            ],
            totalAmount: 5500000,
            status: OrderStatus.Pending,
            createdAt: Timestamp.now()
        };
        await addDoc(collection(firebase.db, 'orders'), mockOrder);
        fetchOrders();
    };

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
            fetchedOrders.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
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
        // Mock AI Simulation
        if (!firebase) return;
        const analysis = "AI Suggestion: High value customer. Priority delivery recommended due to 'Pending' status > 2 days.";

        try {
            await updateDoc(doc(firebase.db, 'orders', orderId), { aiAnalysis: analysis });
            setOrders(orders.map(o => o.id === orderId ? { ...o, aiAnalysis: analysis } : o));
            alert(analysis);
        } catch (error) {
            console.error("Error saving AI analysis:", error);
        }
    };

    if (loading) return <div>Loading orders...</div>;

    return (
        <div className="bg-white dark:bg-[#1a261f] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-[#2a4032] mt-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary dark:text-[#6fbe8e]">Order Management</h2>
                <button
                    onClick={generateMockOrder}
                    className="px-4 py-2 text-xs border border-dashed border-gray-400 rounded hover:bg-gray-50"
                >
                    + Generate Mock Order
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-200 dark:border-white/10 dark:text-white">
                            <th className="pb-3 pl-2">Client</th>
                            <th className="pb-3">Items</th>
                            <th className="pb-3">Total</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3">AI Insight</th>
                            <th className="pb-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {orders.map(order => (
                            <tr key={order.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="py-4 pl-2 dark:text-gray-300">
                                    <div className="font-bold">{order.customerName}</div>
                                    <div className="text-xs text-gray-500">{order.email}</div>
                                </td>
                                <td className="py-4 dark:text-gray-300">
                                    {order.items.map((item, idx) => (
                                        <div key={idx}>{item.productName} (x{item.quantity})</div>
                                    ))}
                                </td>
                                <td className="py-4 font-bold dark:text-[#6fbe8e]">
                                    {order.totalAmount.toLocaleString()} VND
                                </td>
                                <td className="py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === OrderStatus.Delivered ? 'bg-green-100 text-green-700' :
                                        order.status === OrderStatus.Pending ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="py-4 max-w-xs text-xs text-gray-500 italic">
                                    {order.aiAnalysis || "No analysis yet."}
                                </td>
                                <td className="py-4 flex flex-col gap-2">
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                                        className="p-1 rounded border text-xs dark:bg-black/20 dark:text-white"
                                    >
                                        {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <button
                                        onClick={() => analyzeOrderAI(order.id)}
                                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 flex items-center justify-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
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
