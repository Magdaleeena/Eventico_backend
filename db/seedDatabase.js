const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const fs = require('fs');
const path = require('path');


async function seedDatabase() {
  
  const usersData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../db/testData/users.json'), 'utf-8'));
  const eventsData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../db/testData/events.json'), 'utf-8'));
  
  await User.deleteMany({});
  await Event.deleteMany({});

  await User.insertMany(usersData);
  await Event.insertMany(eventsData);

  console.log('Database seeded successfully!');
}

module.exports = seedDatabase;
