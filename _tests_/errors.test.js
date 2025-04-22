const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const seedDatabase = require('../db/seedDatabase');

describe('General Error Handling', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    await mongoose.connection.dropDatabase();
    await seedDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  it('should return 404 for a non-existent endpoint', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.msg).toBe('Path not found');
  });
});
