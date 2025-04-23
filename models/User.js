const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, equired: true, unique: true }, 
  firstName: { type: String, required: true, trim: true, default: 'First' },
  lastName: { type: String, required: true, trim: true, default: 'Last' },
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true,lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],},
  phone: { type: String, trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profileImage: { type: String, default: '/public/images/default_profile_img.png' },
  bio: { type: String, trim: true, maxlength: 500 },
  location: { type: String, trim: true },
  social: {
    linkedin: { type: String, trim: true },
    twitter:  { type: String, trim: true },
    website:  { type: String, trim: true },
  },
  dateOfBirth: { type: Date },
  isVerified:  { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  lastLogin:   { type: Date },
  eventsSignedUp: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  eventsManaged: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
