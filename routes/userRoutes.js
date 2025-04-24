const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
const { clerkMiddleware } = require('@clerk/express');

const { hasPermission, isAdmin } = require('../middlewares/clerkAuthMiddleware');

// Route to get all users - protected route
router.get('/', clerkMiddleware(), hasPermission, isAdmin, userController.getAllUsers);

// Route to get your profile - protected route
router.get('/me', clerkMiddleware(), hasPermission, userController.getOwnProfile); 

// Route to update your profile - protected route
router.put('/me', clerkMiddleware(), hasPermission, userController.updateOwnProfile); 

// Route to delete your profile - protected route
router.delete('/me', clerkMiddleware(), hasPermission, userController.deleteOwnProfile); 

router.post("/sync", userController.syncUserFromClerk);


module.exports = router;