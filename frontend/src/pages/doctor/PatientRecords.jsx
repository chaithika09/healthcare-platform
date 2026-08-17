import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import {
  FiSearch, FiUser, FiFileText, FiCalendar, FiPhone,
  FiMail, FiActivity, FiPlus, FiTrash2, FiCheckCircle,
  FiX, FiChevronRight, FiEdit3, FiPackage, FiClock
} from "react-icons/fi";
import { doctorAPI, prescriptionAPI } from "../../services/api";
import toast from "react-hot-toast";

/* ─── Inline Prescription Form ─────────────────────────────── */
function PrescriptionForm({ patient, onSuccess, onCancel }) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      diagnosis: patient.condition !== "General consultation" ? patient.condition : "",
      notes: "",
      followUp: "",
      medicines: [{ name: "", dose: "", frequency: "", duration: "", instructions: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "medicines" });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await prescriptionAPI.create({
        patientId:   patient.id,
        diagnosis:   data.diagnosis,
        medicines:   data.medicines,
        notes:       data.notes || "",
        followUpDate: data.followUp || undefined,
      });
      onSuccess(res.data.data.prescription);
      toast.success("✅ Prescription saved and sent to patient!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save prescription");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Patient badge */}
      <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xs">
            {patient.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="font-semibold text-primary-900 dark:text-primary-200 text-sm">{patient.name}</p>
            <p className="text-xs text-primary-600 dark:text-primary-400">
              {patient.age !== "N/A" ? `Age ${patient.age}` : ""}{patient.gender !== "N/A" ? ` · ${patient.gender}` : ""}
            </p>
          </div>
        </div>
        <button onClick={onCancel} className="p-1.5 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-lg text-primary-500 transition-colors">
          <FiX size={15} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Diagnosis */}
        <div>
          <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5 block">
            Diagnosis / Chief Complaint *
          </label>
          <input
            {...register("diagnosis", { required: "Required" })}
            placeholder="e.g., Hypertension, Fever, Diabetes"
            className={`w-full px-3 py-2.5 text-sm border rounded-xl bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-400 ${errors.diagnosis ? "border-red-400" : "border-gray-200"}`}
          />
          {errors.diagnosis && <p className="text-red-500 text-xs mt-1">{errors.diagnosis.message}</p>}
        </div>

        {/* Medicines */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-600 dark:text-slate-400">💊 Medications *</label>
            <button type="button"
              onClick={() => append({ name: "", dose: "", frequency: "", duration: "", instructions: "" })}
              className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              <FiPlus size={12} /> Add
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, i) => (
              <div key={field.id} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 dark:text-slate-500">Medicine {i + 1}</span>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(i)}
                      className="text-gray-300 dark:text-slate-600 hover:text-red-500 transition-colors">
                      <FiTrash2 size={13} />
                    </button>
                  )}
                </div>
                <input
                  {...register(`medicines.${i}.name`, { required: true })}
                  placeholder="Medicine name"
                  className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-400"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    {...register(`medicines.${i}.dose`, { required: true })}
                    placeholder="Dose (e.g. 5mg)"
                    className="px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-400"
                  />
                  <select
                    {...register(`medicines.${i}.frequency`, { required: true })}
                    className="px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-400"
                  >
                    <option value="">Frequency...</option>
                    <option>Once daily (OD)</option>
                    <option>Twice daily (BD)</option>
                    <option>Three times daily (TDS)</option>
                    <option>Four times daily (QID)</option>
                    <option>As needed (SOS)</option>
                    <option>At bedtime (HS)</option>
                    <option>Before food</option>
                    <option>After food</option>
                  </select>
                  <input
                    {...register(`medicines.${i}.duration`)}
                    placeholder="Duration (e.g. 7 days)"
                    className="px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-400"
                  />
                  <input
                    {...register(`medicines.${i}.instructions`)}
                    placeholder="Instructions"
                    className="px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes & Follow-up */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5 block">Doctor's Notes</label>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Lifestyle, diet, warnings..."
              className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5 block">Follow-up Date</label>
            <input
              {...register("followUp")}
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-sm transition-colors shadow-lg shadow-primary-500/20"
        >
          {saving
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            : <><FiCheckCircle size={16} /> Send Prescription to {patient.name.split(" ")[0]}</>
          }
        </button>
      </form>
    </motion.div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */
