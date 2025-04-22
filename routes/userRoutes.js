const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

const { authenticateClerkToken, isAdmin } = require('../middlewares/clerkAuthMiddleware');

// Route to get all users - protected route
router.get('/', ...authenticateClerkToken, isAdmin, userController.getAllUsers);

// Route to get your profile - protected route
router.get('/me', ...authenticateClerkToken, userController.getOwnProfile); 

// Route to update your profile - protected route
router.put('/me', ...authenticateClerkToken, userController.updateOwnProfile); 

// Route to delete your profile - protected route
router.delete('/me', ...authenticateClerkToken, userController.deleteOwnProfile); 

router.post("/sync", userController.syncUserFromClerk);


module.exports = router;