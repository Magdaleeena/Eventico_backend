const User = require('../models/User');
const Event = require('../models/Event');
const { getAuth } = require("@clerk/express");

const authenticateClerkToken = (req, res, next) => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    return res.status(401).json({ msg: "Unauthorized" });
  }
  req.auth = auth;
  next();
};


// Check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.auth.userId });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admins only' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ msg: 'Server error in isAdmin check' });
  }
};

// Check if event creator or admin
const isEventCreatorAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.auth.userId });
    const event = await Event.findById(req.params.id);
    if (!user) return res.status(401).json({ msg: 'User not found' });
    if (!event) return res.status(404).json({ msg: 'Event not found' });

    const isAdmin = user.role === 'admin';
    const isCreator = event.createdBy.toString() === user._id.toString();

    if (!isAdmin && !isCreator) {
      return res.status(403).json({ msg: 'Only admin or creator can modify' });
    }

    req.user = user;
    req.event = event;
    next();
  } catch (err) {
    res.status(500).json({ msg: 'Server error in isEventCreatorAdmin' });
  }
};

module.exports = { authenticateClerkToken, isAdmin, isEventCreatorAdmin };
