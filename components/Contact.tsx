
import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { initFirebase } from '../services/firebase';
import { SiteConfig, Showroom } from '../types';

const DEFAULT_SHOWROOMS: Showroom[] = [
  {
    city: 'TP. Hồ Chí Minh',
    address: 'Lava Tower, Thảo Điền, Quận 2',
    label: 'Flagship',
    img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=400',
  },
  {
    city: 'Hà Nội',
    address: 'Tầng 3, Lotte Center, Ba Đình',
    label: 'Premium',
    img: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=400',
  },
];

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [config, setConfig] = useState<SiteConfig | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      const firebase = initFirebase();
      if (!firebase) return;
      const docSnap = await getDoc(doc(firebase.db, 'site_config', 'main'));
      if (docSnap.exists()) {
        setConfig(docSnap.data() as SiteConfig);
      }
    };
    fetchConfig();
  }, []);

  const showrooms = (config?.showrooms && config.showrooms.length > 0) ? config.showrooms : DEFAULT_SHOWROOMS;
  const pageTitle = config?.contactPage?.pageTitle || 'Liên hệ với Lava';
  const pageSubtitle = config?.contactPage?.pageSubtitle || 'Ghé thăm showroom của chúng tôi hoặc bắt đầu dự án thiết kế riêng. Chúng tôi kiến tạo không gian kể câu chuyện của bạn.';
  const contactPhone = config?.contactPhone || '091 998 8911';
  const contactEmail = config?.contactEmail || 'info@lavainterior.com';
  const workingHours = config?.contactPage?.workingHours || 'T2 – T7: 9:00 – 18:00';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-8 md:px-10 md:py-12 lg:py-16 w-full page-enter">
      {/* Page Header */}
      <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6 reveal">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-text-main dark:text-white sm:text-5xl lg:text-6xl mb-4">
            {pageTitle}
          </h1>
          <p className="text-lg text-[#578e6b] dark:text-gray-400 font-medium">
            {pageSubtitle}
          </p>
        </div>
        <div className="hidden md:flex gap-2 bg-white dark:bg-white/5 p-1.5 rounded-xl border border-[#d3e4d9] dark:border-white/10">
          <button className="px-4 py-2 rounded-lg bg-[#f6f8f7] dark:bg-white/10 text-xs font-bold uppercase tracking-wider text-primary">Yêu cầu tư vấn</button>
          <button className="px-4 py-2 rounded-lg hover:bg-[#f6f8f7] dark:hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-[#578e6b] dark:text-gray-400 transition-colors">Hỗ trợ</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 flex flex-col gap-10">
          <div className="reveal bg-white dark:bg-[#1A261F] p-6 md:p-10 rounded-2xl shadow-float border border-transparent dark:border-white/5">
            <h3 className="text-2xl font-bold mb-8 text-text-main dark:text-white">Bắt đầu dự án</h3>
            {submitted ? (
              <div className="flex flex-col items-center justify-center text-center py-12 anim-scale-in">
                <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl">check_circle</span>
                </div>
                <h4 className="text-xl font-bold text-text-main dark:text-white mb-2">Đã gửi thành công!</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Đội ngũ Lava sẽ liên hệ lại trong 24 giờ.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <label className="flex flex-col flex-1 gap-2">
                    <span className="text-sm font-semibold text-text-main dark:text-gray-300">Họ và tên lót</span>
                    <input className="w-full rounded-xl border border-[#d3e4d9] bg-[#f9fbfa] px-4 py-3.5 text-base outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary dark:bg-white/5 dark:border-white/10 dark:text-white" placeholder="Nguyễn Văn" type="text" />
                  </label>
                  <label className="flex flex-col flex-1 gap-2">
                    <span className="text-sm font-semibold text-[#101913] dark:text-gray-300">Tên</span>
                    <input className="w-full rounded-xl border border-[#d3e4d9] bg-[#f9fbfa] px-4 py-3.5 text-base outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary dark:bg-white/5 dark:border-white/10 dark:text-white" placeholder="A" type="text" />
                  </label>
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                  <label className="flex flex-col flex-1 gap-2">
                    <span className="text-sm font-semibold text-[#101913] dark:text-gray-300">Email</span>
                    <input className="w-full rounded-xl border border-[#d3e4d9] bg-[#f9fbfa] px-4 py-3.5 text-base outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary dark:bg-white/5 dark:border-white/10 dark:text-white" placeholder="info@lava.interior" type="email" />
                  </label>
                  <label className="flex flex-col flex-1 gap-2">
                    <span className="text-sm font-semibold text-[#101913] dark:text-gray-300">Số điện thoại</span>
                    <input className="w-full rounded-xl border border-[#d3e4d9] bg-[#f9fbfa] px-4 py-3.5 text-base outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary dark:bg-white/5 dark:border-white/10 dark:text-white" placeholder="0912 345 678" type="tel" />
                  </label>
                </div>
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-[#101913] dark:text-gray-300">Lời nhắn</span>
                  <textarea className="w-full resize-none rounded-xl border border-[#d3e4d9] bg-[#f9fbfa] px-4 py-3.5 text-base outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary dark:bg-white/5 dark:border-white/10 dark:text-white" placeholder="Mô tả ý tưởng của bạn..." rows={4}></textarea>
                </label>
                <button className="w-full rounded-xl bg-accent-wine hover:bg-[#5e1821] text-white py-4 px-6 text-base font-bold shadow-lg shadow-accent-wine/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2" type="submit">
                  <span>Gửi yêu cầu</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-lg font-bold text-[#101913] dark:text-white">Showroom của chúng tôi</h3>
          </div>
          {showrooms.map((showroom, idx) => (
            <div
              key={idx}
              className="reveal group relative overflow-hidden rounded-xl bg-white dark:bg-[#1A261F] shadow-sm border border-[#d3e4d9] dark:border-white/10 hover:shadow-md transition-all hover-lift"
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div className="flex flex-row h-full">
                <div className="w-1/3 bg-gray-200 relative overflow-hidden">
                  <img src={showroom.img} className="h-full w-full object-cover group-hover:scale-110 transition-all duration-700" alt={`Showroom ${showroom.city}`} />
                </div>
                <div className="flex-1 p-5">
                  <span className="inline-flex items-center rounded-md bg-[#f9fbfa] dark:bg-white/10 px-2 py-1 text-xs font-bold uppercase text-primary border border-primary/10 mb-2">{showroom.label}</span>
                  <h4 className="text-lg font-bold text-text-main dark:text-white">{showroom.city}</h4>
                  <p className="text-sm text-[#578e6b] dark:text-gray-400 mt-1">{showroom.address}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Direct Contact */}
          <div className="reveal bg-gradient-to-br from-primary/5 to-accent-gold/5 dark:from-primary/10 dark:to-accent-gold/10 rounded-xl p-6 border border-primary/10 dark:border-primary/20 space-y-4 mt-2">
            <h4 className="font-bold text-text-main dark:text-white">Liên hệ trực tiếp</h4>
            <div className="space-y-3">
              <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[18px] text-primary">call</span>
                {contactPhone}
              </a>
              <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[18px] text-primary">mail</span>
                {contactEmail}
              </a>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <span className="material-symbols-outlined text-[18px] text-primary">schedule</span>
                {workingHours}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
