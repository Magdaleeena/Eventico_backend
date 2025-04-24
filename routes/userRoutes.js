const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

const { isAdmin } = require('../middlewares/clerkAuthMiddleware');

const { requireAuth, getAuth, clerkClient } = require('@clerk/express');

// Route to get all users - protected route
router.get('/', requireAuth(), isAdmin, userController.getAllUsers);

// Route to get your profile - protected route
router.get('/me', requireAuth(), userController.getOwnProfile); 

// Route to update your profile - protected route
router.put('/me', requireAuth(), userController.updateOwnProfile); 

// Route to delete your profile - protected route
router.delete('/me', requireAuth(), userController.deleteOwnProfile); 

router.post("/sync", userController.syncUserFromClerk);


module.exports = router;