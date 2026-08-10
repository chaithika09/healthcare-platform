import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCalendar, FiVideo, FiUser, FiDownload, FiHome, FiMessageSquare } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AppointmentConfirm() {
  const { state } = useLocation();
  const doctor = state?.doctor || { name: "Dr. Sarah Johnson", specialty: "Cardiologist", fee: 150 };
  const date = state?.date || "2024-06-28";
  const slot = state?.slot || "3:00 PM";
  const type = state?.type || "video";
  const confirmId = "APT-" + Math.random().toString(36).substr(2, 8).toUpperCase();

  const handleDownloadReceipt = () => {
    const text = `
============================================================
 SMART HEALTHCARE PORTAL — APPOINTMENT RECEIPT
============================================================
 Booking Reference : APT-${Math.floor(100000 + Math.random() * 900000)}
 Doctor/Provider   : ${doctor.name} (${doctor.specialty})
 Appointment Date  : ${date}
 Appointment Time  : ${slot}
 Consultation Type : ${type.toUpperCase()}
 Consultation Fee  : $${doctor.fee}.00 USD
 Payment Status    : PAID & CONFIRMED
============================================================

 APPOINTMENT INSTRUCTIONS:
 • Please join the video room or arrive at the clinic 5 mins early.
 • Bring any relevant previous medical history or lab reports.

 Security Code: SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}
 Verified by MedIQ+ Healthcare Portal
============================================================
`;
    const blob = new Blob([text.trim()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Appointment_Receipt_${doctor.name.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded appointment receipt!");
  };

  return (
    <div className="max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="text-center py-8"
      >
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <span className="text-5xl">✅</span>
        </motion.div>

        <h1 className="text-2xl font-heading font-bold text-gray-900">Appointment Confirmed!</h1>
        <p className="text-gray-500 mt-2">Your appointment has been successfully booked.</p>

        {/* Confirmation card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6 mt-6 text-left"
        >
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
              {doctor.avatar || "SJ"}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{doctor.name}</p>
              <p className="text-sm text-primary-600">{doctor.specialty}</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { icon: FiCalendar, label: "Date & Time", value: `${date} at ${slot}` },
              { icon: type === "video" ? FiVideo : FiUser, label: "Type", value: type === "video" ? "Video Consultation" : "In-Person Visit" },
              { icon: FiCalendar, label: "Confirmation ID", value: confirmId },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <item.icon size={16} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
            <span className="text-gray-500 text-sm">Total Paid</span>
            <span className="text-xl font-bold text-gray-900">${doctor.fee}</span>
          </div>
        </motion.div>

        {/* Reminder note */}
        <div className="bg-blue-50 rounded-2xl p-4 mt-4 text-left">
          <p className="text-sm text-blue-700 font-medium">📅 Reminder set</p>
          <p className="text-xs text-blue-600 mt-1">You'll receive a reminder 24 hours and 1 hour before your appointment.</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-6">
          {type === "video" && (
            <Link to={`/video-call/apt-1`} className="btn-primary btn-lg w-full justify-center gap-2">
              <FiVideo size={18} /> Join Video Call
            </Link>
          )}
          <Link to="/patient/dashboard" className="btn-outline btn-lg w-full justify-center gap-2">
            <FiHome size={18} /> Back to Dashboard
          </Link>
          <button onClick={handleDownloadReceipt} className="btn-ghost btn-lg w-full justify-center gap-2 text-gray-600 dark:text-slate-300 hover:text-primary-600">
            <FiDownload size={18} /> Download Receipt
          </button>
        </div>
      </motion.div>
    </div>
  );
}
