import React from "react";
import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../common/Logo";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary-500/20 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <Logo size={48} showText={true} textColor="white" />
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl font-heading font-bold text-white leading-tight">
              Your Health,<br />Our Priority
            </h2>
            <p className="text-white/80 mt-4 text-lg leading-relaxed">
              Connect with top doctors, manage your medical records, and get care from anywhere — all in one secure platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "👨‍⚕️", label: "500+ Doctors" },
              { icon: "🏥", label: "50+ Hospitals" },
              { icon: "👥", label: "10K+ Patients" },
              { icon: "⭐", label: "4.9 Rating" },
            ].map((item) => (
              <div key={item.label} className="glass rounded-2xl p-4 flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-white font-medium text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/50 text-sm">
          © 2024 Smart Healthcare Portal. All rights reserved.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <Logo size={36} showText={true} textColor="#0066CC" />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
