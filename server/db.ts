import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = postgres(connectionString);
export const db = drizzle(sql, { schema });

console.log('Connected to PostgreSQL database');