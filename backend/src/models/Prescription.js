const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  dose:         { type: String, required: true },
  frequency:    { type: String, required: true },
  duration:     String,
  instructions: String,
  quantity:     Number,
}, { _id: false });

const prescriptionSchema = new mongoose.Schema(
  {
    patient:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },

    prescriptionNumber: { type: String, unique: true },

    diagnosis:  { type: String, required: true },
    medicines:  { type: [medicineSchema], required: true },

    notes:       String,
    followUpDate: Date,

    status: {
      type: String,
      enum: ["active", "completed", "expired", "cancelled"],
      default: "active",
    },

    issuedDate:  { type: Date, default: Date.now },
    expiryDate:  Date,

    // Digital signature
    doctorSignature: String,
    isVerified:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

prescriptionSchema.pre("save", function (next) {
  if (!this.prescriptionNumber) {
    this.prescriptionNumber = "RX-" + Date.now().toString(36).toUpperCase();
  }
  next();
});

prescriptionSchema.index({ patient: 1, createdAt: -1 });
prescriptionSchema.index({ doctor: 1 });
prescriptionSchema.index({ status: 1 });

module.exports = mongoose.model("Prescription", prescriptionSchema);
