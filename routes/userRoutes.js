const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');


// Route to create a user - public route
router.post('/register', userController.createUser);

// Route to login a user - public route
router.post('/login', userController.loginUser);

// Route to get all users - protected route
router.get('/', authenticateToken, isAdmin, userController.getAllUsers);

// Route to get your profile - protected route
router.get('/me', authenticateToken, userController.getOwnProfile);

// Route to update your profile - protected route
router.put('/me', authenticateToken, userController.updateOwnProfile);

// Route to delete your profile - protected route
router.delete('/me', authenticateToken, userController.deleteOwnProfile);

router.post("/sync", userController.syncUserFromClerk);




module.exports = router;