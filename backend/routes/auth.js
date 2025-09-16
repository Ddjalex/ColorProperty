const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const storage = require('../storage');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await storage.getUserByEmail(email);
    
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { ...user, passwordHash: undefined } });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const userData = req.body;
    const existingUser = await storage.getUserByEmail(userData.email);
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await storage.createUser(userData);
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { ...user, passwordHash: undefined } });
  } catch (error) {
    res.status(400).json({ message: 'Registration failed' });
  }
});

// Token verification route
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await storage.getUser(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    res.json({ ...user, passwordHash: undefined });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;