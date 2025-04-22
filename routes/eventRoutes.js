const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateClerkToken, isAdmin, isEventCreatorAdmin } = require('../middlewares/clerkAuthMiddleware');

// Get all events PUBLIC
router.get('/', eventController.getAllEvents);

// Get an event by ID PUBLIC
router.get('/:id', eventController.getEventById);

// Create a new event ADMIN ONLY
router.post('/', authenticateClerkToken, isAdmin, eventController.createEvent);

// Update an event by ID
router.put('/:id', authenticateClerkToken, isEventCreatorAdmin, eventController.updateEvent);

// Delete an event by ID
router.delete('/:id', authenticateClerkToken, isEventCreatorAdmin, eventController.deleteEvent);

// User can signup for an event
router.post('/:id/signup', authenticateClerkToken, eventController.signUpForEvent);

// User can cancel their signup for an event
router.post('/:id/unsignup', authenticateClerkToken, eventController.unSignUpFromEvent);

module.exports = router;
