import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiDownload, FiSearch, FiCalendar, FiPackage, FiClock } from "react-icons/fi";

const prescriptions = [
  {
    id: 1, doctor: "Dr. Sarah Johnson", specialty: "Cardiologist", date: "2024-06-15",
    status: "active", medicines: [
      { name: "Amlodipine", dose: "5mg", frequency: "Once daily", duration: "30 days", instructions: "Take with food" },
      { name: "Lisinopril",  dose: "10mg", frequency: "Once daily", duration: "30 days", instructions: "Take in the morning" },
    ],
    notes: "Monitor blood pressure daily. Return for follow-up in 4 weeks.",
  },
  {
    id: 2, doctor: "Dr. Emily Davis", specialty: "Dermatologist", date: "2024-06-01",
    status: "active", medicines: [
      { name: "Clindamycin Gel", dose: "1%", frequency: "Twice daily", duration: "60 days", instructions: "Apply to affected area" },
    ],
    notes: "Avoid sun exposure. Use sunscreen SPF 50+.",
  },
  {
    id: 3, doctor: "Dr. James Wilson", specialty: "Pediatrician", date: "2024-05-10",
    status: "expired", medicines: [
      { name: "Amoxicillin", dose: "500mg", frequency: "Three times daily", duration: "7 days", instructions: "Complete full course" },
    ],
    notes: "Complete the full antibiotic course even if feeling better.",
  },
];

export default function PrescriptionViewer() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const filtered = prescriptions.filter((p) => {
    const matchSearch = p.doctor.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Prescriptions</h1>
        <p className="text-gray-500 text-sm mt-1">{prescriptions.length} prescriptions on record</p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search prescriptions..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
        <div className="flex gap-2">
          {["all", "active", "expired"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${filter === f ? "bg-primary-500 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* List */}
        <div className="space-y-3">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(p)}
              className={`card p-4 cursor-pointer transition-all ${selected?.id === p.id ? "ring-2 ring-primary-500" : "hover:shadow-card-hover"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <FiPackage size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{p.doctor}</p>
                    <p className="text-xs text-gray-500">{p.specialty}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {p.status}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><FiCalendar size={11} /> {p.date}</span>
                <span className="flex items-center gap-1"><FiPackage size={11} /> {p.medicines.length} medicine(s)</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detail */}
        {selected ? (
          <motion.div key={selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-heading font-semibold text-gray-900">Prescription Details</h3>
                <p className="text-xs text-gray-500 mt-0.5">{selected.date}</p>
              </div>
              <button className="btn-outline btn-sm gap-1.5">
                <FiDownload size={13} /> Download
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center text-white font-bold text-sm">
                {selected.doctor.split(" ").map((n) => n[0]).join("").slice(1, 3)}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{selected.doctor}</p>
                <p className="text-xs text-gray-500">{selected.specialty}</p>
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 text-sm mb-3">Medications</h4>
            <div className="space-y-3 mb-5">
              {selected.medicines.map((med, i) => (
                <div key={i} className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{med.name}</p>
                    <span className="text-xs font-bold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">{med.dose}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><FiClock size={10} /> {med.frequency}</span>
                    <span className="flex items-center gap-1"><FiCalendar size={10} /> {med.duration}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 italic">{med.instructions}</p>
                </div>
              ))}
            </div>

            {selected.notes && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-xs font-semibold text-amber-700 mb-1">Doctor's Notes</p>
                <p className="text-xs text-amber-600">{selected.notes}</p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="card p-8 flex flex-col items-center justify-center text-center text-gray-400">
            <FiPackage size={40} className="mb-3 opacity-40" />
            <p className="text-sm">Select a prescription to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
