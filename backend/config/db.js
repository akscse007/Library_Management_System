// backend/src/config/db.js
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lmsdb';

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return;
    }
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
    
    // Remove old JSON schema validator if it exists
    const db = mongoose.connection.db;
    try {
      const collections = await db.listCollections().toArray();
      const userCollExists = collections.some(col => col.name === 'users');
      
      if (userCollExists) {
        try {
          // Use collMod command to clear validator
          await db.command({ 
            collMod: 'users', 
            validator: {}
          });
        } catch (err) {
          // Silently skip if no validator exists
        }
      }
    } catch (validatorErr) {
      // Silently skip validator cleanup
    }
    
    // optional: listen for disconnects
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB error:', err);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // rethrow so the server startup can handle/exit if desired
    throw err;
  }
};

module.exports = connectDB;
