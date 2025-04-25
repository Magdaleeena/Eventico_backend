const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const seedDatabase = require('../db/seedDatabase');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

  beforeAll(async () => {
    await mongoose.connection.dropDatabase();
    await seedDatabase();

    const adminUser = await User.findOne({ role: 'admin' });
    const regularUser = await User.findOne({ role: 'user' });

    adminToken = generateToken(adminUser);
    userToken = generateToken(regularUser);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  
  describe('GET /api/users', () => {
    it('should return a list of users with status 200', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should return only admins when filtered by role', async () => {
      const res = await request(app)
        .get('/api/users?role=admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.forEach(user => {
        expect(user.role).toBe('admin');
      });
    });

    it('should return only users when filtered by role', async () => {
      const res = await request(app)
        .get('/api/users?role=user')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.forEach(user => {
        expect(user.role).toBe('user');
      });
    });

    it('should return 401 for accessing without token', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
      expect(res.body.msg).toBe('Access denied, no token provided.');
    });

    it('should return 403 for non-admin access', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.msg).toBe('Access denied');
    });
  });

  
  describe('POST /api/users/register', () => {
    it('should create a new user with status 201', async () => {
      const newUser = {
        firstName: 'Oliver',
        lastName: 'Koletzki',
        username: 'koliver',
        email: 'koliver@example.com',
        password: 'Password333*',
      };

      const res = await request(app)
        .post('/api/users/register')
        .send(newUser)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe(newUser.email);
      expect(res.body.user.firstName).toBe(newUser.firstName);
      expect(res.body.user.role).toBe('user');
      expect(res.body.user.profileImage).toBe('/public/images/default_profile_img.png');
    });
    
    it('should return 400 if the user already exists by email', async () => {
      const duplicateUser = {
        firstName: 'Duplicate',
        lastName: 'User',
        username: 'username',
        email: 'username@example.com',
        password: 'Password123*',
      };
    
      // First request: should succeed
      const firstRes = await request(app)
        .post('/api/users/register')
        .send(duplicateUser)
        .set('Authorization', `Bearer ${adminToken}`);
    
      expect(firstRes.status).toBe(201);
    
      // Second request: should fail with 400
      const secondRes = await request(app)
        .post('/api/users/register')
        .send(duplicateUser)
        .set('Authorization', `Bearer ${adminToken}`);
    
      expect(secondRes.status).toBe(400);
      expect(secondRes.body.msg).toMatch(/already exists/i);
    });

    it('should return 400 if required fields like password are missing or password is not in the right format', async () => {
      const incompleteUser = {
        firstName: 'NoPass',
        lastName: 'User',
        username: 'nopass',
        email: 'nopass@example.com'
      };
  
      const res = await request(app)
        .post('/api/users/register')
        .send(incompleteUser)
        .set('Authorization', `Bearer ${adminToken}`);
  
      expect(res.status).toBe(400);
      expect(res.body.msg).toMatch(/Password must be at least 8 characters long, include both letters, numbers, and at least one special character/i);
    });

    it('should return 400 if required fields like firstName are missing', async () => {
      const incompleteUser = {
        lastName: 'User',
        username: 'nopass',
        password: 'Testpass123*',
        email: 'nopass@example.com'
      };
  
      const res = await request(app)
        .post('/api/users/register')
        .send(incompleteUser)
        .set('Authorization', `Bearer ${adminToken}`);
  
      expect(res.status).toBe(400);
      expect(res.body.msg).toMatch(/User validation failed:/i);
    });
  });

  describe('POST /api/users/login', () => {
    const testUser = {
      firstName: 'Login',
      lastName: 'Tester',
      username: 'logintester',
      email: 'logintester@example.com',
      password: 'Testpass123*'
    };
  
    it('should create and then log in a user successfully', async () => {      
      const registerRes = await request(app)
        .post('/api/users/register')
        .send(testUser)
        .set('Authorization', `Bearer ${adminToken}`);
  
      expect(registerRes.status).toBe(201);
  
      const userInDb = await User.findOne({ email: testUser.email }); 

      expect(userInDb).toBeDefined();
      expect(userInDb.email).toBe(testUser.email);
      expect(userInDb.password).not.toBe(testUser.password); 

    // Log in the user
      const loginRes = await request(app)
        .post('/api/users/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.msg).toBe('Login successful');
      expect(loginRes.body).toHaveProperty('token');
    });
  });
  
 
  describe('General Error Handling', () => {
    it('should return 404 for a non-existent endpoint', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.msg).toBe('Path not found');
    });
  });
});
