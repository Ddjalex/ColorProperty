import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertPropertySchema, 
  insertProjectSchema, 
  insertBlogPostSchema, 
  insertTeamMemberSchema, 
  insertLeadSchema,
  insertUserSchema,
  insertHeroSlideSchema
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

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
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
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { ...user, passwordHash: undefined } });
    } catch (error) {
      res.status(400).json({ message: 'Registration failed' });
    }
  });

  // Properties routes
  app.get('/api/properties', async (req, res) => {
    try {
      const result = await storage.getProperties(req.query);
      res.json(result);
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
      console.error('Failed to create property:', error);
      res.status(400).json({ 
        message: 'Failed to create property',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.put('/api/properties/:id', requireAuth, async (req, res) => {
    try {
      console.log('Updating property ID:', req.params.id);
      console.log('Update data:', JSON.stringify(req.body, null, 2));
      
      const property = await storage.updateProperty(req.params.id, req.body);
      if (!property) {
        console.log('Property not found for ID:', req.params.id);
        return res.status(404).json({ message: 'Property not found' });
      }
      console.log('Property updated successfully');
      res.json(property);
    } catch (error) {
      console.error('Property update error:', error);
      res.status(400).json({ 
        message: 'Failed to update property', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
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
      console.log('Received blog post data:', req.body);
      
      // Convert publishedAt string to Date object if present
      const blogData = { ...req.body };
      if (blogData.publishedAt && typeof blogData.publishedAt === 'string') {
        blogData.publishedAt = new Date(blogData.publishedAt);
      }
      
      const postData = insertBlogPostSchema.parse(blogData);
      console.log('Parsed blog post data:', postData);
      const post = await storage.createBlogPost(postData);
      res.json(post);
    } catch (error) {
      console.error('Blog post creation error:', error);
      if (error instanceof Error) {
        res.status(400).json({ message: 'Failed to create blog post', error: error.message });
      } else {
        res.status(400).json({ message: 'Failed to create blog post', error: 'Unknown error' });
      }
    }
  });

  app.put('/api/blog/:id', requireAuth, async (req, res) => {
    try {
      // Convert publishedAt string to Date object if present
      const blogData = { ...req.body };
      if (blogData.publishedAt && typeof blogData.publishedAt === 'string') {
        blogData.publishedAt = new Date(blogData.publishedAt);
      }
      
      const post = await storage.updateBlogPost(req.params.id, blogData);
      if (!post) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      res.json(post);
    } catch (error) {
      console.error('Blog post update error:', error);
      res.status(400).json({ message: 'Failed to update blog post' });
    }
  });

  app.delete('/api/blog/:id', requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteBlogPost(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      res.json({ message: 'Blog post deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete blog post' });
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

  // Hero Slides routes
  app.get('/api/hero-slides', async (req, res) => {
    try {
      const slides = await storage.getHeroSlides();
      res.json(slides);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch hero slides' });
    }
  });

  app.get('/api/hero-slides/:id', async (req, res) => {
    try {
      const slide = await storage.getHeroSlide(req.params.id);
      if (!slide) {
        return res.status(404).json({ message: 'Hero slide not found' });
      }
      res.json(slide);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch hero slide' });
    }
  });

  app.post('/api/hero-slides', requireAuth, async (req, res) => {
    try {
      const slideData = insertHeroSlideSchema.parse(req.body);
      const slide = await storage.createHeroSlide(slideData);
      res.json(slide);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create hero slide' });
    }
  });

  app.put('/api/hero-slides/:id', requireAuth, async (req, res) => {
    try {
      const slide = await storage.updateHeroSlide(req.params.id, req.body);
      if (!slide) {
        return res.status(404).json({ message: 'Hero slide not found' });
      }
      res.json(slide);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update hero slide' });
    }
  });

  app.delete('/api/hero-slides/:id', requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteHeroSlide(req.params.id);
      if (!success) {
        return res.status(404).json({ message: 'Hero slide not found' });
      }
      res.json({ message: 'Hero slide deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete hero slide' });
    }
  });

  // Image serving endpoint for property images
  app.get('/api/properties/:id/images/:index', async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property || !property.images) {
        return res.status(404).json({ message: 'Property or image not found' });
      }

      const imageIndex = parseInt(req.params.index);
      if (imageIndex < 0 || imageIndex >= property.images.length) {
        return res.status(404).json({ message: 'Image index out of range' });
      }

      const imageData = property.images[imageIndex];
      
      // Handle base64 images
      if (imageData.startsWith('data:image/')) {
        const base64Data = imageData.split(',')[1];
        const mimeType = imageData.split(';')[0].split(':')[1];
        
        const buffer = Buffer.from(base64Data, 'base64');
        
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Length', buffer.length);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        res.send(buffer);
      } else if (imageData.startsWith('http')) {
        // Redirect to external image
        res.redirect(imageData);
      } else {
        res.status(404).json({ message: 'Invalid image format' });
      }
    } catch (error) {
      console.error('Error serving image:', error);
      res.status(500).json({ message: 'Failed to serve image' });
    }
  });

  // Initialize admin user if it doesn't exist
  app.post('/api/init-admin', async (req, res) => {
    try {
      const existingAdmin = await storage.getUserByEmail('admin@temer.com');
      if (existingAdmin) {
        return res.json({ message: 'Admin user already exists' });
      }

      const adminUser = await storage.createUser({
        name: 'Admin User',
        email: 'admin@temer.com',
        passwordHash: 'admin123', // This will be hashed by the storage layer
        role: 'admin'
      });

      res.json({ message: 'Admin user created', user: { ...adminUser, passwordHash: undefined } });
    } catch (error) {
      res.status(500).json({ message: 'Failed to create admin user' });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket Server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active WebSocket connections
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');
    
    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });
  
  // Function to broadcast updates to all connected clients
  const broadcastUpdate = (type: string, data: any) => {
    const message = JSON.stringify({ type, data });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };
  
  // Export broadcast function for use in storage operations
  (global as any).broadcastUpdate = broadcastUpdate;
  
  return httpServer;
}
