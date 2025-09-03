import { db } from './db.js';
import { eq, desc, and, like, gte, lte, ilike } from 'drizzle-orm';
import bcrypt from 'bcrypt';

import { 
  users,
  properties,
  projects,
  constructionUpdates,
  blogPosts,
  teamMembers,
  leads,
  settings
} from "@shared/schema";

import type { 
  User, 
  InsertUser, 
  Property, 
  InsertProperty,
  Project,
  InsertProject,
  ConstructionUpdate,
  InsertConstructionUpdate,
  BlogPost,
  InsertBlogPost,
  TeamMember,
  InsertTeamMember,
  Lead,
  InsertLead,
  Settings,
  InsertSettings,
  Json
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Property methods
  getProperties(filters?: any): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  getPropertyBySlug(slug: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: Partial<Property>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;
  getFeaturedProperties(): Promise<Property[]>;

  // Project methods
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Construction Update methods
  getConstructionUpdates(projectId?: string): Promise<ConstructionUpdate[]>;
  createConstructionUpdate(update: InsertConstructionUpdate): Promise<ConstructionUpdate>;
  updateConstructionUpdate(id: string, update: Partial<ConstructionUpdate>): Promise<ConstructionUpdate | undefined>;
  deleteConstructionUpdate(id: string): Promise<boolean>;

  // Blog methods
  getBlogPosts(status?: string): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: string, post: Partial<BlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: string): Promise<boolean>;

  // Team methods
  getTeamMembers(): Promise<TeamMember[]>;
  getTeamMember(id: string): Promise<TeamMember | undefined>;
  createTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  updateTeamMember(id: string, member: Partial<TeamMember>): Promise<TeamMember | undefined>;
  deleteTeamMember(id: string): Promise<boolean>;

  // Lead methods
  getLeads(): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, lead: Partial<Lead>): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<boolean>;

  // Settings methods
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: Partial<Settings>): Promise<Settings>;
}

