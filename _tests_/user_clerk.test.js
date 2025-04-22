const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const seedDatabase = require('../db/seedDatabase');

jest.mock('../middlewares/clerkAuthMiddleware', () => ({
  authenticateClerkToken: (req, res, next) => {
    req.auth = global.__mockClerkAuth__ || {
      clerkId: 'test_clerk_id_123',
      sessionId: 'test_session',
    };
    next();
  },
  isAdmin: async (req, res, next) => {
    const clerkId = req.auth.clerkId;
    const user = await require('../models/User').findOne({ clerkId });

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied: Admins only' });
    }

    req.user = user;
    next();
  },
  isEventCreatorAdmin: (req, res, next) => next(), // bypass this for now
}));

describe('Users protected routes - auth via Clerk', () => {
  
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    await mongoose.connection.dropDatabase();
    await seedDatabase();

    await User.create({
      clerkId: 'test_clerk_id_123',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      isVerified: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('GET /api/users (admin only)', () => {
    beforeAll(async () => {
      await User.create([
        {
          clerkId: 'admin_clerk_id',
          email: 'admin@example.com',
          username: 'adminuser',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isVerified: true,
        },
        {
          clerkId: 'user_clerk_id',
          email: 'user@example.com',
          username: 'normaluser',
          firstName: 'Normal',
          lastName: 'User',
          role: 'user',
          isVerified: true,
        },
      ]);
    });

    it('should return all users when accessed by admin', async () => {
      global.__mockClerkAuth__ = {
        clerkId: 'admin_clerk_id',
        sessionId: 'test_session',
      };

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer fake-token');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      expect(res.body[0]).toHaveProperty('email');

      delete global.__mockClerkAuth__;
    });

    it('should return 403 if user is not admin', async () => {
      global.__mockClerkAuth__ = {
        clerkId: 'user_clerk_id',
        sessionId: 'test_session',
      };

      const res = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer fake-token');

      expect(res.status).toBe(403);
      expect(res.body.msg).toMatch(/access denied/i);

      delete global.__mockClerkAuth__;
    });
  });  

  describe('GET /api/users/me (Clerk)', () => {
    it('should return the current Clerk user profile', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer fake-token');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('username', 'testuser');
      expect(res.body).toHaveProperty('email', 'test@example.com');
    });
  });

  describe('PUT /api/users/me (Clerk)', () => {
    it('should update the current Clerk user profile', async () => {
      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', 'Bearer fake-token')
        .send({ firstName: 'UpdatedName', username: 'updateduser' });
  
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user.username', 'updateduser');
    });
  
    it('should return 400 if username is already taken by another user', async () => {
      await User.create({
        clerkId: 'other_clerk_id',
        username: 'takenusername',
        email: 'someone@example.com',
      });
  
      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', 'Bearer fake-token')
        .send({ username: 'takenusername' });
  
      expect(res.status).toBe(400);
      expect(res.body.msg).toMatch(/username already taken/i);
    });
  
    it('should return 404 if user not found', async () => {
        global.__mockClerkAuth__ = { clerkId: 'nonexistent_clerk_id', sessionId: 'session_xyz' };
      
        const res = await request(app)
          .put('/api/users/me')
          .set('Authorization', 'Bearer fake-token')
          .send({ firstName: 'Ghost' });
      
        expect(res.status).toBe(404);
        expect(res.body.msg).toMatch(/user not found/i);      
        
        delete global.__mockClerkAuth__;
      });
  }); 

  describe('DELETE /api/users/me (Clerk)', () => {
    it('should delete the current Clerk user profile', async () => {
      // The user exists before trying to delete
      await User.create({
        clerkId: 'delete_me_id',
        email: 'deleteme@example.com',
        username: 'deleteme',
        firstName: 'Delete',
        lastName: 'Me',
        role: 'user',
        isVerified: true,
      });
  
      global.__mockClerkAuth__ = { clerkId: 'delete_me_id', sessionId: 'test_session' };
  
      const res = await request(app)
        .delete('/api/users/me')
        .set('Authorization', 'Bearer fake-token');
  
      expect(res.status).toBe(200);
      expect(res.body.msg).toMatch(/deleted/i);
  
      const deleted = await User.findOne({ clerkId: 'delete_me_id' });
      expect(deleted).toBeNull();
  
      delete global.__mockClerkAuth__;
    });
  
    it('should return 404 if user is not found', async () => {
      global.__mockClerkAuth__ = { clerkId: 'nonexistent_user_id', sessionId: 'fake-session' };
  
      const res = await request(app)
        .delete('/api/users/me')
        .set('Authorization', 'Bearer fake-token');
  
      expect(res.status).toBe(404);
      expect(res.body.msg).toMatch(/user not found/i);
  
      delete global.__mockClerkAuth__;
    });
  });  
});
