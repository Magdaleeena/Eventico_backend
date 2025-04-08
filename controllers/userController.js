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
      const { role } = req.query;
      const filter = role ? { role } : {};
      const users = await User.find(filter); 
      res.status(200).json(users); 
    } catch (err) {
      res.status(500).json({ message: 'Error fetching users', error: err });
    }
  };


// Get a user by clerkUserId
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ clerkUserId: req.auth.user.id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err });
  }
};
