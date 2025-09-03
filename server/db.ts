import { MongoClient } from 'mongodb';

const CONNECTION_STRING = process.env.DATABASE_URL || 'mongodb+srv://walmeseged_db_user:A1l2m3e4s5@gift.k3fycs2.mongodb.net/?retryWrites=true&w=majority&appName=Gift';

let db: any = null;
let client: any = null;

export async function connectToDatabase() {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(CONNECTION_STRING);
    await client.connect();
    db = client.db('temer_properties');
    console.log('Connected to MongoDB Atlas');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function getCollection(collectionName: string) {
  const database = await connectToDatabase();
  return database.collection(collectionName);
}

export { client };