#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables
const envPath = '.env';
let supabaseUrl, supabaseAnonKey;

try {
  const envContent = readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    if (line.startsWith('VITE_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1];
    }
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
      supabaseAnonKey = line.split('=')[1];
    }
  }
} catch (error) {
  console.log('❌ Could not read .env file. Please run "npm run setup" first.');
  process.exit(1);
}

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your_supabase') || supabaseAnonKey.includes('your_supabase')) {
  console.log('❌ Supabase credentials not configured. Please update your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🌱 Seeding database with 10 products...\n');

// Categories (5 categories)
const categories = [
  {
    id: 'cat_electronics',
    name: 'Electronics',
    name_fr: 'Électronique',
    description: 'Smartphones, laptops, tablets, accessories',
    description_fr: 'Smartphones, ordinateurs portables, tablettes, accessoires'
  },
  {
    id: 'cat_fashion',
    name: 'Fashion & Clothing',
    name_fr: 'Mode et Vêtements',
    description: 'Clothing, shoes, accessories, jewelry',
    description_fr: 'Vêtements, chaussures, accessoires, bijoux'
  },
  {
    id: 'cat_home',
    name: 'Home & Garden',
    name_fr: 'Maison et Jardin',
    description: 'Furniture, decor, tools, plants',
    description_fr: 'Meubles, décoration, outils, plantes'
  },
  {
    id: 'cat_beauty',
    name: 'Beauty & Personal Care',
    name_fr: 'Beauté et Soins Personnels',
    description: 'Cosmetics, skincare, fragrances, grooming',
    description_fr: 'Cosmétiques, soins de la peau, parfums, toilettage'
  },
  {
    id: 'cat_sports',
    name: 'Sports & Fitness',
    name_fr: 'Sports et Fitness',
    description: 'Exercise equipment, sportswear, outdoor gear',
    description_fr: 'Équipement d\'exercice, vêtements de sport, équipement de plein air'
  }
];

