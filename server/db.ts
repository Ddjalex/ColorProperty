import { MongoClient } from 'mongodb';

const CONNECTION_STRING = 'mongodb+srv://walmeseged_db_user:A1l2m3e4s5@gift.k3fycs2.mongodb.net/?retryWrites=true&w=majority&appName=Gift';

let db: any = null;
let client: any = null;

export async function connectToDatabase() {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(CONNECTION_STRING, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    await client.connect();
    db = client.db('temer_properties');
    
    // Create indexes for better performance
    await createIndexes();
    
    console.log('Connected to MongoDB Atlas');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

async function createIndexes() {
  try {
    // Properties indexes
    const propertiesCollection = db.collection('properties');
    await propertiesCollection.createIndex({ createdAt: -1 });
    await propertiesCollection.createIndex({ slug: 1 }, { unique: true });
    await propertiesCollection.createIndex({ status: 1 });
    await propertiesCollection.createIndex({ propertyType: 1 });
    await propertiesCollection.createIndex({ location: 1 });
    await propertiesCollection.createIndex({ priceETB: 1 });
    await propertiesCollection.createIndex({ featured: 1 });

    // Blog posts indexes
    const blogCollection = db.collection('blog_posts');
    await blogCollection.createIndex({ publishedAt: -1 });
    await blogCollection.createIndex({ slug: 1 }, { unique: true });
    await blogCollection.createIndex({ status: 1 });
    await blogCollection.createIndex({ authorId: 1 });

    // Team members indexes
    const teamCollection = db.collection('team_members');
    await teamCollection.createIndex({ order: 1 });

    // Hero slides indexes
    const slidesCollection = db.collection('hero_slides');
    await slidesCollection.createIndex({ order: 1 });
    await slidesCollection.createIndex({ isActive: 1 });

    // Users indexes
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    console.log('Database indexes created successfully');
  } catch (error) {
    // Ignore index creation errors (they may already exist)
    console.log('Indexes already exist or creation skipped');
  }
}

export async function getCollection(collectionName: string) {
  const database = await connectToDatabase();
  return database.collection(collectionName);
}

export { client };