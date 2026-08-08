import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMessageSquare, FiPhone, FiMail, FiBook, FiVideo,
  FiChevronRight, FiSearch, FiPlay, FiSend, FiX, FiCheck
} from "react-icons/fi";

// ── Bot responses ─────────────────────────────────────────────
const BOT_REPLIES = {
  appointment: "To book an appointment: go to Find Doctors → select a doctor → choose a date and time slot → confirm. You'll receive a confirmation email.",
  password:    "To reset your password: click 'Forgot Password' on the login page → enter your email → click the reset link in your email → set a new password.",
  record:      "To upload medical records: go to Upload Reports in the sidebar → drag and drop your file or click browse → add a title → click Upload.",
  prescription:"To view prescriptions: go to Prescriptions in the sidebar. Your doctor's prescriptions will appear there after consultation.",
  payment:     "For payment issues: go to Payment History in the sidebar. All transactions are listed there. For refunds, contact us at support@smarthealthcare.com",
  video:       "For video consultations: book a video appointment with a doctor → at appointment time, click 'Join Video Call' from your dashboard.",
  default:     "Thank you for your message! Our support team will get back to you within 24 hours. For urgent help call +1 (800) 555-4325.",
};

function getBotReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes("appointment") || m.includes("book")) return BOT_REPLIES.appointment;
  if (m.includes("password") || m.includes("forgot") || m.includes("reset")) return BOT_REPLIES.password;
  if (m.includes("record") || m.includes("upload") || m.includes("report")) return BOT_REPLIES.record;
  if (m.includes("prescription") || m.includes("medicine")) return BOT_REPLIES.prescription;
  if (m.includes("payment") || m.includes("billing") || m.includes("refund")) return BOT_REPLIES.payment;
  if (m.includes("video") || m.includes("call") || m.includes("consultation")) return BOT_REPLIES.video;
  return BOT_REPLIES.default;
}

