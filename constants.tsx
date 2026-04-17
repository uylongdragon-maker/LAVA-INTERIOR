
import { Material, Product, ProductStatus } from './types';

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
    name: 'Ghế Đôn Composite',
    category: 'Ghế - Seat/Stool',
    material: Material.Composite,
    price: 3200000,
    imageUrl: 'https://images.unsplash.com/photo-1594913785162-e6785b493bd2?q=80&w=600',
    images: [
      'https://images.unsplash.com/photo-1594913785162-e6785b493bd2?q=80&w=600',
      'https://images.unsplash.com/photo-1594913785162-e6785b493bd2?q=80&w=600',
      'https://images.unsplash.com/photo-1594913785162-e6785b493bd2?q=80&w=600'
    ],
    description: 'Composite Lacquer Seat with high-gloss finish.',
    stock: 15,
    sku: 'LAVA-S01',
    status: ProductStatus.InStock,
    swatchGroups: [
      {
        title: 'Marble Patterns',
        swatches: [
          { image: 'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?q=80&w=100' },
          { image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=100' },
          { image: 'https://images.unsplash.com/photo-1634712282287-14ed57b9cc89?q=80&w=100' }
        ]
      },
      {
        title: 'Lacquer Colors',
        swatches: [
          { color: '#4F46E5', image: '' },
          { color: '#DC2626', image: '' },
          { color: '#7C3AED', image: '' },
          { color: '#FBBF24', image: '' }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Bàn Trà Cementic Monolith',
    category: 'Bàn trà - Coffee Table',
    material: Material.Cement,
    price: 5500000,
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=600',
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=600',
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=600'
    ],
    description: 'Bàn trà bê tông mài nguyên khối.',
    stock: 8,
    sku: 'LAVA-T01',
    status: ProductStatus.InStock,
    swatchGroups: [
      {
        title: 'Color & Patterns',
        swatches: [
          { image: 'https://images.unsplash.com/photo-1541625602330-2277a1cd13a2?q=80&w=100' },
          { image: 'https://images.unsplash.com/photo-1516131238440-96f7c70c06cc?q=80&w=100' },
          { image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=100' }
        ]
      }
    ]
  }
];


