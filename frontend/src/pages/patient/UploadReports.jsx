import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUpload, FiFile, FiX, FiCheckCircle, FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { recordAPI, appointmentAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function UploadReports() {
  const [files,     setFiles]     = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded,  setUploaded]  = useState(false);
  const [dragOver,  setDragOver]  = useState(false);
  const [doctors,   setDoctors]   = useState([]);
  const fileRef = useRef();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      type: "lab-report",
    }
  });

  // Load real doctors from appointments
  useEffect(() => {
    appointmentAPI.getAll().then(res => {
      const apts = res.data.data.appointments || [];
      const seen = new Set();
      const docs = [];
      apts.forEach(a => {
        const name = a.doctor?.user?.name || a.doctor?.name;
        if (name && !seen.has(name)) {
          seen.add(name);
          docs.push(name);
        }
      });
      setDoctors(docs);
    }).catch(() => {});
  }, []);

  const addFiles = (newFiles) => {
    const arr = Array.from(newFiles).map(f => ({
      file: f,
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(2) + " MB",
      type: f.type,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
    }));
    setFiles(prev => [...prev, ...arr]);
  };

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const onSubmit = async (data) => {
    if (!files.length) { toast.error("Please select at least one file."); return; }
    setUploading(true);

    const formData = new FormData();
    formData.append("title",      data.title);
    formData.append("type",       data.type);
    formData.append("reportDate", data.date);
    formData.append("doctor",     data.doctor || "");
    formData.append("notes",      data.notes  || "");
    // Backend uses upload.array("files", 5) — must use "files" field name
    files.forEach(f => formData.append("files", f.file));

    try {
      await recordAPI.upload(formData);
      setUploaded(true);
      toast.success("Report uploaded successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (uploaded) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle size={48} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Successful!</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-2">{files.length} file(s) added to your medical records.</p>
          <div className="flex gap-3 justify-center mt-8">
            <Link to="/medical-records" className="btn-primary">View Records</Link>
            <button onClick={() => { setFiles([]); setUploaded(false); }} className="btn-outline">Upload More</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">
      <Link to="/medical-records"
        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200">
        <FiArrowLeft size={16} /> Back to Records
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Reports</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          Upload lab results, X-rays, prescriptions or any medical document
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
              : "border-gray-200 dark:border-slate-700 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            className="hidden"
            onChange={e => addFiles(e.target.files)}
          />
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiUpload size={28} className="text-primary-600 dark:text-primary-400" />
          </div>
          <p className="font-semibold text-gray-900 dark:text-white">Drop files here or click to browse</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">PDF, JPG, PNG, DOC — Max 10MB per file</p>
        </div>

        {/* File list */}
        <AnimatePresence>
          {files.map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700"
            >
              {f.preview ? (
                <img src={f.preview} alt={f.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <FiFile size={18} className="text-primary-600 dark:text-primary-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{f.name}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{f.size}</p>
              </div>
              <button type="button" onClick={() => removeFile(i)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                <FiX size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Report Details */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white">Report Details</h3>

          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 block mb-1.5">
              Report Title *
            </label>
            <input
              {...register("title", { required: "Title is required" })}
              placeholder="e.g., Blood Test Report, X-Ray Chest"
              className={`w-full px-4 py-2.5 text-sm border rounded-xl bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-400 ${
                errors.title ? "border-red-400" : "border-gray-200"
              }`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Type + Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 block mb-1.5">
                Report Type
              </label>
              <select
                {...register("type")}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="lab-report">Lab Report</option>
                <option value="imaging">Imaging / Radiology</option>
                <option value="prescription">Prescription</option>
                <option value="discharge-summary">Discharge Summary</option>
                <option value="vaccination">Vaccination</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 block mb-1.5">
                Report Date
              </label>
              <input
                {...register("date")}
                type="date"
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          {/* Doctor — from real appointments */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 block mb-1.5">
              Doctor / Hospital (optional)
            </label>
            {doctors.length > 0 ? (
              <select
                {...register("doctor")}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="">Select doctor or leave blank</option>
                {doctors.map(d => <option key={d} value={d}>{d}</option>)}
                <option value="other">Other / External Doctor</option>
              </select>
            ) : (
              <input
                {...register("doctor")}
                placeholder="Enter doctor or hospital name"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-400"
              />
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 block mb-1.5">
              Notes (optional)
            </label>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Any additional notes about this report..."
              className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading || !files.length}
          className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary-500/20"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <FiUpload size={18} />
              Upload {files.length > 0 ? `${files.length} File(s)` : "Files"}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
