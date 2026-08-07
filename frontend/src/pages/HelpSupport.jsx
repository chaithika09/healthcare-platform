import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMessageSquare, FiPhone, FiMail, FiBook, FiVideo, FiChevronRight, FiSearch, FiPlay } from "react-icons/fi";
import toast from "react-hot-toast";

const topics = [
  { icon: "📅", title: "Appointments",      desc: "Booking, cancelling, rescheduling", link: "/faq" },
  { icon: "💳", title: "Payments",          desc: "Billing, refunds, invoices",         link: "/faq" },
  { icon: "📋", title: "Medical Records",   desc: "Uploading, downloading, sharing",    link: "/medical-records" },
  { icon: "🎥", title: "Video Calls",       desc: "Setup, troubleshooting, tips",       link: "/faq" },
  { icon: "🔒", title: "Privacy & Security",desc: "Data protection, account security",  link: "/privacy" },
  { icon: "👤", title: "Account & Profile", desc: "Profile, settings, password",        link: "/settings" },
  { icon: "💊", title: "Prescriptions",     desc: "Viewing and managing prescriptions", link: "/prescriptions" },
  { icon: "🚨", title: "Emergency",         desc: "Emergency contacts and ambulance",   link: "/emergency" },
];

const faqs = [
  "How do I book an appointment?",
  "How do I reset my password?",
  "How do I upload medical records?",
  "How does video consultation work?",
  "How do I view my prescriptions?",
];

export default function HelpSupport() {
  const [search, setSearch]   = useState("");
  const [showChat, setShowChat] = useState(false);
  const [chatMsg, setChatMsg]  = useState("");
  const [chatLog, setChatLog]  = useState([
    { from: "bot", text: "👋 Hello! How can I help you today?" }
  ]);
  const navigate = useNavigate();

  const filteredFAQs = faqs.filter(q => q.toLowerCase().includes(search.toLowerCase()));

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    const msg = chatMsg.trim();
    setChatLog(prev => [...prev, { from: "user", text: msg }]);
    setChatMsg("");
    setTimeout(() => {
      setChatLog(prev => [...prev, {
        from: "bot",
        text: "Thank you for your message! Our support team will respond within 24 hours. For urgent issues call +1 (800) 555-HEALTH."
      }]);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-hero rounded-3xl p-8 text-white text-center">
        <h1 className="text-2xl font-heading font-bold mb-2">How can we help you?</h1>
        <p className="text-white/80 text-sm mb-5">Search our help center or browse topics below</p>
        <div className="relative max-w-md mx-auto">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search for help..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-gray-900 text-sm outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
        {search && filteredFAQs.length > 0 && (
          <div className="mt-3 bg-white rounded-2xl text-left overflow-hidden max-w-md mx-auto">
            {filteredFAQs.map((q) => (
              <button key={q} onClick={() => navigate("/faq")}
                className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0">
                {q}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick contact */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-blue-50 text-blue-600">
            <FiMessageSquare size={22} />
          </div>
          <p className="font-semibold text-gray-900 text-sm">Live Chat</p>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">Chat with support team</p>
          <button onClick={() => setShowChat(!showChat)} className="btn-outline btn-sm w-full justify-center">
            {showChat ? "Close Chat" : "Start Chat"}
          </button>
        </div>

        <div className="card p-5 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-green-50 text-green-600">
            <FiPhone size={22} />
          </div>
          <p className="font-semibold text-gray-900 text-sm">Call Us</p>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">+1 (800) 555-HEALTH</p>
          <a href="tel:+18005554325" className="btn-outline btn-sm w-full justify-center block">
            Call Now
          </a>
        </div>

        <div className="card p-5 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-purple-50 text-purple-600">
            <FiMail size={22} />
          </div>
          <p className="font-semibold text-gray-900 text-sm">Email</p>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">support@smarthealthcare.com</p>
          <a href="mailto:support@smarthealthcare.com" className="btn-outline btn-sm w-full justify-center block">
            Send Email
          </a>
        </div>
      </div>

      {/* Live Chat Panel */}
      {showChat && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
          <div className="bg-gradient-hero px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white font-medium text-sm">Support Chat</span>
            </div>
            <button onClick={() => setShowChat(false)} className="text-white/70 hover:text-white text-xs">Close</button>
          </div>
          <div className="h-48 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {chatLog.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${m.from === "user" ? "bg-primary-600 text-white" : "bg-white border border-gray-200 text-gray-700"}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 flex gap-2 border-t border-gray-100">
            <input
              type="text"
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Type your message..."
              className="flex-1 input text-sm py-2"
            />
            <button onClick={sendChat} className="btn-primary btn-sm px-4">Send</button>
          </div>
        </motion.div>
      )}

      {/* Help topics */}
      <div>
        <h2 className="font-heading font-semibold text-gray-900 mb-4">Browse Help Topics</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {topics.map((topic, i) => (
            <motion.div key={topic.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
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
            { title: "Getting Started",      duration: "3:24", desc: "Complete app walkthrough" },
            { title: "Book Appointments",    duration: "2:15", desc: "Step-by-step booking guide" },
            { title: "Video Consultations",  duration: "4:10", desc: "How to use video calls" },
          ].map((v) => (
            <button
              key={v.title}
              onClick={() => toast.success(`Opening tutorial: ${v.title}`)}
              className="bg-gray-50 hover:bg-primary-50 rounded-2xl p-4 text-center transition-all group border border-transparent hover:border-primary-200"
            >
              <div className="w-12 h-12 bg-primary-100 group-hover:bg-primary-200 rounded-xl flex items-center justify-center mx-auto mb-2 transition-colors">
                <FiPlay size={18} className="text-primary-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{v.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{v.desc}</p>
              <span className="text-xs text-primary-600 font-medium mt-1 block">{v.duration}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Documentation link */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
          <FiBook size={22} className="text-primary-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">Full Documentation & FAQ</p>
          <p className="text-sm text-gray-500">Detailed guides for all platform features</p>
        </div>
        <Link to="/faq" className="btn-primary btn-sm">View FAQ</Link>
      </div>

      {/* Contact info footer */}
      <div className="bg-primary-50 rounded-2xl p-5 text-center">
        <p className="text-sm text-gray-600">
          Support hours: <strong>Mon–Fri 8AM–8PM</strong> · Sat 9AM–5PM EST
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Emergency: <a href="tel:911" className="text-red-500 font-semibold">Call 911</a> ·
          Mental Health: <a href="tel:988" className="text-primary-600 font-semibold"> 988</a>
        </p>
      </div>
    </div>
  );
}
