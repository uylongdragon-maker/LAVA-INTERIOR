
import React from 'react';
import { Product, ProductStatus } from '../types';
import parse from 'html-react-parser';
import 'react-quill/dist/quill.snow.css'; // Verify if we need css here or global

interface ProductDetailModalProps {
    product: Product | null;
    onClose: () => void;
}

import ReactDOM from 'react-dom';
import parse from 'html-react-parser';

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
    if (!product) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative z-[100000] bg-white dark:bg-zinc-900 rounded-[10px] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:h-auto animate-fade-in-up">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full text-black dark:text-white transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                {/* Left: Image */}
                <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-gray-100 dark:bg-zinc-800">
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {product.status === ProductStatus.OutOfStock && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                            <span className="text-white font-bold border-2 border-white px-4 py-2 uppercase tracking-widest text-sm rotate-[-12deg]">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                {/* Right: Details */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center gap-6 overflow-y-auto">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-widest">
                                {product.category}
                            </span>
                            <span className="px-3 py-1 border border-black/10 dark:border-white/20 text-black dark:text-white text-[10px] font-bold uppercase tracking-widest">
                                {product.material}
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-black dark:text-white mb-2 leading-tight">
                            {product.name}
                        </h2>
                        <p className="text-2xl font-light text-primary dark:text-white/80">
                            {product.price.toLocaleString('vi-VN')}đ
                        </p>
                    </div>

                    <div className="h-[1px] bg-black/10 dark:bg-white/10 w-full"></div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-black/60 dark:text-white/60">Mô tả sản phẩm</h4>
                        <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-light description-content">
                            {product.description ? parse(product.description) : "Chưa có mô tả cho sản phẩm này."}
                        </div>
                    </div>

                    <div className="mt-4">
                        <button
                            disabled={product.status === ProductStatus.OutOfStock}
                            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-[0.2em] hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-none"
                        >
                            {product.status === ProductStatus.OutOfStock ? 'Sold Out' : 'Add to Cart'}
                        </button>
                        <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-wider">
                            Free shipping on orders over 5.000.000đ
                        </p>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProductDetailModal;
