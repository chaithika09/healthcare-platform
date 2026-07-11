import React from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiClock, FiHeart, FiShare2, FiBookmark } from "react-icons/fi";

export default function ArticleDetail() {
  const { id } = useParams();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/articles" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <FiArrowLeft size={16} /> Back to Articles
      </Link>

      <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="card overflow-hidden">
          <div className="h-48 bg-gradient-hero flex items-center justify-center">
            <span className="text-8xl">❤️</span>
          </div>
          <div className="p-6">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">Cardiology</span>
            <h1 className="text-2xl font-heading font-bold text-gray-900 mt-3 mb-2">10 Tips for a Healthy Heart</h1>
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
              <span className="flex items-center gap-1"><FiClock size={11} /> 5 min read</span>
              <span>June 20, 2024</span>
              <span>By Dr. Sarah Johnson</span>
            </div>

            <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
              <p className="text-base leading-relaxed">Maintaining a healthy heart is one of the most important things you can do for your overall wellbeing. Cardiovascular disease remains the leading cause of death worldwide, but the good news is that many risk factors are within your control.</p>
              <h2 className="text-lg font-heading font-semibold text-gray-900">1. Exercise Regularly</h2>
              <p className="leading-relaxed">Aim for at least 150 minutes of moderate-intensity aerobic activity per week. This can include brisk walking, cycling, swimming, or any activity that gets your heart rate up. Regular exercise strengthens the heart muscle and improves circulation.</p>
              <h2 className="text-lg font-heading font-semibold text-gray-900">2. Eat a Heart-Healthy Diet</h2>
              <p className="leading-relaxed">Focus on fruits, vegetables, whole grains, lean proteins, and healthy fats. Limit saturated fats, trans fats, sodium, and added sugars. The Mediterranean diet has been shown to significantly reduce cardiovascular risk.</p>
              <h2 className="text-lg font-heading font-semibold text-gray-900">3. Maintain a Healthy Weight</h2>
              <p className="leading-relaxed">Excess weight, especially around the abdomen, increases the risk of heart disease. Even modest weight loss of 5-10% can significantly improve cardiovascular health markers.</p>
              <h2 className="text-lg font-heading font-semibold text-gray-900">4. Don't Smoke</h2>
              <p className="leading-relaxed">Smoking is one of the biggest risk factors for heart disease. If you smoke, quitting is the single best thing you can do for your heart health. Within just one year of quitting, your risk of heart disease drops by 50%.</p>
              <h2 className="text-lg font-heading font-semibold text-gray-900">5. Manage Stress</h2>
              <p className="leading-relaxed">Chronic stress can raise blood pressure and contribute to heart disease. Practice stress-reduction techniques such as meditation, deep breathing, yoga, or spending time in nature.</p>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
              <button className="btn-ghost btn-sm gap-1.5 text-gray-600"><FiHeart size={14} /> 234 Likes</button>
              <button className="btn-ghost btn-sm gap-1.5 text-gray-600"><FiBookmark size={14} /> Save</button>
              <button className="btn-ghost btn-sm gap-1.5 text-gray-600"><FiShare2 size={14} /> Share</button>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}
