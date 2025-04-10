const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const userSchema = new mongoose.Schema({
    clerkId: { type: String, required: false},  
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true},
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    // clerkId or auth0Id or firebaseUid: { type: String, required: false } OR  password, if managed by myself: { type: String, required: true, select: false },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']},
    phone: { type: String, required: false, trim: true },
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
