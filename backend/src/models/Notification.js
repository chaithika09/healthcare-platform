const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sender:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    type: {
      type: String,
      enum: ["appointment", "record", "payment", "message", "reminder", "system", "alert"],
      required: true,
    },

    title:   { type: String, required: true },
    message: { type: String, required: true },

    data: { type: mongoose.Schema.Types.Mixed }, // extra payload

    isRead:   { type: Boolean, default: false },
    readAt:   Date,

    // Push notification
    isPushSent: { type: Boolean, default: false },
    isEmailSent:{ type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
