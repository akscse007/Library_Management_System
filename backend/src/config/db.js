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
