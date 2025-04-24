const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

const { extractUserIdFromToken, isAdmin } = require('../middlewares/clerkAuthMiddleware');

// Route to get all users - protected route for admins only
router.get('/', extractUserIdFromToken, isAdmin, userController.getAllUsers);

// Route to get your profile - protected route (auth only)
router.get('/me', extractUserIdFromToken, userController.getOwnProfile);

// Route to update your profile - protected route (auth only)
router.put('/me', extractUserIdFromToken, userController.updateOwnProfile);

// Route to delete your profile - protected route (auth only)
router.delete('/me', extractUserIdFromToken, userController.deleteOwnProfile);

// Sync Clerk user with database - protected route (auth only)
router.post('/sync', extractUserIdFromToken, userController.syncUserFromClerk);

module.exports = router;