// server/index.ts
import express2 from "express";
import path3 from "path";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/db.ts
import { MongoClient } from "mongodb";
var CONNECTION_STRING = "mongodb+srv://walmeseged_db_user:A1l2m3e4s5@gift.k3fycs2.mongodb.net/?retryWrites=true&w=majority&appName=Gift";
var db = null;
var client = null;
async function connectToDatabase() {
  if (db) {
    return db;
  }
  try {
    client = new MongoClient(CONNECTION_STRING, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5e3,
      socketTimeoutMS: 45e3
    });
    await client.connect();
    db = client.db("temer_properties");
    await createIndexes();
    console.log("Connected to MongoDB Atlas");
    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}
async function createIndexes() {
  try {
    const propertiesCollection = db.collection("properties");
    await propertiesCollection.createIndex({ createdAt: -1 });
    await propertiesCollection.createIndex({ slug: 1 }, { unique: true });
    await propertiesCollection.createIndex({ status: 1 });
    await propertiesCollection.createIndex({ propertyType: 1 });
    await propertiesCollection.createIndex({ location: 1 });
    await propertiesCollection.createIndex({ priceETB: 1 });
    await propertiesCollection.createIndex({ featured: 1 });
    await propertiesCollection.createIndex({ featured: 1, status: 1 });
    await propertiesCollection.createIndex({ status: 1, createdAt: -1 });
    const blogCollection = db.collection("blog_posts");
    await blogCollection.createIndex({ publishedAt: -1 });
    await blogCollection.createIndex({ slug: 1 }, { unique: true });
    await blogCollection.createIndex({ status: 1 });
    await blogCollection.createIndex({ authorId: 1 });
    const teamCollection = db.collection("team_members");
    await teamCollection.createIndex({ order: 1 });
    const slidesCollection = db.collection("hero_slides");
    await slidesCollection.createIndex({ order: 1 });
    await slidesCollection.createIndex({ isActive: 1 });
    const usersCollection = db.collection("users");
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log("Database indexes created successfully");
  } catch (error) {
    console.log("Indexes already exist or creation skipped");
  }
}
async function getCollection(collectionName) {
  const database = await connectToDatabase();
  return database.collection(collectionName);
}

