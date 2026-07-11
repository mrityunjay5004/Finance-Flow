const mongoose = require('mongoose');
const config = require('./index');

let isConnected = false;

/**
 * Establishment of MongoDB connection with serverless reuse support
 */
const connectDB = async () => {
  mongoose.set('strictQuery', true);

  if (isConnected || mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    isConnected = true;
    return;
  }

  try {
    const db = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
    isConnected = db.connections[0].readyState === 1;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    throw err;
  }
};

module.exports = connectDB;
