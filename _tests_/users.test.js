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
    console.log(response.body); 
  });

  it('should return 404 for a non-existent endpoint', async () => {
    const response = await request(app).get('/api/nonexistent');
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe('Path not found');
  });
});

  