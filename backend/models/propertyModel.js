const { getDb } = require('../db');
const { ObjectId } = require('mongodb');

class PropertyModel {
  static async create(propertyData) {
    const db = getDb();
    const properties = db.collection('properties');

    const property = {
      ...propertyData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await properties.insertOne(property);
    return { ...property, _id: result.insertedId };
  }

  static async findAll(options = {}) {
    const db = getDb();
    const properties = db.collection('properties');
    
    const {
      page = 1,
      limit = 12,
      status = 'active',
      propertyType,
      location,
      minPrice,
      maxPrice,
      featured
    } = options;

    const filter = {};
    if (status) filter.status = status;
    if (propertyType) filter.propertyType = propertyType;
    if (location) filter.location = new RegExp(location, 'i');
    if (minPrice) filter.priceETB = { ...filter.priceETB, $gte: minPrice };
    if (maxPrice) filter.priceETB = { ...filter.priceETB, $lte: maxPrice };
    if (featured !== undefined) filter.featured = featured;

    const skip = (page - 1) * limit;
    
    const total = await properties.countDocuments(filter);
    const items = await properties
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return {
      properties: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  static async findById(id) {
    const db = getDb();
    const properties = db.collection('properties');
    return await properties.findOne({ _id: new ObjectId(id) });
  }

  static async findBySlug(slug) {
    const db = getDb();
    const properties = db.collection('properties');
    return await properties.findOne({ slug });
  }

  static async updateById(id, updateData) {
    const db = getDb();
    const properties = db.collection('properties');
    
    const result = await properties.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );
    
    return result.modifiedCount > 0;
  }

  static async deleteById(id) {
    const db = getDb();
    const properties = db.collection('properties');
    const result = await properties.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  static async findFeatured(limit = 6) {
    const db = getDb();
    const properties = db.collection('properties');
    return await properties
      .find({ featured: true, status: 'active' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  static async search(query) {
    const db = getDb();
    const properties = db.collection('properties');
    
    const searchFilter = {
      status: 'active',
      $or: [
        { title: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { location: new RegExp(query, 'i') }
      ]
    };

    return await properties
      .find(searchFilter)
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async getPropertyTypes() {
    const db = getDb();
    const properties = db.collection('properties');
    return await properties.distinct('propertyType');
  }

  static async getLocations() {
    const db = getDb();
    const properties = db.collection('properties');
    return await properties.distinct('location');
  }
}

module.exports = PropertyModel;