const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
    clerkId: { type: String, required: false},  
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now },
});

// Create the User model from the schema
const User = mongoose.model('User', userSchema);

// Export the User model to be used in controllers
module.exports = User;
