const express = require('express');
const storage = require('../storage');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all team members
router.get('/', async (req, res) => {
  try {
    const members = await storage.getTeamMembers();
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch team members' });
  }
});

// Create team member
router.post('/', requireAuth, async (req, res) => {
  try {
    const member = await storage.createTeamMember(req.body);
    res.json(member);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create team member' });
  }
});

module.exports = router;