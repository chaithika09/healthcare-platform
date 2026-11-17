const mongoose = require("mongoose");

const ambulanceRequestSchema = new mongoose.Schema(
  {
    patient:       { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    patientName:   String,
    patientPhone:  String,
    location:      { type: String, required: true },
    gpsCoords:     { lat: Number, lng: Number },
    emergencyType: { type: String, required: true },
    notes:         String,
    status: {
      type: String,
      enum: ["pending", "dispatched", "arrived", "completed", "cancelled"],
      default: "pending",
    },
    assignedUnit:  String,
    eta:           String,
    respondedAt:   Date,
    completedAt:   Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AmbulanceRequest", ambulanceRequestSchema);
