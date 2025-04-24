const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

const { extractUserIdFromToken, isAdmin, isEventCreatorAdmin } = require('../middlewares/clerkAuthMiddleware');

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/:id', eventController.getEventById);

// Admin routes
router.post('/', extractUserIdFromToken, isAdmin, eventController.createEvent);
router.put('/:id', extractUserIdFromToken, isEventCreatorAdmin, eventController.updateEvent);
router.delete('/:id', extractUserIdFromToken, isEventCreatorAdmin, eventController.deleteEvent);

// Signed-in user routes
router.post('/:id/signup', extractUserIdFromToken, eventController.signUpForEvent);
router.post('/:id/unsignup', extractUserIdFromToken, eventController.unSignUpFromEvent);

module.exports = router;
