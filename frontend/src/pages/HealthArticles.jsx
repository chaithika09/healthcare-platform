import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSearch, FiClock, FiBookmark, FiHeart } from "react-icons/fi";

const articles = [
  { id: 1, title: "10 Tips for a Healthy Heart",           category: "Cardiology",    readTime: "5 min", date: "Jun 20", image: "❤️", excerpt: "Discover evidence-based strategies to keep your cardiovascular system in top shape.", likes: 234 },
  { id: 2, title: "Understanding Diabetes Management",     category: "Endocrinology", readTime: "8 min", date: "Jun 18", image: "🩸", excerpt: "A comprehensive guide to managing blood sugar levels through diet, exercise, and medication.", likes: 189 },
  { id: 3, title: "Mental Health in the Digital Age",      category: "Psychiatry",    readTime: "6 min", date: "Jun 15", image: "🧠", excerpt: "How technology affects our mental wellbeing and practical strategies for digital wellness.", likes: 312 },
  { id: 4, title: "The Importance of Sleep for Health",    category: "General",       readTime: "4 min", date: "Jun 12", image: "😴", excerpt: "Why quality sleep is essential for physical and mental health, and how to improve it.", likes: 156 },
  { id: 5, title: "Nutrition Guide for Busy Professionals",category: "Nutrition",     readTime: "7 min", date: "Jun 10", image: "🥗", excerpt: "Practical nutrition tips for people with hectic schedules who want to eat healthily.", likes: 278 },
  { id: 6, title: "Exercise and Chronic Pain Management",  category: "Orthopedics",   readTime: "9 min", date: "Jun 8",  image: "🏃", excerpt: "How targeted exercise programs can help manage and reduce chronic pain conditions.", likes: 143 },
];

const categories = ["All", "Cardiology", "Endocrinology", "Psychiatry", "General", "Nutrition", "Orthopedics"];

export default function HealthArticles() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || a.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Health Articles</h1>
        <p className="text-gray-500 text-sm mt-1">Expert health insights and medical news</p>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input type="text" placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${category === c ? "bg-primary-500 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Featured */}
      {category === "All" && !search && (
        <div className="bg-gradient-hero rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 text-8xl opacity-20 -translate-y-2 translate-x-2">❤️</div>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">Featured</span>
          <h2 className="text-xl font-heading font-bold mt-3 mb-2">10 Tips for a Healthy Heart</h2>
          <p className="text-white/80 text-sm mb-4">Discover evidence-based strategies to keep your cardiovascular system in top shape.</p>
          <Link to="/articles/1" className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-primary-50 transition-colors">
            Read Article
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((article, i) => (
          <motion.div key={article.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={`/articles/${article.id}`} className="card-hover p-5 block">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {article.image}
                </div>
                <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary-600 transition-colors">
                  <FiBookmark size={15} />
                </button>
              </div>
              <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{article.category}</span>
              <h3 className="font-semibold text-gray-900 mt-2 mb-1 text-sm leading-snug">{article.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed truncate-2">{article.excerpt}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                <span className="flex items-center gap-1"><FiClock size={11} /> {article.readTime} read</span>
                <span className="flex items-center gap-1"><FiHeart size={11} /> {article.likes}</span>
                <span>{article.date}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
