import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPropertySchema, 
  insertProjectSchema, 
  insertBlogPostSchema, 
  insertTeamMemberSchema, 
  insertLeadSchema,
  insertUserSchema
} from "@shared/schema";

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function registerRoutes(app: Express): Promise<Server> {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  // Auth middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };

  // Auth routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || !await bcrypt.compare(password, user.passwordHash)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { ...user, passwordHash: undefined } });
    } catch (error) {
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await storage.createUser(userData);
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { ...user, passwordHash: undefined } });
    } catch (error) {
      res.status(400).json({ message: 'Registration failed' });
    }
  });

  // Properties routes
  app.get('/api/properties', async (req, res) => {
    try {
      const properties = await storage.getProperties(req.query);
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch properties' });
    }
  });

  app.get('/api/properties/featured', async (req, res) => {
    try {
      const properties = await storage.getFeaturedProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch featured properties' });
    }
  });

  app.get('/api/properties/:id', async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch property' });
    }
  });

  app.get('/api/properties/slug/:slug', async (req, res) => {
    try {
      const property = await storage.getPropertyBySlug(req.params.slug);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch property' });
    }
  });

  app.post('/api/properties', requireAuth, async (req, res) => {
    try {
      const propertyData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(propertyData);
      res.json(property);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create property' });
    }
  });

  app.put('/api/properties/:id', requireAuth, async (req, res) => {
    try {
      const property = await storage.updateProperty(req.params.id, req.body);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      res.json(property);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update property' });
    }
  });

  app.delete('/api/properties/:id', requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteProperty(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Property not found' });
      }
      res.json({ message: 'Property deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete property' });
    }
  });

  // Projects routes
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch projects' });
    }
  });

  app.post('/api/projects', requireAuth, async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create project' });
    }
  });

  // Blog routes
  app.get('/api/blog', async (req, res) => {
    try {
      const posts = await storage.getBlogPosts('published');
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch blog posts' });
    }
  });

  app.get('/api/blog/:id', async (req, res) => {
    try {
      const post = await storage.getBlogPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch blog post' });
    }
  });

  app.get('/api/blog/slug/:slug', async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch blog post' });
    }
  });

  app.post('/api/blog', requireAuth, async (req, res) => {
    try {
      const postData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(postData);
      res.json(post);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create blog post' });
    }
  });

  // Team routes
  app.get('/api/team', async (req, res) => {
    try {
      const members = await storage.getTeamMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch team members' });
    }
  });

  app.post('/api/team', requireAuth, async (req, res) => {
    try {
      const memberData = insertTeamMemberSchema.parse(req.body);
      const member = await storage.createTeamMember(memberData);
      res.json(member);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create team member' });
    }
  });

  // Leads routes
  app.get('/api/leads', requireAuth, async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch leads' });
    }
  });

  app.post('/api/leads', async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      res.json(lead);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create lead' });
    }
  });

  // Settings routes
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch settings' });
    }
  });

  app.put('/api/settings', requireAuth, async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update settings' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
