import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUpload, FiFile, FiX, FiCheckCircle, FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function UploadReports() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const addFiles = (newFiles) => {
    const arr = Array.from(newFiles).map((f) => ({
      file: f, name: f.name, size: (f.size / 1024 / 1024).toFixed(2) + " MB",
      type: f.type, preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
    }));
    setFiles((prev) => [...prev, ...arr]);
  };

  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const onSubmit = async (data) => {
    if (!files.length) { toast.error("Please select at least one file."); return; }
    setUploading(true);
    try {
      await new Promise((r) => setTimeout(r, 2000));
      setUploaded(true);
      toast.success("Reports uploaded successfully!");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (uploaded) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle size={48} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-gray-900">Upload Successful!</h2>
          <p className="text-gray-500 mt-2">{files.length} file(s) uploaded to your medical records.</p>
          <div className="flex gap-3 justify-center mt-8">
            <Link to="/medical-records" className="btn-primary">View Records</Link>
            <button onClick={() => { setFiles([]); setUploaded(false); }} className="btn-outline">Upload More</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/medical-records" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <FiArrowLeft size={16} /> Back to Records
      </Link>

      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Upload Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Upload lab results, prescriptions, or any medical documents</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            dragOver ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.dicom"
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FiUpload size={28} className="text-primary-600" />
          </div>
          <p className="font-semibold text-gray-900">Drop files here or click to browse</p>
          <p className="text-sm text-gray-500 mt-1">PDF, JPG, PNG, DOC, DICOM — Max 10MB per file</p>
        </div>

        {/* File list */}
        <AnimatePresence>
          {files.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                <FiFile size={18} className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
                <p className="text-xs text-gray-500">{f.size}</p>
              </div>
              <button type="button" onClick={() => removeFile(i)} className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                <FiX size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Metadata */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Report Details</h3>
          <div>
            <label className="label">Report Title *</label>
            <input {...register("title", { required: "Title is required" })} placeholder="e.g., Blood Test Report June 2024" className={`input ${errors.title ? "input-error" : ""}`} />
            {errors.title && <p className="error-message">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Report Type</label>
              <select {...register("type")} className="input">
                <option value="lab">Lab Report</option>
                <option value="imaging">Imaging / Radiology</option>
                <option value="prescription">Prescription</option>
                <option value="discharge">Discharge Summary</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Report Date</label>
              <input {...register("date")} type="date" className="input" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
          </div>
          <div>
            <label className="label">Doctor / Hospital (optional)</label>
            <input {...register("doctor")} placeholder="e.g., Dr. Sarah Johnson" className="input" />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <textarea {...register("notes")} rows={2} placeholder="Any additional notes..." className="input resize-none" />
          </div>
        </div>

        <button type="submit" disabled={uploading || !files.length} className="btn-primary btn-lg w-full justify-center">
          {uploading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Uploading...
            </span>
          ) : `Upload ${files.length > 0 ? files.length + " File(s)" : "Files"}`}
        </button>
      </form>
    </div>
  );
}
