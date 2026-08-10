const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./src/models/User");
const Doctor = require("./src/models/Doctor");
const Patient = require("./src/models/Patient");

const MONGODB_URI = process.env.MONGODB_URI;

const doctors = [
  {
    name: "Dr. Sarah Johnson",
    email: "lschaithika+doctor@gmail.com",
    password: "Demo@1234",
    role: "doctor",
    specialty: "Cardiologist",
    experience: 12,
    hospital: "City Medical Center",
    consultationFee: { video: 150, inPerson: 200 }
  },
  {
    name: "Dr. Michael Chen",
    email: "lschaithika+doctor2@gmail.com",
    password: "Demo@1234",
    role: "doctor",
    specialty: "Neurologist",
    experience: 15,
    hospital: "Green Valley Hospital",
    consultationFee: { video: 180, inPerson: 220 }
  }
];

const patient = {
  name: "Demo Patient",
  email: "lschaithika+patient@gmail.com",
  password: "Demo@1234",
  role: "patient"
};

const seed = async () => {
  if (!MONGODB_URI || MONGODB_URI.includes("xxxxx")) {
    console.error("❌ MONGODB_URI not set in backend/.env");
    process.exit(1);
  }

  try {
    console.log("🔌 Connecting to Atlas...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected.");

    // Clear existing (optional - be careful in production)
    // await User.deleteMany({ email: { $in: [patient.email, ...doctors.map(d => d.email)] } });

    console.log("🌱 Seeding users...");

    // Create Patient
    const existingPatient = await User.findOne({ email: patient.email });
    if (!existingPatient) {
      const u = await User.create({ ...patient, isEmailVerified: true });
      await Patient.create({ user: u._id });
      console.log(`✅ Created patient: ${patient.email}`);
    }

    // Create Doctors
    for (const d of doctors) {
      const existingDoc = await User.findOne({ email: d.email });
      if (!existingDoc) {
        const u = await User.create({
          name: d.name,
          email: d.email,
          password: d.password,
          role: "doctor",
          isEmailVerified: true
        });
        await Doctor.create({
          user: u._id,
          specialty: d.specialty,
          experience: d.experience,
          hospital: d.hospital,
          consultationFee: d.consultationFee,
          verificationStatus: "approved"
        });
        console.log(`✅ Created doctor: ${d.email}`);
      }
    }

    console.log("✨ Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();
