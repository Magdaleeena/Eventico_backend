const Event = require('../models/Event');

// Get all events with pagination, sorting, and optional category filter
const getAllEvents = async (req, res) => {
  const { page = 1, limit = 10, category, sortBy = 'date', sortOrder = 'asc' } = req.query;
  
  const order = sortOrder === 'desc' ? -1 : 1;  // If descending, use -1
  
  try {
    // Build filter object for category (optional)
    const filter = category ? { category } : {};

    // Get events with pagination, category filter, and sorting
    const events = await Event.find(filter)
      .sort({ [sortBy]: order })  // Sort by 'date' or other fields
      .skip((page - 1) * limit)   // Skip the correct number of items for pagination
      .limit(Number(limit));      // Limit the number of events to 'limit'

    // Get the total count of events for pagination
    const totalEvents = await Event.countDocuments(filter);

    // Send response with events, total count, and pagination details
    res.status(200).json({
      events,
      totalEvents,
      totalPages: Math.ceil(totalEvents / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ msg: 'Error fetching events', error: err.message });
  }
};

// Create a new event
const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, createdBy, maxParticipants, keywords, category, tags, image, eventURL, status, organizerContact } = req.body;

    // Create a new event document
    const newEvent = new Event({
      title,
      description,
      date,
      location,
      createdBy,
      maxParticipants,
      participants: [], // Initially no participants
      keywords,
      category,
      tags,
      image,
      eventURL,
      status,
      organizerContact,
    });

    // Save event to the database
    const event = await newEvent.save();

    // Respond with the created event
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: 'Bad request, invalid data.' }); // Ensure proper error handling
  }
};

// Get a single event by ID
const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    return res.status(200).json(event);
  } catch (err) {
    return res.status(500).json({ msg: 'Error fetching event', error: err.message });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    const event = await Event.findByIdAndUpdate(id, updates, { new: true });
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    return res.status(200).json(event);
  } catch (err) {
    return res.status(400).json({ msg: 'Error updating event', error: err.message });
  }
};

// Delete an event
const deleteEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findByIdAndDelete(id);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    return res.status(200).json({ msg: 'Event deleted' });
  } catch (err) {
    return res.status(500).json({ msg: 'Error deleting event', error: err.message });
  }
};

module.exports = { getAllEvents, createEvent, getEventById, updateEvent, deleteEvent };
