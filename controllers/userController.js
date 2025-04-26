const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Event = require('../models/Event');

// Generate token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,        
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
}

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
exports.createUser = async (req, res, next) => {
  
  try {
    const { firstName, lastName, username, email, password, phone, role, profileImage, bio, location, social, dateOfBirth } = req.body;

    // Check if user already exists
    const normalizedEmail = email.toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }     

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[a-zA-Z\d\S]{8,}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        msg: 'Password must be at least 8 characters long, include both letters, numbers, and at least one special character.'
      });
    }

    const hashedPassword = await User.hashPassword(password); 
      
    const newUser = new User({ firstName, lastName, username, email: normalizedEmail, password: hashedPassword, phone, role, profileImage, bio, location, social, dateOfBirth });
    try {
      await newUser.save();
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      return res.status(400).json({ msg: saveError.message || 'Error saving user' });
    }

    console.log('Generating token with:', {
      id: newUser._id,
      username: newUser.username,
      role: newUser.role,
      jwtSecret: process.env.JWT_SECRET ? 'exists' : 'missing'
    });
   
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
      profileImage: newUser.profileImage,
      bio: newUser.bio,
      location: newUser.location,
      social: newUser.social,
      dateOfBirth: newUser.dateOfBirth,
      isVerified: newUser.isVerified,
      isActive: newUser.isActive,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,    
      token, 
    };

    res.status(201).json({
      msg: 'User created successfully',
      user: userResponse,
    });

  } catch (err) {
    next(err); 
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
    const user = await User.findById(req.user.id)
    .select('-password')
    .populate('eventsSignedUp', 'title date location');    
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    let eventsManaged = [];

    if (user.role === 'admin') {
      eventsManaged = await Event.find({ createdBy: user._id })
        .select('title date location');
    }

    res.status(200).json({
      ...user.toObject(), 
      eventsManaged,
    });
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

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
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
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json({ msg: 'Your account has been deleted' });
  } catch (err) {
    next(err); 
  }
};






