const cors = require('cors');
require('dotenv-flow').config();  
const express = require('express');
const connectDB = require('./db');  
const userRoutes = require('./routes/userRoutes'); 
const eventRoutes = require('./routes/eventRoutes');
const endpointsRoutes = require('./routes/endpointsRoutes');
const { mongooseValidationHandler, mongooseCastErrorHandler, customErrorHandler, serverErrorHandler } = require('./error-handlers');
const path = require('path');

const app = express();

connectDB();

app.use(cors({
  origin: ['http://localhost:5173', 'https://eventico-frontend.onrender.com'], 
  credentials: true,
}));

app.use(express.json());

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

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack || err);
  res.status(500).json({ msg: "Internal Server Error", error: err.message });
});


module.exports = app;
