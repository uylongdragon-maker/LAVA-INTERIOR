import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Product, ProductStatus, SiteConfig } from '../types';
import parse from 'html-react-parser';
import { useCart } from '../src/contexts/CartContext';
import { doc, getDoc } from 'firebase/firestore';
import { initFirebase } from '../services/firebase';

interface ProductDetailModalProps {
    product: Product | null;
    onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
    const { addToCart } = useCart();
    const [config, setConfig] = useState<SiteConfig | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            const firebase = initFirebase();
            if (!firebase) return;
            try {
                const snap = await getDoc(doc(firebase.db, 'site_config', 'main'));
                if (snap.exists()) {
                    setConfig(snap.data() as SiteConfig);
                }
            } catch (e) { console.error(e); }
        };
        fetchConfig();
    }, []);

    if (!product) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content - Designed as a Catalogue Page */}
            <div className="relative z-[100000] bg-white dark:bg-[#0f0f0f] w-full max-w-6xl h-auto max-h-[90vh] overflow-y-auto animate-fade-in-up border border-white/5 shadow-2xl rounded-2xl overflow-hidden">
                
                {/* Catalogue Header Bar */}
                <div className="bg-[#1a1a1a] text-white py-5 px-6 md:px-12 lg:px-16 flex justify-between items-center sticky top-0 z-20 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        {(config?.modalLayout?.showLogo !== false) && (
                            <div className="h-6 w-auto opacity-80">
                                <svg className="h-full w-auto" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M24 10L12 36H36L24 10Z" fill="currentColor"></path>
                                </svg>
                            </div>
                        )}
                        <span className="text-[10px] font-bold tracking-[0.5em] uppercase opacity-70">Lava Interior</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <h2 className="hidden md:block text-xs font-bold tracking-[0.3em] uppercase opacity-90 font-display">
                            {config?.modalLayout?.headerTitle || (product.material.split(' - ')[1] || 'Artisan Collection')}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:opacity-100 opacity-60 transition-opacity"
                        >
                            <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                    </div>
                </div>

                <div className="px-6 md:px-12 lg:px-16 py-12 md:py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                        
                        {/* 1. Large Featured Image (Left) */}
                        <div className="lg:col-span-6">
                            <div className="relative aspect-[4/5] bg-gray-50 dark:bg-zinc-900 rounded-sm overflow-hidden group">
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                                />
                                {product.status === ProductStatus.OutOfStock && (
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                        <span className="text-white font-bold border border-white/40 px-6 py-2 uppercase tracking-[0.3em] text-xs">
                                            Sold Out
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="mt-8 text-center lg:text-left">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.4em] mb-2">{product.category}</p>
                                <h2 className="text-4xl md:text-6xl font-display font-medium text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-6">
                                    {product.name}
                                </h2>
                                <div className="flex items-center gap-4 justify-center lg:justify-start">
                                    <div className="h-[1px] w-8 bg-black/10 dark:bg-white/20"></div>
                                    <h3 className="text-2xl font-display font-light text-primary dark:text-white/80">
                                        {product.price.toLocaleString('vi-VN')} VNĐ
                                    </h3>
                                </div>
                            </div>
                        </div>

                        {/* 2. Secondary Views & Catalog Content (Right) */}
                        <div className="lg:col-span-6 space-y-16">
                            
                            {/* Secondary Gallery (Top Right of the 'Page') */}
                            <div className="grid grid-cols-2 gap-4">
                                {(product.images?.slice(1, 3) || []).map((img, i) => (
                                    <div key={i} className="aspect-square bg-gray-50 dark:bg-zinc-900 rounded-sm overflow-hidden">
                                        <img src={img} className="w-full h-full object-cover transition-transform hover:scale-110 duration-500" alt="Detail" />
                                    </div>
                                ))}
                            </div>

                            {/* Description - Editorial Style */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-[1px] w-12 bg-primary"></div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tư vấn thiết kế</h4>
                                </div>
                                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-light italic description-content">
                                    {product.description ? parse(product.description) : "Mẫu sản phẩm thủ công tinh xảo, định nghĩa lại không gian sống thô mộc."}
                                </div>
                            </div>

                            {/* Interactive Swatches - The "Catalogue" Heart */}
                            {product.swatchGroups && product.swatchGroups.length > 0 && (
                                <div className="space-y-10 border-t border-black/5 dark:border-white/5 pt-12">
                                    {product.swatchGroups.map((group, idx) => (
                                        <div key={idx} className="space-y-6">
                                            <div className="flex items-center gap-6">
                                                <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-900 dark:text-white whitespace-nowrap">
                                                    {group.title}
                                                </h5>
                                                <div className="h-[1px] w-full bg-black/5 dark:bg-white/5"></div>
                                            </div>
                                            <div className="flex flex-wrap gap-4">
                                                {group.swatches.map((swatch, sIdx) => (
                                                    <div key={sIdx} className="group relative">
                                                        <div 
                                                            className="size-10 md:size-12 rounded-full border border-black/10 dark:border-white/20 overflow-hidden transition-all hover:scale-110 cursor-pointer shadow-sm"
                                                            style={{ backgroundColor: swatch.color }}
                                                            title={swatch.name}
                                                        >
                                                            {swatch.image && <img src={swatch.image} className="size-full object-cover" alt="swatch" />}
                                                        </div>
                                                        <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                            {swatch.name}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Purchase Action */}
                            <div className="pt-12">
                                <button
                                    disabled={product.status === ProductStatus.OutOfStock}
                                    onClick={() => { addToCart(product); onClose(); }}
                                    className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-bold text-[10px] uppercase tracking-[0.4em] hover:bg-black/80 dark:hover:bg-white/80 transition-all shadow-2xl disabled:opacity-50"
                                >
                                    {product.status === ProductStatus.OutOfStock ? 'Sold Out' : 'Add to Collection'}
                                </button>
                                <p className="text-center text-[9px] text-gray-400 mt-6 uppercase tracking-widest font-bold">
                                    Vận chuyển tận nơi — Bảo hành chính hãng
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProductDetailModal;
