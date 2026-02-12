
import React from 'react';

const VALUES = [
  {
    icon: 'precision_manufacturing',
    title: 'Thủ Công Tinh Xảo',
    desc: 'Mỗi sản phẩm là kết tinh từ đôi bàn tay nghệ nhân với hơn 10 năm kinh nghiệm trong chế tác xi măng mài.',
  },
  {
    icon: 'eco',
    title: 'Bền Vững',
    desc: 'Cam kết sử dụng nguyên liệu tái chế và quy trình sản xuất thân thiện với môi trường.',
  },
  {
    icon: 'auto_awesome',
    title: 'Đổi Mới Sáng Tạo',
    desc: 'Ứng dụng AI và công nghệ composite tiên tiến để kiến tạo những thiết kế chưa từng có.',
  },
];

const MILESTONES = [
  { year: '2015', title: 'Khởi nguồn', desc: 'Lava Interior ra đời từ xưởng nhỏ tại Thảo Điền, Quận 2.' },
  { year: '2018', title: 'Composite', desc: 'Phát triển dòng vật liệu Composite cao cấp riêng biệt.' },
  { year: '2021', title: 'Vươn tầm', desc: 'Khai trương showroom flagship và phục vụ 1000+ dự án.' },
  { year: '2024', title: 'AI Creative Lab', desc: 'Ra mắt Nana Banana AI — thiết kế nội thất bằng trí tuệ nhân tạo.' },
  { year: '2026', title: 'Tương lai', desc: 'Mở rộng thị trường Đông Nam Á và Nhật Bản.' },
];

const TEAM = [
  {
    name: 'Nguyễn Minh Khoa',
    role: 'Founder & Creative Director',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400',
  },
  {
    name: 'Trần Thị Hương',
    role: 'Head of Product Design',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400',
  },
  {
    name: 'Lê Hoàng Duy',
    role: 'Lead AI Engineer',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400',
  },
];

