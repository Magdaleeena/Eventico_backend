const User = require('../models/User');

// Get all users (admin-only)
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
  console.log("[getOwnProfile] Route hit");

  try {
    const userId = req.auth?.userId;
    console.log("[CONTROLLER] req.auth:", req.auth);
    console.log("[CONTROLLER] req.auth.userId:", userId);

    if (!userId) {
      console.warn("userId missing from auth object");
      return res.status(401).json({ msg: "Missing userId in request" });
    }

    let user;
    try {
      user = await User.findOne({ userId }); 
      console.log("[CONTROLLER] Mongo query success:", user);
    } catch (dbErr) {
      console.error("Mongoose query failed:", dbErr);
      return res.status(500).json({ msg: "Mongo query crashed", error: dbErr.message });
    }

    if (!user) {
      console.warn("No user found for userId:", userId);
      return res.status(404).json({ msg: 'User not found in DB' });
    }

    console.log("User found:", {
      id: user._id,
      username: user.username,
      email: user.email
    });

    return res.status(200).json(user);
  } catch (err) {
    console.error("Uncaught error in getOwnProfile:", {
      message: err.message,
      stack: err.stack,
      auth: req.auth,
    });
    return res.status(500).json({ msg: "Internal server error", error: err.message });
  }
};


// Update your own profile
exports.updateOwnProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    delete updates.role;

    const userId = req.auth?.userId;

    if (updates.username) {
      const existing = await User.findOne({ username: updates.username });
      if (existing && existing.userId !== userId) {
        return res.status(400).json({ msg: "Username already taken" });
      }
    }

    const user = await User.findOneAndUpdate(
      { userId },
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
    const userId = req.auth?.userId;
    const user = await User.findOneAndDelete({ userId });

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
    const { userId, email, firstName, lastName } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ msg: "Missing required Clerk info" });
    }

    const normalizedEmail = email.toLowerCase();

    let user = await User.findOne({ $or: [{ userId }, { email: normalizedEmail }] });

    if (!user) {
      const baseUsername = normalizedEmail.split("@")[0];
      const suffix = userId.slice(-4);
      let candidateUsername = `${baseUsername}-${suffix}`;
      let count = 0;

      while (await User.findOne({ username: candidateUsername })) {
        count++;
        candidateUsername = `${baseUsername}-${suffix}-${count}`;
      }

      user = new User({
        userId,
        firstName: firstName || 'First',
        lastName: lastName || 'Last',
        email: normalizedEmail,
        username: candidateUsername,
        isVerified: true,
        role: "user",
      });

      await user.save();
      console.log("New Clerk user created:", candidateUsername);
    } else {
      if (!user.userId) {
        user.userId = userId;
        await user.save();
        console.log("Linked userId to existing user:", user.email);
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
