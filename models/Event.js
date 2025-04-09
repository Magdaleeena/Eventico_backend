const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    maxParticipants: { type: Number, required: true, min: 1 },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    keywords: { type: [String], required: true },
    category: {
      type: String,
      required: true,
      enum: ['Music', 'Arts', 'Social', 'Health & Wellness', 'Education', 'Entertainment', 'Food & Drink', 'Conference', 'Sports', 'Technology', 'Networking'], 
    },
    tags: [String],
    image: { type: String, default: '' },
    eventURL: { type: String, default: '' },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'completed'],
      default: 'active',
    },
    organizerContact: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
