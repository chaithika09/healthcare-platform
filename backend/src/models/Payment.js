const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    patient:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },

    transactionId: { type: String, unique: true },
    amount:        { type: Number, required: true },
    currency:      { type: String, default: "USD" },

    method: {
      type: String,
      enum: ["card", "paypal", "apple-pay", "google-pay", "bank-transfer"],
    },

    status: {
      type: String,
      enum: ["pending", "processing", "paid", "failed", "refunded", "partially-refunded"],
      default: "pending",
    },

    description: String,

    // Gateway details
    gatewayProvider:   String, // "stripe", "paypal"
    gatewayPaymentId:  String,
    gatewayCustomerId: String,

    // Card details (masked)
    cardLast4:  String,
    cardBrand:  String,

    // Refund
    refundAmount: Number,
    refundReason: String,
    refundedAt:   Date,

    receiptUrl: String,
    invoiceUrl: String,

    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

paymentSchema.pre("save", function (next) {
  if (!this.transactionId) {
    this.transactionId = "PAY-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

paymentSchema.index({ patient: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
