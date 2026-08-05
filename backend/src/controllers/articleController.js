const Article = require("../models/Article");

// ── Seed default articles if none exist ───────────────────────
const defaultArticles = [
  { title: "10 Tips for a Healthy Heart", category: "Cardiology", readTime: "5 min", image: "❤️", likes: 234, author: "Dr. Sarah Johnson", excerpt: "Discover evidence-based strategies to keep your cardiovascular system in top shape.", content: "Maintaining a healthy heart is one of the most important things you can do for your overall wellbeing. Exercise regularly, eat a heart-healthy diet, avoid smoking, manage stress, and monitor your blood pressure and cholesterol levels regularly.", tags: ["heart","cardiology","health"] },
  { title: "Understanding Diabetes Management", category: "Endocrinology", readTime: "8 min", image: "🩸", likes: 189, author: "Dr. James Wilson", excerpt: "A comprehensive guide to managing blood sugar levels through diet, exercise, and medication.", content: "Diabetes management requires a multi-faceted approach including regular blood sugar monitoring, healthy diet, physical activity, and medication adherence. Always consult your endocrinologist for personalized treatment plans.", tags: ["diabetes","blood sugar","endocrinology"] },
  { title: "Mental Health in the Digital Age", category: "Psychiatry", readTime: "6 min", image: "🧠", likes: 312, author: "Dr. Lisa Martinez", excerpt: "How technology affects our mental wellbeing and practical strategies for digital wellness.", content: "The digital revolution has transformed how we live, work, and connect. While technology offers many benefits, excessive screen time and social media use can negatively impact mental health. Setting boundaries and practicing mindfulness are key strategies.", tags: ["mental health","psychiatry","wellness"] },
  { title: "The Importance of Sleep for Health", category: "General", readTime: "4 min", image: "😴", likes: 156, author: "Dr. Robert Kim", excerpt: "Why quality sleep is essential for physical and mental health, and how to improve it.", content: "Adults need 7-9 hours of quality sleep per night. Poor sleep is linked to increased risk of heart disease, diabetes, obesity, and mental health disorders. Establish a regular sleep schedule and create a relaxing bedtime routine.", tags: ["sleep","wellness","general health"] },
  { title: "Nutrition Guide for Busy Professionals", category: "Nutrition", readTime: "7 min", image: "🥗", likes: 278, author: "Dr. Priya Sharma", excerpt: "Practical nutrition tips for people with hectic schedules who want to eat healthily.", content: "Eating healthy with a busy lifestyle requires planning. Meal prep on weekends, keep healthy snacks available, choose protein-rich foods, stay hydrated, and avoid processed foods whenever possible.", tags: ["nutrition","diet","healthy eating"] },
  { title: "Exercise and Chronic Pain Management", category: "Orthopedics", readTime: "9 min", image: "🏃", likes: 143, author: "Dr. Michael Torres", excerpt: "How targeted exercise programs can help manage and reduce chronic pain conditions.", content: "Contrary to common belief, appropriate exercise is one of the best treatments for chronic pain. Low-impact activities like swimming, walking, and yoga can significantly reduce pain levels and improve quality of life.", tags: ["exercise","pain management","orthopedics"] },
];

const seedArticles = async () => {
  const count = await Article.countDocuments();
  if (count === 0) {
    await Article.insertMany(defaultArticles);
  }
};

// ── Get All Articles ──────────────────────────────────────────
exports.getAll = async (req, res, next) => {
  try {
    await seedArticles();
    const { category, search, page = 1, limit = 10 } = req.query;
    const query = { isPublished: true };
    if (category) query.category = { $regex: category, $options: "i" };
    if (search)   query.$or = [
      { title:   { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
    ];

    const total    = await Article.countDocuments(query);
    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({ success: true, data: { articles, total } });
  } catch (error) { next(error); }
};

// ── Get Single Article ────────────────────────────────────────
exports.getById = async (req, res, next) => {
  try {
    await seedArticles();
    // Support both MongoDB _id and numeric index
    let article;
    if (req.params.id.match(/^[a-fA-F0-9]{24}$/)) {
      article = await Article.findById(req.params.id);
    } else {
      // Fallback: get by index for legacy numeric IDs
      const index = parseInt(req.params.id) - 1;
      const all   = await Article.find({ isPublished: true });
      article = all[index] || all[0];
    }

    if (!article) return res.status(404).json({ success: false, message: "Article not found" });
    res.json({ success: true, data: { article } });
  } catch (error) { next(error); }
};

// ── Like Article ──────────────────────────────────────────────
exports.like = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!article) return res.status(404).json({ success: false, message: "Article not found" });
    res.json({ success: true, data: { likes: article.likes } });
  } catch (error) { next(error); }
};
