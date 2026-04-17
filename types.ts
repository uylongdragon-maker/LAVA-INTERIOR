
// Category is now dynamic, but we keep the initial defaults as reference or fallback
export const DEFAULT_CATEGORIES = [
  'Bàn trà - Coffee Table',
  'Bàn ăn - Dining Table',
  'Ghế - Seat/Stool',
  'Chậu cây - Planter',
  'Trang trí - Decor',
  'Material Texture',
  'Khác - Others'
];

export enum Material {
  Cement = 'Bê tông - Cement',
  Composite = 'Sơn mài - Lacquer/Composite',
  Terrazzo = 'Đá mài - Terrazzo'
}

export enum ProductStatus {
  InStock = 'Còn hàng',
  OutOfStock = 'Hết hàng',
  PreOrder = 'Đặt trước'
}

export interface Product {
  id: string;
  name: string;
  category: string;
  material: Material;
  price: number;
  imageUrl: string; // Featured Image
  images: string[]; // Variations/Gallery
  description: string;
  stock: number;
  sku: string;
  status: ProductStatus;
  swatchGroups?: SwatchGroup[]; // For Catalogue Display
}

export interface SwatchGroup {
  title: string; // e.g. "Marble Patterns", "Lacquer Colors"
  swatches: SwatchItem[];
}

export interface SwatchItem {
  name?: string;
  color?: string; // Optional hex
  image: string; // URL to texture clip
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
  heroImage?: string;
  heroCtaText?: string;
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

  // Contact Page
  // Dynamic Product Management
  categories?: string[];
  
  // Catalogue Modal Layout
  modalLayout?: {
    headerTitle: string;
    showLogo: boolean;
    primaryColor?: string;
  };
}

export interface ClientSectionConfig {
  title: string;
  subtitle: string;
  desc: string;
  logos: string[];
  exhibitionImages: string[];
  bottomTitle: string;
  bottomDesc: string;
}

export interface CompanySectionConfig {
  factoryImg: string;
  factoryTitle: string;
  factoryDesc: string;
  
  sprayImg: string;
  sprayTitle: string;
  sprayDesc: string;
  
  centerTitle: string;
  centerDesc: string;
  
  features: {
    img: string;
    title: string;
    desc: string;
  }[];
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

export interface Showroom {
  city: string;
  address: string;
  label: string;
  img: string;
}

export interface ContactPageConfig {
  pageTitle: string;
  pageSubtitle: string;
  workingHours: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selected?: boolean;
}

export enum OrderStatus {
  Pending = 'Chờ xử lý',
  Processing = 'Đang xử lý',
  Shipping = 'Đang giao hàng',
  Completed = 'Hoàn thành',
  Cancelled = 'Đã hủy'
}

export enum PaymentMethod {
  BankQR = 'QR Ngân hàng',
  Napas = 'Thẻ NAPAS/VISA/MASTER'
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface SocialMetrics {
  likes: number;
  comments: number;
  shares: number;
}

export interface SocialPost {
  id: string;
  content: string;
  imageUrl?: string;
  platform: 'facebook' | 'instagram';
  metrics: SocialMetrics;
  createdAt: any;
  permalink?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'admin' | 'bot';
  text: string;
  timestamp: any;
}

export interface ChatSession {
  id: string;
  customerName: string;
  phone: string;
  status: 'active' | 'closed';
  messages: ChatMessage[];
  createdAt: any;
  csCode?: string; // e.g., CS-12345
}

export interface SocialConfig {
  fbPageId: string;
  fbAccessToken: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  vatAmount: number; // 8%
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: any;
  estimatedDeliveryDate?: string;
  notes?: string;
}

export interface PromotionCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  isActive: boolean;
  expiryDate?: string;
}