// ── Email Modal ───────────────────────────────────────────────
function EmailModal({ onClose }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const send = (e) => {
    e.preventDefault();
    // Opens Gmail compose in new tab
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`);
    const subject = encodeURIComponent(form.subject || "Support Request - MedIQ+");
    window.open(`https://mail.google.com/mail/?view=cm&to=support@smarthealthcare.com&su=${subject}&body=${body}`, "_blank");
    setSent(true);
    setTimeout(onClose, 2000);
  };

  return (
    <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading font-bold text-gray-900 flex items-center gap-2">
            <FiMail size={18} className="text-purple-600" /> Send us an Email
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><FiX size={18} /></button>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck size={32} className="text-green-500" />
            </div>
            <p className="font-semibold text-gray-900">Gmail opened!</p>
            <p className="text-sm text-gray-500 mt-1">Your message is ready to send.</p>
          </div>
        ) : (
          <form onSubmit={send} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Your Name</label>
                <input className="input" placeholder="John Smith" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              </div>
              <div>
                <label className="label">Your Email</label>
                <input className="input" type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
            </div>
            <div>
              <label className="label">Subject</label>
              <select className="input" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}>
                <option value="">Select a subject</option>
                <option>Appointment Issue</option>
                <option>Payment Problem</option>
                <option>Technical Support</option>
                <option>Account Problem</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Message</label>
              <textarea className="input resize-none" rows={4} placeholder="Describe your issue..." value={form.message} onChange={e => setForm({...form, message: e.target.value})} required />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
              <button type="submit" className="btn-primary flex-1 gap-2 justify-center">
                <FiMail size={15} /> Open in Gmail
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Call Modal ────────────────────────────────────────────────
function CallModal({ onClose }) {
  return (
    <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg"><FiX size={18} /></button>
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiPhone size={36} className="text-green-600" />
        </div>
        <h3 className="font-heading font-bold text-gray-900 text-xl mb-1">Call Support</h3>
        <p className="text-gray-500 text-sm mb-5">Our team is ready to help you</p>

        <div className="space-y-3 mb-6">
          {[
            { label: "General Support", number: "+1 (800) 555-4325", hours: "Mon-Fri 8AM-8PM EST" },
            { label: "Emergency Line",  number: "911",              hours: "24/7 Emergency" },
            { label: "Mental Health",   number: "988",              hours: "24/7 Crisis Line" },
          ].map((c) => (
            <a key={c.label} href={`tel:${c.number.replace(/[^0-9+]/g,'')}`}
              className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-green-50 rounded-xl transition-colors group border border-transparent hover:border-green-200">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                <FiPhone size={16} className="text-green-600" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-gray-900">{c.label}</p>
                <p className="text-xs text-gray-500">{c.hours}</p>
              </div>
              <span className="font-bold text-green-600 text-sm">{c.number}</span>
            </a>
          ))}
        </div>
        <button onClick={onClose} className="btn-outline w-full justify-center">Close</button>
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────
const topics = [
  { icon: "📅", title: "Appointments",       desc: "Booking, cancelling, rescheduling", link: "/faq" },
  { icon: "💳", title: "Payments",           desc: "Billing, refunds, invoices",         link: "/payment-history" },
  { icon: "📋", title: "Medical Records",    desc: "Uploading, downloading, sharing",    link: "/medical-records" },
  { icon: "🎥", title: "Video Calls",        desc: "Setup, troubleshooting, tips",       link: "/faq" },
  { icon: "🔒", title: "Privacy & Security", desc: "Data protection, account security",  link: "/privacy" },
  { icon: "👤", title: "Account & Profile",  desc: "Profile, settings, password",        link: "/settings" },
  { icon: "💊", title: "Prescriptions",      desc: "Viewing and managing prescriptions", link: "/prescriptions" },
  { icon: "🚨", title: "Emergency Help",     desc: "Emergency contacts and ambulance",   link: "/emergency" },
];

export default function HelpSupport() {
  const [search, setSearch]     = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showCall, setShowCall]   = useState(false);
  const [chatMsg, setChatMsg]   = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatLog, setChatLog]   = useState([
    { from: "bot", text: "👋 Hi! I'm the MedIQ+ support assistant. How can I help you today?" },
    { from: "bot", text: "You can ask me about appointments, prescriptions, payments, video calls, or any other feature." },
  ]);
  const messagesEnd = useRef(null);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [chatLog, isTyping]);

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    const msg = chatMsg.trim();
    setChatLog(prev => [...prev, { from: "user", text: msg }]);
    setChatMsg("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatLog(prev => [...prev, { from: "bot", text: getBotReply(msg) }]);
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Hero search */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-hero rounded-3xl p-8 text-white text-center">
        <h1 className="text-2xl font-heading font-bold mb-2">How can we help you?</h1>
        <p className="text-white/80 text-sm mb-5">Search our help center or browse topics below</p>
        <div className="relative max-w-md mx-auto">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search for help..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-gray-900 text-sm outline-none" />
        </div>
        {search.length > 1 && (
          <div className="mt-3 bg-white rounded-2xl text-left overflow-hidden max-w-md mx-auto shadow-lg">
            {["How to book appointment", "Reset password", "Upload medical records", "Video consultation setup", "View prescriptions", "Payment issues"]
              .filter(q => q.toLowerCase().includes(search.toLowerCase()))
              .slice(0,4)
              .map(q => (
                <Link key={q} to="/faq" onClick={() => setSearch("")}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                  <FiSearch size={13} className="text-gray-400" /> {q}
                </Link>
              ))}
            {!["How to book appointment","Reset password","Upload medical records","Video consultation setup","View prescriptions","Payment issues"].some(q => q.toLowerCase().includes(search.toLowerCase())) && (
              <div className="px-4 py-3 text-sm text-gray-500">No results — try browsing topics below</div>
            )}
          </div>
        )}
      </motion.div>

      {/* Contact cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Live Chat */}
        <div className="card p-5 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-blue-50 text-blue-600">
            <FiMessageSquare size={22} />
          </div>
          <p className="font-semibold text-gray-900 text-sm">Live Chat</p>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">Chat with support team</p>
          <button onClick={() => setShowChat(true)} className="btn-primary btn-sm w-full justify-center">
            Start Chat
          </button>
        </div>

        {/* Call */}
        <div className="card p-5 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-green-50 text-green-600">
            <FiPhone size={22} />
          </div>
          <p className="font-semibold text-gray-900 text-sm">Call Us</p>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">+1 (800) 555-HEALTH</p>
          <button onClick={() => setShowCall(true)} className="btn-secondary btn-sm w-full justify-center">
            Call Now
          </button>
        </div>

        {/* Email */}
        <div className="card p-5 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-purple-50 text-purple-600">
            <FiMail size={22} />
          </div>
          <p className="font-semibold text-gray-900 text-sm">Email Support</p>
          <p className="text-xs text-gray-500 mt-0.5 mb-3">support@smarthealthcare.com</p>
          <button onClick={() => setShowEmail(true)} className="btn-outline btn-sm w-full justify-center">
            Send Email
          </button>
        </div>
      </div>

      {/* Chat window */}
      <AnimatePresence>
        {showChat && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
            className="card overflow-hidden shadow-xl">
            {/* Chat header */}
            <div className="bg-gradient-hero px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm">🤝</div>
                <div>
                  <p className="text-white font-semibold text-sm">MedIQ+ Support</p>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-white/70 text-xs">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="text-white/70 hover:text-white p-1">
                <FiX size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {chatLog.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                  {m.from === "bot" && (
                    <div className="w-7 h-7 rounded-full bg-gradient-hero flex items-center justify-center text-xs mr-2 flex-shrink-0 self-end">🤝</div>
                  )}
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${
                    m.from === "user" ? "bg-primary-600 text-white rounded-br-sm" : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                  }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-hero flex items-center justify-center text-xs">🤝</div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <motion.div key={i} className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [0,-5,0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i*0.15 }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>

            {/* Quick replies */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex gap-2 overflow-x-auto scrollbar-hide">
              {["Book appointment", "Reset password", "Payment issue", "Video call help"].map(q => (
                <button key={q} onClick={() => { setChatMsg(q); }}
                  className="flex-shrink-0 text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:border-primary-400 hover:bg-primary-50 text-gray-600 hover:text-primary-600 transition-all">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <input type="text" value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendChat()}
                placeholder="Type your message..."
                className="flex-1 input text-sm py-2" />
              <button onClick={sendChat} disabled={!chatMsg.trim()}
                className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all">
                <FiSend size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            { title: "Getting Started",     duration: "3:24" },
            { title: "Book Appointments",   duration: "2:15" },
            { title: "Video Consultations", duration: "4:10" },
          ].map((v) => (
            <Link key={v.title} to="/doctors"
              className="bg-gray-50 hover:bg-primary-50 rounded-2xl p-4 text-center transition-all group border border-transparent hover:border-primary-200">
              <div className="w-12 h-12 bg-primary-100 group-hover:bg-primary-200 rounded-xl flex items-center justify-center mx-auto mb-2 transition-colors">
                <FiPlay size={18} className="text-primary-600" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{v.title}</p>
              <p className="text-xs text-primary-600 font-medium mt-1">{v.duration}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Docs link */}
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

      {/* Support hours */}
      <div className="bg-primary-50 rounded-2xl p-4 text-center border border-primary-100">
        <p className="text-sm text-gray-700 font-medium">Support Hours</p>
        <p className="text-sm text-gray-600 mt-1">Mon–Fri <strong>8AM–8PM</strong> · Sat <strong>9AM–5PM</strong> EST</p>
        <p className="text-xs text-gray-400 mt-1.5">
          Emergency: <a href="tel:911" className="text-red-500 font-bold">911</a> ·
          Mental Health Helpline: <a href="tel:988" className="text-primary-600 font-bold"> 988</a>
        </p>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showEmail && <EmailModal onClose={() => setShowEmail(false)} />}
        {showCall  && <CallModal  onClose={() => setShowCall(false)}  />}
      </AnimatePresence>
    </div>
  );
}
