// PrescriptionUpload v2 — standalone prescription form
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiPlus, FiTrash2, FiCheckCircle, FiPrinter,
  FiArrowLeft, FiUser, FiCalendar, FiFileText
} from "react-icons/fi";
import { prescriptionAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function PrescriptionUpload() {
  const location    = useLocation();
  const navigate    = useNavigate();
  const patientData = location.state?.patient;

  const [submitted,    setSubmitted]    = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [savedRx,      setSavedRx]      = useState(null);

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      patientName: patientData?.name || "",
      patientId:   patientData?.id   || "",
      age:         patientData?.age  || "",
      date:        new Date().toISOString().split("T")[0],
      diagnosis:   "",
      notes:       "",
      followUp:    "",
      medicines: [{ name: "", dose: "", frequency: "", duration: "", instructions: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "medicines" });

  /* ── Submit: save to database ── */
  const onSubmit = async (data) => {
    if (!patientData?.id) {
      toast.error("Patient ID missing. Please go back and select a patient.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        patientId:   patientData.id,
        diagnosis:   data.diagnosis,
        medicines:   data.medicines,
        notes:       data.notes || "",
        followUpDate: data.followUp || undefined,
      };

      const res = await prescriptionAPI.create(payload);
      setSavedRx(res.data.data.prescription);
      setSubmitted(true);
      toast.success("✅ Prescription saved and sent to patient!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save prescription");
    } finally {
      setSaving(false);
    }
  };

  /* ── Print prescription ── */
  const handlePrint = () => {
    window.print();
  };

  /* ── Success screen ── */
  if (submitted && savedRx) {
    return (
      <div className="max-w-lg mx-auto py-10 space-y-6">
        {/* Success card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 text-center shadow-lg"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <FiCheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prescription Created!</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">
            Saved to database and visible to the patient.
          </p>

          {/* Rx summary */}
          <div className="mt-5 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl text-left space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <FiFileText size={14} className="text-primary-500" />
              <span className="text-gray-500 dark:text-slate-400">Rx No:</span>
              <span className="font-bold text-gray-900 dark:text-white">{savedRx.prescriptionNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FiUser size={14} className="text-primary-500" />
              <span className="text-gray-500 dark:text-slate-400">Patient:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{patientData?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FiCalendar size={14} className="text-primary-500" />
              <span className="text-gray-500 dark:text-slate-400">Diagnosis:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{savedRx.diagnosis}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 dark:text-slate-400">Medicines:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{savedRx.medicines?.length} prescribed</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-6">
            <button onClick={handlePrint} className="btn-outline w-full gap-2 justify-center">
              <FiPrinter size={16} /> Print Prescription
            </button>
            <button
              onClick={() => { setSubmitted(false); setSavedRx(null); }}
              className="btn-primary w-full justify-center"
            >
              Write Another Prescription
            </button>
            <button onClick={() => navigate("/doctor/patients")} className="text-sm text-gray-500 dark:text-slate-400 hover:text-primary-600 transition-colors mt-1">
              ← Back to Patients
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/doctor/patients")}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          <FiArrowLeft size={20} className="text-gray-600 dark:text-slate-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Write Prescription</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm">
            {patientData ? `Patient: ${patientData.name}` : "Select a patient from My Patients"}
          </p>
        </div>
      </div>

      {/* No patient warning */}
      {!patientData && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">No patient selected</p>
            <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">
              Go to <button onClick={() => navigate("/doctor/patients")} className="underline font-semibold">My Patients</button> → select a patient → click Write Prescription
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Patient info card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiUser size={16} className="text-primary-500" /> Patient Information
          </h3>

          {patientData && (
            <div className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {patientData.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-primary-900 dark:text-primary-200 text-sm">{patientData.name}</p>
                <p className="text-xs text-primary-600 dark:text-primary-400">
                  {patientData.age ? `Age: ${patientData.age}` : ""} {patientData.gender ? `• ${patientData.gender}` : ""}
                  {patientData.condition ? ` • ${patientData.condition}` : ""}
                </p>
              </div>
              <span className="ml-auto text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                Selected ✓
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Patient Name</label>
              <input
                {...register("patientName")}
                readOnly={!!patientData}
                placeholder="Patient name"
                className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white read-only:bg-gray-50 dark:read-only:bg-slate-800/50"
              />
            </div>
            <div>
              <label className="label">Age</label>
              <input
                {...register("age")}
                type="number"
                readOnly={!!patientData}
                placeholder="Age"
                className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white read-only:bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="label">Diagnosis / Chief Complaint *</label>
            <input
              {...register("diagnosis", { required: "Diagnosis is required" })}
              placeholder="e.g., Hypertension, Type 2 Diabetes, Fever"
              className={`input dark:bg-slate-800 dark:border-slate-700 dark:text-white ${errors.diagnosis ? "border-red-400" : ""}`}
            />
            {errors.diagnosis && <p className="text-red-500 text-xs mt-1">{errors.diagnosis.message}</p>}
          </div>

          <div>
            <label className="label">Date</label>
            <input
              {...register("date")}
              type="date"
              className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
        </div>

        {/* Medicines */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              💊 Medications
            </h3>
            <button
              type="button"
              onClick={() => append({ name: "", dose: "", frequency: "", duration: "", instructions: "" })}
              className="btn-outline btn-sm gap-1.5"
            >
              <FiPlus size={14} /> Add Medicine
            </button>
          </div>

          {fields.map((field, i) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                  💊 Medicine {i + 1}
                </span>
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Medicine Name *</label>
                  <input
                    {...register(`medicines.${i}.name`, { required: true })}
                    placeholder="e.g., Amlodipine, Paracetamol, Metformin"
                    className="input dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="label">Dosage *</label>
                  <input
                    {...register(`medicines.${i}.dose`, { required: true })}
                    placeholder="e.g., 5mg, 500mg"
                    className="input dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="label">Frequency *</label>
                  <select
                    {...register(`medicines.${i}.frequency`, { required: true })}
                    className="input dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  >
                    <option value="">Select...</option>
                    <option>Once daily (OD)</option>
                    <option>Twice daily (BD)</option>
                    <option>Three times daily (TDS)</option>
                    <option>Four times daily (QID)</option>
                    <option>As needed (SOS)</option>
                    <option>At bedtime (HS)</option>
                    <option>Before food</option>
                    <option>After food</option>
                  </select>
                </div>
                <div>
                  <label className="label">Duration</label>
                  <input
                    {...register(`medicines.${i}.duration`)}
                    placeholder="e.g., 7 days, 1 month"
                    className="input dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="label">Special Instructions</label>
                  <input
                    {...register(`medicines.${i}.instructions`)}
                    placeholder="e.g., Take with food, Avoid alcohol"
                    className="input dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Notes & Follow-up */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            📋 Doctor's Notes
          </h3>
          <div>
            <label className="label">Notes / Advice</label>
            <textarea
              {...register("notes")}
              rows={3}
              placeholder="Lifestyle advice, dietary instructions, warnings, follow-up instructions..."
              className="input resize-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label className="label">Follow-up Date</label>
            <input
              {...register("followUp")}
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="btn-outline flex-1 gap-2 justify-center"
          >
            <FiPrinter size={16} /> Preview & Print
          </button>
          <button
            type="submit"
            disabled={saving || !patientData}
            className="btn-primary flex-1 justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiCheckCircle size={16} /> Save Prescription
              </>
            )}
          </button>
        </div>

        {!patientData && (
          <p className="text-center text-xs text-gray-400 dark:text-slate-500">
            Please select a patient from <button onClick={() => navigate("/doctor/patients")} className="text-primary-600 dark:text-primary-400 underline">My Patients</button> first
          </p>
        )}
      </form>
    </div>
  );
}
