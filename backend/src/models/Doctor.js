const mongoose = require("mongoose");

const availabilitySlotSchema = new mongoose.Schema({
  day:       { type: String, enum: ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] },
  startTime: String,
  endTime:   String,
  isAvailable: { type: Boolean, default: true },
}, { _id: false });

const doctorSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    specialty:   { type: String, required: true },
    subSpecialties: [String],
    licenseNumber: { type: String, required: true },
    experience:  { type: Number, required: true }, // years
    bio:         { type: String, maxlength: 1000 },

    education: [{
      degree:      String,
      institution: String,
      year:        Number,
    }],

    certifications: [{
      name:        String,
      issuedBy:    String,
      year:        Number,
    }],

    hospital:  String,
    languages: [String],

    consultationFee: {
      video:     { type: Number, default: 100 },
      inPerson:  { type: Number, default: 120 },
    },

    consultationTypes: {
      video:    { type: Boolean, default: true },
      inPerson: { type: Boolean, default: true },
    },

    availability: [availabilitySlotSchema],

    // Verification
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    verificationDocuments: [String],
    verifiedAt:  Date,
    verifiedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rejectionReason: String,

    // Stats
    totalPatients:     { type: Number, default: 0 },
    totalAppointments: { type: Number, default: 0 },
    averageRating:     { type: Number, default: 0, min: 0, max: 5 },
    totalReviews:      { type: Number, default: 0 },

    isAvailableNow: { type: Boolean, default: false },
  },
  { timestamps: true }
);

doctorSchema.index({ user: 1 });
doctorSchema.index({ specialty: 1 });
doctorSchema.index({ verificationStatus: 1 });
doctorSchema.index({ averageRating: -1 });

module.exports = mongoose.model("Doctor", doctorSchema);
