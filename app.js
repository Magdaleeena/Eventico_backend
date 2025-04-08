require('dotenv-flow').config();  
const express = require('express');
const connectDB = require('./db');  
const userRoutes = require('./routes/userRoutes'); 
const eventRoutes = require('./routes/eventRoutes');
const { psqlErrorHandlerOne, psqlErrorHandlerTwo, psqlErrorHandlerThree, customErrorHandler, serverErrorHandler } = require('./error-handlers');

const app = express();

connectDB();

app.use(express.json());

// Use the user routes
app.use('/api', userRoutes);

app.use('/api/events', eventRoutes);

// Basic route to check if the server is running
app.get('/', (req, res) => {
  res.send('Welcome to the Event API!');
});

// 404 error handler for undefined routes
app.all("*", (request, response) => {
  response.status(404).send({ msg: 'Path not found' });
});

app.use(psqlErrorHandlerOne);

app.use(psqlErrorHandlerTwo);

app.use(psqlErrorHandlerThree);

app.use(customErrorHandler);

app.use(serverErrorHandler);

module.exports = app;
