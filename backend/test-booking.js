const mongoose = require("mongoose");
require("dotenv").config();
const Appointment = require("./src/models/Appointment");
const User = require("./src/models/User");
const Doctor = require("./src/models/Doctor");
const Patient = require("./src/models/Patient");

async function testBooking() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected");

    // Get patient and doctor
    const patientUser = await User.findOne({ email: "ksubramanyam906@gmail.com" });
    const doctorUser = await User.findOne({ email: "lschaithika@gmail.com" });
    
    if (!patientUser) return console.error("Patient not found");
    if (!doctorUser) return console.error("Doctor not found");

    console.log("Patient User ID:", patientUser._id);
    console.log("Doctor User ID:", doctorUser._id);

    // Create test appointment
    const appointment = await Appointment.create({
      patient: patientUser._id,
      doctor: doctorUser._id,
      date: new Date("2026-08-14"),
      timeSlot: "10:00 AM",
      type: "video",
      fee: 500,
      symptoms: "Test booking",
      status: "confirmed",
      paymentStatus: "pending",
    });

    console.log("✅ Appointment created:", appointment.confirmationId);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testBooking();