export class PostgreSQLStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.passwordHash, 10);
    const result = await db.insert(users).values({
      ...user,
      passwordHash: hashedPassword,
    }).returning();
    return result[0];
  }

  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    try {
      const updateData = { ...user };
      if (updateData.passwordHash) {
        updateData.passwordHash = await bcrypt.hash(updateData.passwordHash, 10);
      }
      const result = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
      return result[0] || undefined;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      const result = await db.delete(users).where(eq(users.id, id));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Property methods
  async getProperties(filters: any = {}): Promise<Property[]> {
    try {
      let query = db.select().from(properties);
      const conditions = [];

      if (filters.location) {
        conditions.push(ilike(properties.location, `%${filters.location}%`));
      }
      if (filters.propertyType) {
        conditions.push(eq(properties.propertyType, filters.propertyType));
      }
      if (filters.bedrooms) {
        conditions.push(gte(properties.bedrooms, parseInt(filters.bedrooms)));
      }
      if (filters.status) {
        conditions.push(eq(properties.status, filters.status));
      }
      if (filters.minPrice) {
        conditions.push(gte(properties.priceETB, filters.minPrice));
      }
      if (filters.maxPrice) {
        conditions.push(lte(properties.priceETB, filters.maxPrice));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const result = await query.orderBy(desc(properties.createdAt));
      return result.map(row => ({
        ...row,
        amenities: row.amenities as Json,
        images: row.images as Json,
        coordinates: row.coordinates as Json
      }));
    } catch (error) {
      console.error('Error getting properties:', error);
      return [];
    }
  }

  async getProperty(id: string): Promise<Property | undefined> {
    try {
      const result = await db.select().from(properties).where(eq(properties.id, parseInt(id))).limit(1);
      const property = result[0];
      if (!property) return undefined;
      return {
        ...property,
        amenities: property.amenities as Json,
        images: property.images as Json,
        coordinates: property.coordinates as Json
      };
    } catch (error) {
      console.error('Error getting property:', error);
      return undefined;
    }
  }

  async getPropertyBySlug(slug: string): Promise<Property | undefined> {
    try {
      const result = await db.select().from(properties).where(eq(properties.slug, slug)).limit(1);
      const property = result[0];
      if (!property) return undefined;
      return {
        ...property,
        amenities: property.amenities as Json,
        images: property.images as Json,
        coordinates: property.coordinates as Json
      };
    } catch (error) {
      console.error('Error getting property by slug:', error);
      return undefined;
    }
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const result = await db.insert(properties).values(property).returning();
    return result[0];
  }

  async updateProperty(id: string, property: Partial<Property>): Promise<Property | undefined> {
    try {
      const result = await db.update(properties).set(property).where(eq(properties.id, parseInt(id))).returning();
      return result[0] || undefined;
    } catch (error) {
      console.error('Error updating property:', error);
      return undefined;
    }
  }

  async deleteProperty(id: string): Promise<boolean> {
    try {
      const result = await db.delete(properties).where(eq(properties.id, parseInt(id)));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting property:', error);
      return false;
    }
  }

  async getFeaturedProperties(): Promise<Property[]> {
    try {
      const result = await db.select().from(properties)
        .where(and(eq(properties.featured, true), eq(properties.status, 'active')))
        .limit(6);
      return result.map(row => ({
        ...row,
        amenities: row.amenities as Json,
        images: row.images as Json,
        coordinates: row.coordinates as Json
      }));
    } catch (error) {
      console.error('Error getting featured properties:', error);
      return [];
    }
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    try {
      const result = await db.select().from(projects).orderBy(desc(projects.createdAt));
      return result.map(row => ({
        ...row,
        images: row.images as Json
      }));
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  }

  async getProject(id: string): Promise<Project | undefined> {
    try {
      const result = await db.select().from(projects).where(eq(projects.id, parseInt(id))).limit(1);
      const project = result[0];
      if (!project) return undefined;
      return {
        ...project,
        images: project.images as Json
      };
    } catch (error) {
      console.error('Error getting project:', error);
      return undefined;
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(project).returning();
    return result[0];
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project | undefined> {
    try {
      const result = await db.update(projects).set(project).where(eq(projects.id, parseInt(id))).returning();
      return result[0] || undefined;
    } catch (error) {
      console.error('Error updating project:', error);
      return undefined;
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      const result = await db.delete(projects).where(eq(projects.id, parseInt(id)));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  // Construction Update methods
  async getConstructionUpdates(projectId?: string): Promise<ConstructionUpdate[]> {
    try {
      let query = db.select().from(constructionUpdates);
      
      if (projectId) {
        query = query.where(eq(constructionUpdates.projectId, parseInt(projectId)));
      }
      
      const result = await query.orderBy(desc(constructionUpdates.publishedAt));
      return result.map(row => ({
        ...row,
        images: row.images as Json
      }));
    } catch (error) {
      console.error('Error getting construction updates:', error);
      return [];
    }
  }

  async createConstructionUpdate(update: InsertConstructionUpdate): Promise<ConstructionUpdate> {
    const result = await db.insert(constructionUpdates).values(update).returning();
    return result[0];
  }

  async updateConstructionUpdate(id: string, update: Partial<ConstructionUpdate>): Promise<ConstructionUpdate | undefined> {
    try {
      const result = await db.update(constructionUpdates).set(update).where(eq(constructionUpdates.id, parseInt(id))).returning();
      return result[0] || undefined;
    } catch (error) {
      console.error('Error updating construction update:', error);
      return undefined;
    }
  }

  async deleteConstructionUpdate(id: string): Promise<boolean> {
    try {
      const result = await db.delete(constructionUpdates).where(eq(constructionUpdates.id, parseInt(id)));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting construction update:', error);
      return false;
    }
  }

  // Blog methods
  async getBlogPosts(status?: string): Promise<BlogPost[]> {
    try {
      let query = db.select().from(blogPosts);
      
      if (status) {
        query = query.where(eq(blogPosts.status, status));
      }
      
      const result = await query.orderBy(desc(blogPosts.publishedAt));
      return result.map(row => ({
        ...row,
        tags: row.tags as Json
      }));
    } catch (error) {
      console.error('Error getting blog posts:', error);
      return [];
    }
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    try {
      const result = await db.select().from(blogPosts).where(eq(blogPosts.id, parseInt(id))).limit(1);
      const post = result[0];
      if (!post) return undefined;
      return {
        ...post,
        tags: post.tags as Json
      };
    } catch (error) {
      console.error('Error getting blog post:', error);
      return undefined;
    }
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    try {
      const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
      const post = result[0];
      if (!post) return undefined;
      return {
        ...post,
        tags: post.tags as Json
      };
    } catch (error) {
      console.error('Error getting blog post by slug:', error);
      return undefined;
    }
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const result = await db.insert(blogPosts).values(post).returning();
    return result[0];
  }

  async updateBlogPost(id: string, post: Partial<BlogPost>): Promise<BlogPost | undefined> {
    try {
      const result = await db.update(blogPosts).set(post).where(eq(blogPosts.id, parseInt(id))).returning();
      return result[0] || undefined;
    } catch (error) {
      console.error('Error updating blog post:', error);
      return undefined;
    }
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    try {
      const result = await db.delete(blogPosts).where(eq(blogPosts.id, parseInt(id)));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return false;
    }
  }

  // Team methods
  async getTeamMembers(): Promise<TeamMember[]> {
    try {
      const result = await db.select().from(teamMembers).orderBy(teamMembers.order);
      return result;
    } catch (error) {
      console.error('Error getting team members:', error);
      return [];
    }
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    try {
      const result = await db.select().from(teamMembers).where(eq(teamMembers.id, parseInt(id))).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting team member:', error);
      return undefined;
    }
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const result = await db.insert(teamMembers).values(member).returning();
    return result[0];
  }

  async updateTeamMember(id: string, member: Partial<TeamMember>): Promise<TeamMember | undefined> {
    try {
      const result = await db.update(teamMembers).set(member).where(eq(teamMembers.id, parseInt(id))).returning();
      return result[0] || undefined;
    } catch (error) {
      console.error('Error updating team member:', error);
      return undefined;
    }
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    try {
      const result = await db.delete(teamMembers).where(eq(teamMembers.id, parseInt(id)));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting team member:', error);
      return false;
    }
  }

  // Lead methods
  async getLeads(): Promise<Lead[]> {
    try {
      const result = await db.select().from(leads).orderBy(desc(leads.createdAt));
      return result;
    } catch (error) {
      console.error('Error getting leads:', error);
      return [];
    }
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const result = await db.insert(leads).values(lead).returning();
    return result[0];
  }

  async updateLead(id: string, lead: Partial<Lead>): Promise<Lead | undefined> {
    try {
      const result = await db.update(leads).set(lead).where(eq(leads.id, parseInt(id))).returning();
      return result[0] || undefined;
    } catch (error) {
      console.error('Error updating lead:', error);
      return undefined;
    }
  }

  async deleteLead(id: string): Promise<boolean> {
    try {
      const result = await db.delete(leads).where(eq(leads.id, parseInt(id)));
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting lead:', error);
      return false;
    }
  }

  // Settings methods
  async getSettings(): Promise<Settings | undefined> {
    try {
      const result = await db.select().from(settings).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting settings:', error);
      return undefined;
    }
  }

  async updateSettings(settingsData: Partial<Settings>): Promise<Settings> {
    const existingSettings = await this.getSettings();
    
    if (existingSettings) {
      const result = await db.update(settings).set(settingsData).where(eq(settings.id, existingSettings.id)).returning();
      return result[0];
    } else {
      const result = await db.insert(settings).values(settingsData as InsertSettings).returning();
      return result[0];
    }
  }
}

export const storage = new PostgreSQLStorage();