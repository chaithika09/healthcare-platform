import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { FiPlus, FiTrash2, FiCheckCircle, FiPrinter } from "react-icons/fi";
import toast from "react-hot-toast";

export default function PrescriptionUpload() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: {
      medicines: [{ name: "", dose: "", frequency: "", duration: "", instructions: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "medicines" });

  const onSubmit = async (data) => {
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitted(true);
    toast.success("Prescription created successfully!");
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle size={48} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-gray-900">Prescription Created!</h2>
        <p className="text-gray-500 mt-2">The prescription has been sent to the patient.</p>
        <div className="flex gap-3 justify-center mt-8">
          <button className="btn-outline gap-2"><FiPrinter size={16} /> Print</button>
          <button onClick={() => setSubmitted(false)} className="btn-primary">New Prescription</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Write Prescription</h1>
        <p className="text-gray-500 text-sm mt-1">Create a digital prescription for your patient</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Patient info */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Patient Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Patient Name *</label>
              <input {...register("patientName", { required: true })} placeholder="John Smith" className="input" />
            </div>
            <div>
              <label className="label">Patient ID</label>
              <input {...register("patientId")} placeholder="PAT-001" className="input" />
            </div>
            <div>
              <label className="label">Age</label>
              <input {...register("age")} type="number" placeholder="45" className="input" />
            </div>
            <div>
              <label className="label">Date</label>
              <input {...register("date")} type="date" className="input" defaultValue={new Date().toISOString().split("T")[0]} />
            </div>
          </div>
          <div>
            <label className="label">Diagnosis / Chief Complaint *</label>
            <input {...register("diagnosis", { required: true })} placeholder="e.g., Hypertension, Type 2 Diabetes" className="input" />
          </div>
        </div>

        {/* Medicines */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Medications</h3>
            <button type="button" onClick={() => append({ name: "", dose: "", frequency: "", duration: "", instructions: "" })}
              className="btn-outline btn-sm gap-1.5">
              <FiPlus size={14} /> Add Medicine
            </button>
          </div>

          {fields.map((field, i) => (
            <motion.div key={field.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Medicine {i + 1}</span>
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(i)} className="p-1.5 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Medicine Name *</label>
                  <input {...register(`medicines.${i}.name`, { required: true })} placeholder="e.g., Amlodipine" className="input" />
                </div>
                <div>
                  <label className="label">Dosage *</label>
                  <input {...register(`medicines.${i}.dose`, { required: true })} placeholder="e.g., 5mg" className="input" />
                </div>
                <div>
                  <label className="label">Frequency *</label>
                  <select {...register(`medicines.${i}.frequency`, { required: true })} className="input">
                    <option value="">Select...</option>
                    <option>Once daily</option>
                    <option>Twice daily</option>
                    <option>Three times daily</option>
                    <option>Four times daily</option>
                    <option>As needed</option>
                    <option>At bedtime</option>
                  </select>
                </div>
                <div>
                  <label className="label">Duration</label>
                  <input {...register(`medicines.${i}.duration`)} placeholder="e.g., 30 days" className="input" />
                </div>
                <div>
                  <label className="label">Instructions</label>
                  <input {...register(`medicines.${i}.instructions`)} placeholder="e.g., Take with food" className="input" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Notes */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Additional Notes</h3>
          <div>
            <label className="label">Doctor's Notes</label>
            <textarea {...register("notes")} rows={3} placeholder="Follow-up instructions, lifestyle advice, warnings..." className="input resize-none" />
          </div>
          <div>
            <label className="label">Follow-up Date</label>
            <input {...register("followUp")} type="date" className="input" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" className="btn-outline flex-1 gap-2"><FiPrinter size={16} /> Preview</button>
          <button type="submit" className="btn-primary flex-1 justify-center">Create Prescription</button>
        </div>
      </form>
    </div>
  );
}
