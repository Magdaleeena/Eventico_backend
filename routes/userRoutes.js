const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

const { hasPermission, isAdmin } = require('../middlewares/clerkAuthMiddleware');

// Route to get all users - protected route
router.get('/', hasPermission, isAdmin, userController.getAllUsers);

router.get('/me', (req, res) => {
    console.log('[TEST] /me route hit ✅');
    res.send('Route is alive');
  });
  

// Route to get your profile - protected route
//router.get('/me', userController.getOwnProfile); 

// Route to update your profile - protected route
router.put('/me', userController.updateOwnProfile); 

// Route to delete your profile - protected route
router.delete('/me', userController.deleteOwnProfile); 

router.post("/sync", userController.syncUserFromClerk);


module.exports = router;