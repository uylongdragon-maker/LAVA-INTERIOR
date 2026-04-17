import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { initFirebase } from '../services/firebase';
import { Material, Product, ProductStatus, DEFAULT_CATEGORIES, SiteConfig } from '../types';
import { PRODUCTS } from '../constants';
import { useScrollReveal } from '../src/hooks/useScrollReveal';
import { useCart } from '../src/contexts/CartContext';
import ProductDetailModal from './ProductDetailModal';

const Products: React.FC = () => {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [selectedMaterial, setSelectedMaterial] = useState<Material>(Material.Composite);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [categories, setCategories] = useState<string[]>(['Tất cả', ...DEFAULT_CATEGORIES]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredProducts = products.filter(p =>
    (selectedCategory === 'Tất cả' || p.category === selectedCategory) &&
    (p.material === selectedMaterial)
  );

  useScrollReveal(containerRef, filteredProducts);

  useEffect(() => {
    const firebase = initFirebase();
    if (!firebase) return;
    setLoading(true);

    const fetchData = async () => {
        try {
            // 1. Fetch Categories
            const configSnap = await getDoc(doc(firebase.db, 'site_config', 'main'));
            if (configSnap.exists()) {
                const configData = configSnap.data() as SiteConfig;
                setConfig(configData);
                if (configData.categories && configData.categories.length > 0) {
                    setCategories(['Tất cả', ...configData.categories]);
                }
            }
        } catch (e) { console.error("Error fetching categories", e); }
    };
    fetchData();

    const unsubscribe = onSnapshot(collection(firebase.db, 'products'), (snapshot) => {
      const fetchedProducts: Product[] = [];
      snapshot.forEach((doc) => {
        fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
      });
      const combined = [...fetchedProducts];
      PRODUCTS.forEach(p => {
        if (!combined.find(cp => cp.id === p.id)) combined.push(p);
      });
      setProducts(combined);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);



  return (
    <div ref={containerRef} className="max-w-[1440px] mx-auto px-6 md:px-12 pb-20 w-full page-enter bg-white dark:bg-black text-black dark:text-white">
      {/* Editorial Header */}
      <section className="reveal flex flex-col md:flex-row justify-between items-end gap-6 py-16 md:py-24 border-b border-black/5 dark:border-white/5 mb-16">
        <div className="flex flex-col gap-2">
          <p className="text-black/60 dark:text-white/60 text-[10px] font-bold uppercase tracking-[0.3em]">{config?.sectionTitleMaterials || 'Signature Collections'}</p>
          <h1 className="text-5xl md:text-8xl font-display font-medium leading-none tracking-tighter">
             Artisan Materiality
          </h1>
        </div>

        {/* Material Switcher */}
        <div className="flex gap-8">
          {Object.values(Material).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMaterial(m)}
              className={`pb-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${selectedMaterial === m ? 'text-black dark:text-white border-b-2 border-black dark:border-white' : 'text-gray-400 hover:text-black dark:hover:text-white border-b-2 border-transparent'}`}
            >
              {m.split(' - ')[1] || m}
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Category Filter Sidebar */}
        <aside className="w-full lg:w-48 flex-shrink-0 space-y-12">
          <div className="lg:sticky lg:top-32 space-y-8">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 text-black/40 dark:text-white/40">Phân loại</h4>
              <div className="flex flex-col gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat as any)}
                    className={`text-left text-sm font-display tracking-tight transition-all duration-300 ${selectedCategory === cat
                      ? 'text-black dark:text-white font-bold italic translate-x-1'
                      : 'text-gray-400 hover:text-black dark:hover:text-white'
                      }`}
                  >
                    {cat.split(' - ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#1a1a1a] dark:bg-zinc-900 text-white p-6 space-y-4 rounded-sm">
                <h4 className="text-sm font-bold uppercase tracking-widest opacity-80">Heritage</h4>
                <p className="text-[11px] leading-relaxed font-light opacity-60">Khám phá câu chuyện đằng sau mỗi vật liệu thô mộc được chế tác thủ công.</p>
                <button className="text-[9px] font-bold uppercase tracking-widest border-b border-white/30 hover:border-white transition-all pb-1">Xem chi tiết</button>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {selectedCategory.includes('Material Texture') ? (
                // Specialized Swatch Grid for Material Texture
                <div className="space-y-16 animate-fade-in-up">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="space-y-8">
                      <div className="flex items-center gap-6">
                        <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5"></div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.4em] opacity-40">{product.name}</h3>
                        <div className="h-[1px] flex-1 bg-black/5 dark:bg-white/5"></div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-10 focus:outline-none">
                        {product.swatchGroups?.flatMap(g => g.swatches).map((swatch, sIdx) => (
                          <div key={sIdx} className="group flex flex-col items-center gap-3">
                            <div 
                              className="size-16 sm:size-20 rounded-full border border-black/10 dark:border-white/10 overflow-hidden transition-all duration-500 hover:scale-110 cursor-pointer shadow-sm relative"
                              title={swatch.name}
                              onClick={() => setSelectedProduct(product)}
                            >
                               {swatch.image ? (
                                   <img src={swatch.image} className="w-full h-full object-cover" alt={swatch.name} />
                               ) : (
                                   <div className="size-full" style={{ backgroundColor: swatch.color }} />
                               )}
                               <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-tight text-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 text-gray-400">
                              {swatch.name || 'Sample'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="text-center py-20 text-gray-400 italic">Hiện chưa có mẫu vân cho vật liệu này.</p>
                  )}
                </div>
              ) : (
                // Standard Product Grid
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                  {filteredProducts.map((product, idx) => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="reveal group cursor-pointer flex flex-col gap-6"
                      style={{ transitionDelay: `${idx * 50}ms` }}
                    >
                      <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-zinc-900 rounded-sm">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                        />
                        
                        {product.status === ProductStatus.OutOfStock && (
                          <div className="absolute top-0 right-0 bg-black text-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest">
                            Sold Out
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
                      </div>

                      <div className="flex flex-col items-center text-center gap-2">
                        <h3 className="text-xl font-display text-gray-800 dark:text-gray-200 uppercase tracking-tight group-hover:opacity-70 transition-opacity">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">{product.category.split(' - ')[0]}</span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                          <span className="text-sm font-medium text-black dark:text-white">
                            {product.price.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="py-20 text-center border-t border-dashed border-gray-100 dark:border-white/5">
                <p className="font-display text-xl text-gray-400 italic">No products matched your selection.</p>
            </div>
          )}
        </div>
      </div>
      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
};

export default Products;
