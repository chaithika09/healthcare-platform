const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    patient:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctor:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },

    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },

    tags: [String], // ["professional", "punctual", "knowledgeable"]

    isVerified: { type: Boolean, default: false },
    isVisible:  { type: Boolean, default: true },

    // Doctor response
    doctorReply:     String,
    doctorRepliedAt: Date,
  },
  { timestamps: true }
);

// One review per appointment
reviewSchema.index({ patient: 1, appointment: 1 }, { unique: true });
reviewSchema.index({ doctor: 1, rating: -1 });

// Update doctor's average rating after save
reviewSchema.post("save", async function () {
  const Doctor = mongoose.model("Doctor");
  const stats = await mongoose.model("Review").aggregate([
    { $match: { doctor: this.doctor } },
    { $group: { _id: "$doctor", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Doctor.findOneAndUpdate(
      { user: this.doctor },
      { averageRating: Math.round(stats[0].avgRating * 10) / 10, totalReviews: stats[0].count }
    );
  }
});

module.exports = mongoose.model("Review", reviewSchema);
