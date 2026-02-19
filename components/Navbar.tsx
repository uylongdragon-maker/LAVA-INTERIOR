
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { initFirebase } from '../services/firebase';
import { SiteConfig } from '../types';
const NAV_ITEMS = [
  { id: '/', name: 'Trang chủ', icon: 'home' },
  { id: '/products', name: 'Sản phẩm', icon: 'inventory_2' },

  { id: '/about', name: 'Giới thiệu', icon: 'info' },
  { id: '/contact', name: 'Liên hệ', icon: 'mail' },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [config, setConfig] = useState<SiteConfig | null>(null);

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
        console.error("Error fetching navbar config", error);
      }
    };
    fetchConfig();
  }, []);

  const currentPath = location.pathname === '/' ? '/' : location.pathname;

  useEffect(() => {
    const saved = localStorage.getItem('lava-dark-mode');
    if (saved === 'true') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('lava-dark-mode', String(next));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const isHome = location.pathname === '/';

  return (
    <>
      <nav
        className={`fixed top-0 z-50 w-full transition-all duration-500 ease-in-out ${isScrolled
          ? 'bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md shadow-sm'
          : isHome ? 'bg-transparent' : 'bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-sm'
          }`}
      >
        <div className="px-6 md:px-12 py-5 max-w-[1440px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleNavigate('/'); }}
            className="flex items-center gap-3 group"
          >
            {config?.logo ? (
              <img src={config.logo} alt="Lava Interior" className="h-10 w-auto object-contain" />
            ) : (
              <div className="size-9 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                <svg className="w-full h-full drop-shadow-lg" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 4C12.95 4 4 12.95 4 24C4 35.05 12.95 44 24 44C35.05 44 44 35.05 44 24C44 12.95 35.05 4 24 4ZM34 32C34 33.1 33.1 34 32 34H16C14.9 34 14 33.1 14 32V16C14 14.9 14.9 14 16 14H32C33.1 14 34 14.9 34 16V32Z" fill="currentColor" fillOpacity="0.2"></path>
                  <path d="M24 10L12 36H36L24 10Z" fill="currentColor"></path>
                </svg>
              </div>
            )}
            <h1 className={`text-2xl font-display font-bold tracking-tight transition-colors duration-300 ${isScrolled || !isHome ? 'text-primary-dark dark:text-primary' : 'text-white'}`}>
              Lava Interior
            </h1>
          </a>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`relative px-2 py-1 text-sm font-medium tracking-wide transition-all duration-300 group ${currentPath === item.id
                  ? 'text-primary font-bold'
                  : (isScrolled || !isHome) ? 'text-text-main hover:text-primary' : 'text-white hover:text-primary'
                  }`}
              >
                {item.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full ${currentPath === item.id ? 'w-full' : ''}`} />
              </button>
            ))}
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <button className={`p-2 rounded-full transition-colors ${(isScrolled || !isHome) ? 'hover:bg-primary/5 text-gray-700 dark:text-white' : 'hover:bg-white/10 text-white'}`}>
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>
            <button className={`p-2 rounded-full transition-colors relative ${(isScrolled || !isHome) ? 'hover:bg-primary/5 text-gray-700 dark:text-white' : 'hover:bg-white/10 text-white'}`}>
              <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
              <span className="absolute top-1.5 right-1.5 size-2 bg-primary rounded-full ring-2 ring-white dark:ring-black"></span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDark}
              className={`hidden sm:flex p-2 rounded-full transition-colors ${(isScrolled || !isHome) ? 'hover:bg-primary/5 text-gray-700 dark:text-white' : 'hover:bg-white/10 text-white'}`}
              title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
            >
              <span className="material-symbols-outlined text-[22px] transition-transform duration-500 hover:rotate-180">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden p-2 rounded-full transition-colors ${(isScrolled || !isHome) ? 'hover:bg-primary/5 text-gray-700 dark:text-white' : 'hover:bg-white/10 text-white'}`}
            >
              <span className="material-symbols-outlined text-[26px]">
                {isMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          {/* Menu Panel */}
          <div className="absolute top-0 right-0 w-full max-w-sm h-full bg-white dark:bg-[#131f17] shadow-2xl mobile-menu-overlay overflow-y-auto">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#e9f1ec] dark:border-[#2a4032]">
              <div className="flex items-center gap-2">
                <div className="size-6 text-primary">
                  <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 10L12 36H36L24 10Z" fill="currentColor"></path>
                  </svg>
                </div>
                <span className="text-lg font-bold text-text-main dark:text-white">Menu</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-text-main dark:text-white">close</span>
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-1">
              {NAV_ITEMS.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-300 ${currentPath === item.id
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-text-main dark:text-[#d1dcd5] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <span className={`material-symbols-outlined text-[22px] ${currentPath === item.id ? 'text-primary' : 'text-[#578e6b]'
                    }`}>{item.icon}</span>
                  <span className="text-base font-medium">{item.name}</span>
                  {currentPath === item.id && (
                    <span className="ml-auto size-2 bg-primary rounded-full"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Dark Mode Toggle (Mobile) */}
            <div className="mx-4 mt-4 p-4 rounded-2xl bg-[#f6f8f7] dark:bg-white/5 border border-[#e9f1ec] dark:border-[#2a4032]">
              <button
                onClick={toggleDark}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[20px] text-[#578e6b]">
                    {isDark ? 'dark_mode' : 'light_mode'}
                  </span>
                  <span className="text-sm font-medium text-text-main dark:text-white">
                    {isDark ? 'Chế độ tối' : 'Chế độ sáng'}
                  </span>
                </div>
                <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${isDark ? 'bg-primary' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${isDark ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </div>
              </button>
            </div>

            {/* Footer info */}
            <div className="absolute bottom-0 w-full p-6 border-t border-[#e9f1ec] dark:border-[#2a4032]">
              <p className="text-xs text-gray-400 text-center">© 2026 Lava Interior</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
