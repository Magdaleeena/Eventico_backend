const jwt = require('jsonwebtoken');

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


module.exports = { authenticateToken, isAdmin };
