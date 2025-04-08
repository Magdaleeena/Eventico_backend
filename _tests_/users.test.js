const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const seedDatabase = require('../db/seedDatabase');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate a token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
};

describe('UserController Tests', () => {
  let adminToken;
  let userToken;
  let userId;

  beforeAll(async () => {
    // Seed the database before running tests
    await seedDatabase();

    // Get the admin and user from the seeded database
    const adminUser = await User.findOne({ role: 'admin' });
    const regularUser = await User.findOne({ role: 'user' });

    // Generate tokens for both the admin and regular user
    adminToken = generateToken(adminUser);
    userToken = generateToken(regularUser);

    // Save userId for testing purposes
    userId = regularUser._id;
  });

  afterAll(async () => {
    // Cleanup: Drop the database after tests
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should return a list of users with status 200', async () => {
    const response = await request(app)    
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(200);    
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should return only admins when filtered by role', async () => {
    const response = await request(app)
      .get('/api/users?role=admin')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);

    response.body.forEach(user => {
      expect(user.role).toBe('admin');
    });
  });

  it('should return only users when filtered by role', async () => {
    const response = await request(app)
      .get('/api/users?role=user')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);

    response.body.forEach(user => {
      expect(user.role).toBe('user');
    });
  }); 

  it('should create a new user and return it with status 201', async () => {
          const newUser = {
            firstName: 'Oliver',
            lastName: 'Koletzki',
            username: 'koliver',
            email: 'koliver@example.com',
            password: 'password333',
          };
      
          const response = await request(app)
            .post('/api/users')
            .send(newUser)
            .set('Authorization', `Bearer ${adminToken}`);
      
          expect(response.status).toBe(201);
          expect(response.body.user.email).toBe(newUser.email);
          expect(response.body.user.firstName).toBe(newUser.firstName);
          expect(response.body.user.role).toBe('user');
        });

  it('should return 401 for accessing protected route without token', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(401);  
    expect(response.body.msg).toBe('Access denied, no token provided.');
  });

  it('should return 403 for accessing admin route with non-admin token', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${userToken}`);  // Non-admin token
    expect(response.status).toBe(403);  // Forbidden if the user is not an admin
    expect(response.body.msg).toBe('Access denied');
  });
   
  it('should return 404 for a non-existent endpoint', async () => {
    const response = await request(app).get('/api/nonexistent');
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe('Path not found');
  });
});
