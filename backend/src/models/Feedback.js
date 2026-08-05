const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    user:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName:  { type: String },
    category:  { type: String, default: "Overall Experience" },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    feedback:  { type: String, required: true, maxlength: 1000 },
    recommend: { type: String, enum: ["Yes, definitely", "Maybe", "No"] },
  },
  { timestamps: true }
);

feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
