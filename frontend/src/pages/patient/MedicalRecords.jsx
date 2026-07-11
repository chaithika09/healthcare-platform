import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiFileText, FiDownload, FiEye, FiUpload, FiSearch, FiFilter, FiCalendar, FiUser } from "react-icons/fi";

const records = [
  { id: 1, title: "Blood Test Report",       type: "Lab Report",    doctor: "Dr. Sarah Johnson", date: "2024-06-15", size: "2.4 MB", format: "PDF", category: "lab" },
  { id: 2, title: "Chest X-Ray",             type: "Radiology",     doctor: "Dr. Michael Chen",  date: "2024-06-10", size: "8.1 MB", format: "DICOM", category: "imaging" },
  { id: 3, title: "ECG Report",              type: "Cardiology",    doctor: "Dr. Sarah Johnson", date: "2024-05-28", size: "1.2 MB", format: "PDF", category: "lab" },
  { id: 4, title: "Prescription - June",     type: "Prescription",  doctor: "Dr. Emily Davis",   date: "2024-06-01", size: "0.5 MB", format: "PDF", category: "prescription" },
  { id: 5, title: "MRI Brain Scan",          type: "Radiology",     doctor: "Dr. Michael Chen",  date: "2024-05-15", size: "45 MB",  format: "DICOM", category: "imaging" },
  { id: 6, title: "Diabetes Panel",          type: "Lab Report",    doctor: "Dr. James Wilson",  date: "2024-04-20", size: "1.8 MB", format: "PDF", category: "lab" },
];

const categories = ["all", "lab", "imaging", "prescription"];
const typeColors = {
  "Lab Report":   "bg-blue-100 text-blue-700",
  "Radiology":    "bg-purple-100 text-purple-700",
  "Cardiology":   "bg-red-100 text-red-700",
  "Prescription": "bg-green-100 text-green-700",
};

export default function MedicalRecords() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = records.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.doctor.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || r.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-500 text-sm mt-1">{records.length} records stored securely</p>
        </div>
        <Link to="/upload-reports" className="btn-primary gap-2 self-start">
          <FiUpload size={16} /> Upload Record
        </Link>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
              category === c ? "bg-primary-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300"
            }`}
          >
            {c === "all" ? "All Records" : c}
          </button>
        ))}
      </div>

      {/* Records grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((rec, i) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-hover p-5"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                <FiFileText size={22} className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{rec.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${typeColors[rec.type] || "bg-gray-100 text-gray-600"}`}>
                  {rec.type}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <FiUser size={11} /> {rec.doctor}
              </div>
              <div className="flex items-center gap-1.5">
                <FiCalendar size={11} /> {rec.date}
              </div>
              <div className="flex items-center justify-between">
                <span>{rec.size} · {rec.format}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button className="btn-ghost btn-sm flex-1 gap-1.5 text-gray-600">
                <FiEye size={13} /> View
              </button>
              <button className="btn-outline btn-sm flex-1 gap-1.5">
                <FiDownload size={13} /> Download
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl">📂</span>
          <p className="text-gray-500 mt-4">No records found.</p>
        </div>
      )}
    </div>
  );
}
