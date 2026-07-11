import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiTrash2, FiBell, FiClock, FiCheckCircle, FiX } from "react-icons/fi";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const initialReminders = [
  { id: 1, medicine: "Amlodipine 5mg",  times: ["8:00 AM"], frequency: "Daily",       taken: false, color: "bg-blue-100 text-blue-700" },
  { id: 2, medicine: "Lisinopril 10mg", times: ["8:00 AM"], frequency: "Daily",       taken: true,  color: "bg-green-100 text-green-700" },
  { id: 3, medicine: "Metformin 500mg", times: ["8:00 AM", "8:00 PM"], frequency: "Twice daily", taken: false, color: "bg-purple-100 text-purple-700" },
];

const colors = [
  "bg-blue-100 text-blue-700", "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700", "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700", "bg-teal-100 text-teal-700",
];

export default function MedicineReminder() {
  const [reminders, setReminders] = useState(initialReminders);
  const [showAdd, setShowAdd] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const toggleTaken = (id) => {
    setReminders((prev) => prev.map((r) => r.id === id ? { ...r, taken: !r.taken } : r));
  };

  const deleteReminder = (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    toast.success("Reminder deleted");
  };

  const onAdd = (data) => {
    const newReminder = {
      id: Date.now(),
      medicine: `${data.name} ${data.dose}`,
      times: [data.time],
      frequency: data.frequency,
      taken: false,
      color: colors[reminders.length % colors.length],
    };
    setReminders((prev) => [...prev, newReminder]);
    reset();
    setShowAdd(false);
    toast.success("Reminder added!");
  };

  const takenCount = reminders.filter((r) => r.taken).length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Medicine Reminder</h1>
          <p className="text-gray-500 text-sm mt-1">{takenCount}/{reminders.length} taken today</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary gap-2">
          <FiPlus size={16} /> Add Reminder
        </button>
      </div>

      {/* Progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Today's Progress</span>
          <span className="text-sm font-bold text-primary-600">{Math.round((takenCount / reminders.length) * 100)}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(takenCount / reminders.length) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{takenCount} taken</span>
          <span>{reminders.length - takenCount} remaining</span>
        </div>
      </div>

      {/* Reminders list */}
      <div className="space-y-3">
        {reminders.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`card p-4 flex items-center gap-4 transition-all ${r.taken ? "opacity-60" : ""}`}
          >
            <button
              onClick={() => toggleTaken(r.id)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                r.taken ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
              }`}
            >
              <FiCheckCircle size={20} />
            </button>

            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${r.taken ? "line-through text-gray-400" : "text-gray-900"}`}>
                {r.medicine}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <FiClock size={11} /> {r.times.join(", ")}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.color}`}>
                  {r.frequency}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                <FiBell size={15} />
              </button>
              <button onClick={() => deleteReminder(r.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                <FiTrash2 size={15} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add reminder modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-content p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-semibold text-gray-900">Add Medicine Reminder</h3>
                <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
                <div>
                  <label className="label">Medicine Name *</label>
                  <input {...register("name", { required: true })} placeholder="e.g., Amlodipine" className="input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Dosage *</label>
                    <input {...register("dose", { required: true })} placeholder="e.g., 5mg" className="input" />
                  </div>
                  <div>
                    <label className="label">Time *</label>
                    <input {...register("time", { required: true })} type="time" className="input" />
                  </div>
                </div>
                <div>
                  <label className="label">Frequency</label>
                  <select {...register("frequency")} className="input">
                    <option>Daily</option>
                    <option>Twice daily</option>
                    <option>Three times daily</option>
                    <option>Weekly</option>
                    <option>As needed</option>
                  </select>
                </div>
                <div>
                  <label className="label">Notes (optional)</label>
                  <input {...register("notes")} placeholder="e.g., Take with food" className="input" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAdd(false)} className="btn-outline flex-1">Cancel</button>
                  <button type="submit" className="btn-primary flex-1 justify-center">Add Reminder</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
