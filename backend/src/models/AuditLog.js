const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    type:    { type: String, enum: ["auth","doctor","payment","record","system","user"], default: "system" },
    action:  { type: String, required: true },
    user:    { type: String }, // email or "system"
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ip:      { type: String },
    status:  { type: String, enum: ["success","failed","warning"], default: "success" },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ type: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
