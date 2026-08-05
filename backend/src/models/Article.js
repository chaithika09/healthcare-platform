const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true },
    excerpt:  { type: String, required: true },
    content:  { type: String, required: true },
    category: { type: String, required: true },
    author:   { type: String, default: "Smart Healthcare Team" },
    image:    { type: String, default: "❤️" },
    readTime: { type: String, default: "5 min" },
    likes:    { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    tags:     [String],
  },
  { timestamps: true }
);

articleSchema.index({ category: 1 });
articleSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Article", articleSchema);
