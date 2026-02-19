
import { Category, Material, Product, ProductStatus } from './types';

export const COLORS = {
  white: '#FFFFFF',
  primary: '#DC2626', // Red-600 for 'hover màu đỏ'
  secondary: '#78350F', // Deep Warm Brown
  accent: '#CA8A04', // Deep Gold
  background: '#FFF7ED', // Light Orange/Cream
  text: '#3E2723', // Dark Brown for 'chữ màu nâu'
};

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Bàn Trà Cementic',
    category: Category.TableSet,
    material: Material.Cement,
    price: 4500000,
    imageUrl: 'https://images.unsplash.com/photo-1594913785162-e6785b493bd2?q=80&w=600',
    description: 'Thiết kế tối giản từ bê tông mài cao cấp.',
    stock: 10,
    sku: 'LAVA-001',
    status: ProductStatus.InStock
  },
  {
    id: '2',
    name: 'Chậu Cây Lava Gold',
    category: Category.PlantPot,
    material: Material.Composite,
    price: 1200000,
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600',
    description: 'Độ bền cao với lớp phủ vàng sang trọng.',
    stock: 20,
    sku: 'LAVA-002',
    status: ProductStatus.InStock
  },
  {
    id: '3',
    name: 'Ghế Bành Bordeaux',
    category: Category.TableSet,
    material: Material.Composite,
    price: 8900000,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600',
    description: 'Bọc nhung đỏ vang mềm mại, tinh tế.',
    stock: 5,
    sku: 'LAVA-003',
    status: ProductStatus.InStock
  },
  {
    id: '4',
    name: 'Tượng Trang Trí Abstract',
    category: Category.Decoration,
    material: Material.Cement,
    price: 2300000,
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600',
    description: 'Tác phẩm nghệ thuật đương đại.',
    stock: 15,
    sku: 'LAVA-004',
    status: ProductStatus.InStock
  },
  {
    id: '5',
    name: 'Bồn Rửa Lava Stone',
    category: Category.Others,
    material: Material.Cement,
    price: 6800000,
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600',
    description: 'Bồn rửa đá mài nguyên khối, tinh xảo từng đường nét.',
    stock: 8,
    sku: 'LAVA-005',
    status: ProductStatus.InStock
  },
  {
    id: '6',
    name: 'Kệ Treo Tường Modular',
    category: Category.Decoration,
    material: Material.Composite,
    price: 3200000,
    imageUrl: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?q=80&w=600',
    description: 'Hệ kệ module linh hoạt, tùy biến theo không gian.',
    stock: 12,
    sku: 'LAVA-006',
    status: ProductStatus.InStock
  },
  {
    id: '7',
    name: 'Bộ Bàn Ăn Monolith',
    category: Category.TableSet,
    material: Material.Cement,
    price: 15500000,
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=600',
    description: 'Bàn ăn xi măng nguyên khối cho 6 người, chân thép đen.',
    stock: 3,
    sku: 'LAVA-007',
    status: ProductStatus.PreOrder
  },
  {
    id: '8',
    name: 'Đèn Sàn Ambient Arc',
    category: Category.Decoration,
    material: Material.Composite,
    price: 4700000,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?q=80&w=600',
    description: 'Đèn sàn cung hình, ánh sáng ấm lan tỏa tinh tế.',
    stock: 7,
    sku: 'LAVA-008',
    status: ProductStatus.InStock
  },
];