// server/storage.ts
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
var MongoStorage = class {
  // User methods
  async getUser(id) {
    try {
      const collection = await getCollection("users");
      if (!ObjectId.isValid(id)) {
        return void 0;
      }
      const user = await collection.findOne({ _id: new ObjectId(id) });
      return user || void 0;
    } catch (error) {
      console.error("Error getting user:", error);
      return void 0;
    }
  }
  async getUserByEmail(email) {
    try {
      const collection = await getCollection("users");
      const user = await collection.findOne({ email });
      return user || void 0;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return void 0;
    }
  }
  async createUser(user) {
    const collection = await getCollection("users");
    const hashedPassword = await bcrypt.hash(user.passwordHash, 10);
    const newUser = {
      ...user,
      passwordHash: hashedPassword,
      createdAt: /* @__PURE__ */ new Date()
    };
    const result = await collection.insertOne(newUser);
    return { ...newUser, _id: result.insertedId.toString() };
  }
  async updateUser(id, user) {
    try {
      const collection = await getCollection("users");
      const updateData = { ...user, updatedAt: /* @__PURE__ */ new Date() };
      if (updateData.passwordHash) {
        updateData.passwordHash = await bcrypt.hash(updateData.passwordHash, 10);
      }
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );
      return result.value || void 0;
    } catch (error) {
      console.error("Error updating user:", error);
      return void 0;
    }
  }
  async deleteUser(id) {
    try {
      const collection = await getCollection("users");
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
  // Property methods
  async getProperties(filters = {}) {
    try {
      const collection = await getCollection("properties");
      const query = {};
      if (!filters.includeAllStatuses) {
        query.status = { $in: ["active", "sold", "rented"] };
      }
      if (filters.location) {
        query.location = new RegExp(filters.location, "i");
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
      const properties = await collection.find(query, {
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
          // Count of images instead of image data
          amenities: { $slice: 3 },
          // Only get first 3 amenities for listing
          coordinates: 1,
          createdAt: 1
        }
      }).sort({ createdAt: -1 }).skip(skip).limit(limit).hint({ createdAt: -1 }).toArray();
      return { properties, total };
    } catch (error) {
      console.error("Error getting properties:", error);
      return { properties: [], total: 0 };
    }
  }
  async getProperty(id) {
    try {
      const collection = await getCollection("properties");
      if (!ObjectId.isValid(id)) {
        return void 0;
      }
      const property = await collection.findOne({ _id: new ObjectId(id) });
      return property || void 0;
    } catch (error) {
      console.error("Error getting property:", error);
      return void 0;
    }
  }
  async getPropertyBySlug(slug) {
    try {
      const collection = await getCollection("properties");
      const property = await collection.findOne({ slug });
      return property || void 0;
    } catch (error) {
      console.error("Error getting property by slug:", error);
      return void 0;
    }
  }
  async createProperty(property) {
    try {
      const collection = await getCollection("properties");
      const newProperty = {
        ...property,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      const result = await collection.insertOne(newProperty);
      const createdProperty = { ...newProperty, _id: result.insertedId.toString() };
      if (global.broadcastUpdate) {
        global.broadcastUpdate("property_created", createdProperty);
      }
      return createdProperty;
    } catch (error) {
      console.error("Error creating property:", error);
      throw error;
    }
  }
  async updateProperty(id, property) {
    try {
      const collection = await getCollection("properties");
      if (!ObjectId.isValid(id)) {
        console.log("Invalid ObjectId format:", id);
        return void 0;
      }
      const objectId = new ObjectId(id);
      const updateData = { ...property, updatedAt: /* @__PURE__ */ new Date() };
      const existingProperty = await collection.findOne({ _id: objectId });
      if (!existingProperty) {
        console.log("Property not found with ID:", id);
        return void 0;
      }
      const updateResult = await collection.updateOne(
        { _id: objectId },
        { $set: updateData }
      );
      if (updateResult.matchedCount === 0) {
        console.log("No documents matched for update, ID:", id);
        return void 0;
      }
      const updatedProperty = await collection.findOne({ _id: objectId });
      if (updatedProperty && global.broadcastUpdate) {
        global.broadcastUpdate("property_updated", updatedProperty);
      }
      console.log("Property updated successfully for ID:", id);
      return updatedProperty || void 0;
    } catch (error) {
      console.error("Error updating property:", error);
      return void 0;
    }
  }
  async deleteProperty(id) {
    try {
      const collection = await getCollection("properties");
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting property:", error);
      return false;
    }
  }
  async getFeaturedProperties() {
    try {
      const collection = await getCollection("properties");
      const properties = await collection.find({ featured: true, status: "active" }, {
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
          // Count of images instead of image data
          amenities: { $slice: 3 },
          // Only get first 3 amenities
          coordinates: 1,
          createdAt: 1
        }
      }).sort({ createdAt: -1 }).limit(6).hint({ featured: 1, status: 1 }).toArray();
      return properties;
    } catch (error) {
      console.error("Error getting featured properties:", error);
      return [];
    }
  }
  // Project methods
  async getProjects() {
    try {
      const collection = await getCollection("projects");
      const projects = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return projects;
    } catch (error) {
      console.error("Error getting projects:", error);
      return [];
    }
  }
  async getProject(id) {
    try {
      const collection = await getCollection("projects");
      if (!ObjectId.isValid(id)) {
        return void 0;
      }
      const project = await collection.findOne({ _id: new ObjectId(id) });
      return project || void 0;
    } catch (error) {
      console.error("Error getting project:", error);
      return void 0;
    }
  }
  async createProject(project) {
    const collection = await getCollection("projects");
    const newProject = {
      ...project,
      createdAt: /* @__PURE__ */ new Date()
    };
    const result = await collection.insertOne(newProject);
    return { ...newProject, _id: result.insertedId.toString() };
  }
  async updateProject(id, project) {
    try {
      const collection = await getCollection("projects");
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: project },
        { returnDocument: "after" }
      );
      return result.value || void 0;
    } catch (error) {
      console.error("Error updating project:", error);
      return void 0;
    }
  }
  async deleteProject(id) {
    try {
      const collection = await getCollection("projects");
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting project:", error);
      return false;
    }
  }
  // Construction Update methods
  async getConstructionUpdates(projectId) {
    try {
      const collection = await getCollection("construction_updates");
      const query = projectId ? { projectId } : {};
      const updates = await collection.find(query).sort({ publishedAt: -1 }).toArray();
      return updates;
    } catch (error) {
      console.error("Error getting construction updates:", error);
      return [];
    }
  }
  async createConstructionUpdate(update) {
    const collection = await getCollection("construction_updates");
    const newUpdate = {
      ...update,
      createdAt: /* @__PURE__ */ new Date()
    };
    const result = await collection.insertOne(newUpdate);
    return { ...newUpdate, _id: result.insertedId.toString() };
  }
  async updateConstructionUpdate(id, update) {
    try {
      const collection = await getCollection("construction_updates");
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: update },
        { returnDocument: "after" }
      );
      return result.value || void 0;
    } catch (error) {
      console.error("Error updating construction update:", error);
      return void 0;
    }
  }
  async deleteConstructionUpdate(id) {
    try {
      const collection = await getCollection("construction_updates");
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting construction update:", error);
      return false;
    }
  }
  // Blog methods
  async getBlogPosts(status) {
    try {
      const collection = await getCollection("blog_posts");
      const query = status ? { status } : {};
      const posts = await collection.find(query).sort({ publishedAt: -1 }).toArray();
      return posts;
    } catch (error) {
      console.error("Error getting blog posts:", error);
      return [];
    }
  }
  async getBlogPost(id) {
    try {
      const collection = await getCollection("blog_posts");
      if (!ObjectId.isValid(id)) {
        return void 0;
      }
      const post = await collection.findOne({ _id: new ObjectId(id) });
      return post || void 0;
    } catch (error) {
      console.error("Error getting blog post:", error);
      return void 0;
    }
  }
  async getBlogPostBySlug(slug) {
    try {
      const collection = await getCollection("blog_posts");
      const post = await collection.findOne({ slug });
      return post || void 0;
    } catch (error) {
      console.error("Error getting blog post by slug:", error);
      return void 0;
    }
  }
  async createBlogPost(post) {
    const collection = await getCollection("blog_posts");
    const newPost = {
      ...post,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    const result = await collection.insertOne(newPost);
    return { ...newPost, _id: result.insertedId.toString() };
  }
  async updateBlogPost(id, post) {
    try {
      const collection = await getCollection("blog_posts");
      const updateData = { ...post, updatedAt: /* @__PURE__ */ new Date() };
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: "after" }
      );
      return result.value || void 0;
    } catch (error) {
      console.error("Error updating blog post:", error);
      return void 0;
    }
  }
  async deleteBlogPost(id) {
    try {
      const collection = await getCollection("blog_posts");
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting blog post:", error);
      return false;
    }
  }
  // Team methods
  async getTeamMembers() {
    try {
      const collection = await getCollection("team_members");
      const members = await collection.find({}).sort({ order: 1 }).toArray();
      return members;
    } catch (error) {
      console.error("Error getting team members:", error);
      return [];
    }
  }
  async getTeamMember(id) {
    try {
      const collection = await getCollection("team_members");
      if (!ObjectId.isValid(id)) {
        return void 0;
      }
      const member = await collection.findOne({ _id: new ObjectId(id) });
      return member || void 0;
    } catch (error) {
      console.error("Error getting team member:", error);
      return void 0;
    }
  }
  async createTeamMember(member) {
    const collection = await getCollection("team_members");
    const newMember = {
      ...member,
      createdAt: /* @__PURE__ */ new Date()
    };
    const result = await collection.insertOne(newMember);
    return { ...newMember, _id: result.insertedId.toString() };
  }
  async updateTeamMember(id, member) {
    try {
      const collection = await getCollection("team_members");
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: member },
        { returnDocument: "after" }
      );
      return result.value || void 0;
    } catch (error) {
      console.error("Error updating team member:", error);
      return void 0;
    }
  }
  async deleteTeamMember(id) {
    try {
      const collection = await getCollection("team_members");
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting team member:", error);
      return false;
    }
  }
  // Lead methods
  async getLeads() {
    try {
      const collection = await getCollection("leads");
      const leads = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return leads;
    } catch (error) {
      console.error("Error getting leads:", error);
      return [];
    }
  }
  async createLead(lead) {
    const collection = await getCollection("leads");
    const newLead = {
      ...lead,
      createdAt: /* @__PURE__ */ new Date()
    };
    const result = await collection.insertOne(newLead);
    return { ...newLead, _id: result.insertedId.toString() };
  }
  async updateLead(id, lead) {
    try {
      const collection = await getCollection("leads");
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: lead },
        { returnDocument: "after" }
      );
      return result.value || void 0;
    } catch (error) {
      console.error("Error updating lead:", error);
      return void 0;
    }
  }
  async deleteLead(id) {
    try {
      const collection = await getCollection("leads");
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting lead:", error);
      return false;
    }
  }
  // Settings methods
  async getSettings() {
    try {
      const collection = await getCollection("settings");
      const settings = await collection.findOne({});
      return settings || void 0;
    } catch (error) {
      console.error("Error getting settings:", error);
      return void 0;
    }
  }
  async updateSettings(settings) {
    const collection = await getCollection("settings");
    const updateData = { ...settings, updatedAt: /* @__PURE__ */ new Date() };
    const result = await collection.findOneAndUpdate(
      {},
      { $set: updateData },
      { upsert: true, returnDocument: "after" }
    );
    return result.value;
  }
  // Hero Slide methods
  async getHeroSlides() {
    try {
      const collection = await getCollection("hero_slides");
      const slides = await collection.find({}).sort({ order: 1, createdAt: -1 }).toArray();
      return slides;
    } catch (error) {
      console.error("Error getting hero slides:", error);
      return [];
    }
  }
  async getHeroSlide(id) {
    try {
      const collection = await getCollection("hero_slides");
      if (!ObjectId.isValid(id)) {
        return void 0;
      }
      const slide = await collection.findOne({ _id: new ObjectId(id) });
      return slide || void 0;
    } catch (error) {
      console.error("Error getting hero slide:", error);
      return void 0;
    }
  }
  async createHeroSlide(slide) {
    const collection = await getCollection("hero_slides");
    const newSlide = {
      ...slide,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    const result = await collection.insertOne(newSlide);
    return { ...newSlide, _id: result.insertedId.toString() };
  }
  async updateHeroSlide(id, slide) {
    try {
      const collection = await getCollection("hero_slides");
      if (!ObjectId.isValid(id)) {
        console.log("Invalid ObjectId format for hero slide:", id);
        return void 0;
      }
      const objectId = new ObjectId(id);
      console.log("Updating hero slide with ID:", id);
      console.log("Update data:", JSON.stringify(slide, null, 2));
      const existingSlide = await collection.findOne({ _id: objectId });
      if (!existingSlide) {
        console.log("Hero slide not found with ID:", id);
        return void 0;
      }
      console.log("Found existing hero slide, proceeding with update");
      const updateData = { ...slide, updatedAt: /* @__PURE__ */ new Date() };
      const updateResult = await collection.updateOne(
        { _id: objectId },
        { $set: updateData }
      );
      if (updateResult.matchedCount === 0) {
        console.log("No document matched for update, ID:", id);
        return void 0;
      }
      const updatedSlide = await collection.findOne({ _id: objectId });
      if (updatedSlide) {
        console.log("Hero slide updated successfully for ID:", id);
        return updatedSlide;
      } else {
        console.log("Update operation completed but could not fetch updated document for ID:", id);
        return void 0;
      }
    } catch (error) {
      console.error("Error updating hero slide:", error);
      console.error("ID that caused error:", id);
      return void 0;
    }
  }
  async deleteHeroSlide(id) {
    try {
      const collection = await getCollection("hero_slides");
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error("Error deleting hero slide:", error);
      return false;
    }
  }
};
var storage = new MongoStorage();

