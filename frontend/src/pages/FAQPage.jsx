import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiSearch } from "react-icons/fi";

const faqs = [
  { q: "How do I book an appointment?",                  a: "Go to 'Find Doctors', select a doctor, choose a date and time slot, select consultation type (video or in-person), and confirm your booking. You'll receive a confirmation email immediately.", category: "Appointments" },
  { q: "Can I cancel or reschedule an appointment?",     a: "Yes, you can cancel or reschedule up to 2 hours before your appointment. Go to your dashboard, find the appointment, and click 'Cancel' or 'Reschedule'.", category: "Appointments" },
  { q: "How does video consultation work?",              a: "After booking a video appointment, you'll receive a link. At the scheduled time, click 'Join Video Call' from your dashboard. You'll need a camera and microphone.", category: "Consultations" },
  { q: "Is my medical data secure?",                     a: "Yes. We use end-to-end encryption for all medical data. We are HIPAA compliant and never share your data with third parties without your explicit consent.", category: "Privacy" },
  { q: "How do I upload medical reports?",               a: "Go to 'Upload Reports' in the sidebar. You can drag and drop files or click to browse. We support PDF, JPG, PNG, and DICOM formats up to 10MB per file.", category: "Records" },
  { q: "What payment methods are accepted?",             a: "We accept all major credit/debit cards (Visa, Mastercard, Amex), PayPal, Apple Pay, and Google Pay. All payments are processed securely through Stripe.", category: "Payments" },
  { q: "How do I get a refund?",                         a: "Refunds are processed within 5-7 business days for cancelled appointments. Contact support if you haven't received your refund after this period.", category: "Payments" },
  { q: "Can I see doctors outside my country?",          a: "Yes! Our platform supports international video consultations. Doctors are available from multiple countries and time zones.", category: "Consultations" },
  { q: "How are doctors verified?",                      a: "All doctors undergo a rigorous verification process including license verification, credential checks, and background screening before being approved on our platform.", category: "Doctors" },
  { q: "How do I set up medicine reminders?",            a: "Go to 'Medicine Reminder' in the sidebar, click 'Add Reminder', enter the medicine name, dosage, and schedule. You'll receive push notifications at the set times.", category: "Features" },
];

const categories = ["All", "Appointments", "Consultations", "Privacy", "Records", "Payments", "Doctors", "Features"];

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState(null);

  const filtered = faqs.filter((f) => {
    const matchSearch = f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || f.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Frequently Asked Questions</h1>
        <p className="text-gray-500 text-sm mt-1">Find answers to common questions</p>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input type="text" placeholder="Search questions..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${category === c ? "bg-primary-500 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((faq, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="card overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900 text-sm pr-4">{faq.q}</span>
              <motion.div animate={{ rotate: openIndex === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <FiChevronDown size={18} className="text-gray-400 flex-shrink-0" />
              </motion.div>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl">🔍</span>
          <p className="text-gray-500 mt-3">No results found for "{search}"</p>
        </div>
      )}

      <div className="card p-6 text-center bg-primary-50 border-primary-100">
        <p className="font-semibold text-gray-900">Still have questions?</p>
        <p className="text-sm text-gray-500 mt-1">Our support team is here to help</p>
        <a href="/contact" className="btn-primary mt-4 inline-flex">Contact Support</a>
      </div>
    </div>
  );
}
