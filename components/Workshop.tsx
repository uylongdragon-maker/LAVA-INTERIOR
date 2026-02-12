
import React, { useState, useEffect } from 'react';
import { AI_SUGGESTIONS } from '../constants';
import { generateWorkshopImage } from '../services/gemini';
import { uploadDesign, getLocalDesigns, deleteDesign, SavedDesign } from '../services/firebase';

interface Palette {
  id: string;
  name: string;
  description: string;
  prompt: string;
  colors: string[];
}

const Workshop: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>('lava-signature');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedSuccess, setShowSavedSuccess] = useState(false);

  const palettes: Palette[] = [
    {
      id: 'lava-signature',
      name: 'Lava Signature',
      description: 'Sự kết hợp giữa Xi măng mài, Gỗ óc chó và điểm nhấn Vàng gold.',
      prompt: 'polished concrete cement, dark walnut wood, and brushed gold metal accents',
      colors: ['#1c6d3a', '#4a3728', '#D4AF37'], // Green, Walnut, Gold
    },
    {
      id: 'urban-monochrome',
      name: 'Urban Modern',
      description: 'Phong cách thành thị với Bê tông xám và Kim loại đen mờ.',
      prompt: 'raw grey concrete texture with matte black steel and minimal glass elements',
      colors: ['#4b5563', '#111827', '#9ca3af'], // Grey, Black, Silver
    },
    {
      id: 'nordic-light',
      name: 'Nordic Warmth',
      description: 'Gỗ Sồi sáng màu kết hợp Composite trắng tinh tế.',
      prompt: 'light oak natural wood, white smooth composite, and soft grey textile',
      colors: ['#fef3c7', '#ffffff', '#d1d5db'], // Light Oak, White, Grey
    },
    {
      id: 'heritage-luxe',
      name: 'Heritage Red',
      description: 'Nhung Đỏ rượu vang và Chân đồng thau cổ điển.',
      prompt: 'deep wine red velvet upholstery, polished brass, and mahogany wood details',
      colors: ['#7A1F2B', '#D4AF37', '#2d1a12'], // Wine, Brass, Mahogany
    }
  ];

  const steps = [
    { label: "Khởi tạo Studio", detail: "Đang chuẩn bị không gian render 8K..." },
    { label: "Phân tích ý tưởng", detail: "Nana Banana đang đọc bản mô tả của bạn..." },
    { label: "Phối trộn chất liệu", detail: `Đang áp dụng bảng màu ${palettes.find(p => p.id === selectedPaletteId)?.name}...` },
    { label: "Xử lý bề mặt", detail: "Đang tinh chỉnh độ bóng và vân vật liệu..." },
    { label: "Hoàn thiện bản vẽ", detail: "Đang xuất bản vẽ thiết kế cuối cùng..." }
  ];

  useEffect(() => {
    let interval: any;
    if (isGenerating && generationStep < steps.length - 1) {
      interval = setInterval(() => {
        setGenerationStep(prev => prev + 1);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating, generationStep]);

  // Load saved designs on mount
  useEffect(() => {
    setSavedDesigns(getLocalDesigns());
  }, []);

  const handleSaveDesign = async () => {
    if (!generatedImage) return;

    setIsSaving(true);
    try {
      const saved = await uploadDesign(generatedImage, prompt, selectedPalette.name);
      if (saved) {
        setSavedDesigns(prev => [saved, ...prev].slice(0, 20));
        setShowSavedSuccess(true);
        setTimeout(() => setShowSavedSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDesign = async (id: string) => {
    const success = await deleteDesign(id);
    if (success) {
      setSavedDesigns(prev => prev.filter(d => d.id !== id));
    }
  };

  const selectedPalette = palettes.find(p => p.id === selectedPaletteId) || palettes[0];

  const handleGenerate = async (overridingPrompt?: string) => {
    const textPrompt = overridingPrompt || prompt;

    setIsGenerating(true);
    setGenerationStep(0);
    setGenerationError(null);

    try {
      const tags = [selectedPalette.prompt];
      if (textPrompt.trim()) {
        tags.push(textPrompt);
      }

      const result = await generateWorkshopImage(tags);
      setGeneratedImage(result);
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'Không thể kết nối với AI. Vui lòng kiểm tra lại mạng.';
      if (err?.message?.includes('API_KEY')) {
        errorMessage = 'Thiếu khóa bảo mật (API Key). Vui lòng cấu hình môi trường.';
      } else if (err?.message?.includes('429')) {
        errorMessage = 'Hệ thống đang quá tải. Vui lòng thử lại sau vài giây.';
      }
      setGenerationError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const onDragStart = (e: React.DragEvent, suggestionPrompt: string) => {
    e.dataTransfer.setData('text/plain', suggestionPrompt);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const onDragLeave = () => {
    setIsDraggingOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const suggestionPrompt = e.dataTransfer.getData('text/plain');
    if (suggestionPrompt) {
      const newPrompt = prompt ? `${prompt}, ${suggestionPrompt}` : suggestionPrompt;
      setPrompt(newPrompt);
      handleGenerate(newPrompt);
    }
  };

  const DynamicPaletteThumbnail = ({ palette, isSelected }: { palette: Palette, isSelected: boolean }) => {
    const { colors, id } = palette;
    const textures: Record<string, string> = {
      'lava-signature': 'https://www.transparenttextures.com/patterns/concrete-wall.png',
      'urban-monochrome': 'https://www.transparenttextures.com/patterns/brushed-alum.png',
      'nordic-light': 'https://www.transparenttextures.com/patterns/pinstriped-suit.png',
      'heritage-luxe': 'https://www.transparenttextures.com/patterns/dark-matter.png',
    };

    return (
      <div className={`relative size-16 rounded-xl overflow-hidden flex-shrink-0 shadow-md border-2 transition-all duration-500 transform ${isSelected ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-transparent hover:scale-105'}`}>
        <div className="absolute inset-0" style={{ backgroundColor: colors[0] }}></div>
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundColor: colors[1],
            clipPath: 'polygon(60% 0, 100% 0, 100% 100%, 25% 100%)'
          }}
        ></div>
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundColor: colors[2],
            clipPath: 'polygon(85% 0, 100% 0, 100% 100%, 75% 100%)'
          }}
        ></div>
        <div
          className="absolute inset-0 mix-blend-overlay opacity-50 pointer-events-none"
          style={{
            backgroundImage: `url("${textures[id] || textures['lava-signature']}")`,
            backgroundSize: id === 'nordic-light' ? '30px' : 'auto'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20"></div>
        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/40"></div>
        {id === 'lava-signature' && (
          <div className="absolute bottom-1 right-1 size-4 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
            <span className="text-[8px] font-black text-white/50">L</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative h-[calc(100vh-80px)] w-full">
      <aside className="w-full lg:w-[420px] flex-shrink-0 flex flex-col h-full bg-surface-light dark:bg-surface-dark border-r border-[#e9f1ec] dark:border-[#2a3830] z-20 overflow-y-auto no-scrollbar">
        <div className="px-6 py-4 flex gap-2 items-center">
          <a className="text-[#578e6b] hover:text-primary text-sm font-medium" href="#" onClick={(e) => e.preventDefault()}>Trang chủ</a>
          <span className="text-[#578e6b] text-sm font-medium">/</span>
          <span className="text-[#101913] dark:text-white text-sm font-medium">Creative Lab</span>
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              <h3 className="text-[#101913] dark:text-white tracking-tight text-xl font-bold">Nana Banana AI</h3>
            </div>
          </div>

          <div className="bg-background-light dark:bg-[#24332a] p-4 rounded-xl border border-[#e9f1ec] dark:border-[#2a3830]">
            <div className="flex flex-col gap-3">
              <label className="flex flex-col w-full">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="form-textarea w-full resize-none rounded-xl text-[#101913] dark:text-white bg-white dark:bg-[#1a261f] border-none focus:ring-1 focus:ring-primary h-24 p-3 text-sm placeholder:text-[#578e6b]"
                  placeholder="Mô tả ý tưởng... (Kéo thẻ phong cách vào canvas)"
                ></textarea>
              </label>
              <div className="flex justify-between items-center mt-1">
                <button className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 text-[#578e6b] transition-colors">
                  <span className="material-symbols-outlined">mic</span>
                </button>
                <button
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-6 py-2 bg-luxury-gradient text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <span className="animate-spin material-symbols-outlined text-[18px]">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">temp_preferences_custom</span>
                  )}
                  <span>{isGenerating ? 'Đang tạo...' : 'Tưởng tượng'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-[10px] font-bold text-[#578e6b] uppercase tracking-widest mb-3">Kéo & Thả Phong Cách</h4>
            <div className="flex gap-2 flex-wrap">
              {AI_SUGGESTIONS.map(suggestion => (
                <div
                  key={suggestion.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, suggestion.prompt)}
                  className="flex h-10 items-center justify-center rounded-lg bg-[#e9f1ec] dark:bg-[#2a3830] text-[#101913] dark:text-[#d1dcd5] px-4 text-[11px] font-bold hover:bg-[#dce6df] cursor-grab active:cursor-grabbing transition-all border border-transparent hover:border-primary/20 shadow-sm"
                >
                  <span className="material-symbols-outlined text-xs mr-2 opacity-50">drag_indicator</span>
                  {suggestion.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 pb-6 overflow-y-auto no-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[#101913] dark:text-white font-bold text-lg">Bản phối chất liệu</h4>
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Procedural</span>
          </div>
          <div className="flex flex-col gap-4">
            {palettes.map((palette) => (
              <div
                key={palette.id}
                onClick={() => setSelectedPaletteId(palette.id)}
                className={`group relative flex flex-col p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${selectedPaletteId === palette.id
                  ? 'bg-white dark:bg-[#24332a] border-primary shadow-float scale-[1.02]'
                  : 'bg-background-light/50 dark:bg-white/5 border-transparent hover:bg-white dark:hover:bg-white/10'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <DynamicPaletteThumbnail palette={palette} isSelected={selectedPaletteId === palette.id} />
                  <div className="flex-1">
                    <h5 className={`text-sm font-bold ${selectedPaletteId === palette.id ? 'text-primary' : 'text-[#101913] dark:text-white'}`}>
                      {palette.name}
                    </h5>
                    <p className="text-[10px] text-[#578e6b] dark:text-gray-400 mt-1 leading-relaxed">
                      {palette.description}
                    </p>
                  </div>
                  {selectedPaletteId === palette.id && (
                    <span className="material-symbols-outlined text-primary font-bold animate-in zoom-in duration-300">check_circle</span>
                  )}
                </div>
                <div className="flex gap-1.5 mt-4">
                  {palette.colors.map((color, i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: color }}
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Saved Designs Section */}
          {savedDesigns.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[#101913] dark:text-white font-bold text-lg">Thiết kế đã lưu</h4>
                <span className="text-[10px] bg-accent-gold/10 text-accent-gold px-2 py-0.5 rounded-full font-bold">{savedDesigns.length}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {savedDesigns.slice(0, 6).map((design) => (
                  <div key={design.id} className="group relative aspect-square rounded-xl overflow-hidden border border-[#e9f1ec] dark:border-[#2a3830] hover:border-primary transition-colors">
                    <img
                      src={design.imageUrl}
                      alt={design.prompt || 'Saved design'}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setGeneratedImage(design.imageUrl)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                      <span className="text-[8px] text-white/80 truncate max-w-[80%]">{design.palette}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteDesign(design.id); }}
                        className="p-1 bg-accent-wine/80 hover:bg-accent-wine rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-white text-[14px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      <section
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex-1 relative m-0 lg:m-4 rounded-none lg:rounded-2xl overflow-hidden shadow-inner flex flex-col transition-all duration-500 ${isDraggingOver ? 'bg-primary/5 ring-8 ring-primary/10 scale-[0.98]' : 'bg-background-light dark:bg-[#1a261f]'
          }`}
      >
        <div className="absolute inset-0 bg-dot-grid opacity-30 pointer-events-none"></div>

        {isGenerating && (
          <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 z-50">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(28,109,58,0.5)]"
              style={{ width: `${((generationStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        )}

        <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
          <div className="hidden sm:flex bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md shadow-lg rounded-full px-5 py-2.5 items-center gap-4 border border-[#e9f1ec] dark:border-[#2a3830]">
            <div className="flex -space-x-1">
              {selectedPalette.colors.map((c, i) => (
                <div key={i} className="size-3 rounded-full border border-white dark:border-surface-dark" style={{ backgroundColor: c }}></div>
              ))}
            </div>
            <span className="text-xs font-bold text-[#101913] dark:text-white uppercase tracking-widest">{selectedPalette.name}</span>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-luxury-gradient text-white text-xs font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95">
            <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
            <span>ĐẶT THIẾT KẾ</span>
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center relative p-8">
          <div className="relative w-full max-w-[650px] aspect-square flex items-center justify-center group/object">
            {generationError ? (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-[3rem] border border-accent-wine/20">
                <span className="material-symbols-outlined text-6xl text-accent-wine mb-4 animate-bounce">warning</span>
                <h4 className="text-xl font-bold text-[#101913] dark:text-white mb-2">Đã có lỗi xảy ra</h4>
                <p className="text-[#578e6b] dark:text-gray-400 text-sm mb-6 max-w-xs">{generationError}</p>
                <button
                  onClick={() => handleGenerate()}
                  className="px-8 py-3 bg-accent-wine text-white rounded-full font-bold text-sm shadow-lg hover:bg-accent-wine/90 transition-all"
                >
                  Thử lại
                </button>
              </div>
            ) : generatedImage ? (
              <img
                src={generatedImage}
                alt="Bản xem trước AI"
                className="max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-all duration-700 ease-out hover:scale-105 hover:drop-shadow-[0_40px_80px_rgba(0,0,0,0.25)] cursor-zoom-in rounded-3xl"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-[#578e6b] gap-6 text-center">
                <div className="relative flex items-center justify-center">
                  <div className="absolute size-48 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                  <span className="material-symbols-outlined text-[120px] opacity-10">draw</span>
                  <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-4xl opacity-30 animate-bounce">add</span>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-bold opacity-50 uppercase tracking-[0.3em]">AI Creative Atelier</p>
                  <p className="text-sm opacity-40 italic max-w-xs leading-relaxed">Chọn bảng phối màu và kéo thả ý tưởng để bắt đầu sáng tạo.</p>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-[3rem] z-10 transition-all duration-500">
                <div className="text-center space-y-6">
                  <div className="relative size-24 mx-auto">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-primary text-3xl animate-pulse">brush</span>
                  </div>
                  <div className="space-y-2 max-w-xs mx-auto">
                    <p className="text-primary font-black tracking-[0.2em] uppercase text-sm animate-pulse">{steps[generationStep].label}</p>
                    <p className="text-[#101913] dark:text-white text-xs opacity-70 italic font-medium">
                      {steps[generationStep].detail}
                    </p>
                    <div className="flex justify-center gap-1 mt-2">
                      {steps.map((_, i) => (
                        <div
                          key={i}
                          className={`size-1.5 rounded-full transition-all duration-500 ${i === generationStep ? 'bg-primary w-4' : 'bg-primary/20'}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success Toast */}
        {showSavedSuccess && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full shadow-lg">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span className="text-sm font-bold">Đã lưu thiết kế thành công!</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-xl px-6 py-3 rounded-2xl shadow-float border border-[#e9f1ec] dark:border-[#2a3830]">
          <button className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#578e6b]"><span className="material-symbols-outlined text-[20px]">refresh</span></button>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
          <button className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#578e6b]"><span className="material-symbols-outlined text-[20px]">zoom_in</span></button>
          <span className="text-xs font-black text-[#101913] dark:text-white w-14 text-center tabular-nums">100%</span>
          <button className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#578e6b]"><span className="material-symbols-outlined text-[20px]">zoom_out</span></button>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
          <button className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-primary bg-primary/5"><span className="material-symbols-outlined text-[20px]">view_in_ar</span></button>
          {generatedImage && (
            <>
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
              <button
                onClick={handleSaveDesign}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="animate-spin material-symbols-outlined text-[16px]">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
                )}
                <span>{isSaving ? 'Đang lưu...' : 'Lưu Thiết Kế'}</span>
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default Workshop;
