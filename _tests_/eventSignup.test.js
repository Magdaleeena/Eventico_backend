const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const seedDatabase = require('../db/seedDatabase');
const jwt = require('jsonwebtoken');
const Event = require('../models/Event');
const User = require('../models/User');

describe('Event Signup API - Regular User', () => {
  let eventId;

  let adminUser;
  let adminToken;

  let regularUser;
  let userToken;

  beforeAll(async () => {
    await mongoose.connection.dropDatabase();
    await seedDatabase();

    // Get users from DB
    adminUser = await User.findOne({ username: 'mary.stone' });
    regularUser = await User.findOne({ username: 'bob.smith' });

    // Create tokens
    adminToken = jwt.sign(
      { id: adminUser._id.toString(), username: adminUser.username, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    
    userToken = jwt.sign(
      { id: regularUser._id.toString(), username: regularUser.username, role: regularUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    

    // Create event as admin
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
      organizerContact: {
        email: 'organizer@test.com',
        phone: '+123456789'
      },
      createdBy: adminUser._id
    });

    eventId = createdEvent._id.toString();
    console.log('Created test event with ID:', eventId);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /api/events/:id/signup and /unsignup', () => {
    it('should allow a user to sign up for the event', async () => {
      const res = await request(app)
        .post(`/api/events/${eventId}/signup`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/successfully signed up/i);
    });

    it('should not allow signing up twice for the same event', async () => {
      const res = await request(app)
        .post(`/api/events/${eventId}/signup`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already signed up/i);
    });

    it('should not allow an admin to sign up for an event', async () => {
      const res = await request(app)
        .post(`/api/events/${eventId}/signup`)
        .set('Authorization', `Bearer ${adminToken}`);
    
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/admins cannot sign up/i);
    });

    it('should allow a user to unsign from the event', async () => {
      const res = await request(app)
        .post(`/api/events/${eventId}/unsignup`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/removed from event/i);
    });

    it('should not allow unsigning if not signed up', async () => {
      const res = await request(app)
        .post(`/api/events/${eventId}/unsignup`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/not signed up/i);
    });
  });
});
