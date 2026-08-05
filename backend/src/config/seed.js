/**
 * Database Seed Script
 * Run: node src/config/seed.js
 * 
 * IMPORTANT: Update the emails below to REAL email addresses
 * so users can receive password reset and notification emails.
 */

require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");

const User    = require("../models/User");
const Patient = require("../models/Patient");
const Doctor  = require("../models/Doctor");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/healthcare_db";
const DEMO_PASSWORD = "Demo@1234";

// ── UPDATE THESE TO REAL EMAIL ADDRESSES ──────────────────────
// Each user will receive emails (OTP, password reset, notifications)
// at the email address specified below.
const usersData = [
  {
    name:  "John Patient",
    // ← Change to a real email to receive password reset emails
    email: process.env.DEMO_PATIENT_EMAIL || "lschaithika+patient@gmail.com",
    role:  "patient",
    phone: "+1-555-0101",
    isEmailVerified: true,
    isActive: true,
  },
  {
    name:  "Dr. Sarah Johnson",
    // ← Change to a real email to receive password reset emails
    email: process.env.DEMO_DOCTOR_EMAIL || "lschaithika+doctor@gmail.com",
    role:  "doctor",
    phone: "+1-555-0102",
    isEmailVerified: true,
    isActive: true,
  },
  {
    name:  "Admin User",
    // ← Change to a real email to receive password reset emails
    email: process.env.DEMO_ADMIN_EMAIL || "lschaithika+admin@gmail.com",
    role:  "admin",
    phone: "+1-555-0103",
    isEmailVerified: true,
    isActive: true,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    for (const u of usersData) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        await Patient.deleteOne({ user: existing._id });
        await Doctor.deleteOne({  user: existing._id });
        await User.deleteOne({    _id:  existing._id });
        console.log(`🗑  Removed existing: ${u.email}`);
      }
    }

    for (const userData of usersData) {
      const user = new User({ ...userData, password: DEMO_PASSWORD });
      await user.save();
      console.log(`✅ Created: ${user.email} (${user.role})`);

      if (user.role === "patient") {
        await Patient.create({
          user: user._id,
          dateOfBirth: new Date("1985-06-15"),
          gender: "male", bloodGroup: "O+", height: 178, weight: 72,
          address: { street:"123 Main St", city:"New York", state:"NY", country:"USA", zipCode:"10001" },
          medicalHistory: { allergies:["Penicillin"], conditions:["Hypertension"], medications:["Amlodipine 5mg"] },
        });
        console.log("   └─ Patient profile created");
      }

      if (user.role === "doctor") {
        await Doctor.create({
          user: user._id,
          specialty: "Cardiologist", licenseNumber: "MED-2020-001", experience: 12,
          bio: "Board-certified cardiologist with 12+ years of experience.",
          education: [{ degree:"MD", institution:"Harvard Medical School", year:2008 }],
          hospital: "New York Presbyterian Hospital",
          languages: ["English", "Spanish"],
          consultationFee: { video:150, inPerson:180 },
          consultationTypes: { video:true, inPerson:true },
          verificationStatus: "approved", verifiedAt: new Date(),
          averageRating: 4.9, totalReviews: 312, totalPatients: 2400, isAvailableNow: true,
          availability: [
            { day:"monday",    startTime:"09:00", endTime:"17:00", isAvailable:true },
            { day:"tuesday",   startTime:"09:00", endTime:"17:00", isAvailable:true },
            { day:"wednesday", startTime:"09:00", endTime:"17:00", isAvailable:true },
            { day:"thursday",  startTime:"09:00", endTime:"17:00", isAvailable:true },
            { day:"friday",    startTime:"09:00", endTime:"15:00", isAvailable:true },
          ],
        });
        console.log("   └─ Doctor profile created");
      }
    }

    console.log("\n🎉 Seed completed!");
    console.log("─────────────────────────────────────────────────");
    console.log("Demo Accounts  |  Password: Demo@1234");
    console.log(`  Patient : ${usersData[0].email}`);
    console.log(`  Doctor  : ${usersData[1].email}`);
    console.log(`  Admin   : ${usersData[2].email}`);
    console.log("─────────────────────────────────────────────────");
    console.log("✉️  Password reset emails will go to these addresses");

  } catch (error) {
    console.error("❌ Seed failed:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
