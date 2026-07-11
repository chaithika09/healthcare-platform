import React from "react";
import { motion } from "framer-motion";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing or using the Smart Healthcare Portal, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.",
  },
  {
    title: "2. Use of Services",
    content: "Our platform provides healthcare management tools including appointment booking, medical record storage, and telemedicine services. You agree to use these services only for lawful purposes and in accordance with these Terms. You must not use the platform in any way that could damage, disable, or impair the service.",
  },
  {
    title: "3. Medical Disclaimer",
    content: "The information provided on this platform is for general informational purposes only and does not constitute medical advice. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this platform.",
  },
  {
    title: "4. User Accounts",
    content: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to terminate accounts that violate these terms.",
  },
  {
    title: "5. Privacy and Data Protection",
    content: "Your use of the platform is also governed by our Privacy Policy. We are committed to protecting your personal and medical information in accordance with HIPAA regulations and applicable data protection laws. We implement industry-standard security measures to protect your data.",
  },
  {
    title: "6. Intellectual Property",
    content: "The platform and its original content, features, and functionality are owned by Smart Healthcare Portal and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.",
  },
  {
    title: "7. Limitation of Liability",
    content: "Smart Healthcare Portal shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. Our total liability shall not exceed the amount paid by you for the service in the past 12 months.",
  },
  {
    title: "8. Changes to Terms",
    content: "We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the new terms.",
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Terms & Conditions</h1>
        <p className="text-gray-500 text-sm mt-1">Last updated: June 1, 2024</p>
      </motion.div>

      <div className="card p-6 bg-primary-50 border-primary-100">
        <p className="text-sm text-primary-700 leading-relaxed">
          Please read these Terms and Conditions carefully before using the Smart Healthcare Portal. These terms govern your use of our platform and services.
        </p>
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
          Questions about our Terms?{" "}
          <a href="/contact" className="text-primary-600 font-medium hover:underline">Contact us</a>
        </p>
      </div>
    </div>
  );
}
