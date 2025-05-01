# Eventico Backend 🎉

Welcome to the backend of **Eventico**, a modern full-stack event management platform.  

This RESTful API powers everything from **event discovery** and **user sign-ups** to **admin management** and **secure authentication**. It’s designed to simulate the structure of real-world services like Eventbrite or Reddit, making it ideal for both learning and production-ready use.

---

## 🚀 Project Summary

Eventico Backend provides structured, secure, and efficient access to application data through a robust API.  
Built with **Node.js**, **Express**, and **MongoDB**, this backend manages:


- 🔐 **Secure authentication** - User registration and login using JWT-based authentication

- 📅 **Event management** - Create, update, and sign up for events via RESTful endpoints

- 🧑‍💼 **Role-based access control** - Admins have elevated privileges compared to standard users

- 📁 **MongoDB persistence** - Data is stored in a document-based database using Mongoose

- 🧪 **Testable architecture** - Full coverage using Jest and Supertest for unit and integration tests


🔗 **Hosted API:** [Explore endpoints](https://eventico-backend.onrender.com/api/endpoints)  


---

## 🛠 Tech Stack

- **Node.js** / **Express.js**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Jest + Supertest** for testing
- **dotenv-flow** for environment configuration
- **Render** for deployment 

---

## ⚙️ Setup instructions
#### 1. Clone the repository:

   ```bash
git clone https://github.com/Magdaleeena/Eventico_backend.git
cd Eventico_backend
```
#### 2. Install dependencies:
  ```bash
npm install
  ```

#### 3. Configure environment variables:
Create a `.env` file in the root folder:

  ```bash
MONGO_URI_TEST=mongodb://localhost:27017/eventicoTestDB
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
```
> 💡**Note:** Local development and tests run entirely on a local MongoDB instance — production DB access is not needed.

#### 4. Start MongoDB locally (if you haven't already):
Make sure MongoDB is running at `mongodb://localhost:27017`.

#### 5. Running the app in development:
```bash
npm run dev
```
The backend will be running at:
http://localhost:5000

#### 6. Run the test suite:
The database is auto-seeded via /db/seedDatabase.js — no manual data setup required.

To run individual test files:
```bash
npm test _tests_/users.test.js
npm test _tests_/userProfile.test.js
npm test _tests_/events.test.js 
npm test _tests_/eventSignup.test.js
```

---

## 📡 API Endpoints

#### 🔑 Auth

- `POST /api/users/register` → Register a new user

- `POST /api/users/login` → Authenticate and receive JWT

#### 👤 Users

- `GET /api/users/me` → Get current user profile (auth required)

- `PUT /api/users/me` → Update own profile (auth required)

- `DELETE /api/users/me` → Delete own account (auth required)

- `GET /api/users` → List all users (admin only)

#### 📅  Events

- `GET /api/events` → List all events

- `GET /api/events/:id` → Get event by ID

- `POST /api/events` → Create new event (admin only)

- `PUT /api/events/:id` → Update an event you created (admin only)

- `DELETE /api/events/:id` → Delete an event you created (admin only)

- `POST /api/events/:id/signup` → Sign up for an event 

- `POST /api/events/:id/unsignup` → Cancel signup for an event

---

## 🔒 Security
- Passwords are securely hashed using **bcryptjs** before storage.
- JWTs are signed using a secure key from `.env` (`JWT_SECRET`).
- Protected routes use **authentication middleware** to verify and authorise users.
- Sensitive fields (e.g., password) are excluded from responses with `.select('-password')`.
- Basic **role-based access control** restricts admin-only actions.

---

## 📝 Notes
- Tests use only the `eventicoTestDB` database.
- No production credentials are stored in this repo.
- Ensure a strong `JWT_SECRET` for production environments.