export default function PatientRecords() {
  const [search,      setSearch]      = useState("");
  const [selected,    setSelected]    = useState(null);
  const [patients,    setPatients]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showRxForm,  setShowRxForm]  = useState(false);
  const [showRecords, setShowRecords] = useState(false);
  const [records,     setRecords]     = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [sentRx,      setSentRx]      = useState({});

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    try {
      const res          = await doctorAPI.getAppointments();
      const appointments = res.data.data.appointments || [];
      const uniquePatients = [];
      const seen = new Set();
      appointments.forEach(apt => {
        if (apt.patient?._id && !seen.has(apt.patient._id)) {
          seen.add(apt.patient._id);
          uniquePatients.push({
            id:        apt.patient._id,
            name:      apt.patient.name    || "Patient",
            email:     apt.patient.email   || "N/A",
            phone:     apt.patient.phone   || "N/A",
            age:       apt.patient.age     || "N/A",
            gender:    apt.patient.gender  || "N/A",
            lastVisit: apt.date?.split("T")[0] || "N/A",
            condition: apt.symptoms        || "General consultation",
            visits:    appointments.filter(a => a.patient?._id === apt.patient._id).length,
            appointments: appointments.filter(a => a.patient?._id === apt.patient._id),
          });
        }
      });
      setPatients(uniquePatients);
    } catch (err) {
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.condition?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectPatient = (p) => {
    if (selected?.id === p.id) {
      setSelected(null);
      setShowRxForm(false);
      setShowRecords(false);
    } else {
      setSelected(p);
      setShowRxForm(false);
      setShowRecords(false);
      setRecords([]);
    }
  };

  const fetchRecords = async (patientId) => {
    setRecordsLoading(true);
    try {
      // Get all prescriptions and filter for this patient
      const res = await prescriptionAPI.getAll();
      const all = res.data.data.prescriptions || [];
      const patientRx = all.filter(rx =>
        (rx.patient?._id || rx.patient) === patientId
      );
      setRecords(patientRx);
    } catch (err) {
      toast.error("Failed to load records");
    } finally {
      setRecordsLoading(false);
    }
  };

  const handleViewRecords = () => {
    setShowRxForm(false);
    if (!showRecords) {
      fetchRecords(selected.id);
    }
    setShowRecords(!showRecords);
  };

  const handleRxSuccess = (rx) => {
    setSentRx(prev => ({ ...prev, [selected.id]: rx.prescriptionNumber }));
    setShowRxForm(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Patients</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          {patients.length} patient{patients.length !== 1 ? "s" : ""} · Select one to write a prescription
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
        <input
          type="text"
          placeholder="Search by name or condition..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
        />
      </div>

      {/* Empty state */}
      {patients.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl">👥</span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4">No Patients Yet</h3>
          <p className="text-gray-500 dark:text-slate-400 mt-2">
            Patients will appear here after they book appointments with you.
          </p>
        </div>
      )}

      {/* 3-column layout */}
      {patients.length > 0 && (
        <div className={`grid gap-5 ${(showRxForm || showRecords) ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-5"}`}>

          {/* ── Column 1: Patient List ── */}
          <div className={`space-y-2 ${(showRxForm || showRecords) ? "lg:col-span-1" : "lg:col-span-2"}`}>
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleSelectPatient(p)}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 cursor-pointer transition-all ${
                  selected?.id === p.id
                    ? "border-primary-500 ring-2 ring-primary-500/20 shadow-md"
                    : "border-gray-100 dark:border-slate-800 hover:shadow-md"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{p.condition}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-400">{p.visits} visits</span>
                    {sentRx[p.id] && (
                      <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full font-semibold">
                        ✓ Rx sent
                      </span>
                    )}
                  </div>
                  <FiChevronRight size={14} className={`text-gray-300 dark:text-slate-600 transition-transform ${selected?.id === p.id ? "rotate-90 text-primary-500" : ""}`} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Column 2: Patient Details ── */}
          <AnimatePresence>
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className={`space-y-4 ${(showRxForm || showRecords) ? "lg:col-span-1" : "lg:col-span-3"}`}
              >
                {/* Details card */}
                <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5">
                  {/* Patient header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {selected.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{selected.name}</h3>
                      <p className="text-gray-500 dark:text-slate-400 text-sm">
                        {selected.age !== "N/A" ? `${selected.age} yrs` : ""}
                        {selected.gender !== "N/A" ? ` · ${selected.gender}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    {[
                      { icon: FiPhone,    label: "Phone",       value: selected.phone },
                      { icon: FiMail,     label: "Email",       value: selected.email },
                      { icon: FiCalendar, label: "Last Visit",  value: selected.lastVisit },
                      { icon: FiActivity, label: "Condition",   value: selected.condition },
                      { icon: FiUser,     label: "Total Visits",value: `${selected.visits} visits` },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                          <item.icon size={12} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="text-gray-400 dark:text-slate-500">{item.label}</p>
                          <p className="font-semibold text-gray-900 dark:text-white truncate">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex gap-2">
                    <button
                      onClick={() => { setShowRxForm(!showRxForm); setShowRecords(false); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        showRxForm
                          ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20"
                          : "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50"
                      }`}
                    >
                      <FiEdit3 size={14} />
                      {showRxForm ? "Hide Form" : "Write Prescription"}
                    </button>
                    <button
                      onClick={handleViewRecords}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        showRecords
                          ? "bg-gray-700 dark:bg-slate-600 text-white"
                          : "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      <FiFileText size={14} />
                      {showRecords ? "Hide Records" : "View Records"}
                    </button>
                  </div>

                  {/* Sent Rx badge */}
                  {sentRx[selected.id] && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl flex items-center gap-2">
                      <FiCheckCircle size={16} className="text-green-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-green-800 dark:text-green-300">Prescription Sent!</p>
                        <p className="text-xs text-green-600 dark:text-green-400 font-mono">{sentRx[selected.id]}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recent Visits — hide when rx form or records panel is open */}
                {!showRxForm && !showRecords && (
                  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Recent Visits</h4>
                    <div className="space-y-2">
                      {selected.appointments?.slice(0, 5).map((apt, i) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs">
                          <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{apt.symptoms || "Consultation"}</p>
                            <p className="text-gray-400 dark:text-slate-500 capitalize">{apt.status}</p>
                          </div>
                          <span className="text-gray-400 flex-shrink-0">{apt.date?.split("T")[0]}</span>
                        </div>
                      ))}
                      {!selected.appointments?.length && (
                        <p className="text-xs text-gray-400 text-center py-3">No visit history</p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Column 3: Inline Prescription Form OR Records ── */}
          <AnimatePresence>
            {showRxForm && selected && (
              <motion.div
                key="rx-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="lg:col-span-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5"
              >
                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                  <FiEdit3 size={15} className="text-primary-500" /> Write Prescription
                </h4>
                <PrescriptionForm
                  patient={selected}
                  onSuccess={handleRxSuccess}
                  onCancel={() => setShowRxForm(false)}
                />
              </motion.div>
            )}

            {showRecords && selected && (
              <motion.div
                key="records"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="lg:col-span-1 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                    <FiFileText size={15} className="text-gray-500" />
                    Past Prescriptions
                  </h4>
                  <button onClick={() => setShowRecords(false)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-400">
                    <FiX size={14} />
                  </button>
                </div>

                {recordsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full" />
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center py-10">
                    <FiPackage size={32} className="text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">No prescriptions yet</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                      Write one using the "Write Prescription" button
                    </p>
                    <button
                      onClick={() => { setShowRecords(false); setShowRxForm(true); }}
                      className="mt-3 btn-primary btn-sm gap-1.5"
                    >
                      <FiEdit3 size={12} /> Write Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {records.map((rx, i) => (
                      <motion.div key={rx._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-xs">{rx.diagnosis}</p>
                            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">{rx.prescriptionNumber}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                            rx.status === "active"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
                          }`}>
                            {rx.status}
                          </span>
                        </div>

                        {/* Medicines list */}
                        <div className="space-y-1">
                          {(rx.medicines || []).map((med, j) => (
                            <div key={j} className="flex items-center gap-2 text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                              <span className="font-medium text-gray-800 dark:text-slate-200">{med.name}</span>
                              <span className="text-primary-600 dark:text-primary-400 font-semibold">{med.dose}</span>
                              <span className="text-gray-400 dark:text-slate-500">· {med.frequency}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 dark:text-slate-500">
                          <span className="flex items-center gap-1">
                            <FiCalendar size={9} />
                            {new Date(rx.issuedDate || rx.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                          {rx.followUpDate && (
                            <span className="flex items-center gap-1">
                              <FiClock size={9} />
                              Follow-up: {new Date(rx.followUpDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                            </span>
                          )}
                        </div>

                        {rx.notes && (
                          <p className="mt-1.5 text-[10px] text-gray-500 dark:text-slate-400 italic border-t border-gray-100 dark:border-slate-700 pt-1.5">
                            📋 {rx.notes}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Default empty state when nothing selected */}
          {!selected && (
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-4">
                <FiUser size={28} className="text-primary-400" />
              </div>
              <p className="font-semibold text-gray-700 dark:text-slate-300">Select a Patient</p>
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                Click a patient from the list to view details and write a prescription
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
