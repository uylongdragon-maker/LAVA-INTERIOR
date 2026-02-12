
import React, { useState } from 'react';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="w-full bg-white dark:bg-surface-dark border-t border-[#e9f1ec] dark:border-[#2a4032] mt-16">
      {/* Newsletter Bar */}
      <div className="bg-gradient-to-r from-primary to-primary-dark py-10 md:py-14">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Nhận tin thiết kế mới nhất</h3>
            <p className="text-white/70 text-sm font-light">Ưu đãi độc quyền & xu hướng nội thất 2026</p>
          </div>
          {subscribed ? (
            <div className="flex items-center gap-2 text-white font-bold anim-scale-in">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Đăng ký thành công!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email của bạn..."
                className="flex-1 md:w-72 px-5 py-3.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white placeholder:text-white/50 outline-none focus:border-white/50 focus:bg-white/20 transition-all text-sm"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-white text-primary font-bold rounded-xl text-sm hover:bg-accent-gold hover:text-white transition-all active:scale-95 shadow-lg flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span className="hidden sm:inline">Đăng ký</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a className="flex items-center gap-2 mb-6" href="#">
              <div className="size-6 text-primary">
                <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 10L12 36H36L24 10Z" fill="currentColor"></path>
                </svg>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#101913] dark:text-white">Lava Interior</h2>
            </a>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm leading-relaxed">
              Định nghĩa lại phong cách sống hiện đại qua tay nghề thủ công bền vững và thiết kế uyển chuyển. Nâng tầm tổ ấm của bạn.
            </p>
            <div className="flex gap-4">
              <a href="#" className="size-10 rounded-xl bg-[#f6f8f7] dark:bg-white/5 flex items-center justify-center text-[#578e6b] hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined text-[20px]">thumb_up</span>
              </a>
              <a href="#" className="size-10 rounded-xl bg-[#f6f8f7] dark:bg-white/5 flex items-center justify-center text-[#578e6b] hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </a>
              <a href="#" className="size-10 rounded-xl bg-[#f6f8f7] dark:bg-white/5 flex items-center justify-center text-[#578e6b] hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined text-[20px]">share</span>
              </a>
            </div>
          </div>
          {/* Links */}
          <div>
            <h4 className="font-bold text-[#101913] dark:text-white mb-6">Mua sắm</h4>
            <ul className="space-y-4">
              <li><a className="text-gray-500 hover:text-primary transition-colors text-sm" href="#">Hàng mới về</a></li>
              <li><a className="text-gray-500 hover:text-primary transition-colors text-sm" href="#">Bán chạy nhất</a></li>
              <li><a className="text-gray-500 hover:text-primary transition-colors text-sm" href="#">Nội thất</a></li>
              <li><a className="text-gray-500 hover:text-primary transition-colors text-sm" href="#">Creative Lab</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#101913] dark:text-white mb-6">Công ty</h4>
            <ul className="space-y-4">
              <li><a className="text-gray-500 hover:text-primary transition-colors text-sm" href="#">Câu chuyện của Lava</a></li>
              <li><a className="text-gray-500 hover:text-primary transition-colors text-sm" href="#">Bền vững</a></li>
              <li><a className="text-gray-500 hover:text-primary transition-colors text-sm" href="#">Tuyển dụng</a></li>
              <li><a className="text-gray-500 hover:text-primary transition-colors text-sm" href="#">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#101913] dark:text-white mb-6">Hỗ trợ</h4>
            <ul className="space-y-4">
              <li><a className="text-gray-500 hover:text-primary transition-colors text-sm" href="#">Liên hệ</a></li>
              <li><a className="text-gray-500 hover:text-primary transition-colors text-sm" href="#">FAQ</a></li>
              <li><a className="text-gray-500 hover:text-primary transition-colors text-sm" href="#">Chính sách trả hàng</a></li>
              <li><a className="text-gray-500 hover:text-primary transition-colors text-sm" href="#">Bảo hành</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-[#e9f1ec] dark:border-[#2a4032] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">© 2026 Lava Interior. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-sm text-gray-400 cursor-pointer hover:text-primary transition-colors">Điều khoản</span>
            <span className="text-sm text-gray-400 cursor-pointer hover:text-primary transition-colors">Bảo mật</span>
            <span className="text-sm text-gray-400 cursor-pointer hover:text-primary transition-colors">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
