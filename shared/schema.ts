import { z } from "zod";

// User schema
export const userSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'editor', 'agent']),
  passwordHash: z.string(),
  createdAt: z.date().optional(),
});

export const insertUserSchema = userSchema.omit({ _id: true, createdAt: true });
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Property schema
export const propertySchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  location: z.string(),
  propertyType: z.enum(['apartment', 'house', 'commercial', 'shop', 'land']),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  sizeSqm: z.number(),
  priceETB: z.number(),
  status: z.enum(['active', 'draft', 'sold', 'rented']),
  featured: z.boolean().default(false),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  project: z.string().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertPropertySchema = propertySchema.omit({ _id: true, createdAt: true, updatedAt: true });
export type Property = z.infer<typeof propertySchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

// Project schema
export const projectSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  images: z.array(z.string()).default([]),
  delivered: z.boolean().default(false),
  location: z.string(),
  createdAt: z.date().optional(),
});

export const insertProjectSchema = projectSchema.omit({ _id: true, createdAt: true });
export type Project = z.infer<typeof projectSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;

// Construction Update schema
export const constructionUpdateSchema = z.object({
  _id: z.string().optional(),
  projectId: z.string(),
  title: z.string(),
  body: z.string(),
  images: z.array(z.string()).default([]),
  progressPercent: z.number().min(0).max(100),
  publishedAt: z.date().optional(),
  createdAt: z.date().optional(),
});

export const insertConstructionUpdateSchema = constructionUpdateSchema.omit({ _id: true, createdAt: true });
export type ConstructionUpdate = z.infer<typeof constructionUpdateSchema>;
export type InsertConstructionUpdate = z.infer<typeof insertConstructionUpdateSchema>;

// Blog Post schema
export const blogPostSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  body: z.string(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published']),
  publishedAt: z.date().optional(),
  authorId: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertBlogPostSchema = blogPostSchema.omit({ _id: true, createdAt: true, updatedAt: true });
export type BlogPost = z.infer<typeof blogPostSchema>;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

// Team Member schema
export const teamMemberSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  roleType: z.enum(['officer', 'agent']),
  phone: z.string(),
  whatsapp: z.string(),
  email: z.string().email().optional(),
  photoUrl: z.string().optional(),
  order: z.number().default(0),
  specialization: z.string().optional(),
  createdAt: z.date().optional(),
});

export const insertTeamMemberSchema = teamMemberSchema.omit({ _id: true, createdAt: true });
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

// Lead schema
export const leadSchema = z.object({
  _id: z.string().optional(),
  type: z.enum(['contact', 'schedule']),
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  message: z.string(),
  propertyId: z.string().optional(),
  preferredTime: z.date().optional(),
  createdAt: z.date().optional(),
});

export const insertLeadSchema = leadSchema.omit({ _id: true, createdAt: true });
export type Lead = z.infer<typeof leadSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;

// Hero Slide schema
export const heroSlideSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  subtitle: z.string(),
  imageUrl: z.string(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertHeroSlideSchema = heroSlideSchema.omit({ _id: true, createdAt: true, updatedAt: true });
export type HeroSlide = z.infer<typeof heroSlideSchema>;
export type InsertHeroSlide = z.infer<typeof insertHeroSlideSchema>;

// Settings schema
export const settingsSchema = z.object({
  _id: z.string().optional(),
  // Contact Information
  phoneNumber: z.string().default('0974408281'),
  whatsappNumber: z.string().default('0974408281'),
  email: z.string().email().optional(),
  supportEmail: z.string().email().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    country: z.string().default('Ethiopia'),
    postalCode: z.string().optional(),
  }).default({}),
  businessHours: z.object({
    monday: z.string().default('9:00 AM - 6:00 PM'),
    tuesday: z.string().default('9:00 AM - 6:00 PM'),
    wednesday: z.string().default('9:00 AM - 6:00 PM'),
    thursday: z.string().default('9:00 AM - 6:00 PM'),
    friday: z.string().default('9:00 AM - 6:00 PM'),
    saturday: z.string().default('9:00 AM - 4:00 PM'),
    sunday: z.string().default('Closed'),
  }).default({}),
  hotlineNumbers: z.array(z.string()).default([]),
  // Social Media
  socialLinks: z.object({
    facebook: z.string().optional(),
    youtube: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    telegram: z.string().optional(),
  }).default({}),
  // Communication
  whatsappTemplate: z.string().default("I'm interested in {propertyTitle} - {propertyPrice}. Property link: {propertyLink}"),
  // SEO
  seoDefaults: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.string().optional(),
  }).default({}),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const insertSettingsSchema = settingsSchema.omit({ _id: true, createdAt: true, updatedAt: true });
export type Settings = z.infer<typeof settingsSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;