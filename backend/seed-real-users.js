const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const User = require("./src/models/User");
const Doctor = require("./src/models/Doctor");
const Patient = require("./src/models/Patient");
const Appointment = require("./src/models/Appointment");

const seedRealUsers = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/healthcare_db");
    console.log("✅ Connected to MongoDB\n");

    // ═══════════════════════════════════════════════════════════
    // STEP 1: CLEAR ALL EXISTING DATA
    // ═══════════════════════════════════════════════════════════
    console.log("🗑️  Clearing all existing data...");
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    console.log("✅ All dummy data removed\n");

    // ═══════════════════════════════════════════════════════════
    // STEP 2: CREATE PATIENTS
    // ═══════════════════════════════════════════════════════════
    console.log("👤 Creating patients...");
    
    // Patient 1: Harika
    const harikaUser = await User.create({
      name: "Harika",
      email: "ksubramanyam906@gmail.com",
      password: await bcrypt.hash("Chaithika@09", 10),
      phone: "9392886725",
      role: "patient",
      isVerified: true,
    });

    await Patient.create({
      user: harikaUser._id,
      dateOfBirth: "1995-01-15",
      bloodGroup: "A+",
      allergies: [],
      chronicConditions: [],
      medications: [],
    });

    console.log(`✅ Created patient: Harika (${harikaUser.email})`);

    // Patient 2: Leela
    const leelaUser = await User.create({
      name: "Leela",
      email: "kleelavathi906@gmail.com",
      password: await bcrypt.hash("Chaithika@09", 10),
      phone: "9392886725",
      role: "patient",
      isVerified: true,
    });

    await Patient.create({
      user: leelaUser._id,
      dateOfBirth: "1990-05-20",
      bloodGroup: "B+",
      allergies: [],
      chronicConditions: [],
      medications: [],
    });

    console.log(`✅ Created patient: Leela (${leelaUser.email})\n`);

    // ═══════════════════════════════════════════════════════════
    // STEP 3: CREATE DOCTORS
    // ═══════════════════════════════════════════════════════════
    console.log("👨‍⚕️ Creating doctors...");

    // Doctor 1: Chaithika
    const chaithikaUser = await User.create({
      name: "Dr. Chaithika",
      email: "lschaithika@gmail.com",
      password: await bcrypt.hash("Chaithika@09", 10),
      phone: "9392886725",
      role: "doctor",
      isVerified: true,
    });

    await Doctor.create({
      user: chaithikaUser._id,
      specialty: "General Physician",
      qualifications: ["MBBS", "MD"],
      licenseNumber: "MED-CH-2024-001",
      experience: 8,
      consultationFee: {
        video: 500,
        inPerson: 800,
      },
      availability: {
        monday: { available: true, slots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"] },
        tuesday: { available: true, slots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"] },
        wednesday: { available: true, slots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"] },
        thursday: { available: true, slots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"] },
        friday: { available: true, slots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"] },
        saturday: { available: true, slots: ["09:00 AM", "10:00 AM", "11:00 AM"] },
        sunday: { available: false, slots: [] },
      },
      rating: 4.8,
      totalRatings: 0,
      isApproved: true,
      bio: "Experienced General Physician specializing in preventive care and chronic disease management.",
      languages: ["English", "Telugu", "Hindi"],
      hospital: "City General Hospital",
      consultationTypes: {
        video: true,
        inPerson: true,
      },
    });

    console.log(`✅ Created doctor: Dr. Chaithika (${chaithikaUser.email})`);

    // Doctor 2: Subramanyam
    const subramanyamUser = await User.create({
      name: "Dr. Subramanyam",
      email: "ksubramanyam@gmail.com",
      password: await bcrypt.hash("Chaithika@09", 10),
      phone: "9392886725",
      role: "doctor",
      isVerified: true,
    });

    await Doctor.create({
      user: subramanyamUser._id,
      specialty: "Cardiologist",
      qualifications: ["MBBS", "MD Cardiology"],
      licenseNumber: "MED-SB-2024-002",
      experience: 12,
      consultationFee: {
        video: 700,
        inPerson: 1000,
      },
      availability: {
        monday: { available: true, slots: ["10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM", "05:00 PM"] },
        tuesday: { available: true, slots: ["10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM", "05:00 PM"] },
        wednesday: { available: true, slots: ["10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM", "05:00 PM"] },
        thursday: { available: true, slots: ["10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM", "05:00 PM"] },
        friday: { available: true, slots: ["10:00 AM", "11:00 AM", "03:00 PM", "04:00 PM", "05:00 PM"] },
        saturday: { available: true, slots: ["10:00 AM", "11:00 AM"] },
        sunday: { available: false, slots: [] },
      },
      rating: 4.9,
      totalRatings: 0,
      isApproved: true,
      bio: "Board-certified Cardiologist with expertise in heart disease prevention and treatment.",
      languages: ["English", "Telugu", "Hindi"],
      hospital: "Advanced Heart Care Center",
      consultationTypes: {
        video: true,
        inPerson: true,
      },
    });

    console.log(`✅ Created doctor: Dr. Subramanyam (${subramanyamUser.email})\n`);

    // ═══════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════
    console.log("═══════════════════════════════════════════════");
    console.log("✅ DATABASE SEEDED SUCCESSFULLY!");
    console.log("═══════════════════════════════════════════════\n");

    console.log("📋 LOGIN CREDENTIALS:\n");
    
    console.log("👤 PATIENTS:");
    console.log("  1. Harika");
    console.log("     Email: ksubramanyam906@gmail.com");
    console.log("     Password: Chaithika@09");
    console.log("     Phone: 9392886725\n");
    
    console.log("  2. Leela");
    console.log("     Email: kleelavathi906@gmail.com");
    console.log("     Password: Chaithika@09");
    console.log("     Phone: 9392886725\n");

    console.log("👨‍⚕️ DOCTORS:");
    console.log("  1. Dr. Chaithika");
    console.log("     Email: lschaithika@gmail.com");
    console.log("     Password: Chaithika@09");
    console.log("     Phone: 9392886725");
    console.log("     Specialty: General Physician");
    console.log("     Fee: ₹500 (Video) | ₹800 (In-Person)\n");
    
    console.log("  2. Dr. Subramanyam");
    console.log("     Email: ksubramanyam@gmail.com");
    console.log("     Password: Chaithika@09");
    console.log("     Phone: 9392886725");
    console.log("     Specialty: Cardiologist");
    console.log("     Fee: ₹700 (Video) | ₹1000 (In-Person)\n");

    console.log("═══════════════════════════════════════════════");
    console.log("🎯 You can now:");
    console.log("   1. Login as Leela → Find Dr. Chaithika → Book video appointment");
    console.log("   2. Login as Dr. Chaithika → View appointments");
    console.log("   3. Join video call when appointment time arrives");
    console.log("═══════════════════════════════════════════════\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedRealUsers();
