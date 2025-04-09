const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const seedDatabase = require('../db/seedDatabase'); 

const jwt = require('jsonwebtoken');

const user = {
  _id: '67f54d1287f898787e07a2b2',
  username: 'mary.stone',
  role: 'admin'
};

const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '2h' });

describe('Event Controller Tests', () => {
  beforeAll(async () => {
    await seedDatabase(); 
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase(); 
    await mongoose.connection.close();
  });

  it('should return a list of events with status 200 and default pagination', async () => {
    const response = await request(app).get('/api/events');    
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('events');
    expect(response.body.events).toBeInstanceOf(Array);  
    expect(response.body.events.length).toBeGreaterThan(0); 
        
    // Pagination data is present
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


  it('should create a new event with status 201', async () => {
    const newEvent = {
        title: 'Music Concert',
        description: 'An amazing live music concert with famous artists.',
        date: '2025-06-15T19:00:00Z', 
        location: 'Madison Square Garden',
        createdBy: '60e8f755d9e8a86ed4935e5f', // Existing User _id
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
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.title).toBe('Music Concert');
  });

  it('should return 404 for a non-existent event', async () => {
    const nonExistentEventId = new mongoose.Types.ObjectId();
    const response = await request(app).get(`/api/events/${nonExistentEventId}`);
    
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe('Event not found');
  });

  // it('should update an event with status 200', async () => {
  //   const eventId = '67e1cebd9c1844e2a36b1400'; 
  //   const updatedEvent = {
  //     title: 'Updated Music Concert',
  //     description: 'An updated description',
  //   };

  //   const response = await request(app)
  //     .put(`/api/events/${eventId}`)
  //     .set('Authorization', `Bearer ${token}`)
  //     .send(updatedEvent);
    
  //   expect(response.status).toBe(200);
  //   expect(response.body.title).toBe('Updated Music Concert');
  // });

  // it('should delete an event with status 200', async () => {
  //   const eventId = '67e1cebd9c1844e2a36b1411'; 
  //   const response = await request(app)    
  //     .delete(`/api/events/${eventId}`)
  //     .set('Authorization', `Bearer ${token}`);

  //   expect(response.status).toBe(200);
  //   expect(response.body.msg).toBe('Event deleted');
  // });
});
