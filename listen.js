const app = require('./app');  // Import your Express app
const connectDB = require('./db');  // Import the MongoDB connection function

// Connect to the database
connectDB();

// Get port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
