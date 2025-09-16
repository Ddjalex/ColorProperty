const express = require('express');
const storage = require('../storage');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get settings
router.get('/', async (req, res) => {
  try {
    const settings = await storage.getSettings();
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

// Update settings
router.put('/', requireAuth, async (req, res) => {
  try {
    const settings = await storage.updateSettings(req.body);
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update settings' });
  }
});

module.exports = router;