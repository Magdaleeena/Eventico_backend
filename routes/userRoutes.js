const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
const User = require('../models/User');


// Route to create a user
router.post('/users', userController.createUser);

// Route to get all users
router.get('/users', userController.getAllUsers);

// // Route to get the current authenticated user's details
// router.get('/me', async (req, res) => {
//   if (!req.clerk || !req.clerk.user) {
//     return res.status(401).json({ message: 'Not authenticated' });
//   }

//   const clerkUser = req.clerk.user;

//   try {
//     let mongoUser = await User.findOne({ clerkId: clerkUser.id });

//     if (!mongoUser) {
//       mongoUser = new User({
//         clerkId: clerkUser.id,
//         firstName: clerkUser.firstName,
//         lastName: clerkUser.lastName,
//         email: clerkUser.email,
//         role: 'user',
//         createdAt: new Date(),
//       });
//       await mongoUser.save();
//     }

//     return res.json(mongoUser);
//   } catch (err) {
//     return res.status(500).json({ error: err.message });
//   }
// });

// // Route to link a Clerk user with MongoDB user
// router.post('/link-clerk-user', async (req, res) => {
//   const { clerkUserId, firstName, lastName, email } = req.body;

//   try {
//     let user = await User.findOne({ clerkId: clerkUserId });

//     if (!user) {
//       user = new User({
//         clerkId: clerkUserId,
//         firstName,
//         lastName,
//         email,
//         role: 'user',
//         createdAt: new Date(),
//       });
//       await user.save();
//       console.log('New MongoDB User created:', user);
//     }

//     res.json({ success: true, user });
//   } catch (err) {
//     console.error('Error linking Clerk user:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

module.exports = router;
