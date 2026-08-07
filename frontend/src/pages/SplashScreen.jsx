import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import Logo from "../components/common/Logo";

export default function SplashScreen() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const handleContinue = () => {
    if (isAuthenticated && user) {
      const path =
        user.role === "doctor" ? "/doctor/dashboard" :
        user.role === "admin"  ? "/admin/dashboard"  : "/patient/dashboard";
      navigate(path, { replace: true });
    } else {
      navigate("/welcome", { replace: true });
    }
  };

  useEffect(() => {
    const timer = setTimeout(handleContinue, 2600);
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, navigate]);

  return (
    <div
      onClick={handleContinue}
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
      style={{ background: "linear-gradient(160deg, #020b18 0%, #041e3a 35%, #072a20 70%, #020b18 100%)" }}
    >
      {/* ── Animated background particles ── */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width:  `${[280,200,150,120,90,60][i]}px`,
            height: `${[280,200,150,120,90,60][i]}px`,
            top:    `${[10,60,20,70,40,80][i]}%`,
            left:   `${[70,10,85,25,55,45][i]}%`,
            background: i % 2 === 0
              ? "radial-gradient(circle, rgba(0,168,107,0.12) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(0,102,204,0.15) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
        />
      ))}

      {/* ── Grid lines (subtle tech feel) ── */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "linear-gradient(rgba(0,168,107,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,168,107,0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center px-8">

        {/* Logo with ring effect */}
        <motion.div
          initial={{ scale: 0.3, opacity: 0, rotate: -30 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 0.9, type: "spring", bounce: 0.35 }}
          className="relative mb-8"
        >
          {/* Outer glow rings */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ margin: "-18px", background: "radial-gradient(circle, rgba(0,200,150,0.2) 0%, transparent 65%)" }}
            animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-teal-400/20"
            style={{ margin: "-8px" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
          <Logo size={110} showText={false} animate={false} />
        </motion.div>

        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="text-center"
        >
          <div style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: 800,
            fontSize: "3rem",
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: "0px",
          }}>
            <span style={{ color: "white" }}>Med</span>
            <span style={{
              background: "linear-gradient(135deg,#00E5A0,#00c896,#00ff99)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>iq</span>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "2rem", marginLeft: "3px" }}>+</span>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            style={{
              color: "rgba(255,255,255,0.4)",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginTop: "6px",
            }}
          >
            Smart Healthcare Portal
          </motion.p>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-5 text-center"
        >
          <p style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Inter,sans-serif", fontSize: "0.88rem", fontStyle: "italic" }}>
            "Where Technology Meets Care"
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="flex gap-3 mt-8"
        >
          {[
            { icon: "🧬", label: "AI Powered" },
            { icon: "🔒", label: "Secure" },
            { icon: "💊", label: "Smart Care" },
          ].map((item) => (
            <div key={item.label}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "100px",
                padding: "6px 14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backdropFilter: "blur(8px)",
              }}
            >
              <span style={{ fontSize: "13px" }}>{item.icon}</span>
              <span style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Inter,sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em" }}>{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Loading bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="mt-10 w-48"
        >
          <div style={{ height: "2px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: 1.7, duration: 1.5, ease: "easeInOut" }}
              style={{ height: "100%", background: "linear-gradient(90deg, #0066CC, #00E5A0)", borderRadius: "2px" }}
            />
          </div>
          <p style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Inter,sans-serif", fontSize: "10px", textAlign: "center", marginTop: "8px", letterSpacing: "0.1em" }}>
            LOADING...
          </p>
        </motion.div>
      </div>

      {/* Bottom version */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6"
        style={{ color: "rgba(255,255,255,0.15)", fontFamily: "Inter,sans-serif", fontSize: "11px", letterSpacing: "0.1em" }}
      >
        v1.0.0 · © 2024 MedIQ+ Healthcare
      </motion.p>
    </div>
  );
}
