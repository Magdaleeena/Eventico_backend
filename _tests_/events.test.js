const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
const seedDatabase = require('../db/seedDatabase');

// Mock Clerk Middleware
jest.mock('../middlewares/clerkAuthMiddleware', () => ({
  authenticateClerkToken: (req, res, next) => {
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
    const user = await require('../models/User').findOne({ userId: req.auth.userId });
    const event = await require('../models/Event').findById(req.params.id);
    if (!user || !event) {
      return res.status(404).json({ msg: 'Event or user not found' });
    }
    if (user.role !== 'admin' || event.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({ msg: 'Only the admin who created this event can modify it' });
    }
    req.user = user;
    req.event = event;
    next();
  },
}));

describe('Event Controller API', () => {
  let adminUser;
  let normalUser;
  let otherAdmin;
  let eventId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    await mongoose.connection.dropDatabase();
    await seedDatabase();

    adminUser = await User.create({
      userId: 'test_admin_id',
      email: 'admin@example.com',
      username: 'adminuser',
      role: 'admin',
      isVerified: true,
    });

    normalUser = await User.create({
      userId: 'test_user_id',
      email: 'user@example.com',
      username: 'testuser',
      role: 'user',
      isVerified: true,
    });

    otherAdmin = await User.create({
      userId: 'other_admin_id',
      email: 'other@example.com',
      username: 'otheradmin',
      role: 'admin',
      isVerified: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('GET /api/events', () => {
    it('should return a list of events with status 200 and default pagination', async () => {
      const response = await request(app).get('/api/events');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('events');
      expect(Array.isArray(response.body.events)).toBe(true);
      expect(response.body).toHaveProperty('totalEvents');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('currentPage');
    });

    it('should return events filtered by category if provided', async () => {
      const category = 'Music';
      const response = await request(app).get(`/api/events?category=${category}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.events)).toBe(true);
      response.body.events.forEach(event => {
        expect(event.category).toBe(category);
      });
    });

    it('should return events sorted by date in ascending order by default', async () => {
      const response = await request(app).get('/api/events');
      const events = response.body.events;

      expect(response.status).toBe(200);
      if (events.length > 1) {
        expect(new Date(events[0].date) <= new Date(events[1].date)).toBe(true);
      }
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return 200 and the correct event for a valid ID', async () => {
      global.__mockClerkAuth__ = { userId: 'test_admin_id' };
  
      const created = await request(app).post('/api/events').send({
        title: 'Fetchable Event',
        description: 'Should be retrievable',
        date: new Date(),
        location: 'Someplace',
        maxParticipants: 25,
        category: 'Technology',
        tags: ['fetch'],
        status: 'active',
        organizerContact: {
          email: 'fetch@event.com',
          phone: '+123456789',
        },
      });  
      const fetchedId = created.body._id;  
      const res = await request(app).get(`/api/events/${fetchedId}`);
  
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id', fetchedId);
      expect(res.body).toHaveProperty('title', 'Fetchable Event');
    });
    it('should return 404 for a non-existent event', async () => {
      const nonExistentEventId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/events/${nonExistentEventId}`);

      expect(response.status).toBe(404);
      expect(response.body.msg).toBe('Event not found');
    });
  });

  describe('POST /api/events', () => {
    it('allows admin to create event', async () => {
      global.__mockClerkAuth__ = { userId: 'test_admin_id' };

      const res = await request(app).post('/api/events').send({
        title: 'New Event',
        description: 'Testing Event',
        date: new Date(),
        location: 'Zoom',
        maxParticipants: 50,
        category: 'Music',
        keywords: ['test'],
        tags: ['tag'],
        status: 'active',
        organizerContact: {
          email: 'org@example.com',
          phone: '+123456789',
        },
      });

      expect(res.status).toBe(201);
      eventId = res.body._id;
    });

    it('blocks non-admin from creating event', async () => {
      global.__mockClerkAuth__ = { userId: 'test_user_id' };

      const res = await request(app).post('/api/events').send({
        title: 'Blocked Event',
        description: 'Should fail',
        date: new Date(),
        location: 'Nowhere',
        maxParticipants: 1,
        category: 'Music',
        tags: ['fail'],
        status: 'active',
        organizerContact: {
          email: 'nonadmin@fail.com',
          phone: '+123123123',
        },
      });

      expect(res.status).toBe(403);
      expect(res.body.msg).toMatch(/access denied/i);
    });
  });

  describe('PUT /api/events/:id', () => {
    it('allows creator admin to update event', async () => {
      global.__mockClerkAuth__ = { userId: 'test_admin_id' };

      const res = await request(app).put(`/api/events/${eventId}`).send({
        title: 'Updated Event Title',
      });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Event Title');
    });

    it('blocks other admin from updating event', async () => {
      global.__mockClerkAuth__ = { userId: 'other_admin_id' };

      const res = await request(app).put(`/api/events/${eventId}`).send({
        title: 'Should Not Work',
      });

      expect(res.status).toBe(403);
      expect(res.body.msg).toMatch(/only the admin who created/i);
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('allows creator admin to delete event', async () => {
      global.__mockClerkAuth__ = { userId: 'test_admin_id' };

      const newEvent = await request(app).post('/api/events').send({
        title: 'Delete Me',
        description: 'To be deleted',
        date: new Date(),
        location: 'Somewhere',
        maxParticipants: 10,
        category: 'Music',
        tags: ['delete'],
        status: 'active',
        organizerContact: {
          email: 'delete@example.com',
          phone: '+123456789',
        },
      });

      const deleteId = newEvent.body._id;

      const res = await request(app).delete(`/api/events/${deleteId}`);
      expect(res.status).toBe(200);
      expect(res.body.msg).toMatch(/deleted/i);
    });
  });
});