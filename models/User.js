const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User schema
const userSchema = new mongoose.Schema({
    clerkId: { type: String, required: false, sparse: true},  
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true},
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, select: false, required: function () {
      return !this.clerkId;
    } },
    // clerkId or auth0Id or firebaseUid: { type: String, required: false } OR  password, if managed by myself: { type: String, required: true, select: false },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']},
    phone: { type: String, required: false, trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profileImage: { type: String, default: '/public/images/default_profile_img.png' },
    bio: { type: String, trim: true, maxlength: 500 },
    location: { type: String, trim: true },
    social: {
        linkedin: { type: String, trim: true },
        twitter:  { type: String, trim: true },
        website:  { type: String, trim: true }
        },
    dateOfBirth: { type: Date },
    isVerified:  { type: Boolean, default: false },
    isActive:    { type: Boolean, default: true },
    lastLogin:   { type: Date },
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
