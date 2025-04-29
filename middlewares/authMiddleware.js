const jwt = require('jsonwebtoken');
const Event = require('../models/Event');

// Middleware to check if the user is authenticated
const authenticateToken = (req, res, next) => {
  // extract token
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'Access denied, no token provided.' });
  }

  try {
    // Verify the token with secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the user to the request object
    next(); 
  } catch (err) {   
    res.status(401).json({ msg: 'Invalid or expired token.' });
  }
};

const isAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied' });
    }
    next();
}; 

const isEventCreatorAdmin = async (req, res, next) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ msg: 'Event not found' });
      }
  
      const userId = req.user.id;
      const eventCreatorId = event.createdBy?.toString(); 
      const currentUserId = userId?.toString();
  
      const isAdmin = req.user.role === 'admin';
      const isCreator = eventCreatorId && currentUserId && eventCreatorId === currentUserId;
  
      if (!isAdmin) {
        return res.status(403).json({ msg: 'Access denied. Admins only.' });
      }
  
      if (!isCreator) {
        return res.status(403).json({ msg: 'Only the admin who created this event can modify it' });
      }
      next();
    } catch (err) {
      console.error('Authorization error:', err);
      res.status(500).json({ msg: 'Server error' });
    }
};
  


module.exports = { authenticateToken, isAdmin, isEventCreatorAdmin };
