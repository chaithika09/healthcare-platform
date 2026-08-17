/**
 * Production Seed Script
 * Run: MONGODB_URI=<atlas_uri> node seed-production.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error("❌ MONGODB_URI not set. Run: MONGODB_URI=<uri> node seed-production.js");
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB Atlas\n");

  const User       = require("./src/models/User");
  const Doctor     = require("./src/models/Doctor");
  const Patient    = require("./src/models/Patient");
  const Appointment= require("./src/models/Appointment");

  // Clear existing
  await User.deleteMany({});
  await Doctor.deleteMany({});
  await Patient.deleteMany({});
  await Appointment.deleteMany({});
  console.log("🗑️  Cleared existing data\n");

  const hash = (pw) => bcrypt.hash(pw, 10);
  const pw   = "Chaithika@09";

  // ── Patients ──────────────────────────────────────────────
  const harika = await User.create({
    name: "Harika", email: "ksubramanyam906@gmail.com",
    password: await hash(pw), phone: "9392886725",
    role: "patient", isVerified: true,
  });
  await Patient.create({ user: harika._id, bloodGroup: "A+", allergies: [], chronicConditions: [] });
  console.log("✅ Patient: Harika");

  const leela = await User.create({
    name: "Leela", email: "kleelavathi906@gmail.com",
    password: await hash(pw), phone: "9392886725",
    role: "patient", isVerified: true,
  });
  await Patient.create({ user: leela._id, bloodGroup: "B+", allergies: [], chronicConditions: [] });
  console.log("✅ Patient: Leela");

  // ── Doctors ────────────────────────────────────────────────
  const chaithikaUser = await User.create({
    name: "Dr. Chaithika", email: "lschaithika@gmail.com",
    password: await hash(pw), phone: "9392886725",
    role: "doctor", isVerified: true,
  });
  await Doctor.create({
    user: chaithikaUser._id,
    specialty: "General Physician",
    qualifications: ["MBBS", "MD"],
    licenseNumber: "MED-CH-2024-001",
    experience: 8,
    verificationStatus: "approved",
    isAvailableNow: true,
    consultationFee: { video: 500, inPerson: 800 },
    bio: "Experienced General Physician specializing in preventive care.",
    languages: ["English", "Telugu", "Hindi"],
    hospital: "City General Hospital",
    averageRating: 4.8,
    totalReviews: 0,
    consultationTypes: { video: true, inPerson: true },
  });
  console.log("✅ Doctor: Dr. Chaithika (approved)");

  const subramanyamUser = await User.create({
    name: "Dr. Subramanyam", email: "ksubramanyam@gmail.com",
    password: await hash(pw), phone: "9392886725",
    role: "doctor", isVerified: true,
  });
  await Doctor.create({
    user: subramanyamUser._id,
    specialty: "Cardiologist",
    qualifications: ["MBBS", "MD Cardiology"],
    licenseNumber: "MED-SB-2024-002",
    experience: 12,
    verificationStatus: "approved",
    isAvailableNow: true,
    consultationFee: { video: 700, inPerson: 1000 },
    bio: "Board-certified Cardiologist with expertise in heart disease prevention.",
    languages: ["English", "Telugu", "Hindi"],
    hospital: "Advanced Heart Care Center",
    averageRating: 4.9,
    totalReviews: 0,
    consultationTypes: { video: true, inPerson: true },
  });
  console.log("✅ Doctor: Dr. Subramanyam (approved)\n");

  console.log("═══════════════════════════════════════");
  console.log("✅ Production database seeded!");
  console.log("═══════════════════════════════════════");
  console.log("Login credentials (all passwords: Chaithika@09):");
  console.log("  Patient:  ksubramanyam906@gmail.com");
  console.log("  Patient:  kleelavathi906@gmail.com");
  console.log("  Doctor:   lschaithika@gmail.com");
  console.log("  Doctor:   ksubramanyam@gmail.com");
  console.log("═══════════════════════════════════════\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error("❌", e); process.exit(1); });
