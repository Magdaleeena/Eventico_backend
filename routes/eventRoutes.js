const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { hasPermission, isAdmin, isEventCreatorAdmin } = require('../middlewares/clerkAuthMiddleware');

const { clerkMiddleware } = require('@clerk/express');

// Get all events PUBLIC
router.get('/', eventController.getAllEvents);

// Get an event by ID PUBLIC
router.get('/:id', eventController.getEventById);

// Create a new event ADMIN ONLY
router.post('/', clerkMiddleware(), hasPermission, isAdmin, eventController.createEvent);

// Update an event by ID
router.put('/:id', clerkMiddleware(), hasPermission, isEventCreatorAdmin, eventController.updateEvent);

// Delete an event by ID
router.delete('/:id', clerkMiddleware(), hasPermission, isEventCreatorAdmin, eventController.deleteEvent);

// User can signup for an event
router.post('/:id/signup', clerkMiddleware(), hasPermission, eventController.signUpForEvent);

// User can cancel their signup for an event
router.post('/:id/unsignup', clerkMiddleware(), hasPermission, eventController.unSignUpFromEvent);

module.exports = router;