// shared/schema.ts
import { z } from "zod";
var userSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(["admin", "editor", "agent"]),
  passwordHash: z.string(),
  createdAt: z.date().optional()
});
var insertUserSchema = userSchema.omit({ _id: true, createdAt: true });
var propertySchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  location: z.string(),
  propertyType: z.enum(["apartment", "house", "commercial", "shop", "land"]),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  sizeSqm: z.number(),
  priceETB: z.number(),
  status: z.enum(["active", "draft", "sold", "rented"]),
  featured: z.boolean().default(false),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  imageCount: z.number().optional(),
  // Count of images for listing view
  project: z.string().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});
var insertPropertySchema = propertySchema.omit({ _id: true, createdAt: true, updatedAt: true });
var projectSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  images: z.array(z.string()).default([]),
  delivered: z.boolean().default(false),
  location: z.string(),
  createdAt: z.date().optional()
});
var insertProjectSchema = projectSchema.omit({ _id: true, createdAt: true });
var constructionUpdateSchema = z.object({
  _id: z.string().optional(),
  projectId: z.string(),
  title: z.string(),
  body: z.string(),
  images: z.array(z.string()).default([]),
  progressPercent: z.number().min(0).max(100),
  publishedAt: z.date().optional(),
  createdAt: z.date().optional()
});
var insertConstructionUpdateSchema = constructionUpdateSchema.omit({ _id: true, createdAt: true });
var blogPostSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  body: z.string(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published"]),
  publishedAt: z.date().optional(),
  authorId: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});
