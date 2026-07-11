const mongoose = require("mongoose");

// Simple in-memory store (replace with DB model in production)
const feedbackStore = [];

exports.submit = async (req, res, next) => {
  try {
    const { category, rating, feedback, recommend } = req.body;
    const entry = {
      id:        new mongoose.Types.ObjectId().toString(),
      user:      req.user._id,
      userName:  req.user.name,
      category, rating, feedback, recommend,
      createdAt: new Date(),
    };
    feedbackStore.push(entry);
    res.status(201).json({ success: true, message: "Feedback submitted. Thank you!", data: { feedback: entry } });
  } catch (error) { next(error); }
};

exports.getAll = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required" });
    }
    res.json({ success: true, data: { feedback: feedbackStore, total: feedbackStore.length } });
  } catch (error) { next(error); }
};
