import React from "react";
import { motion } from "framer-motion";

export default function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 bg-gradient-hero flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Logo */}
        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl">
          <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
            <rect x="20" y="6" width="8" height="36" rx="4" fill="white" />
            <rect x="6" y="20" width="36" height="8" rx="4" fill="white" />
            <path d="M8 32 Q16 20 24 28 Q32 36 40 24" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-white mb-1">Smart Healthcare</h1>
          <p className="text-white/70 text-sm">{message}</p>
        </div>

        {/* Spinner */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 bg-white rounded-full"
              animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
