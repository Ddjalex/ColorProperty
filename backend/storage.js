const { connectToDatabase } = require('./db');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

// MongoDB Storage Implementation
class MongoStorage {
  
  // Helper method to get collection
  async getCollection(collectionName) {
    const { db } = await connectToDatabase();
    return db.collection(collectionName);
  }

  // User methods
  async getUser(id) {
    try {
      const collection = await this.getCollection('users');
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

  async getUserByEmail(email) {
    try {
      const collection = await this.getCollection('users');
      const user = await collection.findOne({ email });
      return user || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(user) {
    const collection = await this.getCollection('users');
    const hashedPassword = await bcrypt.hash(user.passwordHash, 10);
    const newUser = {
      ...user,
      passwordHash: hashedPassword,
      createdAt: new Date()
    };
    const result = await collection.insertOne(newUser);
    return { ...newUser, _id: result.insertedId.toString() };
  }

  async updateUser(id, user) {
    try {
      const collection = await this.getCollection('users');
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

  async deleteUser(id) {
    try {
      const collection = await this.getCollection('users');
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Property methods
  async getProperties(filters = {}) {
    try {
      const collection = await this.getCollection('properties');
      const query = {};
      
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

      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 12;
      const skip = (page - 1) * limit;

      const total = await collection.countDocuments(query, { hint: { createdAt: -1 } });
      
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
            imageCount: { $size: { $ifNull: ["$images", []] } },
            amenities: { $slice: 3 },
            coordinates: 1,
            createdAt: 1
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .hint({ createdAt: -1 })
        .toArray();
      
      return { properties, total };
    } catch (error) {
      console.error('Error getting properties:', error);
      return { properties: [], total: 0 };
    }
  }

  async getProperty(id) {
    try {
      const collection = await this.getCollection('properties');
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

  async getPropertyBySlug(slug) {
    try {
      const collection = await this.getCollection('properties');
      const property = await collection.findOne({ slug });
      return property || undefined;
    } catch (error) {
      console.error('Error getting property by slug:', error);
      return undefined;
    }
  }

  async createProperty(property) {
    try {
      const collection = await this.getCollection('properties');
      const newProperty = {
        ...property,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await collection.insertOne(newProperty);
      const createdProperty = { ...newProperty, _id: result.insertedId.toString() };
      
      if (global.broadcastUpdate) {
        global.broadcastUpdate('property_created', createdProperty);
      }
      
      return createdProperty;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  async updateProperty(id, property) {
    try {
      const collection = await this.getCollection('properties');
      if (!ObjectId.isValid(id)) {
        return undefined;
      }
      
      const objectId = new ObjectId(id);
      const updateData = { ...property, updatedAt: new Date() };
      
      const existingProperty = await collection.findOne({ _id: objectId });
      if (!existingProperty) {
        return undefined;
      }
      
      const updateResult = await collection.updateOne(
        { _id: objectId },
        { $set: updateData }
      );
      
      if (updateResult.matchedCount === 0) {
        return undefined;
      }
      
      const updatedProperty = await collection.findOne({ _id: objectId });
      
      if (updatedProperty && global.broadcastUpdate) {
        global.broadcastUpdate('property_updated', updatedProperty);
      }
      
      return updatedProperty || undefined;
    } catch (error) {
      console.error('Error updating property:', error);
      return undefined;
    }
  }

  async deleteProperty(id) {
    try {
      const collection = await this.getCollection('properties');
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting property:', error);
      return false;
    }
  }

  async getFeaturedProperties() {
    try {
      const collection = await this.getCollection('properties');
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
            imageCount: { $size: { $ifNull: ["$images", []] } },
            amenities: { $slice: 3 },
            coordinates: 1,
            createdAt: 1
          }
        })
        .sort({ featured: -1, createdAt: -1 })
        .toArray();
      return properties;
    } catch (error) {
      console.error('Error getting featured properties:', error);
      return [];
    }
  }

  // Blog methods
  async getBlogPosts(status) {
    try {
      const collection = await this.getCollection('blog_posts');
      const query = status ? { status } : {};
      const posts = await collection
        .find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .toArray();
      return posts;
    } catch (error) {
      console.error('Error getting blog posts:', error);
      return [];
    }
  }

  async getBlogPost(id) {
    try {
      const collection = await this.getCollection('blog_posts');
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

  async getBlogPostBySlug(slug) {
    try {
      const collection = await this.getCollection('blog_posts');
      const post = await collection.findOne({ slug });
      return post || undefined;
    } catch (error) {
      console.error('Error getting blog post by slug:', error);
      return undefined;
    }
  }

  async createBlogPost(post) {
    try {
      const collection = await this.getCollection('blog_posts');
      const newPost = {
        ...post,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await collection.insertOne(newPost);
      return { ...newPost, _id: result.insertedId.toString() };
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  }

  async updateBlogPost(id, post) {
    try {
      const collection = await this.getCollection('blog_posts');
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

  async deleteBlogPost(id) {
    try {
      const collection = await this.getCollection('blog_posts');
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return false;
    }
  }

  // Team methods
  async getTeamMembers() {
    try {
      const collection = await this.getCollection('team_members');
      const members = await collection.find({}).sort({ order: 1 }).toArray();
      return members;
    } catch (error) {
      console.error('Error getting team members:', error);
      return [];
    }
  }

  async createTeamMember(member) {
    try {
      const collection = await this.getCollection('team_members');
      const newMember = {
        ...member,
        createdAt: new Date()
      };
      const result = await collection.insertOne(newMember);
      return { ...newMember, _id: result.insertedId.toString() };
    } catch (error) {
      console.error('Error creating team member:', error);
      throw error;
    }
  }

  // Lead methods
  async getLeads() {
    try {
      const collection = await this.getCollection('leads');
      const leads = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return leads;
    } catch (error) {
      console.error('Error getting leads:', error);
      return [];
    }
  }

  async createLead(lead) {
    try {
      const collection = await this.getCollection('leads');
      const newLead = {
        ...lead,
        createdAt: new Date()
      };
      const result = await collection.insertOne(newLead);
      return { ...newLead, _id: result.insertedId.toString() };
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  // Settings methods
  async getSettings() {
    try {
      const collection = await this.getCollection('settings');
      const settings = await collection.findOne({});
      return settings || undefined;
    } catch (error) {
      console.error('Error getting settings:', error);
      return undefined;
    }
  }

  async updateSettings(settings) {
    try {
      const collection = await this.getCollection('settings');
      const updateData = { ...settings, updatedAt: new Date() };
      const result = await collection.findOneAndUpdate(
        {},
        { $set: updateData },
        { upsert: true, returnDocument: 'after' }
      );
      return result.value;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  // Hero Slide methods
  async getHeroSlides() {
    try {
      const collection = await this.getCollection('hero_slides');
      const slides = await collection
        .find({ isActive: true })
        .sort({ order: 1 })
        .toArray();
      return slides;
    } catch (error) {
      console.error('Error getting hero slides:', error);
      return [];
    }
  }

  async getHeroSlide(id) {
    try {
      const collection = await this.getCollection('hero_slides');
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

  async createHeroSlide(slide) {
    try {
      const collection = await this.getCollection('hero_slides');
      const newSlide = {
        ...slide,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await collection.insertOne(newSlide);
      return { ...newSlide, _id: result.insertedId.toString() };
    } catch (error) {
      console.error('Error creating hero slide:', error);
      throw error;
    }
  }

  async updateHeroSlide(id, slide) {
    try {
      const collection = await this.getCollection('hero_slides');
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

  async deleteHeroSlide(id) {
    try {
      const collection = await this.getCollection('hero_slides');
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting hero slide:', error);
      return false;
    }
  }

  // Project methods (for future use)
  async getProjects() {
    try {
      const collection = await this.getCollection('projects');
      const projects = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return projects;
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  }

  async createProject(project) {
    try {
      const collection = await this.getCollection('projects');
      const newProject = {
        ...project,
        createdAt: new Date()
      };
      const result = await collection.insertOne(newProject);
      return { ...newProject, _id: result.insertedId.toString() };
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }
}

// Create and export storage instance
const storage = new MongoStorage();

module.exports = storage;