var insertBlogPostSchema = blogPostSchema.omit({ _id: true, createdAt: true, updatedAt: true });
var teamMemberSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  roleType: z.enum(["officer", "agent"]),
  phone: z.string(),
  whatsapp: z.string(),
  email: z.string().email().optional(),
  photoUrl: z.string().optional(),
  order: z.number().default(0),
  specialization: z.string().optional(),
  createdAt: z.date().optional()
});
var insertTeamMemberSchema = teamMemberSchema.omit({ _id: true, createdAt: true });
var leadSchema = z.object({
  _id: z.string().optional(),
  type: z.enum(["contact", "schedule"]),
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  message: z.string(),
  propertyId: z.string().optional(),
  preferredTime: z.date().optional(),
  createdAt: z.date().optional()
});
var insertLeadSchema = leadSchema.omit({ _id: true, createdAt: true });
var heroSlideSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  subtitle: z.string(),
  imageUrl: z.string(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});
var insertHeroSlideSchema = heroSlideSchema.omit({ _id: true, createdAt: true, updatedAt: true });
var settingsSchema = z.object({
  _id: z.string().optional(),
  // Contact Information
  phoneNumber: z.string().default("0974408281"),
  whatsappNumber: z.string().default("0974408281"),
  email: z.string().email().optional(),
  supportEmail: z.string().email().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    country: z.string().default("Ethiopia"),
    postalCode: z.string().optional()
  }).default({}),
  businessHours: z.object({
    monday: z.string().default("9:00 AM - 6:00 PM"),
    tuesday: z.string().default("9:00 AM - 6:00 PM"),
    wednesday: z.string().default("9:00 AM - 6:00 PM"),
    thursday: z.string().default("9:00 AM - 6:00 PM"),
    friday: z.string().default("9:00 AM - 6:00 PM"),
    saturday: z.string().default("9:00 AM - 4:00 PM"),
    sunday: z.string().default("Closed")
  }).default({}),
  hotlineNumbers: z.array(z.string()).default([]),
  // Social Media
  socialLinks: z.object({
    facebook: z.string().optional(),
    youtube: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    telegram: z.string().optional()
  }).default({}),
  // Communication
  whatsappTemplate: z.string().default("I'm interested in {propertyTitle} - {propertyPrice}. Property link: {propertyLink}"),
  // SEO
  seoDefaults: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.string().optional()
  }).default({}),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});
