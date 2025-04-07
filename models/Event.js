const mongoose = require('mongoose');

// Define the Event Schema
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
      required: true,
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: 1,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References users who are participants
      },
    ],
    keywords: {
      type: [String],
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Music', 'Arts', 'Social', 'Health & Wellness', 'Education', 'Entertainment', 'Food & Drink', 'Conference'], // Example categories
    },
    tags: [String],
    image: {
      type: String,
      default: '', // URL to an image for the event
    },
    eventURL: {
      type: String,
      default: '', // URL to the event's webpage
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'inactive', 'completed'],
      default: 'active',
    },
    organizerContact: {
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Create the Event model based on the schema
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
