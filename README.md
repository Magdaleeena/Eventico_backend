# Eventico Backend 🎉

This is the backend API for **Eventico**, a full-stack event management application.  
The API allows users to create, browse, manage, and sign up for events, while also handling user authentication, profile management, and administrative functionalities.

---

## 🚀 Project Summary

The purpose of this project is to build an API to access application data programmatically.  
The intention is to mimic the building of a real-world backend service (such as Reddit, Eventbrite, etc.), providing structured and secure data access for a frontend application.

This backend is fully **RESTful**, supports **JWT authentication**, and integrates **MongoDB** for database storage.

🔗 **Hosted API:** [Visit Hosted API (Eventico Backend)](https://eventico-backend.onrender.com/api/endpoints)  


---

## 🛠 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB** (Mongoose ODM)
- **JWT Authentication**
- **bcryptjs** for password hashing
- **Jest + Supertest** for unit and integration testing
- **dotenv-flow** for environment variables
- **Render** for deployment (for backend hosting)

---

## Set up instructions
#### 1. Clone the repository:

   ```bash
git clone https://github.com/Magdaleeena/Eventico_backend.git
cd Eventico_backend
```
#### 2. Install dependencies:
  ```bash
npm install
  ```

#### 3. Environment Variables:
Create a .env file in the root folder:

  ```bash
MONGO_URI_TEST=mongodb://localhost:27017/eventicoTestDB
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
```
(You don't need access to production database — tests and local development use a local MongoDB test instance.)

#### 4. Start MongoDB locally (if you haven't already):
Make sure MongoDB is running locally on mongodb://localhost:27017.

#### 5. Running the app in development:
```bash
npm run dev
```
The backend will be running at:
http://localhost:5000

#### 6. Run the test suite:
The database is automatically seeded by /db/seedDatabase.js., therefore, you don't need to manually insert data for testsRun. 
Run each test file separately:
```bash
npm test _tests_/users.test.js
npm test _tests_/userProfile.test.js
npm test _tests_/events.test.js 
npm test _tests_/eventSignup.test.js
```

---

## Available API Routes

#### Auth routes:

POST /api/users/register → Register a new user

POST /api/users/login → Login and get JWT token

#### User routes:

GET /api/users/me → Get own profile (protected)

PUT /api/users/me → Update own profile (protected)

DELETE /api/users/me → Delete own profile (protected)

GET /api/users → Get all users (admin only)

#### Event routes:

GET /api/events → List all events

GET /api/events/:id → Get a single event

POST /api/events → Create an event (admin only)

PUT /api/events/:id → Update an event (admin only)

DELETE /api/events/:id → Delete an event (admin only)

POST /api/events/:id/signup → Sign up for an event

POST /api/events/:id/unsignup → Cancel signup for an event

---

## Security
- Passwords are securely hashed using **bcryptjs** before storing in the database.
- Authentication tokens are signed using a secure **JWT_SECRET** stored in environment variables.
- Protected routes use **authentication middleware** to verify users' identities.
- Sensitive data like passwords is excluded from responses using Mongoose `.select('-password')`.
- Users' role-based access control is partially implemented (e.g., only admins can manage certain actions).

---

## Important
- Only test database (eventicoTestDB) will be used when running tests.
- Production secrets are NOT shared in this repo — you'll need to create your own .env.
- JWT secret must be strong for production environments.




