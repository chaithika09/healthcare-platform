const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    dateOfBirth: { type: Date },
    gender:      { type: String, enum: ["male", "female", "other", "prefer_not"] },
    bloodGroup:  { type: String, enum: ["A+","A-","B+","B-","AB+","AB-","O+","O-","Unknown"] },
    height:      { type: Number }, // cm
    weight:      { type: Number }, // kg

    address: {
      street:  String,
      city:    String,
      state:   String,
      country: String,
      zipCode: String,
    },

    emergencyContact: {
      name:         String,
      relationship: String,
      phone:        String,
    },

    medicalHistory: {
      allergies:   [{ type: String }],
      conditions:  [{ type: String }],
      medications: [{ type: String }],
      surgeries:   [{ type: String }],
      familyHistory: [{ type: String }],
    },

    insurance: {
      provider:   String,
      policyNumber: String,
      groupNumber:  String,
      expiryDate:   Date,
    },

    // Stats
    totalAppointments: { type: Number, default: 0 },
    totalRecords:      { type: Number, default: 0 },
  },
  { timestamps: true }
);

patientSchema.index({ user: 1 });

module.exports = mongoose.model("Patient", patientSchema);
