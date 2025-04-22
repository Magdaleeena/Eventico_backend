const User = require('../models/User');
const Event = require('../models/Event');
const { getAuth } = require('@clerk/clerk-sdk-node');

// Auth middleware using Clerk
const authenticateClerkToken = (req, res, next) => {
  const { userId, sessionId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ msg: 'Unauthorized: Clerk token missing or invalid' });
  }
  // Set for use in controllers
  req.auth = { clerkId: userId, sessionId };
  next();
};

// Checks if the authenticated user is an admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.auth.clerkId });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied: Admins only' });
    }

    // Attach user info if needed later
    req.user = user;

    next();
  } catch (err) {
    res.status(500).json({ msg: 'Server error in isAdmin check' });
  }
};

// Checks if the user is the creator of the event or an admin
const isEventCreatorAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ clerkId: req.auth.clerkId });
    const event = await Event.findById(req.params.id);

    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    const isAdmin = user.role === 'admin';
    const isCreator = event.createdBy.toString() === user._id.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ msg: 'Only the admin or the creator of this event can modify it' });
    }

    // Optionally attach user/event to the request
    req.user = user;
    req.event = event;

    next();
  } catch (err) {
    console.error('Authorization error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  authenticateClerkToken,
  isAdmin,
  isEventCreatorAdmin
};



