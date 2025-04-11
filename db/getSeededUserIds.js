const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv-flow').config();

const connectDB = require('./index');

(async () => {
  try {
    await connectDB();

    const users = await User.find({});
    console.log(
      users.map((u) => ({
        name: `${u.firstName} ${u.lastName}`,
        username: u.username,
        role: u.role,
        id: u._id,
        organizerContact: {
          email: u.email,
          phone: u.phone,
        },
      }))
    );

    mongoose.connection.close();
  } catch (err) {
    console.error('Error fetching users:', err);
    mongoose.connection.close();
  }
})();

// NODE_ENV=production node db/getSeededUserIds.js
