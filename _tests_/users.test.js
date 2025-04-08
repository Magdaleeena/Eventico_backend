const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const seedDatabase = require('../db/seedDatabase');

describe('UserController Tests', () => {
  beforeAll(async () => {
    // Seed the database before running tests
    await seedDatabase();
  });

  afterAll(async () => {
    // Cleanup: Drop the database after tests
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should return a list of users with status 200', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should return only admins when filtered by role', async () => {
    const response = await request(app).get('/api/users?role=admin');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);

    response.body.forEach(user => {
      expect(user.role).toBe('admin');
    });
  });

  it('should return only users when filtered by role', async () => {
    const response = await request(app).get('/api/users?role=user');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);

    response.body.forEach(user => {
      expect(user.role).toBe('user');
    });
  }); 

  it('should create a new user and return it with status 201', async () => {
          const newUser = {
            firstName: 'Jane',
            lastName: 'Doe',
            username: 'jane.doe',
            email: 'jane.doe@example.com',
            password: 'password123',
          };
      
          const response = await request(app)
            .post('/api/users')
            .send(newUser);
      
          expect(response.status).toBe(201);
          expect(response.body).toHaveProperty('_id');
          expect(response.body.email).toBe(newUser.email);
          expect(response.body.firstName).toBe(newUser.firstName);
          expect(response.body.role).toBe('user');
        });
   
  it('should return 404 for a non-existent endpoint', async () => {
    const response = await request(app).get('/api/nonexistent');
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe('Path not found');
  });
});
