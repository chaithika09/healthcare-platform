const Feedback = require("../models/Feedback");

// ── Submit Feedback ───────────────────────────────────────────
exports.submit = async (req, res, next) => {
  try {
    const { category, rating, feedback, recommend } = req.body;

    const entry = await Feedback.create({
      user:      req.user._id,
      userName:  req.user.name,
      category:  category || "Overall Experience",
      rating:    parseInt(rating),
      feedback,
      recommend,
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted. Thank you!",
      data:    { feedback: entry },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get All Feedback (Admin only) ─────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }

    const { page = 1, limit = 20 } = req.query;
    const total    = await Feedback.countDocuments();
    const feedback = await Feedback.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const avgRating = await Feedback.aggregate([
      { $group: { _id: null, avg: { $avg: "$rating" } } },
    ]);

    res.json({
      success: true,
      data: {
        feedback,
        total,
        averageRating: avgRating[0]?.avg?.toFixed(1) || 0,
        pagination: { total, page: parseInt(page), limit: parseInt(limit) },
      },
    });
  } catch (error) {
    next(error);
  }
};
