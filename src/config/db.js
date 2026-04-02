const mongoose = require('mongoose');
const config = require('./index');

let isConnected = false;

/**
 * Establishment of MongoDB connection with serverless reuse support
 */
const connectDB = async () => {
  mongoose.set('strictQuery', true);

  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(config.mongoUri);
    isConnected = db.connections[0].readyState === 1;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    throw err;
  }
};

module.exports = connectDB;
