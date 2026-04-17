import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { initFirebase } from '../services/firebase';
import { SiteConfig } from '../types';

const Footer: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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
        console.error("Error fetching footer config", error);
      }
    };
    fetchConfig();
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="w-full bg-[#1C1917] text-white pt-16 pb-10 px-6 mt-20 border-t border-white/5 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent-gold to-primary"></div>

      {/* Newsletter Bar */}
      <div className="max-w-7xl mx-auto mb-16 pb-12 border-b border-white/5 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-display font-medium text-white mb-2">Nhận tin thiết kế mới nhất</h3>
            <p className="text-white/60 text-sm font-light font-body">Ưu đãi độc quyền & xu hướng nội thất 2026</p>
          </div>
          {subscribed ? (
            <div className="flex items-center gap-2 text-primary font-bold anim-scale-in">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Đăng ký thành công!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email của bạn..."
                className="flex-1 md:w-80 px-6 py-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white placeholder:text-white/40 outline-none focus:border-primary/50 focus:bg-white/10 transition-all text-sm font-light"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-primary text-white font-bold rounded-full text-sm hover:bg-primary-dark transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2 uppercase tracking-wider"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span className="hidden sm:inline">Đăng ký</span>
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 border-b border-white/5 pb-12 relative z-10">
        <div className="col-span-1 md:col-span-2 space-y-8">
          <div>
            <h2 className="text-4xl font-display font-medium text-white tracking-tight">{config?.siteName || 'LAVA INTERIOR CO., LTD'}</h2>
            <span className="text-xs text-accent-gold uppercase tracking-[0.3em] font-bold">Luxury Furniture</span>
          </div>
          <p className="text-gray-400 max-w-md leading-relaxed font-light text-base">
            {config?.footerDescription || 'Chuyên cung cấp các sản phẩm nội thất bàn ghế, chậu cây xi măng, composite cao cấp. Mang thiên nhiên và sự tinh tế vào không gian sống của bạn.'}
          </p>
          <div className="flex gap-4">
            {config?.socialFacebook && (
              <a href={config.socialFacebook} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-xl">public</span>
              </a>
            )}
            {config?.socialInstagram && (
              <a href={config.socialInstagram} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-xl">photo_camera</span>
              </a>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-accent-gold">Liên Hệ</h4>
          <ul className="space-y-6 text-gray-400 text-sm font-light">
            <li className="flex items-start gap-4">
              <span className="material-symbols-outlined text-primary mt-1">location_on</span>
              <span className="leading-relaxed">{config?.address || '103/11G Nguyen Kim Cuong, Phu Hoa Dong, HCMC, Vietnam'}</span>
            </li>
            <li className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary">phone</span>
              <span className="hover:text-white transition-colors cursor-pointer">{config?.contactPhone || '091 998 8911'}</span>
            </li>
            <li className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary">mail</span>
              <span className="hover:text-white transition-colors cursor-pointer">{config?.contactEmail || 'info@lavainterior.com'}</span>
            </li>
          </ul>
        </div>

        <div className="space-y-8">
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-accent-gold">Hỗ trợ</h4>
          <ul className="space-y-4 text-gray-400 text-sm font-light">
            <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-600 rounded-full"></span> Điều khoản & Chính sách</a></li>
            <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-600 rounded-full"></span> Vận chuyển & Giao nhận</a></li>
            <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-600 rounded-full"></span> Đổi trả hàng</a></li>
            <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-gray-600 rounded-full"></span> Câu hỏi thường gặp</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-600 font-light relative z-10">
        <p>© 2026 Lava Interior. All rights reserved.</p>
        <div className="flex gap-8">
          <span className="cursor-pointer hover:text-primary transition-colors">Privacy Policy</span>
          <span className="cursor-pointer hover:text-primary transition-colors">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
