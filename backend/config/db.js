// Database configuration file
// Connects to MongoDB using Mongoose

const mongoose = require('mongoose');

/**
 * Connects to MongoDB database
 * Uses MONGODB_URI from environment variables
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/linkedin-clone', {
      // These options are now default in Mongoose 6+, but kept for compatibility
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

