
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { initFirebase } from '../services/firebase';
import { SiteConfig } from '../types';

const About: React.FC = () => {
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
        console.error("Error fetching about config", error);
      }
    };
    fetchConfig();
  }, []);

  return (
    <div className="page-enter">
      {/* Introduction Section */}
      <section className="pt-32 pb-24 md:pt-40 md:pb-32 bg-[#1A1A1A] dark:bg-[#131f17] text-white">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="reveal space-y-16">
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light leading-[1.1] tracking-tight">
              {config?.aboutTitle ? (
                <div dangerouslySetInnerHTML={{ __html: config.aboutTitle }} />
              ) : (
                <>Welcome to<br /><span className="font-bold">LAVA INTERIOR</span></>
              )}
            </h1>
            
            <div className="grid md:grid-cols-2 gap-12 md:gap-24 font-light text-gray-400 italic text-lg md:text-xl leading-relaxed">
              <p className="reveal-left" style={{ transitionDelay: '200ms' }}>
                Lava Interior kiến tạo sự giao thoa tinh tế giữa nghệ thuật sản xuất OEM chuẩn mực và ngôn ngữ thiết kế độc bản. Chúng tôi tạo nên những tác phẩm nội thất nơi kỹ thuật hoàn mỹ hòa quyện cùng giá trị thẩm mỹ sâu sắc.
              </p>
              <p className="reveal-right" style={{ transitionDelay: '400ms' }}>
                Mỗi thiết kế là một hành trình cảm xúc từ ý niệm đến hiện thực. Chúng tôi tin rằng nội thất không chỉ tô điểm không gian, mà còn chạm đến tâm hồn, nâng tầm từng khoảnh khắc sống thành nghệ thuật.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Break */}
      <section className="bg-white dark:bg-[#131f17] pb-24 md:pb-32">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl -mt-10 md:-mt-16 reveal relative z-10">
            <img
              src={config?.aboutImage || "https://images.unsplash.com/photo-1574621100236-d25b64cfd647?q=80&w=1200"}
              alt="Lava Interior workshop"
              className="rounded-2xl shadow-2xl w-full object-cover h-[50vh] md:h-[70vh] border-4 border-white dark:border-[#131f17]"
            />
        </div>
      </section>

      {/* Brand Philosophy Section */}
      <section className="bg-[#EAEAEA] dark:bg-[#1a261f] py-24 md:py-36 transition-colors duration-500">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl reveal tracking-wide">
          <div className="grid md:grid-cols-2">
            
            {/* Left Column */}
            <div className="flex flex-col pr-8 md:pr-16">
              <h2 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-light mb-16 leading-[1] tracking-tighter text-[#1a1a1a] dark:text-white">
                Our Brand<br /><span className="font-semibold italic">Philosophy:</span>
              </h2>
              
              <div className="mt-auto pb-6 border-b border-[#333]/10 dark:border-white/10">
                <h3 className="font-bold text-xl md:text-2xl mb-4 text-[#1a1a1a] dark:text-white uppercase tracking-widest">Sức mạnh trừu tượng</h3>
                <p className="font-light text-[#555] dark:text-gray-400 leading-relaxed text-lg italic">
                  Khởi nguồn từ những ý niệm vô hình, nơi cảm xúc hóa thành hình khối, tâm hồn biến thành chất liệu. Chúng tôi tạo nên bản sắc riêng cho mỗi thiết kế.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col md:border-l-[1.5px] border-[#333]/10 dark:border-white/10 mt-16 md:mt-0">
              <div className="pb-10 md:pb-24 md:pl-16 pt-8 md:pt-40 border-b border-[#333]/10 dark:border-white/10">
                <h3 className="font-bold text-xl md:text-2xl mb-4 text-[#1a1a1a] dark:text-white uppercase tracking-widest">Định hình tự do</h3>
                <p className="font-light text-[#555] dark:text-gray-400 leading-relaxed text-lg italic">
                  Không gian là vũ trụ thu nhỏ, chờ đợi được khám phá. Chúng tôi kiến tạo bằng sự linh hoạt vô hạn, giải phóng mọi quy tắc cứng nhắc.
                </p>
              </div>
              
              <div className="pt-10 md:pt-24 md:pl-16">
                <h3 className="font-bold text-xl md:text-2xl mb-4 text-[#1a1a1a] dark:text-white uppercase tracking-widest">Nổi bật cá tính</h3>
                <p className="font-light text-[#555] dark:text-gray-400 leading-relaxed text-lg italic">
                  Mỗi tác phẩm là lời tuyên ngôn thầm lặng về linh hồn, phản chiếu cá tính riêng trong từng chi tiết độc nhất.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* The Company Section */}
      <section className="bg-[#f4f4f4] dark:bg-[#131f17] py-24 md:py-32 text-[#333] dark:text-gray-200 transition-colors duration-500">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          
          <div className="text-center mb-24 reveal">
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-[#1a1a1a] dark:text-white uppercase">
              The <span className="font-light italic">company</span>
            </h2>
            <div className="w-16 h-[2px] bg-primary mx-auto mt-6 opacity-30"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center mb-32">
            {/* Top Left: Factory Image */}
            <div className="reveal-left space-y-10">
              <div className="relative group overflow-hidden rounded-2xl shadow-xl">
                 <img src={config?.companySection?.factoryImg || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800"} alt="Factory" className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105" />
                 <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:opacity-0"></div>
              </div>
              
              <div className="md:pr-12">
                <h3 className="font-bold text-xl md:text-2xl mb-4 text-[#1a1a1a] dark:text-white uppercase tracking-wider">{config?.companySection?.factoryTitle || 'Sức mạnh từ quy mô'}</h3>
                <p className="font-light text-[#555] dark:text-gray-400 leading-relaxed text-base italic">
                  {config?.companySection?.factoryDesc || 'Với tổng diện tích 6.000 m2 bao gồm 2 xưởng sản xuất, nhà máy được quy hoạch tối ưu cho từng công đoạn. Phân khu rõ ràng giúp nâng cao hiệu suất vận hành và đảm bảo chất lượng.'}
                </p>
              </div>
            </div>

            {/* Top Right: Text & Spray Image */}
            <div className="reveal-right flex flex-col space-y-16">
               <div className="md:pl-12 pt-8 md:pt-0">
                <h3 className="font-bold text-xl md:text-2xl mb-4 text-[#1a1a1a] dark:text-white uppercase tracking-wider">{config?.companySection?.sprayTitle || 'Kiến tạo giá trị từ sản xuất'}</h3>
                <p className="font-light text-[#555] dark:text-gray-400 leading-relaxed text-base italic">
                  {config?.companySection?.sprayDesc || 'Nhà máy phát triển với định hướng xây dựng hệ thống sản xuất linh hoạt. Chúng tôi tập trung tối ưu quy trình để mỗi sản phẩm đạt giá trị sử dụng bền vững.'}
                </p>
              </div>
              <div className="relative group overflow-hidden rounded-2xl shadow-xl">
                <img src={config?.companySection?.sprayImg || "https://images.unsplash.com/photo-1621905252507-b35492f0502e?q=80&w=800"} alt="Worker spraying paint" className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/10 transition-opacity group-hover:opacity-0"></div>
              </div>
            </div>
          </div>

          {/* Centered Text */}
          <div className="max-w-4xl mx-auto text-center mb-24 reveal">
            <h3 className="font-bold text-xl md:text-2xl mb-4 text-[#333] dark:text-white">{config?.companySection?.centerTitle || 'Định hình tự do trong vận hành'}</h3>
            <p className="font-medium text-[#555] dark:text-gray-400 leading-relaxed">
              {config?.companySection?.centerDesc || 'Đội ngũ 52 công nhân lành nghề là nền tảng cho sự ổn định và phát triển của nhà máy. Với kinh nghiệm thực tiễn và quy trình làm việc chặt chẽ, chúng tôi đảm bảo mỗi sản phẩm đều đạt độ hoàn thiện cao, đáp ứng yêu cầu khắt khe từ đối tác.'}
            </p>
          </div>

          {/* 3 Columns */}
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {/* Box 1 */}
            <div className="reveal group" style={{ transitionDelay: '100ms' }}>
              <div className="overflow-hidden rounded-2xl mb-8 shadow-lg">
                <img src={config?.companySection?.features?.[0]?.img || "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=600"} alt="Production" className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <h3 className="font-bold text-lg mb-4 text-[#1a1a1a] dark:text-white uppercase tracking-widest">{config?.companySection?.features?.[0]?.title || 'Năng lực sản xuất'}</h3>
              <p className="font-light text-[#555] dark:text-gray-400 leading-relaxed text-sm italic">
                {config?.companySection?.features?.[0]?.desc || 'Nhà máy sở hữu năng lực sản xuất ổn định, đáp ứng linh hoạt các đơn hàng từ quy mô vừa đến lớn, đảm bảo tiến độ.'}
              </p>
            </div>
            
            {/* Box 2 */}
            <div className="reveal group" style={{ transitionDelay: '200ms' }}>
              <div className="overflow-hidden rounded-2xl mb-8 shadow-lg">
                <img src={config?.companySection?.features?.[1]?.img || "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=600"} alt="Operation" className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <h3 className="font-bold text-lg mb-4 text-[#1a1a1a] dark:text-white uppercase tracking-widest">{config?.companySection?.features?.[1]?.title || 'Vận hành hiệu quả'}</h3>
              <p className="font-light text-[#555] dark:text-gray-400 leading-relaxed text-sm italic">
                {config?.companySection?.features?.[1]?.desc || 'Quy trình sản xuất tối ưu từ đầu vào đến thành phẩm, đảm bảo hiệu suất cao và chất lượng đồng đều.'}
              </p>
            </div>
            
            {/* Box 3 */}
            <div className="reveal group" style={{ transitionDelay: '300ms' }}>
              <div className="overflow-hidden rounded-2xl mb-8 shadow-lg">
                <img src={config?.companySection?.features?.[2]?.img || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600"} alt="Commitment" className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <h3 className="font-bold text-lg mb-4 text-[#1a1a1a] dark:text-white uppercase tracking-widest">{config?.companySection?.features?.[2]?.title || 'Cam kết chất lượng'}</h3>
              <p className="font-light text-[#555] dark:text-gray-400 leading-relaxed text-sm italic">
                {config?.companySection?.features?.[2]?.desc || 'Chúng tôi duy trì tiêu chuẩn cao trong từng sản phẩm, đảm bảo độ bền và giá trị sử dụng lâu dài.'}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Slogan Art Line */}
      <section className="bg-[#f4f4f4] dark:bg-[#131f17] pb-24 md:pb-32 transition-colors duration-500">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl reveal">
          <div className="bg-[#1f1f1f] dark:bg-black/80 py-20 md:py-24 px-8 md:px-16 flex items-center justify-center text-center shadow-2xl">
            <h2 className="font-light italic text-[#f4f4f4] text-2xl md:text-3xl lg:text-4xl leading-relaxed md:leading-[1.6] tracking-wide">
              "Kiến tạo ngôn ngữ thầm lặng của không gian,<br className="hidden md:block" /> nơi cuộc sống chạm đến hoàn mỹ"
            </h2>
          </div>
        </div>
      </section>

      {/* Our Clients Section */}
      <section className="bg-[#EAEAEA] dark:bg-[#1a261f] py-24 md:py-40 text-center transition-colors duration-500">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          
          <div className="reveal max-w-4xl mx-auto mb-24">
            <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-[#1a1a1a] dark:text-white uppercase mb-8">
              {config?.clientSection?.title || 'OUR CLIENTS'}
            </h2>
            <div className="w-12 h-[1px] bg-primary mx-auto mb-8 opacity-40"></div>
            <h3 className="font-bold text-lg md:text-xl mb-6 text-[#1a1a1a] dark:text-white uppercase tracking-[0.2em]">
              {config?.clientSection?.subtitle || 'Đối tác & khách hàng'}
            </h3>
            <p className="font-light text-[#555] dark:text-gray-400 leading-relaxed text-lg italic">
              {config?.clientSection?.desc || 'Chúng tôi tự hào là đối tác của nhiều thương hiệu trong lĩnh vực nội thất và sản xuất. Sự tin tưởng của khách hàng là minh chứng cho năng lực vận hành ổn định.'}
            </p>
          </div>

          {/* Logos Grid */}
          <div className="reveal grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 items-center mb-32">
            {(config?.clientSection?.logos?.length ? config.clientSection.logos : [
              'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=300&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=300&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=300&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=300&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=300&auto=format&fit=crop',
            ]).map((logo, idx) => (
               <div key={idx} className="bg-white/50 dark:bg-white/5 backdrop-blur-sm p-8 rounded-2xl flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-500 border border-black/5 dark:border-white/5">
                 <img src={logo} alt={`Client logo ${idx + 1}`} className="max-h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity" />
               </div>
            ))}
          </div>

          {/* Exhibition Images */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[0, 1, 2].map((idx) => {
              const staticImages = [
                'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600',
                'https://images.unsplash.com/photo-1551818255-e6e10975bc17?q=80&w=600',
                'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600'
              ];
              const imgUrl = config?.clientSection?.exhibitionImages?.[idx] || staticImages[idx];
              return (
                <div key={idx} className="reveal hover-lift aspect-[4/3] rounded-xl overflow-hidden shadow-sm" style={{ transitionDelay: `${(idx + 1) * 100}ms` }}>
                  <img src={imgUrl} alt={`Exhibition ${idx+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              );
            })}
          </div>

          <div className="reveal max-w-4xl mx-auto pt-12">
            <h3 className="font-bold text-xl md:text-2xl mb-6 text-[#1a1a1a] dark:text-white uppercase tracking-widest leading-snug">
              {config?.clientSection?.bottomTitle || 'Định hình uy tín qua hợp tác'}
            </h3>
            <p className="font-light text-[#555] dark:text-gray-400 leading-relaxed text-base italic max-w-2xl mx-auto border-t border-black/5 dark:border-white/5 pt-8">
              {config?.clientSection?.bottomDesc || 'Chúng tôi không ngừng nâng cao tiêu chuẩn sản xuất, hoàn thiện quy trình và đảm bảo khả năng đáp ứng linh hoạt các yêu cầu từ đối tác.'}
            </p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default About;
