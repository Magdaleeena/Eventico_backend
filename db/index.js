// Database connection set up
const mongoose = require('mongoose');
require('dotenv-flow').config(); // Import dotenv-flow to load environment variables

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/eventicoTestDB');
    console.log('MongoDB Connected Successfully');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
