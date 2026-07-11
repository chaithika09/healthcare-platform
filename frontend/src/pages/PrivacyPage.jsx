import React from "react";
import { motion } from "framer-motion";
import { FiShield, FiLock, FiEye, FiTrash2 } from "react-icons/fi";

const sections = [
  { title: "Information We Collect", content: "We collect information you provide directly, such as name, email, phone number, and medical history. We also collect usage data, device information, and location data (with your permission) to improve our services." },
  { title: "How We Use Your Information", content: "Your information is used to provide and improve our services, process appointments and payments, send notifications and reminders, comply with legal obligations, and ensure platform security." },
  { title: "Medical Data Protection", content: "All medical records and health information are encrypted using AES-256 encryption. We are fully HIPAA compliant. Medical data is never shared with third parties without your explicit written consent, except as required by law." },
  { title: "Data Sharing", content: "We do not sell your personal data. We may share data with healthcare providers you choose to consult, payment processors for transactions, and service providers who assist in platform operations under strict confidentiality agreements." },
  { title: "Your Rights", content: "You have the right to access, correct, or delete your personal data at any time. You can request a copy of all data we hold about you, opt out of marketing communications, and request data portability." },
  { title: "Cookies", content: "We use essential cookies for platform functionality and optional analytics cookies to improve user experience. You can manage cookie preferences in your browser settings or through our cookie consent tool." },
  { title: "Data Retention", content: "Medical records are retained for a minimum of 7 years as required by law. Account data is retained while your account is active. You may request deletion of non-medical data at any time." },
  { title: "Contact & Complaints", content: "For privacy concerns, contact our Data Protection Officer at privacy@smarthealthcare.com. You have the right to lodge a complaint with your local data protection authority." },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mt-1">Last updated: June 1, 2024</p>
      </motion.div>

      {/* Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: FiShield, label: "HIPAA Compliant",   color: "bg-blue-50 text-blue-600" },
          { icon: FiLock,   label: "AES-256 Encrypted", color: "bg-green-50 text-green-600" },
          { icon: FiEye,    label: "No Data Selling",   color: "bg-purple-50 text-purple-600" },
          { icon: FiTrash2, label: "Right to Delete",   color: "bg-orange-50 text-orange-600" },
        ].map((item) => (
          <div key={item.label} className={`rounded-2xl p-3 text-center ${item.color}`}>
            <item.icon size={20} className="mx-auto mb-1" />
            <p className="text-xs font-medium">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-5"
          >
            <h2 className="font-heading font-semibold text-gray-900 mb-2">{section.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{section.content}</p>
          </motion.div>
        ))}
      </div>

      <div className="card p-5 text-center">
        <p className="text-sm text-gray-600">
          Privacy questions?{" "}
          <a href="mailto:privacy@smarthealthcare.com" className="text-primary-600 font-medium hover:underline">
            privacy@smarthealthcare.com
          </a>
        </p>
      </div>
    </div>
  );
}
