import { getCollection } from './db.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

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
  HeroSlide,
  InsertHeroSlide
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  // Property methods
  getProperties(filters?: any): Promise<{ properties: Property[], total: number }>;
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

  // Hero Slide methods
  getHeroSlides(): Promise<HeroSlide[]>;
  getHeroSlide(id: string): Promise<HeroSlide | undefined>;
  createHeroSlide(slide: InsertHeroSlide): Promise<HeroSlide>;
  updateHeroSlide(id: string, slide: Partial<HeroSlide>): Promise<HeroSlide | undefined>;
  deleteHeroSlide(id: string): Promise<boolean>;
}

export class MongoStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    try {
      const collection = await getCollection('users');
      if (!ObjectId.isValid(id)) {
        return undefined;
      }
      const user = await collection.findOne({ _id: new ObjectId(id) });
      return user || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const collection = await getCollection('users');
      const user = await collection.findOne({ email });
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    const collection = await getCollection('users');
    const hashedPassword = await bcrypt.hash(user.passwordHash, 10);
    const newUser = {
      ...user,
      passwordHash: hashedPassword,
      createdAt: new Date()
    };
    const result = await collection.insertOne(newUser);
    return { ...newUser, _id: result.insertedId.toString() };
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | undefined> {
    try {
      const collection = await getCollection('users');
      const updateData = { ...user, updatedAt: new Date() };
      if (updateData.passwordHash) {
        updateData.passwordHash = await bcrypt.hash(updateData.passwordHash, 10);
      }
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      return result.value || undefined;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const collection = await getCollection('users');
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Property methods
  async getProperties(filters: any = {}): Promise<{ properties: Property[], total: number }> {
    try {
      const collection = await getCollection('properties');
      const query: any = {};
      
      // Only show active properties by default unless admin is viewing
      if (!filters.includeAllStatuses) {
        query.status = { $in: ['active', 'sold', 'rented'] };
      }
      
      if (filters.location) {
        query.location = new RegExp(filters.location, 'i');
      }
      if (filters.propertyType) {
        query.propertyType = filters.propertyType;
      }
      if (filters.bedrooms) {
        query.bedrooms = { $gte: parseInt(filters.bedrooms) };
      }
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.minPrice) {
        query.priceETB = { $gte: parseInt(filters.minPrice) };
      }
      if (filters.maxPrice) {
        if (query.priceETB) {
          query.priceETB.$lte = parseInt(filters.maxPrice);
        } else {
          query.priceETB = { $lte: parseInt(filters.maxPrice) };
        }
      }

      // Get pagination parameters
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 12;
      const skip = (page - 1) * limit;

      // Get total count for pagination (use hint for faster counting)
      const total = await collection.countDocuments(query, { hint: { createdAt: -1 } });
      
      // Optimize query with projection to reduce data transfer
      // Only return first image for listing view to improve performance
      const properties = await collection
        .find(query, {
          projection: {
            title: 1,
            slug: 1,
            description: 1,
            location: 1,
            propertyType: 1,
            bedrooms: 1,
            bathrooms: 1,
            sizeSqm: 1,
            priceETB: 1,
            status: 1,
            featured: 1,
            images: { $slice: 1 }, // Only get first image for listing
            amenities: { $slice: 3 }, // Only get first 3 amenities for listing
            coordinates: 1,
            createdAt: 1
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .hint({ createdAt: -1 }) // Use index hint for faster sorting
        .toArray();
      
      return { properties, total };
    } catch (error) {
      console.error('Error getting properties:', error);
      return { properties: [], total: 0 };
    }
  }

  async getProperty(id: string): Promise<Property | undefined> {
    try {
      const collection = await getCollection('properties');
      // Validate ObjectId format before creating ObjectId
      if (!ObjectId.isValid(id)) {
        return undefined;
      }
      const property = await collection.findOne({ _id: new ObjectId(id) });
      return property || undefined;
    } catch (error) {
      console.error('Error getting property:', error);
      return undefined;
    }
  }

  async getPropertyBySlug(slug: string): Promise<Property | undefined> {
    try {
      const collection = await getCollection('properties');
      const property = await collection.findOne({ slug });
      return property || undefined;
    } catch (error) {
      console.error('Error getting property by slug:', error);
      return undefined;
    }
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    try {
      const collection = await getCollection('properties');
      const newProperty = {
        ...property,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await collection.insertOne(newProperty);
      const createdProperty = { ...newProperty, _id: result.insertedId.toString() };
      
      // Broadcast real-time update
      if ((global as any).broadcastUpdate) {
        (global as any).broadcastUpdate('property_created', createdProperty);
      }
      
      return createdProperty;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  async updateProperty(id: string, property: Partial<Property>): Promise<Property | undefined> {
    try {
      const collection = await getCollection('properties');
      const updateData = { ...property, updatedAt: new Date() };
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      if (result.value && (global as any).broadcastUpdate) {
        (global as any).broadcastUpdate('property_updated', result.value);
      }
      
      return result.value || undefined;
    } catch (error) {
      console.error('Error updating property:', error);
      return undefined;
    }
  }

  async deleteProperty(id: string): Promise<boolean> {
    try {
      const collection = await getCollection('properties');
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting property:', error);
      return false;
    }
  }

  async getFeaturedProperties(): Promise<Property[]> {
    try {
      const collection = await getCollection('properties');
      const properties = await collection
        .find({ featured: true, status: 'active' }, {
          projection: {
            title: 1,
            slug: 1,
            description: 1,
            location: 1,
            propertyType: 1,
            bedrooms: 1,
            bathrooms: 1,
            sizeSqm: 1,
            priceETB: 1,
            status: 1,
            featured: 1,
            images: { $slice: 1 }, // Only get first image
            amenities: { $slice: 3 }, // Only get first 3 amenities
            coordinates: 1,
            createdAt: 1
          }
        })
        .sort({ createdAt: -1 })
        .limit(6)
        .hint({ featured: 1, status: 1 }) // Use compound index hint
        .toArray();
      return properties;
    } catch (error) {
      console.error('Error getting featured properties:', error);
      return [];
    }
  }

  // Project methods
  async getProjects(): Promise<Project[]> {
    try {
      const collection = await getCollection('projects');
      const projects = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return projects;
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  }

  async getProject(id: string): Promise<Project | undefined> {
    try {
      const collection = await getCollection('projects');
      if (!ObjectId.isValid(id)) {
        return undefined;
      }
      const project = await collection.findOne({ _id: new ObjectId(id) });
      return project || undefined;
    } catch (error) {
      console.error('Error getting project:', error);
      return undefined;
    }
  }

  async createProject(project: InsertProject): Promise<Project> {
    const collection = await getCollection('projects');
    const newProject = {
      ...project,
      createdAt: new Date()
    };
    const result = await collection.insertOne(newProject);
    return { ...newProject, _id: result.insertedId.toString() };
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project | undefined> {
    try {
      const collection = await getCollection('projects');
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: project },
        { returnDocument: 'after' }
      );
      return result.value || undefined;
    } catch (error) {
      console.error('Error updating project:', error);
      return undefined;
    }
  }

  async deleteProject(id: string): Promise<boolean> {
    try {
      const collection = await getCollection('projects');
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  // Construction Update methods
  async getConstructionUpdates(projectId?: string): Promise<ConstructionUpdate[]> {
    try {
      const collection = await getCollection('construction_updates');
      const query = projectId ? { projectId } : {};
      const updates = await collection.find(query).sort({ publishedAt: -1 }).toArray();
      return updates;
    } catch (error) {
      console.error('Error getting construction updates:', error);
      return [];
    }
  }

  async createConstructionUpdate(update: InsertConstructionUpdate): Promise<ConstructionUpdate> {
    const collection = await getCollection('construction_updates');
    const newUpdate = {
      ...update,
      createdAt: new Date()
    };
    const result = await collection.insertOne(newUpdate);
    return { ...newUpdate, _id: result.insertedId.toString() };
  }

  async updateConstructionUpdate(id: string, update: Partial<ConstructionUpdate>): Promise<ConstructionUpdate | undefined> {
    try {
      const collection = await getCollection('construction_updates');
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: update },
        { returnDocument: 'after' }
      );
      return result.value || undefined;
    } catch (error) {
      console.error('Error updating construction update:', error);
      return undefined;
    }
  }

  async deleteConstructionUpdate(id: string): Promise<boolean> {
    try {
      const collection = await getCollection('construction_updates');
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting construction update:', error);
      return false;
    }
  }

  // Blog methods
  async getBlogPosts(status?: string): Promise<BlogPost[]> {
    try {
      const collection = await getCollection('blog_posts');
      const query = status ? { status } : {};
      const posts = await collection.find(query).sort({ publishedAt: -1 }).toArray();
      return posts;
    } catch (error) {
      console.error('Error getting blog posts:', error);
      return [];
    }
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    try {
      const collection = await getCollection('blog_posts');
      if (!ObjectId.isValid(id)) {
        return undefined;
      }
      const post = await collection.findOne({ _id: new ObjectId(id) });
      return post || undefined;
    } catch (error) {
      console.error('Error getting blog post:', error);
      return undefined;
    }
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    try {
      const collection = await getCollection('blog_posts');
      const post = await collection.findOne({ slug });
      return post || undefined;
    } catch (error) {
      console.error('Error getting blog post by slug:', error);
      return undefined;
    }
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const collection = await getCollection('blog_posts');
    const newPost = {
      ...post,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await collection.insertOne(newPost);
    return { ...newPost, _id: result.insertedId.toString() };
  }

  async updateBlogPost(id: string, post: Partial<BlogPost>): Promise<BlogPost | undefined> {
    try {
      const collection = await getCollection('blog_posts');
      const updateData = { ...post, updatedAt: new Date() };
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      return result.value || undefined;
    } catch (error) {
      console.error('Error updating blog post:', error);
      return undefined;
    }
  }

  async deleteBlogPost(id: string): Promise<boolean> {
    try {
      const collection = await getCollection('blog_posts');
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return false;
    }
  }

  // Team methods
  async getTeamMembers(): Promise<TeamMember[]> {
    try {
      const collection = await getCollection('team_members');
      const members = await collection.find({}).sort({ order: 1 }).toArray();
      return members;
    } catch (error) {
      console.error('Error getting team members:', error);
      return [];
    }
  }

  async getTeamMember(id: string): Promise<TeamMember | undefined> {
    try {
      const collection = await getCollection('team_members');
      if (!ObjectId.isValid(id)) {
        return undefined;
      }
      const member = await collection.findOne({ _id: new ObjectId(id) });
      return member || undefined;
    } catch (error) {
      console.error('Error getting team member:', error);
      return undefined;
    }
  }

  async createTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const collection = await getCollection('team_members');
    const newMember = {
      ...member,
      createdAt: new Date()
    };
    const result = await collection.insertOne(newMember);
    return { ...newMember, _id: result.insertedId.toString() };
  }

  async updateTeamMember(id: string, member: Partial<TeamMember>): Promise<TeamMember | undefined> {
    try {
      const collection = await getCollection('team_members');
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: member },
        { returnDocument: 'after' }
      );
      return result.value || undefined;
    } catch (error) {
      console.error('Error updating team member:', error);
      return undefined;
    }
  }

  async deleteTeamMember(id: string): Promise<boolean> {
    try {
      const collection = await getCollection('team_members');
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting team member:', error);
      return false;
    }
  }

  // Lead methods
  async getLeads(): Promise<Lead[]> {
    try {
      const collection = await getCollection('leads');
      const leads = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return leads;
    } catch (error) {
      console.error('Error getting leads:', error);
      return [];
    }
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const collection = await getCollection('leads');
    const newLead = {
      ...lead,
      createdAt: new Date()
    };
    const result = await collection.insertOne(newLead);
    return { ...newLead, _id: result.insertedId.toString() };
  }

  async updateLead(id: string, lead: Partial<Lead>): Promise<Lead | undefined> {
    try {
      const collection = await getCollection('leads');
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: lead },
        { returnDocument: 'after' }
      );
      return result.value || undefined;
    } catch (error) {
      console.error('Error updating lead:', error);
      return undefined;
    }
  }

  async deleteLead(id: string): Promise<boolean> {
    try {
      const collection = await getCollection('leads');
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting lead:', error);
      return false;
    }
  }

  // Settings methods
  async getSettings(): Promise<Settings | undefined> {
    try {
      const collection = await getCollection('settings');
      const settings = await collection.findOne({});
      return settings || undefined;
    } catch (error) {
      console.error('Error getting settings:', error);
      return undefined;
    }
  }

  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    const collection = await getCollection('settings');
    const updateData = { ...settings, updatedAt: new Date() };
    const result = await collection.findOneAndUpdate(
      {},
      { $set: updateData },
      { upsert: true, returnDocument: 'after' }
    );
    return result.value;
  }

  // Hero Slide methods
  async getHeroSlides(): Promise<HeroSlide[]> {
    try {
      const collection = await getCollection('hero_slides');
      const slides = await collection.find({}).sort({ order: 1, createdAt: -1 }).toArray();
      return slides;
    } catch (error) {
      console.error('Error getting hero slides:', error);
      return [];
    }
  }

  async getHeroSlide(id: string): Promise<HeroSlide | undefined> {
    try {
      const collection = await getCollection('hero_slides');
      if (!ObjectId.isValid(id)) {
        return undefined;
      }
      const slide = await collection.findOne({ _id: new ObjectId(id) });
      return slide || undefined;
    } catch (error) {
      console.error('Error getting hero slide:', error);
      return undefined;
    }
  }

  async createHeroSlide(slide: InsertHeroSlide): Promise<HeroSlide> {
    const collection = await getCollection('hero_slides');
    const newSlide = {
      ...slide,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await collection.insertOne(newSlide);
    return { ...newSlide, _id: result.insertedId.toString() };
  }

  async updateHeroSlide(id: string, slide: Partial<HeroSlide>): Promise<HeroSlide | undefined> {
    try {
      const collection = await getCollection('hero_slides');
      const updateData = { ...slide, updatedAt: new Date() };
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      );
      return result.value || undefined;
    } catch (error) {
      console.error('Error updating hero slide:', error);
      return undefined;
    }
  }

  async deleteHeroSlide(id: string): Promise<boolean> {
    try {
      const collection = await getCollection('hero_slides');
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting hero slide:', error);
      return false;
    }
  }
}

export const storage = new MongoStorage();