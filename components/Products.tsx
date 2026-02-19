import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { initFirebase } from '../services/firebase';
import { Category, Material, Product, ProductStatus } from '../types';
import { PRODUCTS } from '../constants';
import { useScrollReveal } from '../src/hooks/useScrollReveal'; // Adjusted path if needed, check tsconfig
import ProductDetailModal from './ProductDetailModal';

const Products: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Tất cả'>('Tất cả');
  const [selectedMaterial, setSelectedMaterial] = useState<Material>(Material.Composite); // Default to Composite to show imported products
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate filtered products early to use in animations
  const filteredProducts = products.filter(p =>
    (selectedCategory === 'Tất cả' || p.category === selectedCategory) &&
    (p.material === selectedMaterial)
  );

  // Trigger animations when filtered products change
  useScrollReveal(containerRef, filteredProducts);

  useEffect(() => {
    const firebase = initFirebase();
    console.log("Firebase Init:", firebase ? "Success" : "Failed");
    if (!firebase) return;

    setLoading(true);
    // Real-time listener for immediate updates when photos are uploaded
    const unsubscribe = onSnapshot(collection(firebase.db, 'products'), (snapshot) => {
      console.log("Snapshot received. Docs:", snapshot.size);
      const fetchedProducts: Product[] = [];
      snapshot.forEach((doc) => {
        fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
      });
      console.log("First fetched product:", fetchedProducts[0]);
      console.log("Fetched Material (JSON):", JSON.stringify(fetchedProducts[0].material));
      console.log("Selected Material (JSON):", JSON.stringify(selectedMaterial));
      console.log("Direct Match:", fetchedProducts[0].material === selectedMaterial);
      console.log("Trimmed Match:", fetchedProducts[0].material?.trim() === selectedMaterial?.trim());

      // Combine dynamic products with static ones (dynamic first)
      setProducts([...fetchedProducts, ...PRODUCTS]);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const categories = ['Tất cả', ...Object.values(Category)];

  console.log("Current Products:", products.length);
  console.log("Selected Material:", selectedMaterial);
  console.log("Selected Category:", selectedCategory);



  /**
   * Generates a high-quality placeholder image using a service if the product image fails or is missing.
   * Uses keywords to make the placeholders relevant.
   */
  const getPlaceholderUrl = (product: Product) => {
    const query = encodeURIComponent(`${product.category} luxury furniture ${product.material}`);
    return `https://placehold.co/600x800/1c6d3a/ffffff?text=${encodeURIComponent(product.name)}&font=playfair-display`;
  };

  return (
    <div ref={containerRef} className="max-w-[1440px] mx-auto flex flex-col px-6 lg:px-12 pb-20 w-full page-enter bg-white dark:bg-black text-black dark:text-white">
      {/* Header Section - Chanel Minimalist */}
      <section className="reveal flex flex-col md:flex-row justify-between items-end gap-6 py-16 md:py-24 border-b border-black/10 dark:border-white/10 mb-12">
        <div className="flex flex-col gap-2">
          <p className="text-black/60 dark:text-white/60 text-[10px] font-bold uppercase tracking-[0.3em]">Lava Interior</p>
          <h1 className="text-5xl md:text-7xl font-display font-medium leading-none tracking-tight">
            Product Collection
          </h1>
        </div>

        {/* Minimal Text Tabs - No Backgrounds */}
        <div className="flex gap-8">
          <button
            onClick={() => setSelectedMaterial(Material.Cement)}
            className={`pb-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${selectedMaterial === Material.Cement ? 'text-black dark:text-white border-b border-black dark:border-white' : 'text-gray-400 hover:text-black dark:hover:text-white border-b border-transparent'}`}
          >
            Cement
          </button>
          <button
            onClick={() => setSelectedMaterial(Material.Composite)}
            className={`pb-2 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${selectedMaterial === Material.Composite ? 'text-black dark:text-white border-b border-black dark:border-white' : 'text-gray-400 hover:text-black dark:hover:text-white border-b border-transparent'}`}
          >
            Composite
          </button>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Sidebar Filters - Minimal & Sharp */}
        <aside className="w-full lg:w-48 flex-shrink-0 space-y-12">
          <div className="lg:sticky lg:top-32 space-y-8">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6 text-black dark:text-white">Danh mục</h4>
              <div className="flex flex-col gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat as any)}
                    className={`text-left text-sm font-display tracking-wide transition-all duration-300 ${selectedCategory === cat
                      ? 'text-black dark:text-white font-bold italic translate-x-1'
                      : 'text-gray-500 hover:text-black dark:hover:text-white'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Clean Box Newsletter - Sharp Black */}
            <div className="bg-black dark:bg-white text-white dark:text-black p-6 space-y-4 shadow-none rounded-none">
              <h4 className="font-display text-xl leading-tight">Join the<br />Legacy</h4>
              <p className="text-[10px] uppercase tracking-wider opacity-70">Nhận thông tin ưu đãi</p>
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-transparent border-b border-white/30 dark:border-black/30 py-2 text-xs focus:outline-none focus:border-white dark:focus:border-black placeholder:text-white/30 dark:placeholder:text-black/30"
              />
              <button className="text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">Submit</button>
            </div>
          </div>
        </aside>

        {/* Product Grid - Sharp, No Shadows, Minimal */}
        <div className="flex-1">
          {loading && (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-[3px] border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">

              {/* Editorial Block - Sharp & Clean but with 10px radius */}
              <div className="group relative flex flex-col justify-end bg-gray-100 dark:bg-zinc-900 col-span-1 p-8 min-h-[450px] cursor-pointer overflow-hidden rounded-[10px]">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] group-hover:scale-105 opacity-80"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800')" }}
                ></div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <div className="relative z-10 text-white mt-auto">
                  <p className="text-[9px] font-bold uppercase tracking-widest mb-3 border-l-2 border-white pl-3">Artisan Focus</p>
                  <h3 className="text-3xl font-display leading-tight mb-2">The Essence<br />of Stone</h3>
                  <a className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] border-b border-white/50 hover:border-white pb-1 transition-all" href="#">
                    Discover
                  </a>
                </div>
              </div>

              {filteredProducts.map((product, idx) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="reveal group cursor-pointer flex flex-col gap-4"
                  style={{ transitionDelay: `${idx * 50}ms` }}
                >
                  {/* Image Container - 10px Radius */}
                  <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-50 dark:bg-zinc-900 rounded-[10px]">
                    <img
                      src={product.imageUrl || getPlaceholderUrl(product)}
                      alt={product.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Minimal Badge - Sharp Rect */}
                    {product.status === ProductStatus.OutOfStock && (
                      <div className="absolute top-0 right-0 bg-black text-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest">
                        Sold Out
                      </div>
                    )}
                    {product.id === '1' && product.status !== ProductStatus.OutOfStock && (
                      <div className="absolute top-0 left-0 bg-white text-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest border border-black/5">
                        Best Seller
                      </div>
                    )}

                    {/* Hover Overlay - Minimal Tint */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Quick Add - Minimal Icon */}
                    <button
                      className="absolute bottom-4 right-4 size-10 flex items-center justify-center bg-white text-black hover:bg-black hover:text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
                      onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                    >
                      <span className="material-symbols-outlined text-[20px]">add</span>
                    </button>
                  </div>

                  {/* Info - Clean Typography */}
                  <div className="flex flex-col items-center text-center gap-1.5 px-2">
                    <h3 className="text-lg font-display text-black dark:text-white group-hover:opacity-70 transition-opacity">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-gray-500 uppercase tracking-widest text-[10px]">{product.category}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="font-bold text-black dark:text-white">
                        {product.price.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More - Clean Button */}
          {!loading && (
            <div className="mt-24 flex justify-center">
              <button className="px-12 py-4 border border-black/10 dark:border-white/10 text-xs font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-500">
                View All Collection
              </button>
            </div>
          )}
        </div>
      </div>
      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
};

export default Products;
