const express = require('express');
const storage = require('../storage');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get properties stats (for dashboard) - optimized  
router.get('/stats', async (req, res) => {
  try {
    const result = await storage.getProperties({ includeAllStatuses: true, limit: 1 });
    res.json({ total: result.total });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch properties stats' });
  }
});

// Get all properties
router.get('/', async (req, res) => {
  try {
    const result = await storage.getProperties(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch properties' });
  }
});

// Get featured properties
router.get('/featured', async (req, res) => {
  try {
    const properties = await storage.getFeaturedProperties();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch featured properties' });
  }
});

// Get property by ID
router.get('/:id', async (req, res) => {
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

// Get property by slug
router.get('/slug/:slug', async (req, res) => {
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

// Create property
router.post('/', requireAuth, async (req, res) => {
  try {
    const property = await storage.createProperty(req.body);
    res.json(property);
  } catch (error) {
    console.error('Failed to create property:', error);
    res.status(400).json({ 
      message: 'Failed to create property',
      error: error.message || 'Unknown error'
    });
  }
});

// Update property
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const property = await storage.updateProperty(req.params.id, req.body);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    console.error('Property update error:', error);
    res.status(400).json({ 
      message: 'Failed to update property', 
      error: error.message || 'Unknown error' 
    });
  }
});

// Delete property
router.delete('/:id', requireAuth, async (req, res) => {
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

// Serve property images with optimization
router.get('/:id/images/:index', async (req, res) => {
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
      
      // Add aggressive caching for images
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('ETag', `"${req.params.id}-${imageIndex}"`);
      
      // Check if client has cached version
      if (req.headers['if-none-match'] === `"${req.params.id}-${imageIndex}"`) {
        return res.status(304).end();
      }
      
      res.send(buffer);
    } else if (imageData.startsWith('http')) {
      res.redirect(imageData);
    } else {
      res.status(404).json({ message: 'Invalid image format' });
    }
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ message: 'Failed to serve image' });
  }
});

module.exports = router;