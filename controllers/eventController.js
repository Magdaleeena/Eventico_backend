const Event = require('../models/Event');
const User = require('../models/User');

// Get all events with pagination, sorting, and optional category filter
const getAllEvents = async (req, res) => {
  const { page = 1, limit = 10, category, sortBy = 'date', sortOrder = 'asc' } = req.query;
  
  const order = sortOrder === 'desc' ? -1 : 1;  
  
  try {
    // Build filter object for category (optional)
    const filter = category ? { category } : {};

    const events = await Event.find(filter)
      .sort({ [sortBy]: order })  // Sort by 'date' or other fields
      .skip((page - 1) * limit)   // Skip the correct number of items for pagination
      .limit(Number(limit))       // Limit the number of events to 'limit'
      .populate('createdBy', 'firstName lastName');         

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
    res.status(500).json({ msg: 'Error fetching events', error: err.msg });
  }
};

// Get a single event by ID
const getEventById = async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id)
    .populate('createdBy', 'firstName lastName username');
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    return res.status(200).json(event);
  } catch (err) {
    return res.status(500).json({ msg: 'Error fetching event', error: err.msg });
  }
};


// Create a new event
const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, maxParticipants, keywords, category, tags, image, eventURL, status, organizerContact } = req.body;

    // Create a new event document
    const newEvent = new Event({
      title,
      description,
      date,
      location,
      createdBy: req.user.id,
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

    res.status(201).json(event);
  } catch (err) {    
    res.status(400).json({ msg: 'Bad request, invalid data.' }); 
  }
};


// Update an event
const updateEvent = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // This returns the event after it's been updated { new: true}
    const updatedEvent = await Event.findByIdAndUpdate(id, updates, { new: true });
    return res.status(200).json(updatedEvent);
  } catch (err) {
    return res.status(400).json({ msg: 'Error updating event', error: err.msg });
  }
};


// Delete an event
const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    await Event.findByIdAndDelete(id);
    return res.status(200).json({ msg: 'Event deleted' });
  } catch (err) {
    return res.status(500).json({ msg: 'Error deleting event', error: err.msg });
  }
};

// Authenticated user can sign up for an event
const signUpForEvent = async (req, res) => {
  
  const userId = req.user.id;
  const eventId = req.params.id;

  try {
    const event = await Event.findById(eventId);
    const user = await User.findById(userId);

    if (!event || !user) {
      console.log('Event or user not found');
      return res.status(404).json({ msg: 'Event or user not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ msg: 'Admins cannot sign up for events' });
    }

    const alreadySignedUp = event.participants.includes(userId);
    if (alreadySignedUp) {
      return res.status(400).json({ msg: 'User already signed up for this event' });
    }

    event.participants.push(userId);
    user.eventsSignedUp.push(eventId);

    await event.save();
    await user.save();

    return res.status(200).json({ 
      msg: 'Successfully signed up for the event', 
      event: {
          title: event.title,
          date: event.date,
          location: event.location
    } 
  });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error', error: err.msg });
  }
};


// Authenticated user can cancel their sign up for an event
const unSignUpFromEvent = async (req, res) => {
  const userId = req.user.id;
  const eventId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ msg: 'Admins cannot unsign from events' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    if (!event.participants.includes(userId)) {
      return res.status(400).json({ msg: 'You are not signed up for this event' });
    }

    event.participants = event.participants.filter(p => p.toString() !== userId);
    user.eventsSignedUp = user.eventsSignedUp.filter(e => e.toString() !== eventId);

    await event.save();
    await user.save();

    return res.status(200).json({ 
      msg: 'Successfully removed from event', 
      event: {
        title: event.title,
        date: event.date,
        location: event.location
  }
     });
  } catch (err) {
    return res.status(500).json({ msg: 'Error unsigning from event', error: err.msg });
  }
};



module.exports = { getAllEvents, createEvent, getEventById, updateEvent, deleteEvent, signUpForEvent, unSignUpFromEvent };
