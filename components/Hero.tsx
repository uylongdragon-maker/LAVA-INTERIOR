
import React, { useEffect, useRef } from 'react';

interface HeroProps {
  onExplore: () => void;
}

const Hero: React.FC<HeroProps> = ({ onExplore }) => {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (bgRef.current) {
            const scrollY = window.scrollY;
            bgRef.current.style.transform = `scale(1.05) translateY(${scrollY * 0.3}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="w-full max-w-[1440px] px-4 md:px-10 py-6 md:py-8 mx-auto">
      <div className="relative w-full min-h-[600px] md:h-[80vh] rounded-2xl overflow-hidden shadow-soft group">
        {/* Background Image with Parallax */}
        <div
          ref={bgRef}
          className="absolute inset-0 bg-cover bg-center transition-transform duration-100 will-change-transform"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600')",
            transform: 'scale(1.05)',
          }}
        ></div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent md:bg-gradient-to-r md:from-black/60 md:via-black/10 md:to-transparent"></div>
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end md:justify-center p-8 md:p-16 max-w-2xl">
          <span className="anim-fade-in-up inline-block py-1.5 px-4 mb-5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-bold tracking-widest uppercase w-fit">
            New Collection 2026
          </span>
          <h1 className="anim-fade-in-up delay-200 text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-4 tracking-tight">
            Nâng Tầm Không Gian <br /><span className="text-white/90 italic font-light text-3xl md:text-5xl">Gia Đình Bạn</span>
          </h1>
          <p className="anim-fade-in-up delay-400 text-lg md:text-xl text-white/85 font-light mb-8 max-w-lg leading-relaxed">
            Sản phẩm nội thất chế tác thủ công, nơi thiên nhiên hòa quyện cùng kiến trúc hiện đại.
            Được thiết kế cho những không gian biết "thở".
          </p>
          <div className="anim-fade-in-up delay-600 flex flex-wrap gap-4">
            <button
              onClick={onExplore}
              className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold transition-all transform active:scale-95 shadow-lg shadow-primary/30 flex items-center gap-2 hover:shadow-xl hover:translate-y-[-2px]"
            >
              Xem Bộ Sưu Tập
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <button className="px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold transition-all active:scale-95 flex items-center gap-2 hover:border-white/40">
              <span className="material-symbols-outlined">play_arrow</span>
              Xem Phim
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 anim-fade-in-up delay-800">
          <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">Cuộn xuống</span>
          <div className="w-5 h-8 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