const About: React.FC = () => {
  return (
    <div className="page-enter">
      {/* Philosophy */}
      <section className="py-24 md:py-32 bg-white dark:bg-[#131f17]">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="text-center space-y-6 reveal">
            <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-accent-gold">Triết Lý Thiết Kế</h2>
            <h3 className="font-display text-5xl md:text-7xl font-light text-primary dark:text-[#6fbe8e] italic leading-tight">
              "Cốt Cách <br />Từ Sự Thô Mộc"
            </h3>
            <p className="text-gray-500 dark:text-gray-400 font-light text-lg max-w-2xl mx-auto leading-relaxed">
              Chúng tôi tin rằng vẻ đẹp thực sự nằm trong sự chân thực của vật liệu — nơi mà xi măng mài thô mộc trở thành nghệ thuật tinh tế.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center mt-20">
            <div className="reveal-left">
              <img
                src="https://images.unsplash.com/photo-1574621100236-d25b64cfd647?q=80&w=1200"
                alt="Lava Interior workshop"
                className="rounded-2xl shadow-float w-full object-cover aspect-[4/5]"
              />
            </div>
            <div className="reveal-right space-y-6 font-light text-gray-500 dark:text-gray-400 leading-loose">
              <p className="text-lg">
                Khởi nguồn từ niềm đam mê với chất liệu xi măng mài, Lava Interior đã dành hơn một thập kỷ để định nghĩa lại sự xa hoa trong nội thất hiện đại.
              </p>
              <p className="text-lg">
                Chúng tôi tin rằng mỗi món đồ nội thất không chỉ để sử dụng, mà còn là người kể chuyện cho tâm hồn của gia chủ. Từ bàn trà xi măng mài đến đèn nghệ thuật composite — mỗi sản phẩm đều mang dấu ấn riêng.
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
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-[#f6f8f7] dark:bg-[#1a261f]">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="text-center mb-16 reveal">
            <h2 className="text-xs font-bold tracking-[0.4em] uppercase text-accent-wine dark:text-[#d88a98] mb-3">Giá Trị Cốt Lõi</h2>
            <h3 className="font-display text-4xl md:text-5xl font-light text-primary dark:text-[#6fbe8e]">Những Gì Chúng Tôi Tin</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {VALUES.map((value, idx) => (
              <div
                key={idx}
                className="reveal bg-white dark:bg-[#24332a] rounded-2xl p-8 shadow-soft hover-lift card-shine border border-transparent dark:border-white/5"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center justify-center size-14 rounded-2xl bg-primary/10 dark:bg-primary/20 mb-6">
                  <span className="material-symbols-outlined text-primary text-[28px]">{value.icon}</span>
                </div>
                <h4 className="text-lg font-bold text-[#101913] dark:text-white mb-3">{value.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-white dark:bg-[#131f17]">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <div className="reveal bg-gradient-to-br from-primary/5 to-accent-gold/5 dark:from-primary/10 dark:to-accent-gold/10 p-12 md:p-16 rounded-3xl text-center border border-primary/10 dark:border-primary/20">
            <h4 className="font-display text-3xl md:text-4xl text-primary dark:text-[#6fbe8e] mb-6">Sứ Mệnh</h4>
            <p className="max-w-2xl mx-auto text-gray-500 dark:text-gray-400 font-light italic leading-relaxed text-lg">
              "Biến những vật liệu tưởng chừng như lạnh lẽo trở thành những tác phẩm ấm áp, tinh tế và bền bỉ với thời gian — thông qua đôi bàn tay tài hoa và trí tuệ nhân tạo."
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-[#f6f8f7] dark:bg-[#1a261f]">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <div className="text-center mb-16 reveal">
            <h2 className="text-xs font-bold tracking-[0.4em] uppercase text-accent-gold mb-3">Hành Trình</h2>
            <h3 className="font-display text-4xl md:text-5xl font-light text-primary dark:text-[#6fbe8e]">Cột Mốc Quan Trọng</h3>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-primary/15 dark:bg-primary/25 md:-translate-x-px"></div>
            <div className="space-y-12">
              {MILESTONES.map((m, idx) => (
                <div
                  key={idx}
                  className={`reveal relative flex items-start gap-6 md:gap-0 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  style={{ transitionDelay: `${idx * 80}ms` }}
                >
                  {/* Dot */}
                  <div className="absolute left-6 md:left-1/2 top-1 size-3 bg-primary rounded-full -translate-x-1.5 md:-translate-x-1.5 z-10 ring-4 ring-[#f6f8f7] dark:ring-[#1a261f]"></div>
                  {/* Card */}
                  <div className={`ml-14 md:ml-0 md:w-[45%] ${idx % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <span className="text-accent-gold font-bold text-sm tracking-widest">{m.year}</span>
                    <h5 className="text-lg font-bold text-[#101913] dark:text-white mt-1">{m.title}</h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-light">{m.desc}</p>
                  </div>
                  {/* Spacer for other side */}
                  <div className="hidden md:block md:w-[45%]"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-white dark:bg-[#131f17]">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="text-center mb-16 reveal">
            <h2 className="text-xs font-bold tracking-[0.4em] uppercase text-primary dark:text-[#6fbe8e] mb-3">Đội Ngũ</h2>
            <h3 className="font-display text-4xl md:text-5xl font-light text-primary dark:text-[#6fbe8e]">Những Người Tạo Ra Lava</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TEAM.map((member, idx) => (
              <div
                key={idx}
                className="reveal group text-center"
                style={{ transitionDelay: `${idx * 120}ms` }}
              >
                <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden shadow-float">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 rounded-full"></div>
                </div>
                <h4 className="text-lg font-bold text-[#101913] dark:text-white">{member.name}</h4>
                <p className="text-sm text-[#578e6b] dark:text-gray-400 mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
