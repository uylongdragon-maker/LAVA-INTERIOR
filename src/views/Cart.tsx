
import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';

const Cart: React.FC = () => {
    const { cartItems, removeFromCart, updateQuantity, toggleSelection, clearCart } = useCart();
    const router = useRouter();

    const selectedItems = cartItems.filter(item => item.selected);
    const subtotal = selectedItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    return (
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-32 page-enter">
            <h1 className="font-display text-5xl font-bold mb-12">Giỏ Hàng</h1>

            {cartItems.length === 0 ? (
                <div className="text-center py-20 space-y-6">
                    <div className="size-24 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-8">
                        <span className="material-symbols-outlined text-6xl text-gray-300">shopping_cart_off</span>
                    </div>
                    <p className="text-xl text-gray-500 font-light">Giỏ hàng của bạn đang trống.</p>
                    <button 
                        onClick={() => router.push('/products')}
                        className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold uppercase tracking-widest text-xs hover:opacity-80 transition-all"
                    >
                        Tiếp tục mua sắm
                    </button>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Items List */}
                    <div className="flex-1 space-y-8">
                        <div className="flex justify-between items-center pb-4 border-b border-black/10 dark:border-white/10">
                            <button 
                                onClick={clearCart}
                                className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                            >
                                Xoá tất cả
                            </button>
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                {cartItems.length} sản phẩm
                            </span>
                        </div>

                        <div className="space-y-6">
                            {cartItems.map((item) => (
                                <div key={item.product.id} className="flex gap-6 items-center group bg-white dark:bg-zinc-900 p-4 rounded-2xl hover:shadow-xl transition-all border border-black/5 dark:border-white/5">
                                    <input 
                                        type="checkbox" 
                                        checked={item.selected} 
                                        onChange={() => toggleSelection(item.product.id)}
                                        className="size-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                    />
                                    <div className="size-24 bg-gray-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0">
                                        <img src={item.product.imageUrl || item.product.images?.[0] || ''} alt={item.product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold truncate">{item.product.name}</h3>
                                        <p className="text-sm text-gray-400 font-light">{item.product.material}</p>
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center border border-black/10 dark:border-white/10 rounded-lg overflow-hidden">
                                                <button 
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    className="px-3 py-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                                >-</button>
                                                <span className="px-3 text-sm font-bold">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    className="px-3 py-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                                >+</button>
                                            </div>
                                            <button 
                                                onClick={() => removeFromCart(item.product.id)}
                                                className="text-gray-300 hover:text-red-500 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">{(item.product.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">({item.product.price.toLocaleString('vi-VN')}đ/c)</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="w-full lg:w-[400px]">
                        <div className="bg-gray-50 dark:bg-zinc-900 rounded-3xl p-8 sticky top-32 space-y-6 border border-black/5 dark:border-white/5">
                            <h2 className="text-xl font-bold">Thanh Toán</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between text-gray-500 text-sm">
                                    <span>Mặt hàng được chọn</span>
                                    <span className="font-bold">{selectedItems.length}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-sm">
                                    <span>Tổng số lượng</span>
                                    <span className="font-bold">{selectedItems.reduce((acc, i) => acc + i.quantity, 0)}</span>
                                </div>
                                <div className="flex justify-between text-2xl font-bold pt-6 border-t border-black/10 dark:border-white/10">
                                    <span>Tạm tính</span>
                                    <span className="text-primary">{subtotal.toLocaleString('vi-VN')}đ</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => router.push('/checkout')}
                                disabled={selectedItems.length === 0}
                                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-primary/10"
                            >
                                Tiếp tục thanh toán
                            </button>
                            <div className="space-y-2 pt-2">
                                <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest">
                                    * Giá chưa bao gồm 8% thuế VAT
                                </p>
                                <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest">
                                    * Phí giao hàng sẽ được tính tại bước sau
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
