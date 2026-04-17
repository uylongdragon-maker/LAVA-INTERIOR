import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import { createOrder, initFirebase } from '../../services/firebase';
import { OrderStatus, PaymentMethod, PromotionCode } from '../../types';
import { collection, getDocs, query, where } from 'firebase/firestore';

const Checkout: React.FC = () => {
    const { cartItems, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);
    const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        paymentMethod: PaymentMethod.BankQR
    });

    const selectedItems = cartItems.filter(item => item.selected);
    const subtotal = selectedItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const vat = Math.round(subtotal * 0.08);
    const total = subtotal + vat - discount;

    const handleApplyCoupon = async () => {
        if (!coupon) return;
        const firebase = initFirebase();
        if (!firebase) {
            // Demo fallback
            if (coupon.toUpperCase() === 'LAVA10') {
                setDiscount(Math.round(subtotal * 0.1));
                alert('Áp dụng mã giảm giá 10% thành công!');
            } else {
                alert('Mã giảm giá không hợp lệ.');
            }
            return;
        }

        try {
            const q = query(
                collection(firebase.db, 'promotions'), 
                where('code', '==', coupon.toUpperCase()),
                where('isActive', '==', true)
            );
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                alert('Mã giảm giá không tồn tại hoặc đã hết hạn.');
                return;
            }

            const promo = querySnapshot.docs[0].data() as PromotionCode;
            
            if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
                alert(`Đơn hàng tối thiểu ${promo.minOrderAmount.toLocaleString()}đ để áp dụng mã này.`);
                return;
            }

            if (promo.discountType === 'percentage') {
                setDiscount(Math.round(subtotal * (promo.value / 100)));
            } else {
                setDiscount(promo.value);
            }
            alert(`Đã áp dụng mã giảm giá: ${promo.code}`);
        } catch (error) {
            console.error("Error applying coupon", error);
            alert('Lỗi khi áp dụng mã giảm giá.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const orderData = {
            customerName: form.name,
            phone: form.phone,
            email: form.email,
            address: form.address,
            items: selectedItems.map(item => ({
                productId: item.product.id,
                productName: item.product.name,
                quantity: item.quantity,
                price: item.product.price
            })),
            subtotal,
            vatAmount: vat,
            discountAmount: discount,
            totalAmount: total,
            paymentMethod: form.paymentMethod,
            status: OrderStatus.Pending,
            createdAt: new Date(),
            notes: `Thanh toán qua ${form.paymentMethod}`
        };

        try {
            const result = await createOrder(orderData);
            setOrderSuccess(result.id);
            clearCart();
        } catch (error) {
            alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 py-32 page-enter">
                <div className="max-w-lg w-full text-center space-y-8 bg-white dark:bg-zinc-900 p-12 rounded-[40px] shadow-2xl border border-black/5 dark:border-white/5">
                    <div className="size-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto animate-bounce">
                        <span className="material-symbols-outlined text-5xl">check</span>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-display font-bold">Đặt hàng thành công!</h1>
                        <p className="text-gray-500 font-light">Mã đơn hàng của bạn là: <span className="font-bold text-black dark:text-white">#{orderSuccess}</span></p>
                        <p className="text-sm text-gray-400 leading-relaxed italic">
                            Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý. 
                            Bạn sẽ nhận được email thông báo hoặc tin nhắn về kết quả xử lý và thời gian giao nhận hàng chính thức.
                        </p>
                    </div>
                    <button 
                        onClick={() => router.push('/')}
                        className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold uppercase tracking-widest text-xs hover:opacity-80 transition-all"
                    >
                        Quay về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    if (selectedItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6 py-32 page-enter">
                <div className="text-center space-y-6">
                    <p className="text-xl text-gray-500 font-light">Không có sản phẩm nào được chọn để thanh toán.</p>
                    <button 
                        onClick={() => router.push('/cart')}
                        className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold uppercase tracking-widest text-xs"
                    >
                        Quay lại giỏ hàng
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-32 page-enter">
            <h1 className="font-display text-5xl font-bold mb-12">Thanh Toán</h1>

            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-16">
                {/* Left: Info & Payment */}
                <div className="flex-1 space-y-12">
                    <section className="space-y-8">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <span className="size-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-display">1</span>
                            Thông tin nhận hàng
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Họ và tên</label>
                                <input 
                                    required
                                    value={form.name}
                                    onChange={e => setForm({...form, name: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 text-black dark:text-white" 
                                    placeholder="Nguyễn Văn A" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Số điện thoại</label>
                                <input 
                                    required
                                    type="tel"
                                    value={form.phone}
                                    onChange={e => setForm({...form, phone: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 text-black dark:text-white" 
                                    placeholder="0901234567" 
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Email</label>
                                <input 
                                    required
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm({...form, email: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 text-black dark:text-white" 
                                    placeholder="email@example.com" 
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Địa chỉ nhận hàng</label>
                                <textarea 
                                    required
                                    value={form.address}
                                    onChange={e => setForm({...form, address: e.target.value})}
                                    className="w-full bg-gray-50 dark:bg-zinc-900 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary/20 min-h-[100px] text-black dark:text-white" 
                                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <span className="size-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-display">2</span>
                            Phương thức thanh toán
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setForm({...form, paymentMethod: PaymentMethod.BankQR})}
                                className={`flex items-center gap-4 p-6 rounded-3xl border-2 transition-all ${form.paymentMethod === PaymentMethod.BankQR ? 'border-primary bg-primary/5' : 'border-black/5 dark:border-white/5 hover:border-black/10'}`}
                            >
                                <span className="material-symbols-outlined text-3xl">qr_code_2</span>
                                <div className="text-left">
                                    <p className="font-bold">Chuyển khoản QR</p>
                                    <p className="text-xs text-gray-400 italic">Quét mã để thanh toán nhanh</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setForm({...form, paymentMethod: PaymentMethod.Napas})}
                                className={`flex items-center gap-4 p-6 rounded-3xl border-2 transition-all ${form.paymentMethod === PaymentMethod.Napas ? 'border-primary bg-primary/5' : 'border-black/5 dark:border-white/5 hover:border-black/10'}`}
                            >
                                <span className="material-symbols-outlined text-3xl">credit_card</span>
                                <div className="text-left">
                                    <p className="font-bold">Thẻ NAPAS/VISA/MASTER</p>
                                    <p className="text-xs text-gray-400 italic">Thanh toán qua cổng quốc tế</p>
                                </div>
                            </button>
                        </div>
                        
                        {form.paymentMethod === PaymentMethod.BankQR && (
                            <div className="bg-gray-50 dark:bg-zinc-900 p-8 rounded-3xl text-center space-y-4 animate-fade-in-up border border-black/5 dark:border-white/5">
                                <div className="size-48 bg-white p-4 rounded-2xl mx-auto shadow-xl">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=LAVA-ORDER-${total}`} alt="QR Code" className="w-full h-full" />
                                </div>
                                <p className="text-sm text-gray-500 italic max-w-xs mx-auto">Vui lòng quét mã QR trên để hoàn tất giao dịch {total.toLocaleString('vi-VN')}đ. Hệ thống sẽ tự động xác nhận sau khi nhận được tiền.</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right: Summary */}
                <div className="w-full lg:w-[450px]">
                    <div className="bg-gray-50 dark:bg-zinc-900 rounded-[40px] p-8 md:p-10 sticky top-32 space-y-8 border border-black/5 dark:border-white/5 shadow-2xl">
                        <h2 className="text-2xl font-bold">Đơn hàng của bạn</h2>
                        
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {selectedItems.map(item => (
                                <div key={item.product.id} className="flex gap-4 items-center">
                                    <div className="size-16 bg-white dark:bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0 border border-black/5">
                                        <img src={item.product.imageUrl || item.product.images?.[0] || ''} alt={item.product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold truncate">{item.product.name}</h4>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">SL: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold text-sm">{(item.product.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-6 border-t border-black/10 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <input 
                                    value={coupon}
                                    onChange={e => setCoupon(e.target.value)}
                                    placeholder="Mã ưu đãi (LAVA10)" 
                                    className="flex-1 bg-white dark:bg-zinc-800 border-none rounded-full py-3 px-6 text-sm focus:ring-1 focus:ring-primary text-black dark:text-white"
                                />
                                <button 
                                    type="button"
                                    onClick={handleApplyCoupon}
                                    className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap hover:opacity-80 transition-opacity"
                                >
                                    Áp dụng
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-black/10 dark:border-white/10">
                            <div className="flex justify-between text-gray-500 text-sm">
                                <span>Tạm tính</span>
                                <span className="font-bold text-black dark:text-white">{subtotal.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between text-gray-500 text-sm">
                                <span>Thuế VAT (8%)</span>
                                <span className="font-bold text-black dark:text-white">{vat.toLocaleString('vi-VN')}đ</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-600 text-sm italic">
                                    <span>Giảm giá</span>
                                    <span className="font-bold">-{discount.toLocaleString('vi-VN')}đ</span>
                                </div>
                            )}
                            <div className="flex justify-between text-3xl font-display font-bold pt-6 border-t border-black/10 dark:border-white/10">
                                <span>Tổng cộng</span>
                                <span className="text-primary">{total.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading || selectedItems.length === 0}
                            className={`w-full py-5 bg-primary text-white rounded-full font-bold uppercase tracking-[0.3em] text-[10px] hover:opacity-90 transition-all shadow-xl shadow-primary/20 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Đang đặt hàng...' : 'Xác nhận thanh toán'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Checkout;
