/**
 * Database Seed Script
 * Run: node src/config/seed.js
 * Creates demo users: patient@demo.com, doctor@demo.com, admin@demo.com
 * Password for all: Demo@1234
 */

require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");

const User    = require("../models/User");
const Patient = require("../models/Patient");
const Doctor  = require("../models/Doctor");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/healthcare_db";

// ── Plain text password — the User model's pre-save hook will hash it ──
const DEMO_PASSWORD = "Demo@1234";

const usersData = [
  {
    name:  "John Patient",
    email: "patient@demo.com",
    role:  "patient",
    phone: "+1-555-0101",
    isEmailVerified: true,
    isActive: true,
  },
  {
    name:  "Dr. Sarah Johnson",
    email: "doctor@demo.com",
    role:  "doctor",
    phone: "+1-555-0102",
    isEmailVerified: true,
    isActive: true,
  },
  {
    name:  "Admin User",
    email: "admin@demo.com",
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

    // ── Remove existing demo users cleanly ────────────────────
    for (const u of usersData) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        await Patient.deleteOne({ user: existing._id });
        await Doctor.deleteOne({ user: existing._id });
        await User.deleteOne({ _id: existing._id });
        console.log(`🗑  Removed existing: ${u.email}`);
      }
    }

    // ── Create users — pass plain password so pre-save hook hashes it ──
    for (const userData of usersData) {
      // Use 'new User + save()' so the pre-save hook fires correctly
      const user = new User({ ...userData, password: DEMO_PASSWORD });
      await user.save();
      console.log(`✅ Created user: ${user.email} (${user.role})`);

      // ── Create role-specific profile ──────────────────────
      if (user.role === "patient") {
        await Patient.create({
          user: user._id,
          dateOfBirth: new Date("1985-06-15"),
          gender:      "male",
          bloodGroup:  "O+",
          height: 178,
          weight: 72,
          address: {
            street:  "123 Main St",
            city:    "New York",
            state:   "NY",
            country: "USA",
            zipCode: "10001",
          },
          medicalHistory: {
            allergies:   ["Penicillin"],
            conditions:  ["Hypertension"],
            medications: ["Amlodipine 5mg"],
          },
        });
        console.log("   └─ Patient profile created");
      }

      if (user.role === "doctor") {
        await Doctor.create({
          user: user._id,
          specialty:      "Cardiologist",
          subSpecialties: ["Preventive Cardiology", "Heart Failure"],
          licenseNumber:  "MED-2020-001",
          experience:     12,
          bio: "Board-certified cardiologist with 12+ years of experience.",
          education: [
            { degree: "MD",          institution: "Harvard Medical School", year: 2008 },
            { degree: "Fellowship",  institution: "Cleveland Clinic",       year: 2012 },
          ],
          hospital:  "New York Presbyterian Hospital",
          languages: ["English", "Spanish"],
          consultationFee:   { video: 150, inPerson: 180 },
          consultationTypes: { video: true, inPerson: true },
          verificationStatus: "approved",
          verifiedAt:    new Date(),
          averageRating: 4.9,
          totalReviews:  312,
          totalPatients: 2400,
          isAvailableNow: true,
          availability: [
            { day: "monday",    startTime: "09:00", endTime: "17:00", isAvailable: true },
            { day: "tuesday",   startTime: "09:00", endTime: "17:00", isAvailable: true },
            { day: "wednesday", startTime: "09:00", endTime: "17:00", isAvailable: true },
            { day: "thursday",  startTime: "09:00", endTime: "17:00", isAvailable: true },
            { day: "friday",    startTime: "09:00", endTime: "15:00", isAvailable: true },
          ],
        });
        console.log("   └─ Doctor profile created");
      }
    }

    console.log("\n🎉 Seed completed successfully!");
    console.log("─────────────────────────────────────────");
    console.log("Demo Accounts  |  Password: Demo@1234");
    console.log("  Patient : patient@demo.com");
    console.log("  Doctor  : doctor@demo.com");
    console.log("  Admin   : admin@demo.com");
    console.log("─────────────────────────────────────────");

  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
