
import React, { useState } from 'react';
import { Category, Material, Product } from '../types';
import { PRODUCTS } from '../constants';

const Products: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Tất cả'>('Tất cả');
  const [selectedMaterial, setSelectedMaterial] = useState<Material>(Material.Cement);

  const categories = ['Tất cả', ...Object.values(Category)];

  const filteredProducts = PRODUCTS.filter(p =>
    (selectedCategory === 'Tất cả' || p.category === selectedCategory) &&
    p.material === selectedMaterial
  );

  /**
   * Generates a high-quality placeholder image using a service if the product image fails or is missing.
   * Uses keywords to make the placeholders relevant.
   */
  const getPlaceholderUrl = (product: Product) => {
    const query = encodeURIComponent(`${product.category} luxury furniture ${product.material}`);
    return `https://placehold.co/600x800/1c6d3a/ffffff?text=${encodeURIComponent(product.name)}&font=playfair-display`;
  };

  return (
    <div className="max-w-[1440px] mx-auto flex flex-col px-6 lg:px-12 pb-20 w-full page-enter">
      {/* Header Section - Editorial Style */}
      <section className="reveal flex flex-col md:flex-row justify-between items-end gap-6 py-12 md:py-16">
        <div className="flex flex-col gap-3">
          <p className="text-primary text-sm font-bold uppercase tracking-wider">Thư viện vật liệu</p>
          <h1 className="text-[#101913] dark:text-white text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">Material Collection</h1>
          <p className="text-[#578e6b] dark:text-[#8ab99a] text-lg font-normal max-w-md">Curated finishes for modern living. Explore the raw beauty of natural elements.</p>
        </div>

        {/* Segmented Control - iOS 18 Style */}
        <div className="bg-[#e9f1ec] dark:bg-white/5 p-1.5 rounded-full flex relative w-full md:w-auto min-w-[320px] shadow-sm">
          <div
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-primary rounded-full shadow-md transition-all duration-500 ease-in-out ${selectedMaterial === Material.Cement ? 'left-1.5' : 'left-[calc(50%+1.5px)]'
              }`}
          ></div>
          <label className="relative z-10 flex-1 text-center cursor-pointer group">
            <input
              checked={selectedMaterial === Material.Cement}
              onChange={() => setSelectedMaterial(Material.Cement)}
              className="sr-only"
              name="material_type"
              type="radio"
            />
            <span className={`block py-2.5 px-6 rounded-full text-sm font-bold transition-colors duration-300 ${selectedMaterial === Material.Cement ? 'text-white' : 'text-[#578e6b]'}`}>Cement</span>
          </label>
          <label className="relative z-10 flex-1 text-center cursor-pointer group">
            <input
              checked={selectedMaterial === Material.Composite}
              onChange={() => setSelectedMaterial(Material.Composite)}
              className="sr-only"
              name="material_type"
              type="radio"
            />
            <span className={`block py-2.5 px-6 rounded-full text-sm font-bold transition-colors duration-300 ${selectedMaterial === Material.Composite ? 'text-white' : 'text-[#578e6b]'}`}>Composite</span>
          </label>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-4">
          <div className="lg:sticky lg:top-28 space-y-3">
            <div className="border border-[#d3e4d9] dark:border-white/10 bg-white dark:bg-white/5 rounded-2xl p-6 shadow-soft">
              <h4 className="text-[#101913] dark:text-white text-sm font-extrabold uppercase tracking-widest mb-6 border-b border-[#e9f1ec] pb-2">Danh mục</h4>
              <div className="space-y-4">
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer group/item">
                    <input
                      type="radio"
                      name="category_filter"
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat as any)}
                      className="peer h-5 w-5 rounded-full border-[#d3e4d9] text-primary focus:ring-primary/20 transition-all"
                    />
                    <span className={`text-sm transition-all font-medium ${selectedCategory === cat ? 'text-primary font-bold translate-x-1' : 'text-[#578e6b] group-hover/item:text-primary'}`}>
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Newsletter Promo Card */}
            <div className="bg-primary p-6 rounded-2xl text-white shadow-float mt-6">
              <span className="material-symbols-outlined mb-4">mail</span>
              <h4 className="font-bold mb-2">Nhận ưu đãi độc quyền</h4>
              <p className="text-xs text-white/70 mb-4 font-light">Đăng ký để nhận thông tin về các bộ sưu tập giới hạn.</p>
              <input type="email" placeholder="Email của bạn" className="w-full bg-white/10 border-white/20 rounded-xl px-4 py-2 text-xs mb-3 focus:ring-1 focus:ring-white" />
              <button className="w-full bg-white text-primary font-bold py-2 rounded-xl text-[10px] uppercase tracking-widest">Đăng ký</button>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* The stylish Editorial Card from your updated UI - Acts as a curated placeholder element */}
            <div className="group relative flex flex-col justify-end bg-black col-span-1 p-8 rounded-2xl overflow-hidden shadow-float min-h-[400px]">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-70 transition-transform duration-[2000ms] group-hover:scale-110"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800')" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              <div className="relative z-10 text-white space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-accent-gold mb-2">Artisan Focus</p>
                <h3 className="text-2xl font-bold leading-tight">Sức mạnh của đá, tâm hồn của gỗ</h3>
                <p className="text-white/70 text-xs font-light leading-relaxed">Khám phá dòng sản phẩm xi măng đúc thủ công được thiết kế để trường tồn cùng thời gian.</p>
                <a className="inline-flex items-center gap-2 text-xs font-bold hover:text-accent-gold transition-colors pt-4 tracking-widest uppercase" href="#">
                  Xem Câu Chuyện <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
              </div>
            </div>

            {filteredProducts.map((product, idx) => (
              <div key={product.id} className="reveal group relative flex flex-col gap-4 bg-white dark:bg-white/5 p-4 rounded-3xl shadow-soft hover:shadow-float transition-all duration-500 border border-transparent hover:border-accent-gold/20 hover-lift" style={{ transitionDelay: `${idx * 80}ms` }}>
                <div className="relative w-full aspect-[4/5] overflow-hidden rounded-2xl bg-[#f0f0f0] dark:bg-white/10">
                  <img
                    src={product.imageUrl || getPlaceholderUrl(product)}
                    alt={product.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                  />

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-primary dark:text-white uppercase tracking-[0.2em] shadow-sm">
                    {product.id === '1' ? 'Best Seller' : 'Mới'}
                  </div>

                  {/* Material Indicator */}
                  <div className="absolute top-4 right-4 bg-accent-gold/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[9px] font-bold text-white uppercase tracking-widest shadow-sm">
                    {product.material.split(' - ')[0]}
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <button className="absolute bottom-4 right-4 size-12 flex items-center justify-center bg-white dark:bg-primary text-primary dark:text-white rounded-full shadow-2xl opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-primary hover:text-white active:scale-90">
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>shopping_cart_checkout</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2 px-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-[#101913] dark:text-white text-lg font-bold leading-tight group-hover:text-primary transition-colors duration-300">
                      {product.name}
                    </h3>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-3 border-t border-[#e9f1ec]/50">
                    <span className="text-primary dark:text-white font-extrabold text-lg">
                      {product.price.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-[10px] font-bold text-[#578e6b] uppercase tracking-widest opacity-60">
                      {product.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-32 text-center bg-white/50 rounded-3xl border border-dashed border-[#d3e4d9]">
                <span className="material-symbols-outlined text-4xl text-[#578e6b] mb-4 opacity-20">inventory_2</span>
                <p className="text-[#578e6b] font-medium">Lava đang chuẩn bị các mẫu mới cho phân loại này.</p>
              </div>
            )}
          </div>

          {/* Pagination/Load More - Editorial Style */}
          <div className="mt-20 flex flex-col items-center gap-6">
            <div className="h-[1px] w-32 bg-[#d3e4d9]"></div>
            <button className="px-10 py-4 rounded-full border border-[#d3e4d9] dark:border-white/10 text-[#101913] dark:text-white font-bold hover:bg-primary hover:text-white hover:border-primary transition-all duration-500 flex items-center gap-3 group shadow-soft hover:shadow-lg">
              <span>Xem Thêm Sản Phẩm</span>
              <span className="material-symbols-outlined group-hover:rotate-180 transition-transform">refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
