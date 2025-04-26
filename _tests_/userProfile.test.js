const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const seedDatabase = require('../db/seedDatabase');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
};

describe('Authenticated User Profile Endpoints', () => {
  let user;
  let userToken;

  beforeAll(async () => {
    await mongoose.connection.dropDatabase();
    await seedDatabase();

    user = await User.findOne({ role: 'user' });
    userToken = generateToken(user);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('GET - /api/users/me', () => {      
    it('should get own profile', async () => {
        const res = await request(app)
            .get('/api/users/me')
            .set('Authorization', `Bearer ${userToken}`);
  
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('username', user.username);
    });

    it('should return 401 if token is missing', async () => {
        const res = await request(app).get('/api/users/me');
        expect(res.status).toBe(401);
        expect(res.body.msg).toMatch(/no token/i);
    });

    it('should return 401 if token is invalid', async () => {
        const res = await request(app)
          .get('/api/users/me')
          .set('Authorization', 'Bearer invalidtoken');
        expect(res.status).toBe(401);
        expect(res.body.msg).toBe('Invalid or expired token.');
      });
  });

  describe('PUT - /api/users/me', () => {
    it('should update own profile', async () => {
      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ firstName: 'Updated', username: 'usernameUpdated' });       
        
        expect(res.status).toBe(200);
        expect(res.body.msg).toBe('Profile updated');
        expect(res.body.user.firstName).toBe('Updated');
        expect(res.body.user.username).toBe('usernameUpdated');
    });

    it('should return 400 if invalid update data is sent', async () => {
        const res = await request(app)
          .put('/api/users/me')
          .send({ email: 'not-an-email' })
          .set('Authorization', `Bearer ${userToken}`);
  
        expect(res.status).toBe(400); 
        expect(res.body.msg).toBe('Validation error');
    });
  });

  describe('DELETE - /api/users/me', () => {
    it('should delete own profile', async () => {
        const res = await request(app)
            .delete('/api/users/me')
            .set('Authorization', `Bearer ${userToken}`);
  
        expect(res.status).toBe(200);
        expect(res.body.msg).toMatch(/deleted/i);
    });

    it('should return 401 if token is missing', async () => {
      const res = await request(app).delete('/api/users/me');
      expect(res.status).toBe(401);
      expect(res.body.msg).toMatch(/no token/i);
    });

    it('should return 401 if token is invalid', async () => {
        const res = await request(app)
          .delete('/api/users/me')
          .set('Authorization', 'Bearer wrongtoken');
        expect(res.status).toBe(401);
      });
  });
});
