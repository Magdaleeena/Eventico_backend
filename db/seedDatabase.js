require('dotenv-flow').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const fs = require('fs');
const path = require('path');
const connectDB = require('./index');

async function seedDatabase(dataset = 'testData') {
  try {
    await connectDB(); // connect to DB using env

    const usersDataPath = path.resolve(__dirname, `${dataset}/users.json`);
    const eventsDataPath = path.resolve(__dirname, `${dataset}/events.json`);

    const usersData = JSON.parse(fs.readFileSync(usersDataPath, 'utf-8'));
    const eventsData = JSON.parse(fs.readFileSync(eventsDataPath, 'utf-8'));

    await User.deleteMany({});
    await Event.deleteMany({});

    await User.insertMany(usersData);
    await Event.insertMany(eventsData);

    console.log(`Database seeded using "${dataset}" dataset (${process.env.NODE_ENV} environment)`);

    if (require.main === module) {
      process.exit(0);
    }
  } catch (err) {
    console.error('Error seeding database:', err);
    if (require.main === module) {
      process.exit(1);
    } else {
      throw err; // Let tests catch it
    }
  }
};


// Run from CLI if called directly
if (require.main === module) {
  const datasetArg = process.argv[2] || 'testData'; // default to testData
  seedDatabase(datasetArg);
} else {
  module.exports = seedDatabase;
}


