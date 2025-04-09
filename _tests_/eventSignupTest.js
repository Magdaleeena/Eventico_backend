// const request = require('supertest');
// const app = require('../app');
// const mongoose = require('mongoose');
// const seedDatabase = require('../db/seedDatabase');
// const jwt = require('jsonwebtoken');
// const Event = require('../models/Event');
// const { Types } = mongoose; // to find real moongoose ObjectId

// const user = {
//   id: '67f688a13609ee33e191d37e',
//   username: 'bon.smith',
//   role: 'user'
// };

// const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '2h' });

// describe('Event Signup API - Regular User', () => {
//   let eventId;

//   beforeAll(async () => {
//     await mongoose.connection.dropDatabase();
//     await seedDatabase();

//     // Grab a real event ID that this user did NOT create
//     const event = await Event.findOne({
//       createdBy: { $ne: new mongoose.Types.ObjectId(user.id) }
//     });
//     eventId = event._id.toString();
//     console.log('Event ID used for signup test:', eventId)
//   });

//   afterAll(async () => {
//     await mongoose.connection.dropDatabase();
//     await mongoose.connection.close();
//   });

//   describe('POST /api/events/:id/signup and /unsignup', () => {
    
//     it('should allow a user to sign up for the event', async () => {
//       const res = await request(app)
//         .post(`/api/events/${eventId}/signup`)
//         .set('Authorization', `Bearer ${token}`);

//       expect(res.status).toBe(200);
//       expect(res.body.message).toMatch(/successfully signed up/i);
//     });

//     it('should not allow signing up twice for the same event', async () => {
//       const res = await request(app)
//         .post(`/api/events/${eventId}/signup`)
//         .set('Authorization', `Bearer ${token}`);

//       expect(res.status).toBe(400);
//       expect(res.body.message).toMatch(/already signed up/i);
//     });

//     it('should allow a user to unsign from the event', async () => {
//       const res = await request(app)
//         .post(`/api/events/${eventId}/unsignup`)
//         .set('Authorization', `Bearer ${token}`);

//       expect(res.status).toBe(200);
//       expect(res.body.message).toMatch(/removed from event/i);
//     });

//     it('should not allow unsigning if not signed up', async () => {
//       const res = await request(app)
//         .post(`/api/events/${eventId}/unsignup`)
//         .set('Authorization', `Bearer ${token}`);

//       expect(res.status).toBe(400);
//       expect(res.body.message).toMatch(/not signed up/i);
//     });
//   });
// });
