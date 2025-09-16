const express = require('express');
const storage = require('../storage');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all leads (admin only)
router.get('/', requireAuth, async (req, res) => {
  try {
    const leads = await storage.getLeads();
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leads' });
  }
});

// Create lead (public endpoint)
router.post('/', async (req, res) => {
  try {
    const lead = await storage.createLead(req.body);
    res.json(lead);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create lead' });
  }
});

module.exports = router;