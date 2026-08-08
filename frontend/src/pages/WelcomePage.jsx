import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiShield, FiVideo, FiFileText, FiCpu, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import Logo from "../components/common/Logo";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const features = [
  { icon: FiCpu,       color: "bg-blue-50 text-blue-600",    title: "AI Health Assistant",  desc: "24/7 symptom checker & instant guidance" },
  { icon: FiVideo,     color: "bg-green-50 text-green-600",  title: "HD Video Consult",     desc: "Connect with verified doctors remotely" },
  { icon: FiFileText,  color: "bg-purple-50 text-purple-600", title: "Digital EHR Records",   desc: "Secure lab reports & prescriptions" },
  { icon: FiAlertCircle,color:"bg-red-50 text-red-600",     title: "24/7 Emergency Support",desc: "Instant urgent care & ambulance booking" },
];

export default function WelcomePage() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const launchDemo = (role) => {
    navigate("/login", { state: { demoRole: role } });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-blue-600/20 via-teal-500/10 to-transparent blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <Logo size={42} showText={true} />
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Portal Active
          </div>
          <Link
            to="/login"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-semibold text-white transition-all"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Hero */}
      <main className="relative z-10 px-6 py-8 max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-xs font-semibold text-blue-300">
            ✨ Next-Generation Smart Healthcare Platform
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight leading-tight">
            Your Complete Digital <br />
            <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Health & Doctor Portal
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Experience modern healthcare. Book virtual appointments, access digital medical records, and consult AI health assistants in one secure portal.
          </p>

          {/* Quick Portal Access */}
          <div className="pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              ⚡ Open App as Role:
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
              {[
                { role: "patient", icon: "🧑‍⚕️", label: "Patient" },
                { role: "doctor",  icon: "👨‍⚕️", label: "Doctor" },
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => launchDemo(item.role)}
                  className="p-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-2xl flex flex-col items-center gap-1 text-center transition-all hover:scale-105"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-bold text-white">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Standard Auth CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 font-bold rounded-2xl text-sm text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
            >
              Create Account <FiArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold rounded-2xl text-sm text-slate-200 flex items-center justify-center transition-all"
            >
              Log In to Portal
            </Link>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12"
        >
          {features.map((f) => (
            <div key={f.title} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color}`}>
                <f.icon size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{f.title}</h3>
                <p className="text-slate-400 text-xs mt-0.5 leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><FiShield className="text-teal-400" size={14} /> HIPAA Compliant</span>
          <span className="flex items-center gap-1.5"><FiCheckCircle className="text-blue-400" size={14} /> 256-Bit SSL Encryption</span>
          <span className="flex items-center gap-1.5"><FiCheckCircle className="text-emerald-400" size={14} /> Verified Specialists</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-800">
        Smart Healthcare Portal · Version 1.0.0 · All Rights Reserved
      </footer>
    </div>
  );
}
