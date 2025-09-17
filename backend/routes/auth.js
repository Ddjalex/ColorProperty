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

// Change password route
router.put('/change-password', async (req, res) => {
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
    
    const { currentPassword, newPassword } = req.body;
    
    // Verify current password
    if (!await bcrypt.compare(currentPassword, user.passwordHash)) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }
    
    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await storage.updateUser(user._id, { passwordHash: hashedPassword });
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

// Change email route
router.put('/change-email', async (req, res) => {
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
    
    const { newEmail, password } = req.body;
    
    // Verify current password
    if (!await bcrypt.compare(password, user.passwordHash)) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Check if email is already taken
    const existingUser = await storage.getUserByEmail(newEmail);
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.status(400).json({ message: 'Email is already in use' });
    }
    
    // Update email
    await storage.updateUser(user._id, { email: newEmail });
    
    res.json({ message: 'Email updated successfully' });
  } catch (error) {
    console.error('Change email error:', error);
    res.status(500).json({ message: 'Failed to change email' });
  }
});

module.exports = router;