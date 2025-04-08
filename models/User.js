const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

userSchema.statics.hashPassword = async function(password) {
  return await bcrypt.hash(password, 10);
};

// Create the User model from the schema
const User = mongoose.model('User', userSchema);

// Export the User model to be used in controllers
module.exports = User;