// 10 diverse products
const products = [
  // Electronics
  {
    id: 'prod_smartphone_1',
    name: 'Samsung Galaxy A54 5G',
    name_fr: 'Samsung Galaxy A54 5G',
    description: 'Latest Android smartphone with 128GB storage, excellent camera, and 5G connectivity',
    description_fr: 'Dernier smartphone Android avec 128 Go de stockage, excellent appareil photo et connectivité 5G',
    price: 285000,
    category_id: 'cat_electronics',
    image_url: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
    gallery_images: [
      'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
      'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg',
      'https://images.pexels.com/photos/1440727/pexels-photo-1440727.jpeg'
    ],
    model_url: '/models/smartphone.glb',
    stock: 25,
    active: true,
    is_featured: true,
    discount_percentage: 15
  },
  {
    id: 'prod_headphones_1',
    name: 'Sony WH-1000XM4 Wireless',
    name_fr: 'Sony WH-1000XM4 Sans Fil',
    description: 'Premium noise-canceling headphones with superior sound quality and 30-hour battery',
    description_fr: 'Casque haut de gamme à réduction de bruit avec une qualité sonore supérieure et batterie 30h',
    price: 125000,
    category_id: 'cat_electronics',
    image_url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
    gallery_images: [
      'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
      'https://images.pexels.com/photos/3945667/pexels-photo-3945667.jpeg',
      'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg'
    ],
    stock: 18,
    active: true,
    is_featured: true,
    discount_percentage: 20
  },
  
  // Fashion
  {
    id: 'prod_dress_1',
    name: 'African Print Summer Dress',
    name_fr: 'Robe d\'été à Imprimé Africain',
    description: 'Beautiful handmade dress with traditional African patterns and modern cut',
    description_fr: 'Belle robe artisanale avec des motifs africains traditionnels et coupe moderne',
    price: 35000,
    category_id: 'cat_fashion',
    image_url: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg',
    gallery_images: [
      'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg',
      'https://images.pexels.com/photos/1926770/pexels-photo-1926770.jpeg',
      'https://images.pexels.com/photos/1926771/pexels-photo-1926771.jpeg'
    ],
    stock: 15,
    active: true,
    is_featured: true,
    discount_percentage: 25
  },
  {
    id: 'prod_shoes_1',
    name: 'Nike Air Max 270 Sneakers',
    name_fr: 'Baskets Nike Air Max 270',
    description: 'Comfortable and stylish sneakers with Air Max cushioning technology',
    description_fr: 'Baskets confortables et élégantes avec technologie d\'amortissement Air Max',
    price: 75000,
    category_id: 'cat_fashion',
    image_url: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
    gallery_images: [
      'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
      'https://images.pexels.com/photos/2529149/pexels-photo-2529149.jpeg',
      'https://images.pexels.com/photos/2529150/pexels-photo-2529150.jpeg'
    ],
    stock: 30,
    active: true,
    is_featured: false,
    discount_percentage: 0
  },
  
  // Home
  {
    id: 'prod_chair_1',
    name: 'Ergonomic Office Chair',
    name_fr: 'Chaise de Bureau Ergonomique',
    description: 'Ergonomic office chair with lumbar support, adjustable height, and breathable mesh',
    description_fr: 'Chaise de bureau ergonomique avec support lombaire, hauteur réglable et maille respirante',
    price: 95000,
    category_id: 'cat_home',
    image_url: 'https://images.pexels.com/photos/586763/pexels-photo-586763.jpeg',
    gallery_images: [
      'https://images.pexels.com/photos/586763/pexels-photo-586763.jpeg',
      'https://images.pexels.com/photos/586764/pexels-photo-586764.jpeg',
      'https://images.pexels.com/photos/586765/pexels-photo-586765.jpeg'
    ],
    stock: 20,
    active: true,
    is_featured: false,
    discount_percentage: 0
  },
  {
    id: 'prod_plant_1',
    name: 'Indoor Plant Collection (3 Plants)',
    name_fr: 'Collection de Plantes d\'Intérieur (3 Plantes)',
    description: 'Set of 3 beautiful air-purifying indoor plants with decorative pots and care guide',
    description_fr: 'Ensemble de 3 belles plantes d\'intérieur purificatrices d\'air avec pots décoratifs et guide d\'entretien',
    price: 25000,
    category_id: 'cat_home',
    image_url: 'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg',
    gallery_images: [
      'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg',
      'https://images.pexels.com/photos/1084200/pexels-photo-1084200.jpeg',
      'https://images.pexels.com/photos/1084201/pexels-photo-1084201.jpeg'
    ],
    stock: 40,
    active: true,
    is_featured: true,
    discount_percentage: 20
  },
  
  // Beauty
  {
    id: 'prod_perfume_1',
    name: 'Luxury Eau de Parfum',
    name_fr: 'Eau de Parfum de Luxe',
    description: 'Premium fragrance with long-lasting scent and elegant packaging',
    description_fr: 'Parfum premium avec parfum longue durée et emballage élégant',
    price: 65000,
    category_id: 'cat_beauty',
    image_url: 'https://images.pexels.com/photos/2648706/pexels-photo-2648706.jpeg',
    gallery_images: [
      'https://images.pexels.com/photos/2648706/pexels-photo-2648706.jpeg',
      'https://images.pexels.com/photos/2648707/pexels-photo-2648707.jpeg',
      'https://images.pexels.com/photos/2648708/pexels-photo-2648708.jpeg'
    ],
    stock: 25,
    active: true,
    is_featured: false,
    discount_percentage: 0
  },
  {
    id: 'prod_skincare_1',
    name: 'Anti-Aging Serum Set',
    name_fr: 'Set de Sérum Anti-Âge',
    description: 'Complete skincare set with vitamin C serum and hyaluronic acid for youthful skin',
    description_fr: 'Set de soins complet avec sérum à la vitamine C et acide hyaluronique pour une peau jeune',
    price: 45000,
    category_id: 'cat_beauty',
    image_url: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg',
    gallery_images: [
      'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg',
      'https://images.pexels.com/photos/4041393/pexels-photo-4041393.jpeg',
      'https://images.pexels.com/photos/4041394/pexels-photo-4041394.jpeg'
    ],
    stock: 30,
    active: true,
    is_featured: true,
    discount_percentage: 15
  },
  
  // Sports
  {
    id: 'prod_yogamat_1',
    name: 'Premium Yoga Mat',
    name_fr: 'Tapis de Yoga Premium',
    description: 'Eco-friendly yoga mat with non-slip surface and comfortable cushioning',
    description_fr: 'Tapis de yoga écologique avec surface antidérapante et rembourrage confortable',
    price: 35000,
    category_id: 'cat_sports',
    image_url: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg',
    gallery_images: [
      'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg',
      'https://images.pexels.com/photos/4056724/pexels-photo-4056724.jpeg',
      'https://images.pexels.com/photos/4056725/pexels-photo-4056725.jpeg'
    ],
    stock: 35,
    active: true,
    is_featured: false,
    discount_percentage: 0
  },
  {
    id: 'prod_dumbbells_1',
    name: 'Adjustable Dumbbell Set',
    name_fr: 'Set d\'Haltères Réglables',
    description: 'Space-saving adjustable dumbbells with multiple weight options for home workouts',
    description_fr: 'Haltères réglables économes en espace avec plusieurs options de poids pour les entraînements à domicile',
    price: 85000,
    category_id: 'cat_sports',
    image_url: 'https://images.pexels.com/photos/221247/pexels-photo-221247.jpeg',
    gallery_images: [
      'https://images.pexels.com/photos/221247/pexels-photo-221247.jpeg',
      'https://images.pexels.com/photos/221248/pexels-photo-221248.jpeg',
      'https://images.pexels.com/photos/221249/pexels-photo-221249.jpeg'
    ],
    stock: 15,
    active: true,
    is_featured: true,
    discount_percentage: 10
  }
];

