const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    date:      { type: Date,   required: true },
    timeSlot:  { type: String, required: true }, // "09:00 AM"
    duration:  { type: Number, default: 30 },    // minutes

    type: {
      type: String,
      enum: ["video", "in-person"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "in-progress", "completed", "cancelled", "no-show"],
      default: "pending",
    },

    symptoms:   String,
    conditions: String,
    medications: String,
    notes:      String,

    // Doctor's notes after consultation
    diagnosis:       String,
    doctorNotes:     String,
    followUpDate:    Date,

    // Payment
    fee:           { type: Number, required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "refunded"], default: "pending" },
    paymentId:     String,

    // Video call
    videoRoomId:  String,
    videoJoinUrl: String,

    // Cancellation
    cancelledBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cancellationReason: String,
    cancelledAt:     Date,

    // Reminders
    reminderSent24h: { type: Boolean, default: false },
    reminderSent1h:  { type: Boolean, default: false },

    confirmationId: { type: String, unique: true },
  },
  { timestamps: true }
);

// Auto-generate confirmation ID
appointmentSchema.pre("save", function (next) {
  if (!this.confirmationId) {
    this.confirmationId = "APT-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ doctor: 1, date: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
