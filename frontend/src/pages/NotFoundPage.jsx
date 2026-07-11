import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiHome, FiSearch } from "react-icons/fi";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md w-full"
      >
        {/* Animated illustration */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8"
        >
          <div className="w-40 h-40 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <span className="text-7xl">🏥</span>
          </div>
        </motion.div>

        {/* Error code */}
        <motion.h1
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
          className="text-8xl font-heading font-bold text-gradient-primary mb-2"
        >
          404
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-heading font-semibold text-gray-900 mb-3">
            Page Not Found
          </h2>
          <p className="text-gray-500 leading-relaxed mb-8">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back to your health dashboard.
          </p>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          {[
            { to: "/patient/dashboard", label: "Patient Dashboard", emoji: "🧑‍⚕️" },
            { to: "/doctors",           label: "Find Doctors",       emoji: "👨‍⚕️" },
            { to: "/medical-records",   label: "Medical Records",    emoji: "📋" },
            { to: "/help",              label: "Help & Support",     emoji: "💬" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-2 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-card hover:border-primary-200 transition-all text-sm font-medium text-gray-700 hover:text-primary-600"
            >
              <span className="text-lg">{item.emoji}</span>
              {item.label}
            </Link>
          ))}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3 justify-center"
        >
          <button
            onClick={() => navigate(-1)}
            className="btn-outline gap-2"
          >
            <FiArrowLeft size={16} /> Go Back
          </button>
          <Link to="/" className="btn-primary gap-2">
            <FiHome size={16} /> Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
