const mongoose = require("mongoose");

const labBookingSchema = new mongoose.Schema(
  {
    patient:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tests:    [{ name: String, category: String, price: Number }],
    date:     { type: Date, required: true },
    timeSlot: String,
    homeCollection: { type: Boolean, default: false },
    address:  String,
    status:   { type: String, enum: ["booked", "sample-collected", "processing", "completed", "cancelled"], default: "booked" },
    totalAmount: Number,
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    results:  [{ testName: String, result: String, unit: String, normalRange: String, fileUrl: String }],
    notes:    String,
    bookingId: { type: String, unique: true },
  },
  { timestamps: true }
);

labBookingSchema.pre("save", function (next) {
  if (!this.bookingId) {
    this.bookingId = "LAB-" + Date.now().toString(36).toUpperCase();
  }
  next();
});

labBookingSchema.index({ patient: 1, createdAt: -1 });

module.exports = mongoose.model("LabBooking", labBookingSchema);
