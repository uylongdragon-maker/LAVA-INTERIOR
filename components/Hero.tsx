import React, { useEffect, useState, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { initFirebase } from '../services/firebase';
import { SiteConfig } from '../types';

interface HeroProps {
  onExplore?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onExplore }) => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      const firebase = initFirebase();
      if (!firebase) return;
      try {
        const docSnap = await getDoc(doc(firebase.db, 'site_config', 'main'));
        if (docSnap.exists()) {
          setConfig(docSnap.data() as SiteConfig);
        }
      } catch (error) {
        console.error("Error fetching hero config", error);
      }
    };
    fetchConfig();
  }, []);

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
    <section className="relative h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden">
      {/* Dynamic Background */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center z-0 animate-scale-subtle"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000')" }}
      ></div>
      <div className="absolute inset-0 bg-black/40 z-10 backdrop-blur-[1px]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-10"></div>

      {/* Content */}
      <div className="relative z-20 max-w-5xl mx-auto space-y-8 reveal">
        <span className="inline-block py-1.5 px-4 border border-accent-gold/40 rounded-full text-xs font-bold text-accent-gold uppercase tracking-[0.3em] backdrop-blur-md shadow-lg">
          Est. 2024 • Luxury Furniture
        </span>
        <h1 
          className="font-display text-4xl md:text-7xl lg:text-8xl font-medium text-white leading-tight tracking-tight drop-shadow-2xl px-6"
          dangerouslySetInnerHTML={{ __html: config?.heroTitle || 'LAVA INTERIOR' }}
        />
        <p 
          className="text-lg md:text-2xl text-white/90 font-light max-w-3xl mx-auto leading-relaxed font-body px-8 opacity-80"
          dangerouslySetInnerHTML={{ __html: config?.heroSubtitle || 'Nghệ thuật bê tông & Nội thất thủ công' }}
        />

        <div className="pt-10 flex flex-col md:flex-row gap-6 justify-center items-center">
          <button
            onClick={onExplore}
            className="px-10 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-all uppercase tracking-widest text-sm shadow-lg hover:shadow-primary/30 transform hover:-translate-y-1"
          >
            Khám phá Bộ sưu tập
          </button>
          <button className="px-10 py-4 border border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-colors uppercase tracking-widest text-sm backdrop-blur-sm">
            Liên hệ đặt hàng
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 z-20 animate-bounce">
        <span className="material-symbols-outlined text-white/50 text-4xl font-light">keyboard_arrow_down</span>
      </div>
    </section>
  );
};

export default Hero;
