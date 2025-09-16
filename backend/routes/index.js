const express = require('express');
const authRoutes = require('./auth');
const propertyRoutes = require('./properties');
const blogRoutes = require('./blog');
const teamRoutes = require('./team');
const leadRoutes = require('./leads');
const settingsRoutes = require('./settings');
const heroSlideRoutes = require('./heroSlides');

const router = express.Router();

// Register all route modules
router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/blog', blogRoutes);
router.use('/team', teamRoutes);
router.use('/leads', leadRoutes);
router.use('/settings', settingsRoutes);
router.use('/hero-slides', heroSlideRoutes);

module.exports = router;