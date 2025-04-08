const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');


// Route to create a user - public route
router.post('/users', userController.createUser);

// Route to get all users - protected route
router.get('/users', authenticateToken, isAdmin, userController.getAllUsers);



module.exports = router;