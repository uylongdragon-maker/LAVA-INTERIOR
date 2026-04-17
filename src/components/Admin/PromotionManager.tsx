
import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { initFirebase } from '../../../services/firebase';
import { PromotionCode } from '../../../types';

const PromotionManager: React.FC = () => {
    const [codes, setCodes] = useState<PromotionCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCode, setNewCode] = useState<Omit<PromotionCode, 'id'>>({
        code: '',
        discountType: 'percentage',
        value: 0,
        minOrderAmount: 0,
        isActive: true
    });
    
    const firebase = useMemo(() => initFirebase(), []);

    const fetchCodes = async () => {
        if (!firebase) return;
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(firebase.db, 'promotions'));
            const fetched: PromotionCode[] = [];
            querySnapshot.forEach((doc) => {
                fetched.push({ id: doc.id, ...doc.data() } as PromotionCode);
            });
            setCodes(fetched);
        } catch (error) {
            console.error("Error fetching promotions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCodes();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!firebase) return;
        try {
            await addDoc(collection(firebase.db, 'promotions'), newCode);
            setNewCode({
                code: '',
                discountType: 'percentage',
                value: 0,
                minOrderAmount: 0,
                isActive: true
            });
            fetchCodes();
        } catch (error) {
            console.error("Error adding promotion:", error);
        }
    };

    const toggleStatus = async (id: string, current: boolean) => {
        if (!firebase) return;
        try {
            await updateDoc(doc(firebase.db, 'promotions', id), { isActive: !current });
            setCodes(codes.map(c => c.id === id ? { ...c, isActive: !current } : c));
        } catch (error) {
            console.error("Error toggling promotion:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!firebase || !window.confirm("Xóa mã giảm giá này?")) return;
        try {
            await deleteDoc(doc(firebase.db, 'promotions', id));
            setCodes(codes.filter(c => c.id !== id));
        } catch (error) {
            console.error("Error deleting promotion:", error);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-zinc-900/50 p-8 rounded-3xl shadow-sm border border-black/5 dark:border-white/5 mt-6">
            <h2 className="text-2xl font-bold mb-8">Quản Lý Mã Giảm Giá</h2>

            <form onSubmit={handleAdd} className="grid md:grid-cols-5 gap-4 mb-12 p-6 bg-gray-50 dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Mã Code</label>
                    <input 
                        required
                        value={newCode.code}
                        onChange={e => setNewCode({...newCode, code: e.target.value.toUpperCase()})}
                        className="w-full p-2 text-sm border border-black/10 rounded-lg dark:bg-zinc-800 dark:text-white"
                        placeholder="LAVA10"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Loại</label>
                    <select 
                        value={newCode.discountType}
                        onChange={e => setNewCode({...newCode, discountType: e.target.value as any})}
                        className="w-full p-2 text-sm border border-black/10 rounded-lg dark:bg-zinc-800 dark:text-white"
                    >
                        <option value="percentage">Phần trăm (%)</option>
                        <option value="fixed">Số tiền cố định (đ)</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Giá trị</label>
                    <input 
                        type="number"
                        required
                        value={newCode.value}
                        onChange={e => setNewCode({...newCode, value: Number(e.target.value)})}
                        className="w-full p-2 text-sm border border-black/10 rounded-lg dark:bg-zinc-800 dark:text-white"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-gray-400">Đơn hàng tối thiểu</label>
                    <input 
                        type="number"
                        value={newCode.minOrderAmount}
                        onChange={e => setNewCode({...newCode, minOrderAmount: Number(e.target.value)})}
                        className="w-full p-2 text-sm border border-black/10 rounded-lg dark:bg-zinc-800 dark:text-white"
                    />
                </div>
                <div className="flex items-end">
                    <button type="submit" className="w-full p-2.5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:opacity-80 transition-opacity">
                        Thêm Mã
                    </button>
                </div>
            </form>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-black/10 dark:border-white/10 text-[10px] uppercase font-bold text-gray-400">
                            <th className="pb-4 pl-2">Mã Code</th>
                            <th className="pb-4">Loại</th>
                            <th className="pb-4">Giá Trị</th>
                            <th className="pb-4">Đơn Tối Thiểu</th>
                            <th className="pb-4">Trạng Thái</th>
                            <th className="pb-4 text-right pr-2">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {codes.map(c => (
                            <tr key={c.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                                <td className="py-4 pl-2 font-bold text-black dark:text-white">{c.code}</td>
                                <td className="py-4 text-xs text-gray-500">{c.discountType === 'percentage' ? 'Giảm %' : 'Giảm tiền mặt'}</td>
                                <td className="py-4 font-bold text-primary">{c.value.toLocaleString()}{c.discountType === 'percentage' ? '%' : 'đ'}</td>
                                <td className="py-4 text-xs text-gray-500">{c.minOrderAmount?.toLocaleString()}đ</td>
                                <td className="py-4">
                                    <button 
                                        onClick={() => toggleStatus(c.id, c.isActive)}
                                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${c.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-zinc-800 dark:border-zinc-700'}`}
                                    >
                                        {c.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                                    </button>
                                </td>
                                <td className="py-4 text-right pr-2">
                                    <button 
                                        onClick={() => handleDelete(c.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {codes.length === 0 && (
                    <div className="text-center py-10 text-gray-400 font-light italic">Chưa có mã giảm giá nào.</div>
                )}
            </div>
        </div>
    );
};

export default PromotionManager;
