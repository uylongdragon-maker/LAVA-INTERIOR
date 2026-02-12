
import { Category, Material, Product, AIWorkshopSuggestion } from './types';

export const COLORS = {
  white: '#FFFFFF',
  green: '#1A3C34', // Deep Luxury Green
  wine: '#800020',  // Wine Red
  gold: '#D4AF37',  // Gold Accent
};

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Bàn Trà Cementic',
    category: Category.TableSet,
    material: Material.Cement,
    price: 4500000,
    imageUrl: 'https://images.unsplash.com/photo-1594913785162-e6785b493bd2?q=80&w=600',
    description: 'Thiết kế tối giản từ bê tông mài cao cấp.'
  },
  {
    id: '2',
    name: 'Chậu Cây Lava Gold',
    category: Category.PlantPot,
    material: Material.Composite,
    price: 1200000,
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600',
    description: 'Độ bền cao với lớp phủ vàng sang trọng.'
  },
  {
    id: '3',
    name: 'Ghế Bành Bordeaux',
    category: Category.TableSet,
    material: Material.Composite,
    price: 8900000,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600',
    description: 'Bọc nhung đỏ vang mềm mại, tinh tế.'
  },
  {
    id: '4',
    name: 'Tượng Trang Trí Abstract',
    category: Category.Decoration,
    material: Material.Cement,
    price: 2300000,
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600',
    description: 'Tác phẩm nghệ thuật đương đại.'
  },
  {
    id: '5',
    name: 'Bồn Rửa Lava Stone',
    category: Category.Others,
    material: Material.Cement,
    price: 6800000,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600',
    description: 'Bồn rửa đá mài nguyên khối, tinh xảo từng đường nét.'
  },
  {
    id: '6',
    name: 'Kệ Treo Tường Modular',
    category: Category.Decoration,
    material: Material.Composite,
    price: 3200000,
    imageUrl: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?q=80&w=600',
    description: 'Hệ kệ module linh hoạt, tùy biến theo không gian.'
  },
  {
    id: '7',
    name: 'Bộ Bàn Ăn Monolith',
    category: Category.TableSet,
    material: Material.Cement,
    price: 15500000,
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=600',
    description: 'Bàn ăn xi măng nguyên khối cho 6 người, chân thép đen.'
  },
  {
    id: '8',
    name: 'Đèn Sàn Ambient Arc',
    category: Category.Decoration,
    material: Material.Composite,
    price: 4700000,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?q=80&w=600',
    description: 'Đèn sàn cung hình, ánh sáng ấm lan tỏa tinh tế.'
  },
];

export const AI_SUGGESTIONS: AIWorkshopSuggestion[] = [
  { id: '1', label: 'Tối giản (Minimalist)', prompt: 'ultra-minimalist luxury design with clean sharp lines and monochromatic palette' },
  { id: '2', label: 'Chân vàng Gold', prompt: 'elegant polished gold metal legs and gold leaf accents' },
  { id: '3', label: 'Bọc nhung Đỏ Vang', prompt: 'luxurious deep wine red velvet upholstery with tufted details' },
  { id: '4', label: 'Đường cong mềm mại', prompt: 'organic soft fluid curves, sculptural furniture design' },
  { id: '5', label: 'Industrial Luxe', prompt: 'industrial chic with raw concrete texture and aged metal' },
  { id: '6', label: 'Cây xanh (Biophilic)', prompt: 'biophilic design, integrated indoor plants, natural harmony between wood and greenery' },
  { id: '7', label: 'Art Deco', prompt: 'glamorous art deco style, symmetrical geometric patterns, brass and mirror finishes' },
  { id: '8', label: 'Thô mộc Brutalist', prompt: 'brutalist architecture style, raw heavy concrete textures, massive monolithic forms' },
  { id: '9', label: 'Bê tông tối giản', prompt: 'minimalist polished concrete, pure geometric purity, architectural starkness' },
  { id: '10', label: 'Ánh sáng Ambient', prompt: 'integrated warm LED ambient lighting, glowing edges' },
  { id: '11', label: 'Zen Nhật Bản', prompt: 'Japanese Zen aesthetic, wabi-sabi concrete, minimal wood elements' },
  { id: '12', label: 'Đá Cẩm Thạch', prompt: 'veined white marble surfaces with gold inlay' },
];
