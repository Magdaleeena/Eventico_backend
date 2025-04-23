const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const seedDatabase = require('../db/seedDatabase');
const Event = require('../models/Event');
const User = require('../models/User');
jest.mock('../middlewares/clerkAuthMiddleware');

jest.mock('../middlewares/clerkAuthMiddleware', () => ({
  requireAuth: () => (req, res, next) => {
    req.auth = global.__mockClerkAuth__ || {
      userId: 'test_admin_id',
      sessionId: 'mock-session',
    };
    next();
  },
  isAdmin: async (req, res, next) => {
    const user = await require('../models/User').findOne({ userId: req.auth.userId });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied: Admins only' });
    }
    req.user = user;
    next();
  },
  isEventCreatorAdmin: async (req, res, next) => {
    const event = await require('../models/Event').findById(req.params.id);
    const user = await require('../models/User').findOne({ userId: req.auth.userId });

    if (!event || !user) {
      return res.status(404).json({ msg: 'Event or user not found' });
    }

    const isSameAdmin = user.role === 'admin' && event.createdBy.toString() === user._id.toString();

    if (!isSameAdmin) {
      return res.status(403).json({ msg: 'Only the admin who created this event can modify it' });
    }

    req.user = user;
    req.event = event;
    next();
  }
}));

describe('Event Signup API - Regular User vs Admin User', () => {
  let eventId;
  let adminUser;
  let regularUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    await mongoose.connection.dropDatabase();
    await seedDatabase();

    adminUser = await User.create({
      userId: 'admin_123',
      username: 'adminTest',
      email: 'admin@test.com',
      role: 'admin',
      isVerified: true,
    });
    
    regularUser = await User.create({
      userId: 'user_123',
      username: 'userTest',
      email: 'user@test.com',
      role: 'user',
      isVerified: true,
    });
    
    const createdEvent = await Event.create({
      title: 'Test Signup Event',
      description: 'A special test event',
      date: new Date('2025-10-10T10:00:00Z'),
      location: 'Test Location',
      maxParticipants: 50,
      category: 'Music',
      tags: ['signup'],
      keywords: ['signup', 'test'],
      image: 'https://example.com/test.jpg',
      eventURL: 'https://example.com/test-event',
      status: 'active',
      createdBy: adminUser._id,
      organizerContact: {
        email: 'organizer@test.com',
        phone: '+123456789'
      }
    });

    eventId = createdEvent._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  describe('POST /api/events/:id/signup and /unsignup', () => {
    it('should allow a user to sign up for the event', async () => {
      global.__mockClerkAuth__ = { userId: regularUser.userId };

      const res = await request(app).post(`/api/events/${eventId}/signup`);

      expect(res.status).toBe(200);
      expect(res.body.msg).toMatch(/successfully signed up/i);
    });

    it('should not allow signing up twice for the same event', async () => {
      global.__mockClerkAuth__ = { userId: regularUser.userId };

      const res = await request(app).post(`/api/events/${eventId}/signup`);

      expect(res.status).toBe(400);
      expect(res.body.msg).toMatch(/already signed up/i);
    });

    it('should not allow an admin to sign up for an event', async () => {
      global.__mockClerkAuth__ = { userId: adminUser.userId };

      const res = await request(app).post(`/api/events/${eventId}/signup`);

      expect(res.status).toBe(403);
      expect(res.body.msg).toMatch(/admins cannot sign up/i);
    });

    it('should allow a user to unsign from the event', async () => {
      global.__mockClerkAuth__ = { userId: regularUser.userId };

      const res = await request(app).post(`/api/events/${eventId}/unsignup`);

      expect(res.status).toBe(200);
      expect(res.body.msg).toMatch(/removed from event/i);
    });

    it('should not allow unsigning if not signed up', async () => {
      global.__mockClerkAuth__ = { userId: regularUser.userId };

      const res = await request(app).post(`/api/events/${eventId}/unsignup`);

      expect(res.status).toBe(400);
      expect(res.body.msg).toMatch(/not signed up/i);
    });
  });
});
