
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

export enum ProductStatus {
  InStock = 'Còn hàng',
  OutOfStock = 'Hết hàng',
  PreOrder = 'Đặt trước'
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  material: Material;
  price: number;
  imageUrl: string;
  description: string;
  stock: number;
  sku: string;
  status: ProductStatus;
}




export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  author: string;
  createdAt: any;
  status: 'draft' | 'published';
}

export interface SiteConfig {
  // Hero
  heroTitle: string;
  heroSubtitle: string;
  logo?: string;

  // Contact & Footer
  contactEmail: string;
  contactPhone: string;
  address: string;
  footerDescription: string;
  socialFacebook: string;
  socialInstagram: string;

  // Workshop (Home)
  workshopTitle: string;
  workshopDescription: string;

  // About Page
  aboutTitle: string;
  aboutDescription: string;
  aboutImage: string;

  // Section Titles
  sectionTitleMaterials: string;

  // Deep CMS Arrays
  values: CoreValue[];
  milestones: Milestone[];
  team: TeamMember[];

  // Home Page
  homeCollections: HomeCollectionItem[];
  homeStats: HomeStat[];
  homeIntro: HomeIntro;
}

export interface CoreValue {
  icon: string;
  title: string;
  desc: string;
}

export interface Milestone {
  year: string;
  title: string;
  desc: string;
}

export interface TeamMember {
  name: string;
  role: string;
  img: string;
}

export interface HomeCollectionItem {
  title: string;
  desc: string;
  img: string;
  isAi?: boolean;
}

export interface HomeStat {
  value: string;
  label: string;
}

export interface HomeIntro {
  title: string;
  subtitle: string;
  desc: string;
  images: string[];
}

export enum OrderStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled'
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: any;
  aiAnalysis?: string;
}
