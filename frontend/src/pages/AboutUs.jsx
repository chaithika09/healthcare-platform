import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShield, FiHeart, FiUsers, FiAward } from "react-icons/fi";

const team = [
  { name: "Dr. James Anderson", role: "Chief Medical Officer", emoji: "👨‍⚕️" },
  { name: "Sarah Mitchell",     role: "CEO & Co-Founder",      emoji: "👩‍💼" },
  { name: "Dr. Priya Sharma",   role: "Head of Telemedicine",  emoji: "👩‍⚕️" },
  { name: "Michael Torres",     role: "CTO",                   emoji: "👨‍💻" },
];

export default function AboutUs() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-hero rounded-3xl p-8 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 w-24 h-24 bg-white rounded-full" />
          <div className="absolute bottom-4 left-8 w-16 h-16 bg-white rounded-full" />
        </div>
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none">
              <rect x="20" y="6" width="8" height="36" rx="4" fill="white" />
              <rect x="6" y="20" width="36" height="8" rx="4" fill="white" />
            </svg>
          </div>
          <h1 className="text-3xl font-heading font-bold mb-3">About Smart Healthcare</h1>
          <p className="text-white/80 text-base leading-relaxed max-w-xl mx-auto">
            We're on a mission to make quality healthcare accessible to everyone, everywhere. Founded in 2020, we've connected over 10,000 patients with 500+ verified doctors.
          </p>
        </div>
      </motion.div>

      {/* Mission */}
      <div className="grid sm:grid-cols-2 gap-5">
        {[
          { icon: FiHeart,   title: "Our Mission",  desc: "To democratize healthcare by connecting patients with the best doctors through technology, making quality care accessible regardless of location or circumstance.", color: "bg-red-50 text-red-600" },
          { icon: FiShield,  title: "Our Values",   desc: "We believe in privacy, security, and trust. Every piece of health data is encrypted and protected. We never sell your data or compromise your privacy.", color: "bg-blue-50 text-blue-600" },
          { icon: FiUsers,   title: "Our Community",desc: "A growing community of 10,000+ patients and 500+ verified doctors working together to improve health outcomes through technology and compassion.", color: "bg-green-50 text-green-600" },
          { icon: FiAward,   title: "Our Standards", desc: "All doctors on our platform are board-certified and undergo rigorous verification. We maintain the highest standards of medical care and professionalism.", color: "bg-purple-50 text-purple-600" },
        ].map((item, i) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card p-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${item.color}`}>
              <item.icon size={22} />
            </div>
            <h3 className="font-heading font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="card p-6">
        <h2 className="font-heading font-semibold text-gray-900 text-center mb-6">Our Impact</h2>
        <div className="grid grid-cols-4 gap-4 text-center">
          {[
            { value: "10K+", label: "Patients Served" },
            { value: "500+", label: "Verified Doctors" },
            { value: "50+",  label: "Specialties" },
            { value: "4.9★", label: "Average Rating" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-primary-600">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div>
        <h2 className="font-heading font-semibold text-gray-900 mb-4">Leadership Team</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {team.map((member) => (
            <div key={member.name} className="card p-4 text-center">
              <div className="text-4xl mb-3">{member.emoji}</div>
              <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{member.role}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Link to="/contact" className="btn-primary btn-lg">Get in Touch</Link>
      </div>
    </div>
  );
}
