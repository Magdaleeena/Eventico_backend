const jwt = require('jsonwebtoken');
const Event = require('../models/Event');

// Middleware to check if the user is authenticated
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'Access denied, no token provided.' });
  }

  try {
    // Verify the token with secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the user to the request object
    next(); // Allow the request to continue
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

const isEventOwner = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
    
        if (!event) {
          return res.status(404).json({ message: 'Event not found' });
        }
    
        // Must be admin AND the creator
        if (req.user.role !== 'admin' || event.createdBy.toString() !== req.user.id) {
          return res.status(403).json({ message: 'Not authorized to modify this event' });
        }    
        next();
      } catch (err) {        
        res.status(500).json({ message: 'Server error' });
      }
  };
  


module.exports = { authenticateToken, isAdmin, isEventOwner };
