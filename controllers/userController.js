const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET, 
    { expiresIn: '2h' } 
  );
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
      const { role } = req.query;
      const filter = role ? { role } : {};
      const users = await User.find(filter); 
      res.status(200).json(users); 
    } catch (err) {
      res.status(500).json({ msg: 'Error fetching users', error: err });
    }
};
// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, phone, role } = req.body;

    // Check if user already exists
    const normalizedEmail = email.toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }     

    const hashedPassword = await User.hashPassword(password); 
      
    const newUser = new User({ firstName, lastName, username, email: normalizedEmail, password: hashedPassword, phone, role });
    await newUser.save();
   
    const token = generateToken(newUser);

    // User response (excluding sensitive fields)
    const userResponse = {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      token, 
    };

    res.status(201).json({
      msg: 'User created successfully',
      user: userResponse,
    });

  } catch (err) {    
    res.status(500).json({ msg: 'Error creating user', error: err.msg });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email }).select('+password'); // This tells Mongoose to include the password field just for this query, which is exactly what you want during login
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      msg: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ msg: 'Error logging in', error: err.msg });
  }
};

// Get your own profile
exports.getOwnProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// Update your own profile
exports.updateOwnProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    delete updates.role; // prevent role change
    delete updates.password; // prevent password change here

    const user = await User.findByIdAndUpdate(req.user.userId, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.status(200).json({ msg: 'Profile updated', user });
  } catch (err) {
    next(err); 
  }
};

// Delete your own profile
exports.deleteOwnProfile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json({ msg: 'Your account has been deleted' });
  } catch (err) {
    next(err); 
  }
};






