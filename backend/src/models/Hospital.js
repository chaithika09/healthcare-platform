const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    hospitalName:{ type: String, required: true, trim: true },
    registrationNumber: { type: String, required: true },
    address:     { type: String, required: true },
    city:        { type: String, required: true },
    state:       { type: String, required: true },
    pincode:     { type: String, required: true },
    phone:       { type: String, required: true },
    emergencyPhone: { type: String }, // dedicated emergency line
    type: {
      type: String,
      enum: ["government", "private", "clinic", "multispeciality", "other"],
      default: "private",
    },
    specialties:    [String],
    totalBeds:      { type: Number, default: 0 },
    emergencyBeds:  { type: Number, default: 0 },
    hasAmbulance:   { type: Boolean, default: false },
    ambulanceCount: { type: Number, default: 0 },
    isVerified:   { type: Boolean, default: false },
    isActive:     { type: Boolean, default: true },
    // GPS coordinates for proximity alerts
    location: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true }
);

hospitalSchema.index({ user: 1 });
hospitalSchema.index({ city: 1 });
hospitalSchema.index({ isVerified: 1 });

module.exports = mongoose.model("Hospital", hospitalSchema);
