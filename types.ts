
export enum Category {
  TableSet = 'Bộ Bàn Ghế',
  PlantPot = 'Chậu Cây',
  Decoration = 'Trang Trí',
  Others = 'Khác'
}

export enum Material {
  Cement = 'Xi măng - Cement',
  Composite = 'Composite'
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  material: Material;
  price: number;
  imageUrl: string;
  description: string;
}

export interface AIWorkshopSuggestion {
  id: string;
  label: string;
  prompt: string;
}
