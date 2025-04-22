module.exports.authenticateClerkToken = (req, res, next) => {
  req.auth = global.__mockClerkAuth__ || { clerkId: 'test_clerk_id_123', sessionId: 'test_session' };
  next();
};
