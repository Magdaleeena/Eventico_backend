const User = require('../models/User');
const Event = require('../models/Event');
const { requireAuth } = require('@clerk/express');


// Middleware wrapper
const requireAuthWrapper = () => (req, res, next) => {
  console.log("[MIDDLEWARE] requireAuthWrapper hit");

  // Call original Clerk middleware
  requireAuth()(req, res, (err) => {
    if (err) {
      console.error("[MIDDLEWARE] requireAuth failed:", err);
      return res.status(401).json({ msg: "Unauthorized – Clerk requireAuth failed" });
    }
    console.log("[MIDDLEWARE] Clerk auth success:", req.auth);
    next();
  });
};

// Admin checker
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.auth.userId });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ msg: 'Admins only' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("[isAdmin error]", err);
    return res.status(500).json({ msg: 'Server error in isAdmin' });
  }
};

// Event creator checker
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
    console.error("[isEventCreatorAdmin error]", err);
    return res.status(500).json({ msg: 'Server error in isEventCreatorAdmin' });
  }
};

module.exports = { requireAuth, isAdmin, isEventCreatorAdmin };
