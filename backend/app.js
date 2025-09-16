require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://0.0.0.0:5000',
    process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from frontend build in production
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendBuildPath));
}

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// SECURED: Initialize admin user endpoint (only in development mode with secret)
app.post('/api/init-admin', async (req, res) => {
  // Security check: Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'Admin initialization not allowed in production' });
  }

  // Security check: Require secret key from environment
  const initSecret = req.headers['x-init-secret'] || req.body.initSecret;
  const requiredSecret = process.env.ADMIN_INIT_SECRET;
  
  if (!requiredSecret) {
    return res.status(500).json({ message: 'Admin initialization secret not configured' });
  }
  
  if (!initSecret || initSecret !== requiredSecret) {
    return res.status(401).json({ message: 'Invalid initialization secret' });
  }

  try {
    const storage = require('./storage');
    const existingAdmin = await storage.getUserByEmail('admin@temer.com');
    if (existingAdmin) {
      return res.json({ message: 'Admin user already exists' });
    }

    // Pass plain password - storage layer will handle hashing
    const adminUser = await storage.createUser({
      name: 'Admin User',
      email: 'admin@temer.com',
      password: 'TempAdmin2024!ChangeMe', // Plain password, not passwordHash
      role: 'admin'
    });

    res.json({ 
      message: 'Admin user created - CHANGE PASSWORD IMMEDIATELY', 
      user: { ...adminUser, password: undefined, passwordHash: undefined },
      warning: 'Change the default password immediately after first login'
    });
  } catch (error) {
    console.error('Admin initialization error:', error);
    res.status(500).json({ message: 'Failed to create admin user' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Catch-all handler for frontend routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'dist');
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  // 404 handler for development
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
}

// Start server
async function startServer() {
  const PORT = process.env.BACKEND_PORT || (process.env.NODE_ENV === 'production' ? process.env.PORT || 5000 : 3001);
  
  try {
    // Connect to MongoDB database
    try {
      const { connectToDatabase } = require('./db');
      await connectToDatabase();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error.message);
      console.log('Please check your MongoDB connection string');
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.warn('Database connection failed, starting server without database:', error.message);
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend server running on port ${PORT} (without database)`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API base URL: http://localhost:${PORT}/api`);
    });
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  const { closeDatabase } = require('./db');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  const { closeDatabase } = require('./db');
  await closeDatabase();
  process.exit(0);
});

startServer();