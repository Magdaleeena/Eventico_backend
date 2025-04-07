const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
const User = require('../models/User');

// Route to create a user
router.post('/users', userController.createUser);

// Route to get all users
router.get('/users', userController.getAllUsers);

// Route to get the current authenticated user's details
router.get('/me', async (req, res) => {
    if (req.clerk.user) {
      const clerkUser = req.clerk.user;  // Clerk's authenticated user object
      try {
        // Look up the user in MongoDB using Clerk's user ID
        const mongoUser = await User.findOne({ clerkId: clerkUser.id });
  
        if (mongoUser) {
          // If user exists in MongoDB, return the MongoDB user data
          return res.json(mongoUser);
        }
  
        // If user doesn't exist in MongoDB, return the Clerk user data
        return res.json(clerkUser);  // You may want to store this user in MongoDB later
      } catch (err) {
        return res.status(500).json({ error: err.message });
      }
    } else {
      return res.status(401).json({ message: 'Not authenticated' });
    }
  });
  
  // Route to link a Clerk user with MongoDB user
  router.post('/link-clerk-user', async (req, res) => {
    const { name, email, clerkUserId } = req.body;  // Accept name, email, and Clerk user ID from the client
  
    try {
      // Check if the Clerk user already exists in MongoDB
      let user = await User.findOne({ clerkId: clerkUserId });
  
      if (!user) {
        // If the user doesn't exist, create a new MongoDB user and associate it with Clerk's user ID
        user = new User({
          clerkId: clerkUserId,
          name,
          email,
          role: 'user',  // Default role
          createdAt: new Date(),
        });
        await user.save();
      }
  
      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;

