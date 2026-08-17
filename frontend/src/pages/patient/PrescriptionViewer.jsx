import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiDownload, FiSearch, FiCalendar, FiPackage,
  FiClock, FiFileText, FiPrinter, FiX
} from "react-icons/fi";
import { prescriptionAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function PrescriptionViewer() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [selected,      setSelected]      = useState(null);
  const [filter,        setFilter]        = useState("all");

  useEffect(() => {
    prescriptionAPI.getAll()
      .then(res => setPrescriptions(res.data.data.prescriptions || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getDoctorName = (p) =>
    p.doctor?.name || p.doctorName || "Doctor";

  const filtered = prescriptions.filter(p => {
    const matchSearch =
      getDoctorName(p).toLowerCase().includes(search.toLowerCase()) ||
      (p.diagnosis || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.prescriptionNumber || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  /* ── Download as text ── */
  const handleDownload = (p) => {
    const lines = [
      "═══════════════════════════════════════════════════════",
      "   SMART HEALTHCARE PORTAL — DIGITAL PRESCRIPTION",
      "═══════════════════════════════════════════════════════",
      `Rx No    : ${p.prescriptionNumber || "—"}`,
      `Date     : ${new Date(p.issuedDate || p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`,
      `Doctor   : ${getDoctorName(p)}`,
      `Patient  : ${p.patient?.name || "Patient"}`,
      `Diagnosis: ${p.diagnosis}`,
      "───────────────────────────────────────────────────────",
      "MEDICATIONS:",
      ...(p.medicines || []).map((m, i) =>
        `  ${i + 1}. ${m.name}  ${m.dose || m.dosage}\n` +
        `     Frequency : ${m.frequency}\n` +
        `     Duration  : ${m.duration || "—"}\n` +
        `     Note      : ${m.instructions || "—"}`
      ),
      "───────────────────────────────────────────────────────",
      `Doctor's Notes: ${p.notes || "None"}`,
      p.followUpDate ? `Follow-up    : ${new Date(p.followUpDate).toLocaleDateString("en-IN")}` : "",
      "═══════════════════════════════════════════════════════",
      "     Verified digitally by MediQ Healthcare Platform",
      "═══════════════════════════════════════════════════════",
    ].filter(Boolean).join("\n");

    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `Prescription_${p.prescriptionNumber || Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Prescription downloaded!");
  };

  /* ── Print ── */
  const handlePrint = (p) => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Prescription ${p.prescriptionNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: auto; color: #111; }
        h1 { color: #0066CC; border-bottom: 2px solid #0066CC; padding-bottom: 8px; }
        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin: 16px 0; }
        .meta span { font-size: 13px; } .meta strong { font-size: 13px; }
        .medicine { background: #f0f7ff; border-left: 4px solid #0066CC; padding: 10px; margin: 8px 0; border-radius: 4px; }
        .medicine h3 { margin: 0 0 4px; font-size: 14px; }
        .medicine p { margin: 2px 0; font-size: 12px; color: #555; }
        .notes { background: #fffbe6; border: 1px solid #f0c000; padding: 10px; border-radius: 4px; margin-top: 16px; font-size: 13px; }
        .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #888; border-top: 1px solid #ddd; padding-top: 10px; }
        @media print { button { display: none; } }
      </style></head><body>
      <h1>🏥 MediQ Digital Prescription</h1>
      <div class="meta">
        <span><strong>Rx No:</strong> ${p.prescriptionNumber || "—"}</span>
        <span><strong>Date:</strong> ${new Date(p.issuedDate || p.createdAt).toLocaleDateString("en-IN")}</span>
        <span><strong>Doctor:</strong> ${getDoctorName(p)}</span>
        <span><strong>Patient:</strong> ${p.patient?.name || "—"}</span>
        <span><strong>Diagnosis:</strong> ${p.diagnosis}</span>
        <span><strong>Status:</strong> ${p.status}</span>
      </div>
      <h2 style="font-size:15px;margin-top:20px;">💊 Medications</h2>
      ${(p.medicines || []).map(m => `
        <div class="medicine">
          <h3>${m.name} — <span style="color:#0066CC">${m.dose || m.dosage}</span></h3>
          <p>📅 ${m.frequency} | ⏱ ${m.duration || "—"}</p>
          ${m.instructions ? `<p>📌 ${m.instructions}</p>` : ""}
        </div>`).join("")}
      ${p.notes ? `<div class="notes">📋 <strong>Doctor's Notes:</strong> ${p.notes}</div>` : ""}
      ${p.followUpDate ? `<p style="margin-top:12px;font-size:13px;"><strong>Follow-up:</strong> ${new Date(p.followUpDate).toLocaleDateString("en-IN")}</p>` : ""}
      <div class="footer">Verified digitally by MediQ Healthcare Platform</div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Prescriptions</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          {prescriptions.length} prescription{prescriptions.length !== 1 ? "s" : ""} on record
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Search by doctor, diagnosis or Rx no..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "completed", "expired"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-all capitalize ${filter === f ? "bg-primary-500 text-white" : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <span className="text-5xl">💊</span>
          <p className="text-gray-500 dark:text-slate-400 mt-4 font-medium">No prescriptions found</p>
          <p className="text-gray-400 dark:text-slate-500 text-sm mt-1">
            Prescriptions written by your doctor will appear here
          </p>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* List */}
          <div className="space-y-3">
            {filtered.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(selected?._id === p._id ? null : p)}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md ${
                  selected?._id === p._id
                    ? "border-primary-500 ring-2 ring-primary-500/20"
                    : "border-gray-100 dark:border-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                      <FiPackage size={18} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{getDoctorName(p)}</p>
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{p.diagnosis}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${
                    p.status === "active"    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                    p.status === "completed" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"  :
                    "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400"
                  }`}>
                    {p.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <FiCalendar size={10} />
                    {new Date(p.issuedDate || p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiPackage size={10} />
                    {p.medicines?.length || 0} medicine(s)
                  </span>
                  {p.prescriptionNumber && (
                    <span className="font-mono text-gray-400 dark:text-slate-500">{p.prescriptionNumber}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detail panel */}
          <AnimatePresence>
            {selected ? (
              <motion.div
                key={selected._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 space-y-4 h-fit sticky top-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Prescription Details</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-mono mt-0.5">{selected.prescriptionNumber}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-400">
                    <FiX size={16} />
                  </button>
                </div>

                {/* Doctor info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm">
                    {getDoctorName(selected).split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{getDoctorName(selected)}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {new Date(selected.issuedDate || selected.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-0.5">Diagnosis</p>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">{selected.diagnosis}</p>
                </div>

                {/* Medicines */}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mb-2">💊 Medications ({selected.medicines?.length})</p>
                  <div className="space-y-2">
                    {(selected.medicines || []).map((med, i) => (
                      <div key={i} className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{med.name}</p>
                          <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-primary-200 dark:border-primary-700">
                            {med.dose || med.dosage}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-slate-400">
                          <span className="flex items-center gap-1"><FiClock size={10} /> {med.frequency}</span>
                          {med.duration && <span className="flex items-center gap-1"><FiCalendar size={10} /> {med.duration}</span>}
                        </div>
                        {med.instructions && <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 italic">{med.instructions}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selected.notes && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">📋 Doctor's Notes</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">{selected.notes}</p>
                  </div>
                )}

                {/* Follow-up */}
                {selected.followUpDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                    <FiCalendar size={14} className="text-primary-500" />
                    <span>Follow-up: <strong>{new Date(selected.followUpDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</strong></span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                  <button
                    onClick={() => handlePrint(selected)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-semibold rounded-xl text-xs hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <FiPrinter size={13} /> Print
                  </button>
                  <button
                    onClick={() => handleDownload(selected)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs transition-colors"
                  >
                    <FiDownload size={13} /> Download
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="hidden lg:flex bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-8 flex-col items-center justify-center text-center text-gray-400 dark:text-slate-500">
                <FiFileText size={40} className="mb-3 opacity-40" />
                <p className="text-sm">Select a prescription to view details</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
