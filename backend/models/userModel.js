const bcrypt = require('bcrypt');
const { getDb } = require('../db');
const { ObjectId } = require('mongodb');

class UserModel {
  static async create(userData) {
    const db = getDb();
    const users = db.collection('users');

    // Hash password before storing
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);

    const user = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone || null,
      role: userData.role || 'agent',
      passwordHash,
      createdAt: new Date(),
    };

    const result = await users.insertOne(user);
    return { ...user, _id: result.insertedId, passwordHash: undefined };
  }

  static async findByEmail(email) {
    const db = getDb();
    const users = db.collection('users');
    return await users.findOne({ email });
  }

  static async findById(id) {
    const db = getDb();
    const users = db.collection('users');
    return await users.findOne({ _id: new ObjectId(id) });
  }

  static async updateById(id, updateData) {
    const db = getDb();
    const users = db.collection('users');
    
    const updateFields = { ...updateData };
    if (updateFields.password) {
      const saltRounds = 10;
      updateFields.passwordHash = await bcrypt.hash(updateFields.password, saltRounds);
      delete updateFields.password;
    }

    const result = await users.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );
    
    return result.modifiedCount > 0;
  }

  static async deleteById(id) {
    const db = getDb();
    const users = db.collection('users');
    const result = await users.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  static async findAll() {
    const db = getDb();
    const users = db.collection('users');
    return await users.find({}, { projection: { passwordHash: 0 } }).toArray();
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = UserModel;