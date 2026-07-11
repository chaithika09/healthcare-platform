import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMessageSquare, FiPhone, FiMail, FiBook, FiVideo, FiChevronRight } from "react-icons/fi";

const topics = [
  { icon: "📅", title: "Appointments",     desc: "Booking, cancelling, rescheduling",  link: "/faq" },
  { icon: "💳", title: "Payments",         desc: "Billing, refunds, invoices",          link: "/faq" },
  { icon: "📋", title: "Medical Records",  desc: "Uploading, downloading, sharing",     link: "/faq" },
  { icon: "🎥", title: "Video Calls",      desc: "Setup, troubleshooting, tips",        link: "/faq" },
  { icon: "🔒", title: "Privacy & Security",desc: "Data protection, account security",  link: "/privacy" },
  { icon: "👤", title: "Account",          desc: "Profile, settings, password",         link: "/settings" },
];

export default function HelpSupport() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-hero rounded-3xl p-8 text-white text-center">
        <h1 className="text-2xl font-heading font-bold mb-2">How can we help you?</h1>
        <p className="text-white/80 text-sm mb-5">Search our help center or browse topics below</p>
        <div className="relative max-w-md mx-auto">
          <input type="text" placeholder="Search for help..." className="w-full px-4 py-3 rounded-2xl text-gray-900 text-sm outline-none focus:ring-2 focus:ring-white/50" />
        </div>
      </motion.div>

      {/* Quick contact */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: FiMessageSquare, label: "Live Chat",    desc: "Chat with support",    color: "bg-blue-50 text-blue-600",   action: "Start Chat" },
          { icon: FiPhone,         label: "Call Us",      desc: "+1 (800) 555-HEALTH",  color: "bg-green-50 text-green-600", action: "Call Now" },
          { icon: FiMail,          label: "Email",        desc: "support@smarthealthcare.com", color: "bg-purple-50 text-purple-600", action: "Send Email" },
        ].map((item) => (
          <div key={item.label} className="card p-5 text-center">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${item.color}`}>
              <item.icon size={22} />
            </div>
            <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
            <p className="text-xs text-gray-500 mt-0.5 mb-3">{item.desc}</p>
            <button className="btn-outline btn-sm w-full justify-center">{item.action}</button>
          </div>
        ))}
      </div>

      {/* Help topics */}
      <div>
        <h2 className="font-heading font-semibold text-gray-900 mb-4">Browse Help Topics</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {topics.map((topic, i) => (
            <motion.div key={topic.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={topic.link} className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-all">
                <span className="text-2xl">{topic.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{topic.title}</p>
                  <p className="text-xs text-gray-500">{topic.desc}</p>
                </div>
                <FiChevronRight size={16} className="text-gray-400" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video tutorials */}
      <div className="card p-6">
        <h2 className="font-heading font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiVideo size={16} className="text-primary-600" /> Video Tutorials
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { title: "Getting Started",       duration: "3:24" },
            { title: "Booking Appointments",  duration: "2:15" },
            { title: "Video Consultations",   duration: "4:10" },
          ].map((v) => (
            <div key={v.title} className="bg-gray-50 rounded-2xl p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <FiVideo size={20} className="text-primary-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">{v.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{v.duration}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Documentation */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
          <FiBook size={22} className="text-primary-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">Full Documentation</p>
          <p className="text-sm text-gray-500">Detailed guides for all platform features</p>
        </div>
        <Link to="/faq" className="btn-outline btn-sm">View Docs</Link>
      </div>
    </div>
  );
}
