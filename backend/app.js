require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./db');
const routes = require('./routes');

const app = express();
// Force backend to use port 3001 (port 5000 is reserved for frontend in Replit)
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

  // Security check: Require secret key
  const initSecret = req.headers['x-init-secret'] || req.body.initSecret;
  if (!initSecret || initSecret !== 'TEMP_INIT_SECRET_2024') {
    return res.status(401).json({ message: 'Invalid initialization secret' });
  }

  try {
    const storage = require('./storage');
    const existingAdmin = await storage.getUserByEmail('admin@temer.com');
    if (existingAdmin) {
      return res.json({ message: 'Admin user already exists' });
    }

    // Use strong password (should be changed on first login)
    const adminUser = await storage.createUser({
      name: 'Admin User',
      email: 'admin@temer.com',
      passwordHash: 'TempAdmin2024!ChangeMe',
      role: 'admin'
    });

    res.json({ 
      message: 'Admin user created - CHANGE PASSWORD IMMEDIATELY', 
      user: { ...adminUser, passwordHash: undefined },
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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    // Connect to database first
    await connectToDatabase();
    console.log('Database connected successfully');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
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