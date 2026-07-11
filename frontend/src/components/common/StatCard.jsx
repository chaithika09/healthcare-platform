import React from "react";
import { motion } from "framer-motion";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

export default function StatCard({ label, value, icon: Icon, color = "bg-primary-50 text-primary-600", change, changeType = "positive", className = "" }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`card p-5 ${className}`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} mb-3`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      <p className="text-sm text-gray-600 font-medium mt-1">{label}</p>
      {change && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${changeType === "positive" ? "text-green-600" : "text-red-500"}`}>
          {changeType === "positive" ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
          {change}
        </div>
      )}
    </motion.div>
  );
}
