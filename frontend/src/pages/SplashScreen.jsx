import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";

export default function SplashScreen() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated && user) {
        const path =
          user.role === "doctor" ? "/doctor/dashboard" :
          user.role === "admin"  ? "/admin/dashboard"  : "/patient/dashboard";
        navigate(path, { replace: true });
      } else {
        navigate("/welcome", { replace: true });
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="fixed inset-0 bg-gradient-hero flex flex-col items-center justify-center overflow-hidden">
      {/* Background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 w-80 h-80 bg-secondary-500/20 rounded-full"
          animate={{ scale: [1, 1.15, 1], rotate: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-48 h-48 bg-white/5 rounded-full"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-4xl flex items-center justify-center shadow-2xl border border-white/30">
          <svg viewBox="0 0 64 64" className="w-16 h-16" fill="none">
            <rect x="26" y="8" width="12" height="48" rx="6" fill="white" />
            <rect x="8" y="26" width="48" height="12" rx="6" fill="white" />
            <path d="M12 44 Q22 28 32 36 Q42 44 52 28" stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-heading font-bold text-white tracking-tight">
            Smart Healthcare
          </h1>
          <p className="text-white/70 mt-2 text-base">Your Health, Our Priority</p>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-2 mt-4"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-white rounded-full"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-12 text-white/50 text-sm"
      >
        Secure · Reliable · Accessible
      </motion.p>
    </div>
  );
}
