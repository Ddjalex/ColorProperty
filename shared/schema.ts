import { z } from "zod";
import { pgTable, varchar, text, integer, boolean, timestamp, decimal, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Database Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  role: varchar("role", { length: 20 }).notNull().default("agent"),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  propertyType: varchar("property_type", { length: 50 }).notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  sizeSqm: decimal("size_sqm", { precision: 10, scale: 2 }).notNull(),
  priceETB: decimal("price_etb", { precision: 15, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  featured: boolean("featured").default(false),
  amenities: jsonb("amenities").default([]),
  images: jsonb("images").default([]),
  project: varchar("project", { length: 255 }),
  coordinates: jsonb("coordinates"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description").notNull(),
  images: jsonb("images").default([]),
  delivered: boolean("delivered").default(false),
  location: varchar("location", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const constructionUpdates = pgTable("construction_updates", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  images: jsonb("images").default([]),
  progressPercent: integer("progress_percent").notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  body: text("body").notNull(),
  coverImage: varchar("cover_image", { length: 500 }),
  tags: jsonb("tags").default([]),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  authorId: integer("author_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  roleType: varchar("role_type", { length: 50 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }),
  photoUrl: varchar("photo_url", { length: 500 }),
  order: integer("order").default(0),
  specialization: varchar("specialization", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  message: text("message").notNull(),
  propertyId: integer("property_id"),
  preferredTime: timestamp("preferred_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  hotlineNumbers: jsonb("hotline_numbers").default([]),
  socialLinks: jsonb("social_links").default({}),
  whatsappTemplate: text("whatsapp_template").default("I'm interested in {propertyTitle}"),
  seoDefaults: jsonb("seo_defaults").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Zod Schemas
export const userSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users);
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const propertySchema = createSelectSchema(properties);
export const insertPropertySchema = createInsertSchema(properties);
export type Property = z.infer<typeof propertySchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export const projectSchema = createSelectSchema(projects);
export const insertProjectSchema = createInsertSchema(projects);
export type Project = z.infer<typeof projectSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export const constructionUpdateSchema = createSelectSchema(constructionUpdates);
export const insertConstructionUpdateSchema = createInsertSchema(constructionUpdates);
export type ConstructionUpdate = z.infer<typeof constructionUpdateSchema>;
export type InsertConstructionUpdate = z.infer<typeof insertConstructionUpdateSchema>;

export const blogPostSchema = createSelectSchema(blogPosts);
export const insertBlogPostSchema = createInsertSchema(blogPosts);
export type BlogPost = z.infer<typeof blogPostSchema>;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export const teamMemberSchema = createSelectSchema(teamMembers);
export const insertTeamMemberSchema = createInsertSchema(teamMembers);
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export const leadSchema = createSelectSchema(leads);
export const insertLeadSchema = createInsertSchema(leads);
export type Lead = z.infer<typeof leadSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export const settingsSchema = createSelectSchema(settings);
export const insertSettingsSchema = createInsertSchema(settings);
export type Settings = z.infer<typeof settingsSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;