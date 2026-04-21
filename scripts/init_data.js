import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, addDoc } from "firebase/firestore";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load ENV
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PRODUCTS = [
  {
    name: 'Bàn Trà Cementic',
    category: 'table_set',
    material: 'cement',
    price: 4500000,
    imageUrl: 'https://images.unsplash.com/photo-1594913785162-e6785b493bd2?q=80&w=800',
    description: 'Thiết kế tối giản từ bê tông mài cao cấp.',
    stock: 10,
    sku: 'LAVA-001',
    status: 'in_stock'
  },
  {
    name: 'Chậu Cây Lava Gold',
    category: 'plant_pot',
    material: 'composite',
    price: 1200000,
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800',
    description: 'Độ bền cao với lớp phủ vàng sang trọng.',
    stock: 20,
    sku: 'LAVA-002',
    status: 'in_stock'
  },
  {
    name: 'Ghế Bành Bordeaux',
    category: 'table_set',
    material: 'composite',
    price: 8900000,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800',
    description: 'Bọc nhung đỏ vang mềm mại, tinh tế.',
    stock: 5,
    sku: 'LAVA-003',
    status: 'in_stock'
  }
];

const SITE_CONFIG = {
  title: "Lava Interior",
  subtitle: "Creative Furniture Lab",
  logo: "https://lava-interior.vercel.app/logo.svg",
  heroTitle: "Lava Interior: <br /><span class='italic font-normal text-black dark:text-white'>Nghệ Thuật Sống</span>",
  heroSubtitle: "Kế Thừa & Đổi Mới",
  heroDesc: "Chúng tôi không chỉ kiến tạo nội thất, chúng tôi xây dựng những giấc mơ. Kết hợp chất liệu xi măng mài truyền thống với công nghệ AI đột phá.",
  heroImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200",
  homeIntro: {
    title: "Lava Interior: <br /><span class='italic font-normal text-black dark:text-white'>Nghệ Thuật Sống</span>",
    subtitle: "Kế Thừa & Đổi Mới",
    desc: "Chúng tôi không chỉ kiến tạo nội thất, chúng tôi xây dựng những giấc mơ. Kết hợp chất liệu xi măng mài truyền thống với công nghệ AI đột phá.",
    images: [
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600',
        'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=600',
        'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=600',
        'https://images.unsplash.com/photo-1505691938895-1758d7eaa511?q=80&w=600',
    ]
  },
  homeStats: [
    { value: '10+', label: 'Năm Kinh Nghiệm' },
    { value: '5000+', label: 'Dự Án Hoàn Thành' }
  ]
};

const PROMOTIONS = [
    {
        code: "LAVA10",
        value: 10,
        discountType: "percentage",
        minOrderAmount: 1000000,
        isActive: true,
        expiryDate: "2026-12-31"
    }
];

async function init() {
  console.log("🚀 Starting data initialization for project:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

  // 1. Init Site Config
  try {
    await setDoc(doc(db, "site_config", "main"), SITE_CONFIG);
    console.log("✅ Site config initialized.");
  } catch (e) {
    console.error("❌ Site config failed:", e);
  }

  // 2. Init Products
  try {
    for (const p of PRODUCTS) {
      await addDoc(collection(db, "products"), p);
    }
    console.log("✅ Products initialized.");
  } catch (e) {
    console.error("❌ Products failed:", e);
  }

  // 3. Init Promotions
  try {
      for (const promo of PROMOTIONS) {
          await addDoc(collection(db, "promotions"), promo);
      }
      console.log("✅ Promotions initialized.");
  } catch (e) {
      console.error("❌ Promotions failed:", e);
  }

  console.log("🎉 All data initialized successfully!");
  process.exit(0);
}

init();
