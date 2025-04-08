const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

// Get all events
router.get('/', eventController.getAllEvents);

// Create a new event
router.post('/', authenticateToken, isAdmin, eventController.createEvent);

// Get an event by ID
router.get('/:id', eventController.getEventById);

// Update an event by ID
router.put('/:id', authenticateToken, eventController.updateEvent);

// Delete an event by ID
router.delete('/:id', authenticateToken, eventController.deleteEvent);

module.exports = router;
