/**
 * E:\Codes\LibRepo\Mern\backend\config\db.js
 *
 * Simple MongoDB connection helper. Exports a function connectDB().
 * Uses MONGO_URI from process.env.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lmsdb';
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Re-throw so callers can decide whether to exit or keep running
    throw err;
  }
};

module.exports = connectDB;
