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

// Get detailed analytics
router.get('/analytics', requireAuth, async (req, res) => {
  try {
    const [
      allProperties,
      activeProperties,
      soldProperties,
      rentedProperties,
      recentProperties
    ] = await Promise.all([
      storage.getProperties({ includeAllStatuses: true, limit: 1 }),
      storage.getProperties({ status: 'active', limit: 1 }),
      storage.getProperties({ status: 'sold', limit: 1 }),
      storage.getProperties({ status: 'rented', limit: 1 }),
      storage.getProperties({ includeAllStatuses: true, limit: 5 }) // Just for recent activity
    ]);

    // Get ALL properties for comprehensive analytics
    const allPropertiesData = await storage.getProperties({ 
      includeAllStatuses: true, 
      limit: 1000 // Get up to 1000 properties for analytics
    });

    // Calculate property type distribution from ALL properties
    const propertyTypes = {};
    const locations = {};
    const priceRanges = {
      'Under 1M': 0,
      '1M - 5M': 0,
      '5M - 10M': 0,
      'Over 10M': 0
    };

    allPropertiesData.properties.forEach(property => {
      // Property types
      const type = property.propertyType || 'Unknown';
      propertyTypes[type] = (propertyTypes[type] || 0) + 1;

      // Locations
      const location = property.location || 'Unknown';
      locations[location] = (locations[location] || 0) + 1;

      // Price ranges
      const price = property.priceETB || 0;
      if (price < 1000000) {
        priceRanges['Under 1M']++;
      } else if (price < 5000000) {
        priceRanges['1M - 5M']++;
      } else if (price < 10000000) {
        priceRanges['5M - 10M']++;
      } else {
        priceRanges['Over 10M']++;
      }
    });

    res.json({
      summary: {
        total: allProperties.total,
        active: activeProperties.total,
        sold: soldProperties.total,
        rented: rentedProperties.total,
        availablePercentage: allProperties.total > 0 ? Math.round((activeProperties.total / allProperties.total) * 100) : 0
      },
      propertyTypes,
      locations: Object.entries(locations).slice(0, 5), // Top 5 locations
      priceRanges,
      recentProperties: recentProperties.properties.map(p => ({
        id: p._id,
        title: p.title,
        status: p.status,
        priceETB: p.priceETB,
        location: p.location,
        createdAt: p.createdAt
      }))
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
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