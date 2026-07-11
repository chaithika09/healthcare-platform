import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";

const slides = [
  {
    emoji: "🏥",
    title: "Find the Right Doctor",
    desc: "Browse 500+ verified specialists across all medical fields. Filter by specialty, location, and availability.",
    color: "from-blue-500 to-blue-700",
    bg: "bg-blue-50",
  },
  {
    emoji: "📅",
    title: "Book Appointments Easily",
    desc: "Schedule in-person or video consultations in seconds. Get instant confirmation and reminders.",
    color: "from-green-500 to-green-700",
    bg: "bg-green-50",
  },
  {
    emoji: "📋",
    title: "Manage Your Health Records",
    desc: "Store and access your medical history, lab results, and prescriptions securely from anywhere.",
    color: "from-purple-500 to-purple-700",
    bg: "bg-purple-50",
  },
  {
    emoji: "💬",
    title: "Real-Time Consultations",
    desc: "Chat or video call with your doctor from the comfort of your home. Available 24/7.",
    color: "from-orange-500 to-orange-700",
    bg: "bg-orange-50",
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const next = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else navigate("/register");
  };

  const prev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  const slide = slides[current];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip */}
      <div className="flex justify-end p-6">
        <button
          onClick={() => navigate("/register")}
          className="text-sm text-gray-500 hover:text-gray-700 font-medium"
        >
          Skip
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center text-center max-w-sm"
          >
            <div className={`w-32 h-32 ${slide.bg} rounded-4xl flex items-center justify-center mb-8 shadow-lg`}>
              <span className="text-6xl">{slide.emoji}</span>
            </div>
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">{slide.title}</h2>
            <p className="text-gray-500 leading-relaxed">{slide.desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? "w-6 h-2.5 bg-primary-500" : "w-2.5 h-2.5 bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-8 pb-12">
        <button
          onClick={prev}
          disabled={current === 0}
          className="w-12 h-12 rounded-2xl border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors"
        >
          <FiArrowLeft size={20} />
        </button>

        <button
          onClick={next}
          className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-white font-semibold bg-gradient-to-r ${slide.color} shadow-lg hover:shadow-xl transition-all`}
        >
          {current === slides.length - 1 ? "Get Started" : "Next"}
          <FiArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
