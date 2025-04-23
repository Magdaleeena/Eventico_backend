// MOCK VERSION of clerkAuthMiddleware used in tests only

const User = require('../models/User');
const Event = require('../models/Event');

module.exports.requireAuth = () => (req, res, next) => {
  req.auth = global.__mockClerkAuth__ || {
    userId: 'test_admin_id',
    sessionId: 'mock-session',
  };
  next();
};

// Optional: If you're using getAuth in controllers/middleware
module.exports.getAuth = () =>
  global.__mockClerkAuth__ || {
    userId: 'test_admin_id',
    sessionId: 'mock-session',
  };

// Checks for admin user
module.exports.isAdmin = async (req, res, next) => {
  const user = await User.findOne({ userId: req.auth.userId });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: Admins only' });
  }
  req.user = user;
  next();
};

// Checks if the current user is the creator admin of the event
module.exports.isEventCreatorAdmin = async (req, res, next) => {
  const user = await User.findOne({ userId: req.auth.userId });
  const event = await Event.findById(req.params.id);

  if (!user || !event) {
    return res.status(404).json({ msg: 'Event or user not found' });
  }

  const isSameAdmin =
    user.role === 'admin' && event.createdBy.toString() === user._id.toString();

  if (!isSameAdmin) {
    return res.status(403).json({
      msg: 'Only the admin who created this event can modify it',
    });
  }

  req.user = user;
  req.event = event;
  next();
};