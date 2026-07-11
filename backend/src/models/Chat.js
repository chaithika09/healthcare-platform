const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content:   { type: String, required: true, maxlength: 2000 },
    type:      { type: String, enum: ["text", "image", "file", "audio"], default: "text" },
    fileUrl:   String,
    fileName:  String,
    isRead:    { type: Boolean, default: false },
    readAt:    Date,
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
    appointment:  { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },

    messages: [messageSchema],

    lastMessage: {
      content:   String,
      sender:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      timestamp: Date,
    },

    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ "lastMessage.timestamp": -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
