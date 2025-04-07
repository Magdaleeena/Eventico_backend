const User = require('../models/User');

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password } = req.body;
    const newUser = new User({ firstName, lastName, username, email, password }); // You might want to hash the password before saving
    await newUser.save();
    res.status(201).json(newUser); // Respond with the created user
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find(); // Mongoose will use the 'users' collection automatically
      res.status(200).json(users); // Respond with the list of users
    } catch (err) {
      res.status(500).json({ message: 'Error fetching users', error: err });
    }
  };
