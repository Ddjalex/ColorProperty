const express = require('express');
const storage = require('../storage');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all hero slides
router.get('/', async (req, res) => {
  try {
    const slides = await storage.getHeroSlides();
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch hero slides' });
  }
});

// Get hero slide by ID
router.get('/:id', async (req, res) => {
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

// Create hero slide
router.post('/', requireAuth, async (req, res) => {
  try {
    const slide = await storage.createHeroSlide(req.body);
    res.json(slide);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create hero slide' });
  }
});

// Update hero slide
router.put('/:id', requireAuth, async (req, res) => {
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

// Delete hero slide
router.delete('/:id', requireAuth, async (req, res) => {
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

module.exports = router;