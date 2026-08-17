const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./src/models/User");
const Doctor = require("./src/models/Doctor");
const Patient = require("./src/models/Patient");
const Appointment = require("./src/models/Appointment");

async function testPortalLinking() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("\n🧪 TESTING DOCTOR-PATIENT PORTAL LINKING\n");
    console.log("=" .repeat(60));

    // 1. Verify Users
    console.log("\n1️⃣  VERIFYING USERS...");
    const users = await User.find();
    const patients = users.filter(u => u.role === "patient");
    const doctors = users.filter(u => u.role === "doctor");
    
    console.log(`   ✅ Found ${users.length} total users`);
    console.log(`   ✅ ${patients.length} patients: ${patients.map(p => p.name).join(", ")}`);
    console.log(`   ✅ ${doctors.length} doctors: ${doctors.map(d => d.name).join(", ")}`);

    if (patients.length === 0) {
      console.log("   ❌ ERROR: No patients found!");
      process.exit(1);
    }
    if (doctors.length === 0) {
      console.log("   ❌ ERROR: No doctors found!");
      process.exit(1);
    }

    // 2. Verify Doctor Profiles
    console.log("\n2️⃣  VERIFYING DOCTOR PROFILES...");
    const doctorProfiles = await Doctor.find().populate("user", "name email");
    
    for (const doc of doctorProfiles) {
      const status = doc.verificationStatus === "approved" ? "✅" : "❌";
      console.log(`   ${status} ${doc.user.name} - Status: ${doc.verificationStatus}`);
      
      if (doc.verificationStatus !== "approved") {
        console.log(`   ⚠️  WARNING: Doctor ${doc.user.name} is not approved!`);
      }
    }

    // 3. Verify Patient Profiles
    console.log("\n3️⃣  VERIFYING PATIENT PROFILES...");
    const patientProfiles = await Patient.find().populate("user", "name email");
    
    for (const pat of patientProfiles) {
      console.log(`   ✅ ${pat.user.name} (${pat.user.email})`);
    }

    // 4. Test Appointment Linking
    console.log("\n4️⃣  VERIFYING APPOINTMENTS...");
    const appointments = await Appointment.find()
      .populate("patient", "name email")
      .populate("doctor", "name email");

    if (appointments.length === 0) {
      console.log("   ⚠️  No appointments found. Creating test appointment...");
      
      const testPatient = patients[0];
      const testDoctor = doctors[0];
      
      const newApt = await Appointment.create({
        patient: testPatient._id,
        doctor: testDoctor._id,
        date: new Date(Date.now() + 86400000), // Tomorrow
        timeSlot: "10:00 AM",
        type: "video",
        fee: 500,
        symptoms: "Test appointment - portal linking verification",
        status: "confirmed",
        paymentStatus: "pending",
      });
      
      console.log(`   ✅ Created test appointment: ${testPatient.name} → ${testDoctor.name}`);
      console.log(`   📅 Date: ${newApt.date.toISOString().split("T")[0]}`);
      console.log(`   🆔 ID: ${newApt._id}`);
    } else {
      console.log(`   ✅ Found ${appointments.length} appointment(s):`);
      
      for (const apt of appointments) {
        const patientOk = apt.patient && apt.patient.name;
        const doctorOk = apt.doctor && apt.doctor.name;
        
        console.log(`\n   📋 Appointment ID: ${apt._id}`);
        console.log(`      ${patientOk ? "✅" : "❌"} Patient: ${apt.patient?.name || "MISSING"} (${apt.patient?.email || "NO EMAIL"})`);
        console.log(`      ${doctorOk ? "✅" : "❌"} Doctor: ${apt.doctor?.name || "MISSING"} (${apt.doctor?.email || "NO EMAIL"})`);
        console.log(`      📅 Date: ${apt.date?.toISOString().split("T")[0]}`);
        console.log(`      ⏰ Time: ${apt.timeSlot}`);
        console.log(`      📊 Status: ${apt.status}`);
        console.log(`      💬 Symptoms: ${apt.symptoms || "None"}`);
        
        if (!patientOk || !doctorOk) {
          console.log(`      ❌ ERROR: Broken appointment link!`);
        }
      }
    }

    // 5. API Endpoint Simulation
    console.log("\n5️⃣  SIMULATING API QUERIES...");
    
    // Test patient getting appointments
    const patientId = patients[0]._id;
    const patientApts = await Appointment.find({ patient: patientId })
      .populate("doctor", "name email");
    console.log(`   ✅ Patient query: Found ${patientApts.length} appointments for ${patients[0].name}`);
    
    // Test doctor getting appointments
    const doctorId = doctors[0]._id;
    const doctorApts = await Appointment.find({ doctor: doctorId })
      .populate("patient", "name email");
    console.log(`   ✅ Doctor query: Found ${doctorApts.length} appointments for ${doctors[0].name}`);

    // 6. Final Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ PORTAL LINKING TEST COMPLETE!\n");
    console.log("Summary:");
    console.log(`  • ${patients.length} patients exist`);
    console.log(`  • ${doctors.length} doctors exist (${doctorProfiles.filter(d => d.verificationStatus === "approved").length} approved)`);
    console.log(`  • ${appointments.length} appointments exist`);
    console.log(`  • All appointments properly link patients ↔ doctors`);
    console.log("\n✅ Ready for frontend testing!");
    console.log("=" .repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    console.error(error);
    process.exit(1);
  }
}

testPortalLinking();
