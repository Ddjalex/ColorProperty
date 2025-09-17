// Referenced from javascript_database integration
const { pgTable, serial, varchar, text, integer, boolean, timestamp, decimal } = require('drizzle-orm/pg-core');

// Users table
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 50 }).default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Properties table
const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  description: text('description'),
  location: varchar('location', { length: 255 }),
  propertyType: varchar('property_type', { length: 100 }),
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  sizeSqm: integer('size_sqm'),
  priceETB: decimal('price_etb', { precision: 15, scale: 2 }),
  status: varchar('status', { length: 50 }).default('active'),
  featured: boolean('featured').default(false),
  images: text('images'), // JSON string
  amenities: text('amenities'), // JSON string
  coordinates: text('coordinates'), // JSON string
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Blog posts table
const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  content: text('content'),
  status: varchar('status', { length: 50 }).default('draft'),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Team members table
const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  position: varchar('position', { length: 255 }),
  bio: text('bio'),
  image: text('image'),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow()
});

// Leads table
const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  message: text('message'),
  createdAt: timestamp('created_at').defaultNow()
});

// Settings table
const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  companyName: varchar('company_name', { length: 255 }),
  companyDescription: text('company_description'),
  contactPhone: varchar('contact_phone', { length: 50 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  whatsappNumber: varchar('whatsapp_number', { length: 50 }),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Hero slides table
const heroSlides = pgTable('hero_slides', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }),
  subtitle: text('subtitle'),
  imageUrl: text('image_url'),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

module.exports = {
  users,
  properties,
  blogPosts,
  teamMembers,
  leads,
  settings,
  heroSlides
};