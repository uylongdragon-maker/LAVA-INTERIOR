
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../../components/Hero';
import HydrographicTech from '../../components/HydrographicTech';
import { doc, getDoc } from 'firebase/firestore';
import { initFirebase } from '../../services/firebase';
import { SiteConfig, HomeCollectionItem, HomeStat, HomeIntro } from '../../types';
import ChatWidget from '../../components/ChatWidget';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [config, setConfig] = useState<SiteConfig | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            const firebase = initFirebase();
            if (!firebase) return;
            const docSnap = await getDoc(doc(firebase.db, 'site_config', 'main'));
            if (docSnap.exists()) {
                setConfig(docSnap.data() as SiteConfig);
            }
        }
        fetchConfig();
    }, []);

    return (
        <div className="page-enter">
            <Hero onExplore={() => navigate('/products')} />
            <HydrographicTech />
            <FeaturedCategories collections={config?.homeCollections || []} />
            <LegacySection
                intro={config?.homeIntro}
                stats={config?.homeStats || []}
            />
            <ChatWidget />
        </div>
    );
};

const FeaturedCategories: React.FC<{ collections: HomeCollectionItem[] }> = ({ collections }) => {
    // Default Content
    const defaultCollections = [
        { title: 'Xi măng - Cement', desc: 'Vẻ đẹp thô mộc từ nghệ nhân tay nghề cao.', img: 'https://images.unsplash.com/photo-1594913785162-e6785b493bd2?q=80&w=800' },
        { title: 'Composite', desc: 'Linh hoạt, bền bỉ và vô cùng hiện đại.', img: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=800' }
    ];

    const items = collections.length > 0 ? collections : defaultCollections;

    return (
        <section className="py-32 bg-white dark:bg-[#131f17]">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-4 reveal">
                    <div>
                        <h2 className="text-xs font-bold tracking-[0.4em] uppercase text-accent-gold mb-4">Sự Khác Biệt</h2>
                        <h3 className="font-display text-5xl md:text-6xl font-medium text-primary-dark dark:text-primary leading-tight">
                            Bộ Sưu Tập <span className="italic font-light text-accent-wine dark:text-accent-gold">Độc Bản</span>
                        </h3>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    {items.map((item, index) => (
                        <div key={index} className="relative group rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] reveal-scale">
                            <img src={item.img} alt={item.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-10 flex flex-col justify-end transition-opacity duration-500">
                                <h4 className="font-display text-3xl md:text-4xl text-white mb-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{item.title}</h4>
                                <p className="text-white/80 text-base mb-8 font-light max-w-sm translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">{item.desc}</p>
                                <button
                                    className="w-fit px-8 py-3 bg-white text-primary rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 duration-500 delay-200"
                                >
                                    Xem Chi Tiết
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const LegacySection: React.FC<{ intro?: HomeIntro, stats: HomeStat[] }> = ({ intro, stats }) => {
    const defaultStats = [
        { value: '10+', label: 'Năm Kinh Nghiệm' },
        { value: '5000+', label: 'Dự Án Hoàn Thành' }
    ];
    const displayStats = stats.length > 0 ? stats : defaultStats;

    const defaultImages = [
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600',
        'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=600',
        'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=600',
        'https://images.unsplash.com/photo-1505691938895-1758d7eaa511?q=80&w=600',
    ];
    const images = (intro?.images && intro.images.length >= 4) ? intro.images : defaultImages;

    return (
        <section className="py-32 bg-background-light dark:bg-[#1a261f]">
            <div className="container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-20 items-center">
                <div className="relative grid grid-cols-2 gap-6 reveal-left">
                    <div className="space-y-6">
                        <img src={images[0]} className="rounded-2xl shadow-float hover-lift grayscale hover:grayscale-0 transition-all duration-700" alt="Workshop" />
                        <img src={images[1]} className="rounded-2xl shadow-soft translate-x-8 hover-lift grayscale hover:grayscale-0 transition-all duration-700" alt="Interior" />
                    </div>
                    <div className="pt-16 space-y-6">
                        <img src={images[2]} className="rounded-2xl shadow-soft -translate-x-8 hover-lift grayscale hover:grayscale-0 transition-all duration-700" alt="Design" />
                        <img src={images[3]} className="rounded-2xl shadow-float hover-lift grayscale hover:grayscale-0 transition-all duration-700" alt="Furniture" />
                    </div>
                    <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-gold/20 blur-[120px] rounded-full" />
                </div>
                <div className="space-y-10 reveal-right">
                    <h2 className="text-xs font-bold tracking-[0.4em] uppercase text-accent-wine dark:text-[#d88a98]">
                        {intro?.subtitle || 'Kế Thừa & Đổi Mới'}
                    </h2>
                    <h3
                        className="font-display text-6xl md:text-7xl font-light text-primary dark:text-primary leading-tight"
                        dangerouslySetInnerHTML={{ __html: intro?.title || 'Lava Interior: <br /><span class="italic font-normal text-black dark:text-white">Nghệ Thuật Sống</span>' }}
                    />
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-body text-xl font-light">
                        {intro?.desc || 'Chúng tôi không chỉ kiến tạo nội thất, chúng tôi xây dựng những giấc mơ. Kết hợp chất liệu xi măng mài truyền thống với công nghệ AI đột phá, mỗi sản phẩm của Lava là một bản giao hưởng giữa thiên nhiên và kiến trúc hiện đại.'}
                    </p>
                    <div className="flex gap-16 pt-6 border-t border-primary/10 dark:border-white/10">
                        {displayStats.map((stat, idx) => (
                            <div key={idx}>
                                <span className="block text-5xl font-display font-medium text-accent-gold mb-2">{stat.value}</span>
                                <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Home;
