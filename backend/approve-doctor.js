const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./src/models/User");
const Doctor = require("./src/models/Doctor");

const approve = async (email) => {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error("MONGODB_URI missing"); process.exit(1); }

  try {
    await mongoose.connect(uri);
    console.log("✅ Connected.");

    const user = await User.findOne({ email });
    if (!user) { console.error("User not found"); process.exit(1); }

    const doctor = await Doctor.findOneAndUpdate(
      { user: user._id },
      { $set: { verificationStatus: "approved", verifiedAt: new Date() } },
      { new: true }
    );

    if (!doctor) { console.error("Doctor profile not found for this user"); process.exit(1); }

    console.log(`✅ Doctor ${email} approved!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

const email = process.argv[2];
if (!email) { console.log("Usage: node approve-doctor.js email@example.com"); process.exit(1); }
approve(email);
