import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiShield, FiVideo, FiFileText } from "react-icons/fi";

const features = [
  { icon: FiShield,   color: "bg-blue-100 text-blue-600",   title: "Secure & Private",    desc: "HIPAA-compliant data protection" },
  { icon: FiVideo,    color: "bg-green-100 text-green-600", title: "Video Consultations",  desc: "Connect with doctors remotely" },
  { icon: FiFileText, color: "bg-purple-100 text-purple-600",title: "Digital Records",     desc: "Access your health history anytime" },
];

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="bg-gradient-hero relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-500/20 rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10 px-6 pt-16 pb-20 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/30"
          >
            <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
              <rect x="20" y="6" width="8" height="36" rx="4" fill="white" />
              <rect x="6" y="20" width="36" height="8" rx="4" fill="white" />
            </svg>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-heading font-bold text-white"
          >
            Smart Healthcare Portal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/80 mt-3 text-base leading-relaxed max-w-sm mx-auto"
          >
            Connect with top doctors, manage your health records, and get care from anywhere.
          </motion.p>
        </div>
      </div>

      {/* Features */}
      <div className="flex-1 px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 mb-8"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-card"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.color}`}>
                <f.icon size={22} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{f.title}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {[
            { value: "500+", label: "Doctors" },
            { value: "10K+", label: "Patients" },
            { value: "4.9★", label: "Rating" },
          ].map((s) => (
            <div key={s.label} className="bg-primary-50 rounded-2xl p-3 text-center">
              <p className="text-xl font-bold text-primary-600">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="space-y-3"
        >
          <Link
            to="/onboarding"
            className="btn-primary btn-lg w-full justify-center text-base"
          >
            Get Started <FiArrowRight size={18} />
          </Link>
          <Link
            to="/login"
            className="btn-outline btn-lg w-full justify-center text-base"
          >
            I already have an account
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