// Demo users (for testing - in production, users would register normally)
const demoUsers = [
  {
    email: 'admin@demo.com',
    password: 'admin123',
    is_admin: true
  },
  {
    email: 'user@demo.com',
    password: 'user123',
    is_admin: false
  }
];

async function seedData() {
  try {
    // Seed categories
    console.log('📁 Adding 5 categories...');
    const { error: categoriesError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'id' });

    if (categoriesError) {
      console.error('Error seeding categories:', categoriesError);
      return;
    }
    console.log('✅ Categories added successfully');

    // Seed products
    console.log('📦 Adding 10 products...');
    const { error: productsError } = await supabase
      .from('products')
      .upsert(products, { onConflict: 'id' });

    if (productsError) {
      console.error('Error seeding products:', productsError);
      return;
    }
    console.log('✅ Products added successfully');

    // Create demo users
    console.log('👥 Creating demo users...');
    for (const user of demoUsers) {
      const { error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
      });

      if (error && !error.message.includes('already registered')) {
        console.error(`Error creating user ${user.email}:`, error);
      } else {
        console.log(`✅ Demo user created: ${user.email}`);
      }
    }

    console.log('\n🎉 Database seeded successfully with 10 products!');
    console.log('\n📋 Demo Credentials:');
    console.log('Admin: admin@demo.com / admin123');
    console.log('User:  user@demo.com / user123');
    console.log('\n📊 Database Statistics:');
    console.log(`Categories: ${categories.length}`);
    console.log(`Products: ${products.length}`);
    console.log(`Featured Products: ${products.filter(p => p.is_featured).length}`);
    console.log(`Products on Sale: ${products.filter(p => p.discount_percentage > 0).length}`);
    console.log('\n🚀 Run "npm run dev" to start the enhanced 3D shopping experience!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedData();