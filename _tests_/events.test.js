const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const seedDatabase = require('../db/seedDatabase');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

describe('Event Controller API', () => {
  let token;
  let adminUser;
  let createdEventId;

  beforeAll(async () => {
    await mongoose.connection.dropDatabase();
    await seedDatabase();

    adminUser = await User.findOne({ username: 'mary.stone' });

    if (!adminUser) {
      throw new Error('Admin user "mary.stone" not found in database');
    }

    token = jwt.sign(
      { id: adminUser._id.toString(), username: adminUser.username, role: adminUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
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

  describe('POST /api/events', () => {
    it('should create a new event with status 201', async () => {
      const newEvent = {
        title: 'Music Concert',
        description: 'An amazing live music concert with famous artists.',
        date: '2025-06-15T19:00:00Z',
        location: 'Madison Square Garden',
        maxParticipants: 500,
        participants: [],
        keywords: ['music', 'concert', 'live'],
        category: 'Music',
        tags: ['live', 'performance'],
        image: 'http://example.com/image.jpg',
        eventURL: 'http://example.com/event',
        status: 'active',
        organizerContact: {
          email: 'organizer@example.com',
          phone: '+1234567890',
        },
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(newEvent);

      createdEventId = response.body._id;
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.title).toBe('Music Concert');
    });

    it('should return 400 if required fields are missing', async () => {
      const incompleteEvent = {
        date: '2025-06-15T19:00:00Z',
        location: 'Madison Square Garden',
      };
  
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(incompleteEvent);
  
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('Bad request, invalid data.');
    });

    it('should return 403 if the user is not an admin', async () => {
      const nonAdminUser = {
        id: '67f54d1287f898787e00000', 
        username: 'regular.user',
        role: 'user', 
      };
    
      const nonAdminToken = jwt.sign(nonAdminUser, process.env.JWT_SECRET, { expiresIn: '2h' });
    
      const newEvent = {
        title: 'Unauthorized Event',
        description: 'A non-admin user is trying to create an event!',
        date: '2025-07-20T18:00:00Z',
        location: 'London',
        maxParticipants: 10,
        keywords: ['sneaky'],
        category: 'Music',
        tags: ['fail'],
        status: 'active',
        image: '',
        eventURL: '',
        organizerContact: {
          email: 'unauthorized@fail.com',
          phone: '+1111111111',
        },
      };
    
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${nonAdminToken}`)
        .send(newEvent);
    
      expect(response.status).toBe(403);
      expect(response.body.msg).toMatch(/access denied/i);
    });
  });

  describe('PUT /api/events/:id', () => {    
    let createdEventId;

    it('should update an event with status 200', async () => { 
      const newEvent = {
        title: 'Event to Update',
        description: 'Temporary event for update testing.',
        date: '2025-09-01T18:00:00Z',
        location: 'Test Location',
        maxParticipants: 150,
        keywords: ['temporary', 'update'],
        category: 'Music',
        tags: ['testing'],
        image: 'http://example.com/image.jpg',
        eventURL: 'http://example.com/event',
        status: 'active',
        organizerContact: {
          email: 'organizer@test.com',
          phone: '+1234567890',
        },
      };
  
      const createResponse = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${token}`)
        .send(newEvent);
  
      expect(createResponse.status).toBe(201); 
      createdEventId = createResponse.body._id; 
  
      const updateResponse = await request(app)
        .put(`/api/events/${createdEventId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Event Title' });
  
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.title).toBe('Updated Event Title');
    });
  
    it('should return 404 if event ID is invalid or not found', async () => {
      const invalidId = new mongoose.Types.ObjectId();
  
      const response = await request(app)
        .put(`/api/events/${invalidId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Should Not Work' });
  
      expect(response.status).toBe(404);
      expect(response.body.msg).toMatch(/not found/i);
    });
  
    it('should return 403 if user is not the creator admin', async () => {
      const newEvent = {
        title: 'Event For Unauthorized Update',
        description: 'Temporary event for testing wrong user.',
        date: '2025-10-01T18:00:00Z',
        location: 'Unauthorized Location',
        maxParticipants: 200,
        keywords: ['unauthorized', 'test'],
        category: 'Music',
        tags: ['forbidden'],
        status: 'active',
        organizerContact: {
          email: 'organizer@forbidden.com',
          phone: '+9876543210',
        },
      };
      const createResponse = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(newEvent);
      
      expect(createResponse.status).toBe(201);
      const createdEventId = createResponse.body._id;

      const otherUser = {
        id: '67f54d1287f898787e07a999',
        username: 'other.admin',
        role: 'admin'
      };      
  
      const otherToken = jwt.sign(otherUser, process.env.JWT_SECRET, { expiresIn: '2h' });
  
      const response = await request(app)
        .put(`/api/events/${createdEventId}`) 
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Malicious Update Attempt' });
  
      expect(response.status).toBe(403);
      expect(response.body.msg).toBe('Only the admin who created this event can modify it');
    });
  });  

  describe('DELETE /api/events/:id', () => {
  it('should delete the event if the user is the creator', async () => {
    const newEvent = {
      title: 'Event to Delete',
      description: 'Event created to test delete functionality.',
      date: '2025-11-01T19:00:00Z',
      location: 'Delete Test Location',
      maxParticipants: 80,
      keywords: ['delete', 'test'],
      category: 'Social',
      tags: ['removal'],
      status: 'active',
      organizerContact: {
        email: 'delete@test.com',
        phone: '+1234567890',
      },
    };

    // Create event
    const createResponse = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send(newEvent);

    expect(createResponse.status).toBe(201);
    const eventToDeleteId = createResponse.body._id;

    // Now delete it
    const deleteResponse = await request(app)
      .delete(`/api/events/${eventToDeleteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.msg).toBe('Event deleted');
  });

  it('should return 404 when trying to delete a non-existent event', async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/api/events/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.msg).toMatch(/not found/i);
  });
});
});
