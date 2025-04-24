const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

const { isAdmin } = require('../middlewares/clerkAuthMiddleware');
const clerk = require('@clerk/express'); 
const { requireAuth } = clerk;


// Route to get all users - protected route for admins only
router.get('/', requireAuth(), isAdmin, userController.getAllUsers);

// Route to get your profile - protected route (auth only)
router.get('/me', requireAuth(), userController.getOwnProfile);

// Route to update your profile - protected route (auth only)
router.put('/me', requireAuth(), userController.updateOwnProfile);

// Route to delete your profile - protected route (auth only)
router.delete('/me', requireAuth(), userController.deleteOwnProfile);

// Sync Clerk user with database - protected route (auth only)
router.post('/sync', requireAuth(), userController.syncUserFromClerk);

module.exports = router;