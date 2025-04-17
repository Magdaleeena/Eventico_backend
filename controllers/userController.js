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
exports.createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, username, email, password, phone, role, profileImage, bio, location, social, dateOfBirth } = req.body;

    // Check if user already exists
    const normalizedEmail = email.toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }     

    const hashedPassword = await User.hashPassword(password); 
      
    const newUser = new User({ firstName, lastName, username, email: normalizedEmail, password: hashedPassword, phone, role, profileImage, bio, location, social, dateOfBirth });
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
    const user = await User.findOne({ clerkId: req.auth.clerkId }).select('-password');
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
    delete updates.role;
    delete updates.password;

    if (updates.username) {
      const existing = await User.findOne({ username: updates.username });
      if (existing && existing.clerkId !== req.auth.clerkId) {
        return res.status(400).json({ msg: "Username already taken" });
      }
    }

    const user = await User.findOneAndUpdate(
      { clerkId: req.auth.clerkId },
      updates,
      { new: true, runValidators: true }
    ).select('-password');

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
    const user = await User.findOneAndDelete({ clerkId: req.auth.clerkId });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json({ msg: 'Your account has been deleted' });
  } catch (err) {
    next(err);
  }
};


// Sync Clerk user into your database
exports.syncUserFromClerk = async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ msg: "Missing required Clerk info" });
    }

    // Check if user already exists
    let user = await User.findOne({ clerkId });

    if (!user) {
      // Create the user
      user = new User({
        clerkId,
        firstName: firstName || 'First',
        lastName: lastName || 'Last',
        email: email.toLowerCase(),
        username: `${email.split("@")[0]}-${clerkId.slice(-4)}`,
        isVerified: true,
        role: "user", // default role
      });

      await user.save();
    }

    res.status(200).json({ msg: "User synced successfully", user });
  } catch (err) {
    console.error("Error syncing user:", err);
    res.status(500).json({ msg: "Error syncing user", error: err.message });
  }
};






