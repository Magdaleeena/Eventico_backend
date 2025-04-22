const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
const seedDatabase = require('../db/seedDatabase');

jest.mock('../middlewares/clerkAuthMiddleware', () => ({
  authenticateClerkToken: (req, res, next) => {
    req.auth = global.__mockClerkAuth__ || {
      clerkId: 'test_admin_id',
      sessionId: 'mock-session',
    };
    next();
  },
  isAdmin: async (req, res, next) => {
    const user = await require('../models/User').findOne({ clerkId: req.auth.clerkId });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied: Admins only' });
    }
    req.user = user;
    next();
  },
  isEventCreatorAdmin: async (req, res, next) => {
    const event = await require('../models/Event').findById(req.params.id);
    const user = await require('../models/User').findOne({ clerkId: req.auth.clerkId });
  
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


describe('Event Controller API', () => {
  
  beforeAll(async () => {
    await mongoose.connection.dropDatabase();
    await seedDatabase();
  });

  afterAll(async () => {
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
      }
    } catch (err) {
      console.error('afterAll error:', err);
    }
  });
  describe('GET /api/events', () => {
    it('should return a list of events with status 200 and default pagination', async () => {
      const response = await request(app).get('/api/events');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('events');
      expect(response.body.events).toBeInstanceOf(Array);
      expect(response.body.events.length).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('totalEvents');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body).toHaveProperty('currentPage');
    });

    it('should return events filtered by category if provided', async () => {
      const category = 'Music';
      const response = await request(app).get(`/api/events?category=${category}`);

      expect(response.status).toBe(200);
      expect(response.body.events).toBeInstanceOf(Array);
      response.body.events.forEach(event => {
        expect(event.category).toBe(category);
      });
    });

    it('should return events sorted by date in ascending order by default', async () => {
      const response = await request(app).get('/api/events');

      expect(response.status).toBe(200);
      const events = response.body.events;
      expect(new Date(events[0].date) <= new Date(events[1].date)).toBe(true);
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return 404 for a non-existent event', async () => {
      const nonExistentEventId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/events/${nonExistentEventId}`);

      expect(response.status).toBe(404);
      expect(response.body.msg).toBe('Event not found');
    });
  });

  describe('Event routes (Clerk-authenticated)', () => {
    let adminUser, nonAdminUser, eventToUpdate;
  
    beforeAll(async () => {
      await mongoose.connect(process.env.MONGODB_URI);
      await mongoose.connection.dropDatabase();
      await seedDatabase();
  
      // Seed users
      adminUser = await User.create({
        clerkId: 'test_admin_id',
        username: 'adminUser',
        email: 'admin@example.com',
        role: 'admin',
        isVerified: true,
      });
  
      nonAdminUser = await User.create({
        clerkId: 'test_user_id',
        username: 'basicUser',
        email: 'user@example.com',
        role: 'user',
        isVerified: true,
      });
  
      // Seed event (created by admin)
      eventToUpdate = await Event.create({
        title: 'Clerk Event',
        description: 'Clerk test',
        date: new Date(),
        location: 'Nowhere',
        maxParticipants: 100,
        keywords: ['test'],
        category: 'Music', 
        tags: ['clerk'],
        status: 'active',
        organizerContact: {                       
          email: 'admin@clerk.com',
          phone: '+111111111'
        },
        createdBy: adminUser._id,
      });
    });
  
    afterAll(async () => {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    });
  
    describe('POST /api/events', () => {
      it('allows admin to create event', async () => {
        global.__mockClerkAuth__ = { clerkId: 'test_admin_id', sessionId: 'x' };
  
        const res = await request(app)
          .post('/api/events')
          .send({
            title: 'New Event',
            description: 'Testing Clerk',
            date: new Date(),
            location: 'Zoom',
            maxParticipants: 20,
            category: 'Music',
            keywords: ['js'],
            tags: ['online'],
            status: 'active',
            organizerContact: {
              email: 'org@example.com',
              phone: '+123456789',
            },
          });
  
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
      });
  
      it('blocks non-admin from creating event', async () => {
        global.__mockClerkAuth__ = { clerkId: 'test_user_id', sessionId: 'x' };
  
        const res = await request(app)
          .post('/api/events')
          .send({
            title: 'Blocked Event',
            description: 'Non-admin should not pass',
            date: new Date(),
            location: 'Nowhere',
            maxParticipants: 1,
            category: 'Music',
            organizerContact: {                        
              email: 'nonadmin@fail.com',
              phone: '+123123123'
            },
            tags: ['fail'],
            status: 'active'
          });
  
        expect(res.status).toBe(403);
        expect(res.body.msg).toMatch(/access denied/i);
      });
    });
  
    describe('PUT /api/events/:id', () => {
      let eventId;
    
      beforeAll(async () => {
        // Create a second admin
        await User.create({
          clerkId: 'other_admin_id',
          username: 'otherAdmin',
          email: 'other@example.com',
          role: 'admin',
          isVerified: true,
        });
      });
    
      it('allows creator admin to update their event', async () => {
        global.__mockClerkAuth__ = { clerkId: 'test_admin_id', sessionId: 'x' };
    
        const created = await request(app)
          .post('/api/events')
          .send({
            title: 'PUT Test Event',
            description: 'Should be updatable by creator only',
            date: new Date(),
            location: 'Zoom',
            maxParticipants: 50,
            category: 'Music',
            keywords: ['test'],
            tags: ['put'],
            status: 'active',
            organizerContact: {
              email: 'admin@clerk.com',
              phone: '+123456789',
            },
          });
    
        eventId = created.body._id;
    
        const res = await request(app)
          .put(`/api/events/${eventId}`)
          .send({ title: 'Updated Title' });
    
        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Updated Title');
      });
    
      it('blocks other admin from updating event', async () => {
        global.__mockClerkAuth__ = { clerkId: 'other_admin_id', sessionId: 'x' };
    
        const res = await request(app)
          .put(`/api/events/${eventId}`)
          .send({ title: 'Hacked Title' });
    
        console.log('👀 PUT Attempt by Other Admin:', res.status, res.body);
    
        expect(res.status).toBe(403);
        expect(res.body.msg).toMatch(/only the admin who created/i);
      });
    });  
      
    describe('DELETE /api/events/:id', () => {
      it('allows creator admin to delete event', async () => {
        const toDelete = await Event.create({
          title: 'Delete Me',
          description: 'To be deleted',
          date: new Date(),
          location: 'Temporary Location',
          maxParticipants: 10,
          keywords: ['delete'],
          category: 'Music', 
          tags: ['temp'],
          status: 'active',
          createdBy: adminUser._id,
          organizerContact: {
            email: 'org@example.com',
            phone: '+123456789',
          },
        });
  
        global.__mockClerkAuth__ = { clerkId: 'test_admin_id', sessionId: 'x' };
  
        const res = await request(app).delete(`/api/events/${toDelete._id}`);
  
        expect(res.status).toBe(200);
        expect(res.body.msg).toMatch(/deleted/i);
      });
    });
  });
});