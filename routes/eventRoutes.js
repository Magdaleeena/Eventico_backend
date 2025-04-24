const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

const { isAdmin, isEventCreatorAdmin } = require('../middlewares/clerkAuthMiddleware');
const clerk = require('@clerk/express'); 
const { requireAuth } = clerk;

// Get all events - PUBLIC
router.get('/', eventController.getAllEvents);

// Get a single event by ID - PUBLIC
router.get('/:id', eventController.getEventById);

// Create a new event - ADMIN ONLY
router.post('/', requireAuth(), isAdmin, eventController.createEvent);

// Update an event - ADMIN + must be creator
router.put('/:id', requireAuth(), isEventCreatorAdmin, eventController.updateEvent);

// Delete an event - ADMIN + must be creator
router.delete('/:id', requireAuth(), isEventCreatorAdmin, eventController.deleteEvent);

// Sign up for an event - USER must be logged in
router.post('/:id/signup', requireAuth(), eventController.signUpForEvent);

// Cancel signup - USER must be logged in
router.post('/:id/unsignup', requireAuth(), eventController.unSignUpFromEvent);

module.exports = router;
