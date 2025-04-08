const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
    clerkId: { type: String, required: false},  
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    eventsSignedUp: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    eventsManaged: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  },
  {
    timestamps: true,  // Automatically adds createdAt and updatedAt
  }
);

// Create the User model from the schema
const User = mongoose.model('User', userSchema);

// Export the User model to be used in controllers
module.exports = User;
