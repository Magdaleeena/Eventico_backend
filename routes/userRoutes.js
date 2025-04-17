const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');
const { authenticateClerkToken } = require('../middlewares/clerkAuthMiddleware');


// Route to create a user - public route
router.post('/register', userController.createUser);

// Route to login a user - public route
router.post('/login', userController.loginUser);

// Route to get all users - protected route
router.get('/', authenticateToken, isAdmin, userController.getAllUsers);

// Route to get your profile - protected route
router.get('/me', authenticateClerkToken, userController.getOwnProfile);

// Route to update your profile - protected route
router.put('/me', authenticateClerkToken, userController.updateOwnProfile);

// Route to delete your profile - protected route
router.delete('/me', authenticateClerkToken, userController.deleteOwnProfile);

router.post("/sync", userController.syncUserFromClerk);




module.exports = router;