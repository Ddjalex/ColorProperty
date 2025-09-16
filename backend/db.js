require('dotenv').config();
const { MongoClient } = require('mongodb');

let db = null;
let client = null;

async function connectToDatabase() {
  try {
    if (db) {
      return { db, client };
    }

    const uri = process.env.MONGODB_URI || 'mongodb+srv://walmeseged_db_user:A1l2m3e4s5@gift.k3fycs2.mongodb.net/?retryWrites=true&w=majority&appName=Gift';
    
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    db = client.db();
    
    console.log('Connected to MongoDB Atlas');
    
    // Create indexes
    await createIndexes();
    
    return { db, client };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

async function createIndexes() {
  try {
    // Properties indexes
    await db.collection('properties').createIndex({ slug: 1 }, { unique: true });
    await db.collection('properties').createIndex({ status: 1 });
    await db.collection('properties').createIndex({ featured: 1 });
    await db.collection('properties').createIndex({ propertyType: 1 });
    
    // Team members index
    await db.collection('team_members').createIndex({ order: 1 });
    
    // Blog posts indexes  
    await db.collection('blog_posts').createIndex({ slug: 1 }, { unique: true });
    await db.collection('blog_posts').createIndex({ status: 1 });
    
    // Hero slides index
    await db.collection('hero_slides').createIndex({ order: 1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

async function closeDatabase() {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('MongoDB connection closed');
  }
}

module.exports = {
  connectToDatabase,
  closeDatabase,
  getDb: () => db,
  getClient: () => client
};