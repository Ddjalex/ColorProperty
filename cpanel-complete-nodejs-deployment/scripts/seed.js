// scripts/seed.js - Create admin user and sample data
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';

const CONNECTION_STRING = process.env.MONGODB_URI;

if (!CONNECTION_STRING) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

async function seedDatabase() {
  let client;
  
  try {
    console.log('🌱 Starting database seeding...');
    
    client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    const db = client.db('temer_properties');
    
    // 1. Create admin user
    console.log('👤 Creating admin user...');
    const usersCollection = db.collection('users');
    
    // Check if admin already exists
    const existingAdmin = await usersCollection.findOne({ email: 'admin@temer.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await usersCollection.insertOne({
        email: 'admin@temer.com',
        password: hashedPassword,
        role: 'admin',
        name: 'Admin User',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Admin user created: admin@temer.com / admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    // 2. Create sample properties
    console.log('🏠 Creating sample properties...');
    const propertiesCollection = db.collection('properties');
    
    const sampleProperties = [
      {
        title: 'Modern Villa in Bole',
        description: 'Beautiful 4-bedroom villa with modern amenities in the heart of Addis Ababa.',
        location: 'Bole, Addis Ababa',
        propertyType: 'villa',
        saleType: 'sale',
        priceETB: 15000000,
        bedrooms: 4,
        bathrooms: 3,
        area: 350,
        amenities: ['parking', 'garden', 'security', 'modern_kitchen'],
        status: 'available',
        featured: true,
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: 'modern-villa-bole-addis-ababa'
      },
      {
        title: 'Luxury Apartment in Kazanchis',
        description: 'Spacious 3-bedroom apartment with city views and premium finishes.',
        location: 'Kazanchis, Addis Ababa',
        propertyType: 'apartment',
        saleType: 'sale',
        priceETB: 8500000,
        bedrooms: 3,
        bathrooms: 2,
        area: 180,
        amenities: ['elevator', 'gym', 'pool', 'security'],
        status: 'available',
        featured: true,
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: 'luxury-apartment-kazanchis'
      },
      {
        title: 'Office Space in CMC',
        description: 'Prime commercial space perfect for businesses and startups.',
        location: 'CMC, Addis Ababa',
        propertyType: 'commercial',
        saleType: 'rent',
        priceETB: 85000,
        area: 120,
        amenities: ['parking', 'security', 'internet'],
        status: 'available',
        featured: false,
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: 'office-space-cmc'
      }
    ];
    
    // Check if properties already exist
    const existingProperties = await propertiesCollection.countDocuments();
    if (existingProperties === 0) {
      await propertiesCollection.insertMany(sampleProperties);
      console.log(`✅ ${sampleProperties.length} sample properties created`);
    } else {
      console.log(`ℹ️  ${existingProperties} properties already exist`);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

seedDatabase();