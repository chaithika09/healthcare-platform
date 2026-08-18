const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./src/models/User");

const fix = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error("MONGODB_URI missing"); process.exit(1); }

  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB.");

    // Update all users where role is "Doctor" (capitalized) to "doctor" (lowercase)
    // Also "Patient" to "patient" and "Admin" to "admin"
    const users = await User.find({});
    let fixedCount = 0;

    for (const user of users) {
      const lowerRole = user.role.toLowerCase();
      if (user.role !== lowerRole) {
        console.log(`🔧 Fixing role for ${user.email}: ${user.role} -> ${lowerRole}`);
        user.role = lowerRole;
        await user.save();
        fixedCount++;
      }
    }

    console.log(`✨ Done. Fixed ${fixedCount} user roles.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing database:", error);
    process.exit(1);
  }
};

fix();
