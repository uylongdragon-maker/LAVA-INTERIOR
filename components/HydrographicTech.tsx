
import React from 'react';
import { motion } from 'framer-motion';

const materials = [
    {
        id: 'concrete',
        label: 'Xi Măng',
        image: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=800&auto=format&fit=crop',
        description: 'Vẻ đẹp thô mộc, sang trọng đậm chất công nghiệp.'
    },
    {
        id: 'resin',
        label: 'Resin Composite',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
        description: 'Bền bỉ liền mạch với độ hoàn thiện bóng kính.'
    },
    {
        id: 'wood',
        label: 'Gỗ',
        image: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=800&auto=format&fit=crop',
        description: 'Chất cảm hữu cơ ấm áp được lưu giữ trong đá.'
    },
    {
        id: 'metal',
        label: 'Kim Loại',
        image: 'https://images.unsplash.com/photo-1535868463750-c78d9543614f?q=80&w=800&auto=format&fit=crop',
        description: 'Sự mạnh mẽ tinh xảo ánh lên sắc kim khí.'
    },
    {
        id: 'glass',
        label: 'Thủy Tinh',
        image: 'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?q=80&w=800&auto=format&fit=crop',
        description: 'Vẻ đẹp trong trẻo bắt trọn ánh sáng và chiều sâu.'
    }
];

const HydrographicTech: React.FC = () => {
    return (
        <section className="relative py-32 overflow-hidden bg-[#F5F2F0] dark:bg-[#1a1816]">
            {/* Background Texture/Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply dark:mix-blend-overlay"></div>

            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                {/* Header Section */}
                <div className="text-center max-w-4xl mx-auto mb-20">
                    <div className="mb-8">
                        <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-accent-gold mb-4">Sự Khác Biệt</h3>
                        <h2 className="font-display text-5xl md:text-6xl text-text-main dark:text-[#Eaeaea] leading-tight">
                            Bộ Sưu Tập <span className="italic font-light text-accent-wine dark:text-accent-gold">Độc Bản</span>
                        </h2>
                        <h4 className="font-display text-2xl md:text-3xl text-gray-400 dark:text-gray-500 mt-4 italic">
                            Công Nghệ Hydrographic
                        </h4>
                    </div>
                    <p
                        className="font-display text-lg md:text-xl text-gray-600 dark:text-gray-300 font-light leading-relaxed max-w-2xl mx-auto"
                    >
                        Bề mặt đá nhân tạo của chúng tôi là kết tinh của công nghệ Hydrographic tiên tiến, nơi vẻ đẹp nguyên bản của đá tự nhiên được tái hiện hoàn hảo trên mọi chất liệu cốt nền. Sự đột phá này mở ra chân trời mới cho tự do sáng tạo, song hành cùng độ bền vượt trội và giá trị thẩm mỹ chân thực.
                    </p>
                </div>

                {/* Materials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {materials.map((item, index) => (
                        <MaterialCard key={item.id} item={item} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

const MaterialCard: React.FC<{ item: typeof materials[0], index: number }> = ({ item, index }) => {
    return (
        <div
            className="group relative aspect-square rounded-[10px] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
        >
            {/* Background Image - Initially hidden/subtle, reveals on hover */}
            <div className="absolute inset-0 bg-gray-800 dark:bg-[#2a2826] transition-colors duration-500">
                <img
                    src={item.image}
                    alt={item.label}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-110 group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500"></div>
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-2xl font-display text-white drop-shadow-md transition-colors duration-500 mb-2">
                        {item.label}
                    </h3>
                    <p className="font-display text-base font-light text-white/90 drop-shadow-md opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100 italic">
                        {item.description}
                    </p>
                </div>

                {/* Subtle indicator line */}
                <div className="absolute bottom-0 left-0 h-1 bg-accent-gold w-0 group-hover:w-full transition-all duration-700 ease-in-out"></div>
            </div>

            {/* Index Number - Moved to Top Right to avoid overlap */}
            <div className="absolute top-4 right-4 pointer-events-none group-hover:opacity-0 transition-opacity duration-500">
                <span className="text-lg font-display tracking-widest text-white/50 group-hover:text-white/80">
                    0{index + 1}
                </span>
            </div>
        </div>
    );
};

export default HydrographicTech;
