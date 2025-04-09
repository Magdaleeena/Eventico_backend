const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateToken, isAdmin, isEventCreatorAdmin } = require('../middlewares/authMiddleware');

// Get all events PUBLIC
router.get('/', eventController.getAllEvents);

// Get an event by ID PUBLIC
router.get('/:id', eventController.getEventById);

// Create a new event ADMIN ONLY
router.post('/', authenticateToken, isAdmin, eventController.createEvent);

// Update an event by ID
router.put('/:id', authenticateToken, isEventCreatorAdmin, eventController.updateEvent);

// Delete an event by ID
router.delete('/:id', authenticateToken, isEventCreatorAdmin, eventController.deleteEvent);

// User can signup for an event
router.post('/:id/signup', authenticateToken, eventController.signUpForEvent);

// User can cancel their signup for an event
router.post('/:id/unsignup', authenticateToken, eventController.unSignUpFromEvent);

module.exports = router;
