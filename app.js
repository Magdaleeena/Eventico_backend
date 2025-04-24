const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv-flow').config(); 
const { clerkMiddleware, getAuth, requireAuth } = require('@clerk/express');

const connectDB = require('./db');  
const userRoutes = require('./routes/userRoutes'); 
const eventRoutes = require('./routes/eventRoutes');
const endpointsRoutes = require('./routes/endpointsRoutes');
const { mongooseValidationHandler, mongooseCastErrorHandler, customErrorHandler, serverErrorHandler } = require('./error-handlers');

const app = express();
connectDB();

const corsOptions = {
  origin: ['http://localhost:5173', 'https://eventico-frontend.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

app.use(express.json());

app.use(clerkMiddleware());

app.use('/api', endpointsRoutes);

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/api/users', userRoutes);

app.use('/api/events', eventRoutes);

app.all("*", (request, response) => {
  response.status(404).send({ msg: 'Path not found' });
});

app.use(mongooseValidationHandler);

app.use(mongooseCastErrorHandler);

app.use(customErrorHandler);

app.use(serverErrorHandler);

module.exports = app;
