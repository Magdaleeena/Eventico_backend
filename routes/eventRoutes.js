const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { hasPermission, isAdmin, isEventCreatorAdmin } = require('../middlewares/clerkAuthMiddleware');

// Get all events PUBLIC
router.get('/', eventController.getAllEvents);

// Get an event by ID PUBLIC
router.get('/:id', eventController.getEventById);

// Create a new event ADMIN ONLY
router.post('/', hasPermission, isAdmin, eventController.createEvent);

// Update an event by ID
router.put('/:id', hasPermission, isEventCreatorAdmin, eventController.updateEvent);

// Delete an event by ID
router.delete('/:id', hasPermission, isEventCreatorAdmin, eventController.deleteEvent);

// User can signup for an event
router.post('/:id/signup', hasPermission, eventController.signUpForEvent);

// User can cancel their signup for an event
router.post('/:id/unsignup', hasPermission, eventController.unSignUpFromEvent);

module.exports = router;
