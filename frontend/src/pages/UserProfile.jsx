import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiEdit2, FiCalendar, FiFileText, FiStar, FiMapPin, FiPhone, FiMail, FiShield } from "react-icons/fi";
import { useAuthStore } from "../store/authStore";

export default function UserProfile() {
  const { user } = useAuthStore();

  const stats = [
    { label: "Appointments", value: "16" },
    { label: "Records",      value: "8" },
    { label: "Prescriptions",value: "3" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
        <div className="h-24 bg-gradient-hero relative">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 right-8 w-16 h-16 bg-white rounded-full" />
            <div className="absolute bottom-1 left-12 w-10 h-10 bg-white rounded-full" />
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-hero flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <Link to="/profile/edit" className="btn-outline btn-sm gap-1.5">
              <FiEdit2 size={13} /> Edit Profile
            </Link>
          </div>

          <h1 className="text-xl font-heading font-bold text-gray-900">{user?.name || "User Name"}</h1>
          <p className="text-primary-600 font-medium text-sm capitalize">{user?.role || "Patient"}</p>

          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><FiMail size={13} /> {user?.email || "user@email.com"}</span>
            <span className="flex items-center gap-1.5"><FiPhone size={13} /> {user?.phone || "+1 555-0100"}</span>
            <span className="flex items-center gap-1.5"><FiMapPin size={13} /> New York, NY</span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-5 p-4 bg-gray-50 rounded-2xl">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Personal info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
        <h2 className="font-heading font-semibold text-gray-900 mb-4">Personal Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { label: "Full Name",    value: user?.name || "John Smith" },
            { label: "Date of Birth",value: "January 15, 1985" },
            { label: "Gender",       value: "Male" },
            { label: "Blood Group",  value: "O+" },
            { label: "Height",       value: "5'10\" (178 cm)" },
            { label: "Weight",       value: "70 kg" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-gray-500 text-xs">{item.label}</p>
              <p className="font-medium text-gray-900 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Medical info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
        <h2 className="font-heading font-semibold text-gray-900 mb-4">Medical Information</h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-500 text-xs mb-1">Allergies</p>
            <div className="flex flex-wrap gap-2">
              {["Penicillin", "Sulfa drugs"].map((a) => (
                <span key={a} className="badge-error">{a}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Chronic Conditions</p>
            <div className="flex flex-wrap gap-2">
              {["Hypertension"].map((c) => (
                <span key={c} className="badge-warning">{c}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Current Medications</p>
            <div className="flex flex-wrap gap-2">
              {["Amlodipine 5mg", "Lisinopril 10mg"].map((m) => (
                <span key={m} className="badge-primary">{m}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
        <h2 className="font-heading font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiShield size={16} className="text-primary-600" /> Security
        </h2>
        <div className="space-y-3">
          {[
            { label: "Two-Factor Authentication", status: "Enabled", color: "text-green-600" },
            { label: "Last Login",                status: "Today, 9:15 AM", color: "text-gray-600" },
            { label: "Password",                  status: "Last changed 30 days ago", color: "text-gray-600" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-700">{item.label}</span>
              <span className={`text-xs font-medium ${item.color}`}>{item.status}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
