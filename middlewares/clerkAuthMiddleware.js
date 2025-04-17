// clerkAuthMiddleware.js
const { getAuth } = require('@clerk/clerk-sdk-node');

const authenticateClerkToken = (req, res, next) => {
  const { userId, sessionId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ msg: "Unauthorized: Clerk token missing or invalid" });
  }

  // Attach Clerk userId to request (you’ll match it to your User.clerkId in controllers)
  req.auth = { clerkId: userId, sessionId };
  next();
};

module.exports = { authenticateClerkToken };
