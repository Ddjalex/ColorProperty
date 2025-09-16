const express = require('express');
const storage = require('../storage');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all published blog posts
router.get('/', async (req, res) => {
  try {
    const posts = await storage.getBlogPosts('published');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blog posts' });
  }
});

// Get blog post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await storage.getBlogPost(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blog post' });
  }
});

// Get blog post by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const post = await storage.getBlogPostBySlug(req.params.slug);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blog post' });
  }
});

// Create blog post
router.post('/', requireAuth, async (req, res) => {
  try {
    const blogData = { ...req.body };
    if (blogData.publishedAt && typeof blogData.publishedAt === 'string') {
      blogData.publishedAt = new Date(blogData.publishedAt);
    }
    
    const post = await storage.createBlogPost(blogData);
    res.json(post);
  } catch (error) {
    console.error('Blog post creation error:', error);
    res.status(400).json({ 
      message: 'Failed to create blog post', 
      error: error.message || 'Unknown error' 
    });
  }
});

// Update blog post
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const blogData = { ...req.body };
    if (blogData.publishedAt && typeof blogData.publishedAt === 'string') {
      blogData.publishedAt = new Date(blogData.publishedAt);
    }
    
    const post = await storage.updateBlogPost(req.params.id, blogData);
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Blog post update error:', error);
    res.status(400).json({ message: 'Failed to update blog post' });
  }
});

// Delete blog post
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const success = await storage.deleteBlogPost(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete blog post' });
  }
});

module.exports = router;