var insertSettingsSchema = settingsSchema.omit({ _id: true, createdAt: true, updatedAt: true });

// server/routes.ts
import bcrypt2 from "bcrypt";
import jwt from "jsonwebtoken";
async function registerRoutes(app2) {
  const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
  const requireAuth = async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user || !await bcrypt2.compare(password, user.passwordHash)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "24h" });
      res.json({ token, user: { ...user, passwordHash: void 0 } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const user = await storage.createUser(userData);
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "24h" });
      res.json({ token, user: { ...user, passwordHash: void 0 } });
    } catch (error) {
      res.status(400).json({ message: "Registration failed" });
    }
  });
  app2.get("/api/properties", async (req, res) => {
    try {
      const result = await storage.getProperties(req.query);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });
  app2.get("/api/properties/featured", async (req, res) => {
    try {
      const properties = await storage.getFeaturedProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured properties" });
    }
  });
  app2.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });
  app2.get("/api/properties/slug/:slug", async (req, res) => {
    try {
      const property = await storage.getPropertyBySlug(req.params.slug);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });
  app2.post("/api/properties", requireAuth, async (req, res) => {
    try {
      const propertyData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(propertyData);
      res.json(property);
    } catch (error) {
      console.error("Failed to create property:", error);
      res.status(400).json({
        message: "Failed to create property",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.put("/api/properties/:id", requireAuth, async (req, res) => {
    try {
      console.log("Updating property ID:", req.params.id);
      console.log("Update data:", JSON.stringify(req.body, null, 2));
      const property = await storage.updateProperty(req.params.id, req.body);
      if (!property) {
        console.log("Property not found for ID:", req.params.id);
        return res.status(404).json({ message: "Property not found" });
      }
      console.log("Property updated successfully");
      res.json(property);
    } catch (error) {
      console.error("Property update error:", error);
      res.status(400).json({
        message: "Failed to update property",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.delete("/api/properties/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteProperty(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json({ message: "Property deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete property" });
    }
  });
  app2.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });
  app2.post("/api/projects", requireAuth, async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: "Failed to create project" });
    }
  });
  app2.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts("published");
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });
  app2.get("/api/blog/:id", async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });
  app2.get("/api/blog/slug/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });
  app2.post("/api/blog", requireAuth, async (req, res) => {
    try {
      console.log("Received blog post data:", req.body);
      const blogData = { ...req.body };
      if (blogData.publishedAt && typeof blogData.publishedAt === "string") {
        blogData.publishedAt = new Date(blogData.publishedAt);
      }
      const postData = insertBlogPostSchema.parse(blogData);
      console.log("Parsed blog post data:", postData);
      const post = await storage.createBlogPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Blog post creation error:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: "Failed to create blog post", error: error.message });
      } else {
        res.status(400).json({ message: "Failed to create blog post", error: "Unknown error" });
      }
    }
  });
  app2.put("/api/blog/:id", requireAuth, async (req, res) => {
    try {
      const blogData = { ...req.body };
      if (blogData.publishedAt && typeof blogData.publishedAt === "string") {
        blogData.publishedAt = new Date(blogData.publishedAt);
      }
      const post = await storage.updateBlogPost(req.params.id, blogData);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Blog post update error:", error);
      res.status(400).json({ message: "Failed to update blog post" });
    }
  });
  app2.delete("/api/blog/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteBlogPost(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });
  app2.get("/api/team", async (req, res) => {
    try {
      const members = await storage.getTeamMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });
  app2.post("/api/team", requireAuth, async (req, res) => {
    try {
      const memberData = insertTeamMemberSchema.parse(req.body);
      const member = await storage.createTeamMember(memberData);
      res.json(member);
    } catch (error) {
      res.status(400).json({ message: "Failed to create team member" });
    }
  });
  app2.get("/api/leads", requireAuth, async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });
  app2.post("/api/leads", async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      res.json(lead);
    } catch (error) {
      res.status(400).json({ message: "Failed to create lead" });
    }
  });
  app2.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  app2.put("/api/settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Failed to update settings" });
    }
  });
  app2.get("/api/hero-slides", async (req, res) => {
    try {
      const slides = await storage.getHeroSlides();
      res.json(slides);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hero slides" });
    }
  });
  app2.get("/api/hero-slides/:id", async (req, res) => {
    try {
      const slide = await storage.getHeroSlide(req.params.id);
      if (!slide) {
        return res.status(404).json({ message: "Hero slide not found" });
      }
      res.json(slide);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hero slide" });
    }
  });
  app2.post("/api/hero-slides", requireAuth, async (req, res) => {
    try {
      const slideData = insertHeroSlideSchema.parse(req.body);
      const slide = await storage.createHeroSlide(slideData);
      res.json(slide);
    } catch (error) {
      res.status(400).json({ message: "Failed to create hero slide" });
    }
  });
  app2.put("/api/hero-slides/:id", requireAuth, async (req, res) => {
    try {
      const slide = await storage.updateHeroSlide(req.params.id, req.body);
      if (!slide) {
        return res.status(404).json({ message: "Hero slide not found" });
      }
      res.json(slide);
    } catch (error) {
      res.status(400).json({ message: "Failed to update hero slide" });
    }
  });
  app2.delete("/api/hero-slides/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteHeroSlide(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Hero slide not found" });
      }
      res.json({ message: "Hero slide deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete hero slide" });
    }
  });
  app2.get("/api/properties/:id/images/:index", async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property || !property.images) {
        return res.status(404).json({ message: "Property or image not found" });
      }
      const imageIndex = parseInt(req.params.index);
      if (imageIndex < 0 || imageIndex >= property.images.length) {
        return res.status(404).json({ message: "Image index out of range" });
      }
      const imageData = property.images[imageIndex];
      if (imageData.startsWith("data:image/")) {
        const base64Data = imageData.split(",")[1];
        const mimeType = imageData.split(";")[0].split(":")[1];
        const buffer = Buffer.from(base64Data, "base64");
        res.setHeader("Content-Type", mimeType);
        res.setHeader("Content-Length", buffer.length);
        res.setHeader("Cache-Control", "public, max-age=31536000");
        res.send(buffer);
      } else if (imageData.startsWith("http")) {
        res.redirect(imageData);
      } else {
        res.status(404).json({ message: "Invalid image format" });
      }
    } catch (error) {
      console.error("Error serving image:", error);
      res.status(500).json({ message: "Failed to serve image" });
    }
  });
  app2.post("/api/init-admin", async (req, res) => {
    try {
      const existingAdmin = await storage.getUserByEmail("admin@temer.com");
      if (existingAdmin) {
        return res.json({ message: "Admin user already exists" });
      }
      const adminUser = await storage.createUser({
        name: "Admin User",
        email: "admin@temer.com",
        passwordHash: "admin123",
        // This will be hashed by the storage layer
        role: "admin"
      });
      res.json({ message: "Admin user created", user: { ...adminUser, passwordHash: void 0 } });
    } catch (error) {
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clients = /* @__PURE__ */ new Set();
  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log("Client connected to WebSocket");
    ws.on("close", () => {
      clients.delete(ws);
      console.log("Client disconnected from WebSocket");
    });
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(ws);
    });
  });
  const broadcastUpdate = (type, data) => {
    const message = JSON.stringify({ type, data });
    clients.forEach((client2) => {
      if (client2.readyState === WebSocket.OPEN) {
        client2.send(message);
      }
    });
  };
  global.broadcastUpdate = broadcastUpdate;
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  base: "./",
  // Use relative paths for production builds
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    assetsDir: "assets",
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js"
      }
    }
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: false, limit: "50mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  app.use("/assets", express2.static(path3.resolve(import.meta.dirname, "../dist/public/assets"), {
    setHeaders: (res, path4) => {
      if (path4.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      } else if (path4.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      } else if (path4.endsWith(".json")) {
        res.setHeader("Content-Type", "application/json");
      }
    }
  }));
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
