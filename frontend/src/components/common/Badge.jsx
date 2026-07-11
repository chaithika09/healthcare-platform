import React from "react";

const variants = {
  primary:   "bg-primary-100 text-primary-700",
  secondary: "bg-secondary-100 text-secondary-700",
  success:   "bg-green-100 text-green-700",
  warning:   "bg-amber-100 text-amber-700",
  error:     "bg-red-100 text-red-700",
  info:      "bg-blue-100 text-blue-700",
  gray:      "bg-gray-100 text-gray-600",
};

export default function Badge({ children, variant = "primary", className = "", dot = false }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${variant === "success" ? "bg-green-500" : variant === "error" ? "bg-red-500" : "bg-current"}`} />}
      {children}
    </span>
  );
}
