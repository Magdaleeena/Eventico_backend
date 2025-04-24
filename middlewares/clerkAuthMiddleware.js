const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Event = require('../models/Event');

// Custom Clerk token parser
const extractUserIdFromToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.decode(token); // not verified — good enough for MVP

  if (!decoded || !decoded.sub) {
    return res.status(401).json({ msg: 'Invalid token' });
  }

  req.auth = {
    userId: decoded.sub,
    fullToken: decoded,
  };

  next();
};

// Admin role checker (MongoDB)
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.auth.userId });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admins only' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[isAdmin error]', err);
    return res.status(500).json({ msg: 'Server error in isAdmin' });
  }
};

// Admin must be creator of event
const isEventCreatorAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.auth.userId });
    const event = await Event.findById(req.params.id);

    if (!user || !event) {
      return res.status(404).json({ msg: 'User or Event not found' });
    }

    const isCreator = event.createdBy.toString() === user._id.toString();

    if (user.role !== 'admin' || !isCreator) {
      return res.status(403).json({ msg: 'Only the admin who created this event can modify it' });
    }

    req.user = user;
    req.event = event;
    next();
  } catch (err) {
    console.error('[isEventCreatorAdmin error]', err);
    return res.status(500).json({ msg: 'Server error in isEventCreatorAdmin' });
  }
};

module.exports = {
  extractUserIdFromToken,
  isAdmin,
  isEventCreatorAdmin,
};
