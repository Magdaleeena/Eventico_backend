const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { requireAuth, isAdmin, isEventCreatorAdmin } = require('../middlewares/clerkAuthMiddleware');

// Get all events PUBLIC
router.get('/', eventController.getAllEvents);

// Get an event by ID PUBLIC
router.get('/:id', eventController.getEventById);

// Create a new event ADMIN ONLY
router.post('/', requireAuth(), isAdmin, eventController.createEvent);

// Update an event by ID
router.put('/:id', requireAuth(), isEventCreatorAdmin, eventController.updateEvent);

// Delete an event by ID
router.delete('/:id', requireAuth(), isEventCreatorAdmin, eventController.deleteEvent);

// User can signup for an event
router.post('/:id/signup', requireAuth(), eventController.signUpForEvent);

// User can cancel their signup for an event
router.post('/:id/unsignup', requireAuth(), eventController.unSignUpFromEvent);

module.exports = router;
