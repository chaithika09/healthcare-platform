const articles = [
  { id: "1", title: "10 Tips for a Healthy Heart", category: "Cardiology", readTime: "5 min", date: "2024-06-20", image: "❤️", excerpt: "Discover evidence-based strategies to keep your cardiovascular system in top shape.", likes: 234, author: "Dr. Sarah Johnson", content: "Maintaining a healthy heart is one of the most important things you can do for your overall wellbeing..." },
  { id: "2", title: "Understanding Diabetes Management", category: "Endocrinology", readTime: "8 min", date: "2024-06-18", image: "🩸", excerpt: "A comprehensive guide to managing blood sugar levels.", likes: 189, author: "Dr. James Wilson", content: "Diabetes management requires a multi-faceted approach..." },
  { id: "3", title: "Mental Health in the Digital Age", category: "Psychiatry", readTime: "6 min", date: "2024-06-15", image: "🧠", excerpt: "How technology affects our mental wellbeing.", likes: 312, author: "Dr. Lisa Martinez", content: "The digital revolution has transformed how we live and work..." },
];

exports.getAll = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    let filtered = articles;
    if (category) filtered = filtered.filter((a) => a.category.toLowerCase() === category.toLowerCase());
    if (search)   filtered = filtered.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));
    const start = (page - 1) * limit;
    res.json({ success: true, data: { articles: filtered.slice(start, start + parseInt(limit)), total: filtered.length } });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => {
  try {
    const article = articles.find((a) => a.id === req.params.id);
    if (!article) return res.status(404).json({ success: false, message: "Article not found" });
    res.json({ success: true, data: { article } });
  } catch (error) { next(error); }
};
