
import React, { useState, useEffect, useRef, Suspense } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Footer from './components/Footer';

// Lazy load heavy components
const Products = React.lazy(() => import('./components/Products'));
const Workshop = React.lazy(() => import('./components/Workshop'));
const About = React.lazy(() => import('./components/About'));
const Contact = React.lazy(() => import('./components/Contact'));

// Scroll reveal hook
const useScrollReveal = (containerRef: React.RefObject<HTMLElement | null>, trigger: any) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target); // Stop observing once revealed
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const revealElements = container.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [trigger]);
};

// Loading fallback
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const contentRef = useRef<HTMLDivElement>(null);

  useScrollReveal(contentRef, currentTab);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <div className="page-enter">
            <Hero onExplore={() => setCurrentTab('products')} />
            <FeaturedCategories onWorkshop={() => setCurrentTab('workshop')} />
            <LegacySection />
          </div>
        );
      case 'products':
        return (
          <Suspense fallback={<PageLoader />}>
            <div className="page-enter"><Products /></div>
          </Suspense>
        );
      case 'workshop':
        return (
          <Suspense fallback={<PageLoader />}>
            <Workshop />
          </Suspense>
        );
      case 'about':
        return (
          <Suspense fallback={<PageLoader />}>
            <About />
          </Suspense>
        );
      case 'contact':
        return (
          <Suspense fallback={<PageLoader />}>
            <Contact />
          </Suspense>
        );
      default:
        return <Hero onExplore={() => setCurrentTab('products')} />;
    }
  };

  return (
    <div className="min-h-screen selection:bg-primary/20 selection:text-primary overflow-x-hidden" ref={contentRef}>
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <main className="transition-all duration-700 min-h-screen">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

const FeaturedCategories: React.FC<{ onWorkshop: () => void }> = ({ onWorkshop }) => (
  <section className="py-24 bg-white dark:bg-[#131f17]">
    <div className="container mx-auto px-6 lg:px-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4 reveal">
        <div>
          <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-accent-gold mb-3">Sự Khác Biệt</h2>
          <h3 className="font-display text-4xl md:text-5xl font-light text-primary dark:text-[#6fbe8e]">Bộ Sưu Tập Độc Bản</h3>
        </div>
        <button onClick={onWorkshop} className="text-sm font-bold border-b-2 border-primary pb-1 hover:text-accent-gold hover:border-accent-gold transition-all dark:text-white dark:border-white dark:hover:text-accent-gold dark:hover:border-accent-gold">
          Khám phá Creative Lab →
        </button>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { title: 'Xi măng - Cement', desc: 'Vẻ đẹp thô mộc từ nghệ nhân tay nghề cao.', img: 'https://images.unsplash.com/photo-1594913785162-e6785b493bd2?q=80&w=800' },
          { title: 'Composite', desc: 'Linh hoạt, bền bỉ và vô cùng hiện đại.', img: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=800' },
          { title: 'Creative AI', desc: 'Tự tay thiết kế cùng Nana Banana AI.', img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800', isAi: true }
        ].map((item, idx) => (
          <div
            key={idx}
            className="reveal group relative overflow-hidden rounded-2xl aspect-[4/5] shadow-soft hover-lift"
            style={{ transitionDelay: `${idx * 120}ms` }}
          >
            <img src={item.img} alt={item.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 md:p-10 flex flex-col justify-end">
              <h4 className="font-display text-2xl md:text-3xl text-white mb-2">{item.title}</h4>
              <p className="text-white/70 text-sm mb-6 font-light">{item.desc}</p>
              <button
                onClick={item.isAi ? onWorkshop : undefined}
                className="w-fit px-8 py-3 bg-white text-primary rounded-full text-xs font-bold uppercase tracking-widest hover:bg-accent-gold hover:text-white transition-colors"
              >
                {item.isAi ? 'Thử Ngay' : 'Xem Chi Tiết'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const LegacySection = () => (
  <section className="py-24 bg-[#f6f8f7] dark:bg-[#1a261f]">
    <div className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
      <div className="relative grid grid-cols-2 gap-4 reveal-left">
        <div className="space-y-4">
          <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600" className="rounded-2xl shadow-float" alt="Workshop" />
          <img src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=600" className="rounded-2xl shadow-soft translate-x-4" alt="Interior" />
        </div>
        <div className="pt-12 space-y-4">
          <img src="https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=600" className="rounded-2xl shadow-soft -translate-x-4" alt="Design" />
          <img src="https://images.unsplash.com/photo-1505691938895-1758d7eaa511?q=80&w=600" className="rounded-2xl shadow-float" alt="Furniture" />
        </div>
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent-gold/10 blur-[100px] rounded-full" />
      </div>
      <div className="space-y-8 reveal-right">
        <h2 className="text-sm font-bold tracking-[0.4em] uppercase text-accent-wine dark:text-[#d88a98]">Kế Thừa & Đổi Mới</h2>
        <h3 className="font-display text-5xl md:text-6xl font-light text-primary dark:text-[#6fbe8e] leading-tight">Lava Interior: <br /><span className="italic font-normal">Nghệ Thuật Sống</span></h3>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-light text-lg">
          Chúng tôi không chỉ kiến tạo nội thất, chúng tôi xây dựng những giấc mơ.
          Kết hợp chất liệu xi măng mài truyền thống với công nghệ AI đột phá,
          mỗi sản phẩm của Lava là một bản giao hưởng giữa thiên nhiên và kiến trúc hiện đại.
        </p>
        <div className="flex gap-12 pt-4">
          <div>
            <span className="block text-4xl font-light text-accent-gold">10+</span>
            <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Năm Kinh Nghiệm</span>
          </div>
          <div>
            <span className="block text-4xl font-light text-accent-gold">5000+</span>
            <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Dự Án Hoàn Thành</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default App;
