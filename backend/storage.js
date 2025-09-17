const { connectToDatabase } = require('./db');
const bcrypt = require('bcrypt');

// PostgreSQL Storage Implementation
class PostgreSQLStorage {
  
  // Helper method to get pool
  async getPool() {
    const { pool } = await connectToDatabase();
    return pool;
  }

  // User methods
  async getUser(id) {
    try {
      const pool = await this.getPool();
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email) {
    try {
      const pool = await this.getPool();
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0] || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(user) {
    try {
      const pool = await this.getPool();
      // Use password field if available, fallback to passwordHash, or use empty string  
      const plainPassword = user.password || user.passwordHash || '';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      const result = await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [user.name, user.email, hashedPassword, user.role || 'user']
      );
      
      const newUser = result.rows[0];
      return { ...newUser, _id: newUser.id.toString() }; // Keep _id for compatibility
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id, user) {
    try {
      const pool = await this.getPool();
      const updateData = { ...user };
      if (updateData.passwordHash) {
        updateData.passwordHash = await bcrypt.hash(updateData.passwordHash, 10);
      }
      
      const result = await pool.query(
        'UPDATE users SET name = COALESCE($2, name), email = COALESCE($3, email), password_hash = COALESCE($4, password_hash), role = COALESCE($5, role), updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [id, updateData.name, updateData.email, updateData.passwordHash, updateData.role]
      );
      
      return result.rows[0] || undefined;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async deleteUser(id) {
    try {
      const pool = await this.getPool();
      const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Property methods
  async getProperties(filters = {}) {
    try {
      const pool = await this.getPool();
      let query = 'SELECT * FROM properties WHERE 1=1';
      const params = [];
      let paramCount = 0;
      
      if (!filters.includeAllStatuses) {
        paramCount++;
        query += ` AND status = ANY($${paramCount})`;
        params.push(['active', 'sold', 'rented']);
      }
      
      if (filters.location) {
        paramCount++;
        query += ` AND location ILIKE $${paramCount}`;
        params.push(`%${filters.location}%`);
      }
      
      if (filters.propertyType) {
        paramCount++;
        query += ` AND property_type = $${paramCount}`;
        params.push(filters.propertyType);
      }
      
      if (filters.bedrooms) {
        paramCount++;
        query += ` AND bedrooms >= $${paramCount}`;
        params.push(parseInt(filters.bedrooms));
      }
      
      if (filters.status) {
        paramCount++;
        query += ` AND status = $${paramCount}`;
        params.push(filters.status);
      }
      
      if (filters.minPrice) {
        paramCount++;
        query += ` AND price_etb >= $${paramCount}`;
        params.push(parseInt(filters.minPrice));
      }
      
      if (filters.maxPrice) {
        paramCount++;
        query += ` AND price_etb <= $${paramCount}`;
        params.push(parseInt(filters.maxPrice));
      }

      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 12;
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await pool.query(query.replace('SELECT *', 'SELECT COUNT(*)'), params);
      const total = parseInt(countResult.rows[0].count);
      
      // Get paginated results
      query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);
      
      const result = await pool.query(query, params);
      const properties = result.rows.map(row => ({
        ...row,
        _id: row.id.toString(), // Keep _id for compatibility
        priceETB: row.price_etb,
        sizeSqm: row.size_sqm,
        propertyType: row.property_type,
        createdAt: row.created_at
      }));
      
      return { properties, total };
    } catch (error) {
      console.error('Error getting properties:', error);
      return { properties: [], total: 0 };
    }
  }

  async getProperty(id) {
    try {
      const pool = await this.getPool();
      const result = await pool.query('SELECT * FROM properties WHERE id = $1', [id]);
      const property = result.rows[0];
      if (!property) return undefined;
      
      return {
        ...property,
        _id: property.id.toString(),
        priceETB: property.price_etb,
        sizeSqm: property.size_sqm,
        propertyType: property.property_type,
        createdAt: property.created_at
      };
    } catch (error) {
      console.error('Error getting property:', error);
      return undefined;
    }
  }

  async getPropertyBySlug(slug) {
    try {
      const pool = await this.getPool();
      const result = await pool.query('SELECT * FROM properties WHERE slug = $1', [slug]);
      const property = result.rows[0];
      if (!property) return undefined;
      
      return {
        ...property,
        _id: property.id.toString(),
        priceETB: property.price_etb,
        sizeSqm: property.size_sqm,
        propertyType: property.property_type,
        createdAt: property.created_at
      };
    } catch (error) {
      console.error('Error getting property by slug:', error);
      return undefined;
    }
  }

  async createProperty(property) {
    try {
      const pool = await this.getPool();
      const result = await pool.query(
        `INSERT INTO properties (title, slug, description, location, property_type, bedrooms, bathrooms, size_sqm, price_etb, status, featured, images, amenities, coordinates) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
        [
          property.title, property.slug, property.description, property.location,
          property.propertyType, property.bedrooms, property.bathrooms, property.sizeSqm,
          property.priceETB, property.status || 'active', property.featured || false,
          property.images || [], property.amenities || [], JSON.stringify(property.coordinates || {})
        ]
      );
      
      const createdProperty = result.rows[0];
      const formattedProperty = {
        ...createdProperty,
        _id: createdProperty.id.toString(),
        priceETB: createdProperty.price_etb,
        sizeSqm: createdProperty.size_sqm,
        propertyType: createdProperty.property_type,
        createdAt: createdProperty.created_at
      };
      
      if (global.broadcastUpdate) {
        global.broadcastUpdate('property_created', formattedProperty);
      }
      
      return formattedProperty;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  }

  async updateProperty(id, property) {
    try {
      const pool = await this.getPool();
      
      const result = await pool.query(
        `UPDATE properties SET 
         title = COALESCE($2, title),
         slug = COALESCE($3, slug),
         description = COALESCE($4, description),
         location = COALESCE($5, location),
         property_type = COALESCE($6, property_type),
         bedrooms = COALESCE($7, bedrooms),
         bathrooms = COALESCE($8, bathrooms),
         size_sqm = COALESCE($9, size_sqm),
         price_etb = COALESCE($10, price_etb),
         status = COALESCE($11, status),
         featured = COALESCE($12, featured),
         images = COALESCE($13, images),
         amenities = COALESCE($14, amenities),
         coordinates = COALESCE($15, coordinates),
         updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 RETURNING *`,
        [
          id, property.title, property.slug, property.description, property.location,
          property.propertyType, property.bedrooms, property.bathrooms, property.sizeSqm,
          property.priceETB, property.status, property.featured,
          property.images, property.amenities, property.coordinates ? JSON.stringify(property.coordinates) : null
        ]
      );
      
      const updatedProperty = result.rows[0];
      if (!updatedProperty) return undefined;
      
      const formattedProperty = {
        ...updatedProperty,
        _id: updatedProperty.id.toString(),
        priceETB: updatedProperty.price_etb,
        sizeSqm: updatedProperty.size_sqm,
        propertyType: updatedProperty.property_type,
        createdAt: updatedProperty.created_at
      };
      
      if (global.broadcastUpdate) {
        global.broadcastUpdate('property_updated', formattedProperty);
      }
      
      return formattedProperty;
    } catch (error) {
      console.error('Error updating property:', error);
      return undefined;
    }
  }

  async deleteProperty(id) {
    try {
      const pool = await this.getPool();
      const result = await pool.query('DELETE FROM properties WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting property:', error);
      return false;
    }
  }

  async getFeaturedProperties() {
    try {
      const pool = await this.getPool();
      const result = await pool.query('SELECT * FROM properties WHERE featured = true ORDER BY created_at DESC');
      return result.rows.map(row => ({
        ...row,
        _id: row.id.toString(),
        priceETB: row.price_etb,
        sizeSqm: row.size_sqm,
        propertyType: row.property_type,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error getting featured properties:', error);
      return [];
    }
  }

  // Blog methods
  async getBlogPosts(status) {
    try {
      const pool = await this.getPool();
      let query = 'SELECT * FROM blog_posts';
      const params = [];
      
      if (status) {
        query += ' WHERE status = $1';
        params.push(status);
      }
      
      query += ' ORDER BY published_at DESC, created_at DESC';
      
      const result = await pool.query(query, params);
      return result.rows.map(row => ({
        ...row,
        _id: row.id.toString(),
        publishedAt: row.published_at,
        createdAt: row.created_at,
        imageUrl: row.image_url
      }));
    } catch (error) {
      console.error('Error getting blog posts:', error);
      return [];
    }
  }

  async getBlogPost(id) {
    try {
      const pool = await this.getPool();
      const result = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
      const post = result.rows[0];
      if (!post) return undefined;
      
      return {
        ...post,
        _id: post.id.toString(),
        publishedAt: post.published_at,
        createdAt: post.created_at,
        imageUrl: post.image_url
      };
    } catch (error) {
      console.error('Error getting blog post:', error);
      return undefined;
    }
  }

  async getBlogPostBySlug(slug) {
    try {
      const pool = await this.getPool();
      const result = await pool.query('SELECT * FROM blog_posts WHERE slug = $1', [slug]);
      const post = result.rows[0];
      if (!post) return undefined;
      
      return {
        ...post,
        _id: post.id.toString(),
        publishedAt: post.published_at,
        createdAt: post.created_at,
        imageUrl: post.image_url
      };
    } catch (error) {
      console.error('Error getting blog post by slug:', error);
      return undefined;
    }
  }

  async createBlogPost(post) {
    try {
      const pool = await this.getPool();
      const result = await pool.query(
        'INSERT INTO blog_posts (title, slug, content, excerpt, status, image_url, published_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [post.title, post.slug, post.content, post.excerpt, post.status || 'draft', post.imageUrl, post.publishedAt]
      );
      
      const createdPost = result.rows[0];
      return {
        ...createdPost,
        _id: createdPost.id.toString(),
        publishedAt: createdPost.published_at,
        createdAt: createdPost.created_at,
        imageUrl: createdPost.image_url
      };
    } catch (error) {
      console.error('Error creating blog post:', error);
      throw error;
    }
  }

  async updateBlogPost(id, post) {
    try {
      const pool = await this.getPool();
      const result = await pool.query(
        `UPDATE blog_posts SET 
         title = COALESCE($2, title),
         slug = COALESCE($3, slug),
         content = COALESCE($4, content),
         excerpt = COALESCE($5, excerpt),
         status = COALESCE($6, status),
         image_url = COALESCE($7, image_url),
         published_at = COALESCE($8, published_at),
         updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 RETURNING *`,
        [id, post.title, post.slug, post.content, post.excerpt, post.status, post.imageUrl, post.publishedAt]
      );
      
      const updatedPost = result.rows[0];
      if (!updatedPost) return undefined;
      
      return {
        ...updatedPost,
        _id: updatedPost.id.toString(),
        publishedAt: updatedPost.published_at,
        createdAt: updatedPost.created_at,
        imageUrl: updatedPost.image_url
      };
    } catch (error) {
      console.error('Error updating blog post:', error);
      return undefined;
    }
  }

  async deleteBlogPost(id) {
    try {
      const pool = await this.getPool();
      const result = await pool.query('DELETE FROM blog_posts WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting blog post:', error);
      return false;
    }
  }

  // Team methods
  async getTeamMembers() {
    try {
      const pool = await this.getPool();
      const result = await pool.query('SELECT * FROM team_members ORDER BY order_position ASC');
      return result.rows.map(row => ({
        ...row,
        _id: row.id.toString(),
        imageUrl: row.image_url,
        order: row.order_position,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error getting team members:', error);
      return [];
    }
  }

  async createTeamMember(member) {
    try {
      const pool = await this.getPool();
      const result = await pool.query(
        'INSERT INTO team_members (name, position, bio, image_url, order_position) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [member.name, member.position, member.bio, member.imageUrl, member.order || 0]
      );
      
      const createdMember = result.rows[0];
      return {
        ...createdMember,
        _id: createdMember.id.toString(),
        imageUrl: createdMember.image_url,
        order: createdMember.order_position,
        createdAt: createdMember.created_at
      };
    } catch (error) {
      console.error('Error creating team member:', error);
      throw error;
    }
  }

  // Lead methods
  async getLeads() {
    try {
      const pool = await this.getPool();
      const result = await pool.query('SELECT * FROM leads ORDER BY created_at DESC');
      return result.rows.map(row => ({
        ...row,
        _id: row.id.toString(),
        propertyId: row.property_id,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error getting leads:', error);
      return [];
    }
  }

  async createLead(lead) {
    try {
      const pool = await this.getPool();
      const result = await pool.query(
        'INSERT INTO leads (name, email, phone, message, property_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [lead.name, lead.email, lead.phone, lead.message, lead.propertyId]
      );
      
      const createdLead = result.rows[0];
      return {
        ...createdLead,
        _id: createdLead.id.toString(),
        propertyId: createdLead.property_id,
        createdAt: createdLead.created_at
      };
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  // Settings methods
  async getSettings() {
    try {
      const pool = await this.getPool();
      const result = await pool.query('SELECT * FROM settings LIMIT 1');
      const settings = result.rows[0];
      if (!settings) return undefined;
      
      return {
        ...settings,
        _id: settings.id.toString(),
        siteName: settings.site_name,
        siteDescription: settings.site_description,
        contactEmail: settings.contact_email,
        contactPhone: settings.contact_phone,
        socialMedia: settings.social_media,
        updatedAt: settings.updated_at
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return undefined;
    }
  }

  async updateSettings(settings) {
    try {
      const pool = await this.getPool();
      
      // Try to update existing settings first
      const updateResult = await pool.query(
        `UPDATE settings SET 
         site_name = COALESCE($1, site_name),
         site_description = COALESCE($2, site_description),
         contact_email = COALESCE($3, contact_email),
         contact_phone = COALESCE($4, contact_phone),
         address = COALESCE($5, address),
         social_media = COALESCE($6, social_media),
         updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [settings.siteName, settings.siteDescription, settings.contactEmail, settings.contactPhone, settings.address, JSON.stringify(settings.socialMedia)]
      );
      
      if (updateResult.rowCount === 0) {
        // No existing settings, create new
        const insertResult = await pool.query(
          'INSERT INTO settings (site_name, site_description, contact_email, contact_phone, address, social_media) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
          [settings.siteName, settings.siteDescription, settings.contactEmail, settings.contactPhone, settings.address, JSON.stringify(settings.socialMedia)]
        );
        
        const createdSettings = insertResult.rows[0];
        return {
          ...createdSettings,
          _id: createdSettings.id.toString(),
          siteName: createdSettings.site_name,
          siteDescription: createdSettings.site_description,
          contactEmail: createdSettings.contact_email,
          contactPhone: createdSettings.contact_phone,
          socialMedia: createdSettings.social_media,
          updatedAt: createdSettings.updated_at
        };
      }
      
      const updatedSettings = updateResult.rows[0];
      return {
        ...updatedSettings,
        _id: updatedSettings.id.toString(),
        siteName: updatedSettings.site_name,
        siteDescription: updatedSettings.site_description,
        contactEmail: updatedSettings.contact_email,
        contactPhone: updatedSettings.contact_phone,
        socialMedia: updatedSettings.social_media,
        updatedAt: updatedSettings.updated_at
      };
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  // Hero Slide methods
  async getHeroSlides() {
    try {
      const pool = await this.getPool();
      const result = await pool.query('SELECT * FROM hero_slides WHERE active = true ORDER BY order_position ASC');
      return result.rows.map(row => ({
        ...row,
        _id: row.id.toString(),
        imageUrl: row.image_url,
        order: row.order_position,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error getting hero slides:', error);
      return [];
    }
  }

  async getHeroSlide(id) {
    try {
      const pool = await this.getPool();
      const result = await pool.query('SELECT * FROM hero_slides WHERE id = $1', [id]);
      const slide = result.rows[0];
      if (!slide) return undefined;
      
      return {
        ...slide,
        _id: slide.id.toString(),
        imageUrl: slide.image_url,
        order: slide.order_position,
        createdAt: slide.created_at
      };
    } catch (error) {
      console.error('Error getting hero slide:', error);
      return undefined;
    }
  }

  async createHeroSlide(slide) {
    try {
      const pool = await this.getPool();
      const result = await pool.query(
        'INSERT INTO hero_slides (title, subtitle, image_url, order_position, active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [slide.title, slide.subtitle, slide.imageUrl, slide.order || 0, slide.active !== false]
      );
      
      const createdSlide = result.rows[0];
      return {
        ...createdSlide,
        _id: createdSlide.id.toString(),
        imageUrl: createdSlide.image_url,
        order: createdSlide.order_position,
        createdAt: createdSlide.created_at
      };
    } catch (error) {
      console.error('Error creating hero slide:', error);
      throw error;
    }
  }

  async updateHeroSlide(id, slide) {
    try {
      const pool = await this.getPool();
      const result = await pool.query(
        `UPDATE hero_slides SET 
         title = COALESCE($2, title),
         subtitle = COALESCE($3, subtitle),
         image_url = COALESCE($4, image_url),
         order_position = COALESCE($5, order_position),
         active = COALESCE($6, active),
         updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 RETURNING *`,
        [id, slide.title, slide.subtitle, slide.imageUrl, slide.order, slide.active]
      );
      
      const updatedSlide = result.rows[0];
      if (!updatedSlide) return undefined;
      
      return {
        ...updatedSlide,
        _id: updatedSlide.id.toString(),
        imageUrl: updatedSlide.image_url,
        order: updatedSlide.order_position,
        createdAt: updatedSlide.created_at
      };
    } catch (error) {
      console.error('Error updating hero slide:', error);
      return undefined;
    }
  }

  async deleteHeroSlide(id) {
    try {
      const pool = await this.getPool();
      const result = await pool.query('DELETE FROM hero_slides WHERE id = $1', [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting hero slide:', error);
      return false;
    }
  }

  // Project methods (for future use)
  async getProjects() {
    try {
      const pool = await this.getPool();
      const result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
      return result.rows.map(row => ({
        ...row,
        _id: row.id.toString(),
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  }

  async createProject(project) {
    try {
      const pool = await this.getPool();
      const result = await pool.query(
        'INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING *',
        [project.name, project.description]
      );
      
      const createdProject = result.rows[0];
      return {
        ...createdProject,
        _id: createdProject.id.toString(),
        createdAt: createdProject.created_at
      };
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }
}

// Create and export storage instance
const storage = new PostgreSQLStorage();

module.exports = storage;