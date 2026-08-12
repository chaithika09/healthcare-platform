const mongoose = require("mongoose");
require("dotenv").config();
const Doctor = require("./src/models/Doctor");
const User = require("./src/models/User");

const check = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error("MONGODB_URI missing"); process.exit(1); }

  try {
    await mongoose.connect(uri);
    console.log("✅ Connected.");

    const doctors = await Doctor.find().populate("user", "name email");
    console.log(`Found ${doctors.length} doctors:`);
    doctors.forEach(d => {
      console.log(`- Name: ${d.user?.name}, Email: ${d.user?.email}, Status: ${d.verificationStatus}, Specialty: ${d.specialty}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

check();
