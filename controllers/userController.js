const User = require('../models/User');

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
      const { role } = req.query;
      const filter = role ? { role } : {};
      const users = await User.find(filter); 
      res.status(200).json(users); 
    } catch (err) {
      res.status(500).json({ msg: 'Error fetching users', error: err });
    }
};

// Get your own profile
exports.getOwnProfile = async (req, res, next) => {
  try {
    const clerkId = req.auth?.clerkId;
    console.log("Clerk ID received in getOwnProfile:", clerkId);
    console.log("Full req.auth object:", req.auth);

    if (!clerkId) {
      return res.status(401).json({ msg: "Missing Clerk ID in request" });
    }

    // Log incoming Clerk ID for debugging
    console.log("Looking for user with Clerk ID:", clerkId);

    // Attempt to find user
    const user = await User.findOne({ clerkId }).select('-password');

    // Additional debug log if user not found
    if (!user) {
      console.log("User NOT found. Full DB check failed.");
      return res.status(404).json({ msg: 'User not found in DB' });
    }

    // Log if user was found
    console.log("User found:", {
      id: user._id,
      email: user.email,
      username: user.username,
    });

    res.status(200).json(user);
  } catch (err) {
    console.error("Error in getOwnProfile:", err);
    next(err); 
  }
};

// Update your own profile
exports.updateOwnProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    delete updates.role;
    delete updates.password;

    if (updates.username) {
      const existing = await User.findOne({ username: updates.username });
      if (existing && existing.clerkId !== req.auth.clerkId) {
        return res.status(400).json({ msg: "Username already taken" });
      }
    }

    const user = await User.findOneAndUpdate(
      { clerkId: req.auth.clerkId },
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.status(200).json({ msg: 'Profile updated', user });
  } catch (err) {
    next(err);
  }
};

// Delete your own profile
exports.deleteOwnProfile = async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete({ clerkId: req.auth.clerkId });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(200).json({ msg: 'Your account has been deleted' });
  } catch (err) {
    next(err);
  }
};

// Sync Clerk user into your database
exports.syncUserFromClerk = async (req, res) => {
  try {
    const { clerkId, email, firstName, lastName } = req.body;

    if (!clerkId || !email) {
      return res.status(400).json({ msg: "Missing required Clerk info" });
    }

    const normalizedEmail = email.toLowerCase();

    // Find an existing user by Clerk ID or email
    let user = await User.findOne({ $or: [{ clerkId }, { email: normalizedEmail }] });

    if (!user) {
      // Generate truly unique username
      const baseUsername = normalizedEmail.split("@")[0];
      const suffix = clerkId.slice(-4);
      let candidateUsername = `${baseUsername}-${suffix}`;
      let count = 0;

      while (await User.findOne({ username: candidateUsername })) {
        count++;
        candidateUsername = `${baseUsername}-${suffix}-${count}`;
      }

      user = new User({
        clerkId,
        firstName: firstName || 'First',
        lastName: lastName || 'Last',
        email: normalizedEmail,
        username: candidateUsername,
        isVerified: true,
        role: "user",
      });

      await user.save();
      console.log("New user created:", candidateUsername);
    } else {
      // Update Clerk ID if not set yet
      if (!user.clerkId) {
        user.clerkId = clerkId;
        await user.save();
        console.log("Linked Clerk ID to existing user:", user.email);
      } else {
        console.log("Clerk user already exists:", user.email);
      }
    }
    res.status(200).json({ msg: "User synced successfully", user });
  } catch (err) {
    console.error("Error syncing user:", {
      message: err.message,
      stack: err.stack,
      body: req.body,
    });
    res.status(500).json({ msg: "Error syncing user", error: err.message });
  }
};
