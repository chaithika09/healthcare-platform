import React from "react";
import { motion } from "framer-motion";

/**
 * Creative Logo — DNA helix + heart pulse + shield
 * Modern healthcare brand mark
 */

export default function Logo({ size = 64, showText = true, textColor = "white", animate = false, className = "" }) {
  const iconSize = size;
  const fontSize = size * 0.28;
  const subSize  = size * 0.13;

  const icon = (
    <svg viewBox="0 0 100 100" width={iconSize} height={iconSize} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Main gradient - blue to teal */}
        <linearGradient id="lg1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0A84FF" />
          <stop offset="50%" stopColor="#0066CC" />
          <stop offset="100%" stopColor="#00C896" />
        </linearGradient>
        {/* Accent gradient */}
        <linearGradient id="lg2" x1="100" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00E5A0" />
          <stop offset="100%" stopColor="#0066CC" />
        </linearGradient>
        {/* Glow filter */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Inner shadow */}
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0066CC" floodOpacity="0.3" />
        </filter>
        {/* Clip circle */}
        <clipPath id="circleClip">
          <circle cx="50" cy="50" r="44" />
        </clipPath>
      </defs>

      {/* === BACKGROUND SHAPE === */}
      {/* Outer glow ring */}
      <circle cx="50" cy="50" r="48" fill="url(#lg1)" opacity="0.15" />
      {/* Main background */}
      <circle cx="50" cy="50" r="44" fill="url(#lg1)" />
      {/* Overlay shimmer */}
      <ellipse cx="35" cy="28" rx="22" ry="14" fill="white" opacity="0.08" />

      {/* === DNA DOUBLE HELIX (left arc) === */}
      {/* Left strand */}
      <path d="M22 20 C16 32 16 44 22 50 C28 56 28 68 22 80"
        stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Right strand */}
      <path d="M32 20 C38 32 38 44 32 50 C26 56 26 68 32 80"
        stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Helix connectors */}
      {[24, 32, 40, 48, 56, 64, 72].map((y, i) => (
        <line key={i} x1="22" y1={y} x2="32" y2={y}
          stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
      ))}

      {/* === HEART SHAPE (center) === */}
      <path d="M50 68 C50 68 32 56 32 44 C32 38 36 34 40 34 C43 34 46 36 50 40 C54 36 57 34 60 34 C64 34 68 38 68 44 C68 56 50 68 50 68Z"
        fill="white" opacity="0.95" filter="url(#shadow)" />

      {/* === PULSE LINE inside heart === */}
      <path d="M35 44 L40 44 L43 38 L47 50 L51 36 L55 50 L58 44 L63 44"
        stroke="url(#lg2)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"
        clipPath="url(#circleClip)" />

      {/* === SMALL CROSS (top right of heart) === */}
      <rect x="61" y="22" width="3.5" height="11" rx="1.75" fill="white" opacity="0.9" />
      <rect x="57.25" y="25.75" width="11" height="3.5" rx="1.75" fill="white" opacity="0.9" />

      {/* === DOTS (decorative DNA nodes) === */}
      <circle cx="22" cy="20" r="2.5" fill="white" opacity="0.6" />
      <circle cx="32" cy="20" r="2.5" fill="white" opacity="0.6" />
      <circle cx="22" cy="50" r="2.5" fill="white" opacity="0.6" />
      <circle cx="32" cy="50" r="2.5" fill="white" opacity="0.6" />
      <circle cx="22" cy="80" r="2.5" fill="white" opacity="0.6" />
      <circle cx="32" cy="80" r="2.5" fill="white" opacity="0.6" />

      {/* === SHIELD OUTLINE (outer arc) === */}
      <path d="M50 8 L72 17 L72 46 C72 62 62 74 50 80 C38 74 28 62 28 46 L28 17 Z"
        stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" fill="none" />
    </svg>
  );

  return (
    <div className={`flex items-center gap-3 ${className}`} style={{ userSelect: "none" }}>
      {animate ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.7 }}
        >
          {icon}
        </motion.div>
      ) : icon}

      {showText && (
        <div style={{ lineHeight: 1 }}>
          <div style={{
            fontFamily: "Poppins, Inter, sans-serif",
            fontWeight: 800,
            fontSize: `${fontSize}px`,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            color: textColor,
            display: "flex",
            alignItems: "baseline",
            gap: "0px",
          }}>
            <span>Med</span>
            <span style={{
              background: "linear-gradient(135deg, #00E5A0, #00C896)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>iq</span>
            <span style={{ fontSize: `${fontSize * 0.7}px`, marginLeft: "2px", opacity: 0.85 }}>+</span>
          </div>
          <div style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            fontSize: `${subSize}px`,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: textColor === "white" ? "rgba(255,255,255,0.55)" : "#64748b",
            marginTop: "1px",
          }}>
            Smart Healthcare
          </div>
        </div>
      )}
    </div>
  );
}

export function LogoIcon({ size = 40, animate = false, className = "" }) {
  const icon = (
    <svg viewBox="0 0 100 100" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="liGrad1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0A84FF" />
          <stop offset="50%" stopColor="#0066CC" />
          <stop offset="100%" stopColor="#00C896" />
        </linearGradient>
        <linearGradient id="liGrad2" x1="100" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00E5A0" />
          <stop offset="100%" stopColor="#0066CC" />
        </linearGradient>
        <clipPath id="cc2"><circle cx="50" cy="50" r="44" /></clipPath>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#liGrad1)" opacity="0.15" />
      <circle cx="50" cy="50" r="44" fill="url(#liGrad1)" />
      <ellipse cx="35" cy="28" rx="22" ry="14" fill="white" opacity="0.08" />
      <path d="M22 20 C16 32 16 44 22 50 C28 56 28 68 22 80" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M32 20 C38 32 38 44 32 50 C26 56 26 68 32 80" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {[24, 32, 40, 48, 56, 64, 72].map((y, i) => (
        <line key={i} x1="22" y1={y} x2="32" y2={y} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
      ))}
      <path d="M50 68 C50 68 32 56 32 44 C32 38 36 34 40 34 C43 34 46 36 50 40 C54 36 57 34 60 34 C64 34 68 38 68 44 C68 56 50 68 50 68Z" fill="white" opacity="0.95" />
      <path d="M35 44 L40 44 L43 38 L47 50 L51 36 L55 50 L58 44 L63 44" stroke="url(#liGrad2)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#cc2)" />
      <rect x="61" y="22" width="3.5" height="11" rx="1.75" fill="white" opacity="0.9" />
      <rect x="57.25" y="25.75" width="11" height="3.5" rx="1.75" fill="white" opacity="0.9" />
      <circle cx="22" cy="50" r="2.5" fill="white" opacity="0.6" />
      <circle cx="32" cy="50" r="2.5" fill="white" opacity="0.6" />
    </svg>
  );

  if (animate) {
    return (
      <motion.div className={className}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}>
        {icon}
      </motion.div>
    );
  }
  return <div className={className}>{icon}</div>;
}
