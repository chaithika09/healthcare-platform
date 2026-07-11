const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
  {
    patient:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },

    title:       { type: String, required: true, trim: true },
    description: String,

    type: {
      type: String,
      enum: ["lab-report", "imaging", "prescription", "discharge-summary", "vaccination", "other"],
      required: true,
    },

    category: String, // e.g., "Cardiology", "Radiology"

    files: [{
      originalName: String,
      storedName:   String,
      path:         String,
      mimeType:     String,
      size:         Number,
      url:          String,
    }],

    reportDate: { type: Date, default: Date.now },
    doctor:     String,
    hospital:   String,
    notes:      String,

    isShared:   { type: Boolean, default: false },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    tags: [String],
  },
  { timestamps: true }
);

medicalRecordSchema.index({ patient: 1, createdAt: -1 });
medicalRecordSchema.index({ type: 1 });

module.exports = mongoose.model("MedicalRecord", medicalRecordSchema);
