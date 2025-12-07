import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import Category from '../models/Category.model.js';
import connectDB from '../config/database.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create Categories
    console.log('📂 Creating categories...');
    const tshirtCategory = await Category.create({
      name: 'T-Shirts',
      description: 'Custom and regular t-shirts',
      isActive: true
    });
    const poloCategory = await Category.create({
      name: 'Polo Shirts',
      description: 'Premium polo shirts for custom designs',
      isActive: true
    });
    const hoodieCategory = await Category.create({
      name: 'Hoodies',
      description: 'Comfortable hoodies for custom artwork',
      isActive: true
    });
    console.log('✅ Categories created\n');

    // Create Admin User
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@12345', 10);
    
    const adminUser = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: process.env.ADMIN_EMAIL || 'admin@customtshirt.com',
      password: hashedPassword,
      role: 'admin'
    });
    console.log(`✅ Admin user created: ${adminUser.email}\n`);

    // Sample Products
    console.log('📦 Creating sample products...');
    
    const products = [
      // === CUSTOMIZABLE PRODUCTS (Blank Templates) ===
      {
        name: 'Blank White T-Shirt',
        description: 'Premium blank white t-shirt - perfect canvas for your custom designs. 100% cotton, comfortable fit.',
        price: 150000,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
            alt: 'Blank White T-Shirt',
            isPrimary: true
          }
        ],
        category: tshirtCategory._id,
        sizes: [
          { name: 'S', stock: 50 },
          { name: 'M', stock: 80 },
          { name: 'L', stock: 80 },
          { name: 'XL', stock: 50 },
          { name: 'XXL', stock: 30 }
        ],
        variantColors: [
          { name: 'White', hexCode: '#FFFFFF' }
        ],
        isCustomizable: true,
        isFeatured: true,
        status: 'active',
        material: '100% Cotton'
      },
      {
        name: 'Blank Black T-Shirt',
        description: 'Classic blank black t-shirt for custom printing. High-quality fabric, ideal for colorful designs.',
        price: 160000,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
            alt: 'Blank Black T-Shirt',
            isPrimary: true
          }
        ],
        category: tshirtCategory._id,
        sizes: [
          { name: 'S', stock: 40 },
          { name: 'M', stock: 70 },
          { name: 'L', stock: 70 },
          { name: 'XL', stock: 40 },
          { name: 'XXL', stock: 20 }
        ],
        variantColors: [
          { name: 'Black', hexCode: '#000000' }
        ],
        isCustomizable: true,
        isFeatured: true,
        status: 'active',
        material: '100% Cotton'
      },
      {
        name: 'Blank Navy Blue T-Shirt',
        description: 'Navy blue blank tee ready for your creativity. Soft cotton blend, professional look.',
        price: 155000,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800',
            alt: 'Blank Navy Blue T-Shirt',
            isPrimary: true
          }
        ],
        category: tshirtCategory._id,
        sizes: [
          { name: 'S', stock: 30 },
          { name: 'M', stock: 60 },
          { name: 'L', stock: 60 },
          { name: 'XL', stock: 30 }
        ],
        variantColors: [
          { name: 'Navy Blue', hexCode: '#001F3F' }
        ],
        isCustomizable: true,
        isFeatured: false,
        status: 'active',
        material: '100% Cotton'
      },
      {
        name: 'Blank Gray T-Shirt',
        description: 'Versatile gray blank t-shirt for custom designs. Comfortable and stylish base.',
        price: 145000,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1622445275576-721325763afe?w=800',
            alt: 'Blank Gray T-Shirt',
            isPrimary: true
          }
        ],
        category: tshirtCategory._id,
        sizes: [
          { name: 'S', stock: 35 },
          { name: 'M', stock: 65 },
          { name: 'L', stock: 65 },
          { name: 'XL', stock: 35 }
        ],
        variantColors: [
          { name: 'Gray', hexCode: '#808080' }
        ],
        isCustomizable: true,
        isFeatured: false,
        status: 'active',
        material: '100% Cotton'
      },
      
      // === PRE-DESIGNED PRODUCTS (Ready to Buy) ===
      {
        name: 'Sunset Vibes T-Shirt',
        shortDescription: 'Trendy sunset graphic design',
        description: 'Beautiful sunset graphic t-shirt with vintage vibes. Pre-designed and ready to wear!',
        price: 249000,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
            alt: 'Sunset Vibes T-Shirt',
            isPrimary: true
          }
        ],
        category: tshirtCategory._id,
        sizes: [
          { name: 'S', stock: 20 },
          { name: 'M', stock: 35 },
          { name: 'L', stock: 35 },
          { name: 'XL', stock: 20 }
        ],
        variantColors: [
          { name: 'White', hexCode: '#FFFFFF' }
        ],
        isCustomizable: false,
        isFeatured: true,
        status: 'active',
        material: '100% Cotton'
      },
      {
        name: 'Urban Street T-Shirt',
        shortDescription: 'Bold street art design',
        description: 'Edgy urban street art design. Perfect for casual streetwear style.',
        price: 269000,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800',
            alt: 'Urban Street T-Shirt',
            isPrimary: true
          }
        ],
        category: tshirtCategory._id,
        sizes: [
          { name: 'S', stock: 15 },
          { name: 'M', stock: 30 },
          { name: 'L', stock: 30 },
          { name: 'XL', stock: 15 }
        ],
        variantColors: [
          { name: 'Black', hexCode: '#000000' }
        ],
        isCustomizable: false,
        isFeatured: true,
        status: 'active',
        material: '100% Cotton'
      },
      {
        name: 'Vintage Logo T-Shirt',
        shortDescription: 'Classic retro logo print',
        description: 'Retro-inspired logo design with vintage aesthetics. Timeless style.',
        price: 259000,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800',
            alt: 'Vintage Logo T-Shirt',
            isPrimary: true
          }
        ],
        category: tshirtCategory._id,
        sizes: [
          { name: 'S', stock: 25 },
          { name: 'M', stock: 40 },
          { name: 'L', stock: 40 },
          { name: 'XL', stock: 25 }
        ],
        variantColors: [
          { name: 'White', hexCode: '#FFFFFF' }
        ],
        isCustomizable: false,
        isFeatured: false,
        status: 'active',
        material: '100% Cotton'
      },
      {
        name: 'Minimalist Typography Tee',
        shortDescription: 'Clean modern typography',
        description: 'Sleek minimalist design with modern typography. Simple yet stylish.',
        price: 239000,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800',
            alt: 'Minimalist Typography Tee',
            isPrimary: true
          }
        ],
        category: tshirtCategory._id,
        sizes: [
          { name: 'S', stock: 20 },
          { name: 'M', stock: 35 },
          { name: 'L', stock: 35 },
          { name: 'XL', stock: 20 }
        ],
        variantColors: [
          { name: 'Black', hexCode: '#000000' }
        ],
        isCustomizable: false,
        isFeatured: false,
        status: 'active',
        material: '100% Cotton'
      },
      {
        name: 'Premium Polo Shirt',
        shortDescription: 'Classic polo with embroidered logo',
        description: 'Elegant polo shirt with premium embroidered logo. Perfect for business casual.',
        price: 349000,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800',
            alt: 'Premium Polo Shirt',
            isPrimary: true
          }
        ],
        category: poloCategory._id,
        sizes: [
          { name: 'S', stock: 15 },
          { name: 'M', stock: 25 },
          { name: 'L', stock: 25 },
          { name: 'XL', stock: 15 }
        ],
        variantColors: [
          { name: 'Navy Blue', hexCode: '#001F3F' }
        ],
        isCustomizable: false,
        isFeatured: false,
        status: 'active',
        material: 'Pique Cotton'
      },
      {
        name: 'Graphic Hoodie',
        shortDescription: 'Cool graphic print hoodie',
        description: 'Cozy hoodie with eye-catching graphic design. Perfect for cooler days.',
        price: 449000,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
            alt: 'Graphic Hoodie',
            isPrimary: true
          }
        ],
        category: hoodieCategory._id,
        sizes: [
          { name: 'S', stock: 10 },
          { name: 'M', stock: 20 },
          { name: 'L', stock: 20 },
          { name: 'XL', stock: 10 }
        ],
        variantColors: [
          { name: 'Black', hexCode: '#000000' }
        ],
        isCustomizable: false,
        isFeatured: true,
        status: 'active',
        material: '80% Cotton, 20% Polyester'
      }
    ];

    // Use create() instead of insertMany() to trigger pre-save hooks for slug generation
    const createdProducts = await Product.create(products);
    console.log(`✅ Created ${createdProducts.length} products\n`);

    // Summary
    console.log('📊 Seeding Summary:');
    console.log(`   - Admin Users: 1`);
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Customizable Products: ${createdProducts.filter(p => p.isCustomizable).length}`);
    console.log(`   - Featured Products: ${createdProducts.filter(p => p.isFeatured).length}\n`);

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📝 Admin Credentials:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin@12345'}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
seedDatabase();
