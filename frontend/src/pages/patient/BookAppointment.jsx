import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { FiArrowLeft, FiCalendar, FiVideo, FiUser, FiClock, FiFileText } from "react-icons/fi";
import toast from "react-hot-toast";

const timeSlots = ["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM"];

const steps = ["Select Date & Time", "Consultation Type", "Symptoms", "Confirm"];

export default function BookAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [consultType, setConsultType] = useState("video");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const doctor = { name: "Dr. Sarah Johnson", specialty: "Cardiologist", fee: 150, avatar: "SJ" };

  const handleBook = async (data) => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500)); // simulate API
      toast.success("Appointment booked successfully!");
      navigate("/appointment-confirm", {
        state: { doctor, date: selectedDate, slot: selectedSlot, type: consultType, symptoms: data.symptoms },
      });
    } catch {
      toast.error("Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return selectedDate && selectedSlot;
    if (step === 1) return consultType;
    return true;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to={`/doctors/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <FiArrowLeft size={16} /> Back to Profile
      </Link>

      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-500 text-sm mt-1">with {doctor.name}</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 ${i <= step ? "text-primary-600" : "text-gray-400"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i < step ? "bg-primary-500 border-primary-500 text-white" :
                i === step ? "border-primary-500 text-primary-600" :
                "border-gray-300 text-gray-400"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full ${i < step ? "bg-primary-500" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Doctor summary */}
      <div className="card p-4 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
          {doctor.avatar}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{doctor.name}</p>
          <p className="text-sm text-primary-600">{doctor.specialty}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xl font-bold text-gray-900">${doctor.fee}</p>
          <p className="text-xs text-gray-400">per session</p>
        </div>
      </div>

      {/* Step content */}
      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="label flex items-center gap-2"><FiCalendar size={14} /> Select Date</label>
              <input
                type="date"
                className="input"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            {selectedDate && (
              <div>
                <label className="label flex items-center gap-2"><FiClock size={14} /> Select Time Slot</label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium border-2 transition-all ${
                        selectedSlot === slot
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-200 text-gray-600 hover:border-primary-300"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Consultation Type</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "video", icon: FiVideo, label: "Video Call", desc: "Consult from home", color: "text-blue-600 bg-blue-50" },
                { value: "in-person", icon: FiUser, label: "In-Person", desc: "Visit the clinic", color: "text-green-600 bg-green-50" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setConsultType(t.value)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    consultType === t.value ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.color} mb-3`}>
                    <t.icon size={22} />
                  </div>
                  <p className="font-semibold text-gray-900">{t.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <form className="space-y-4">
            <div>
              <label className="label flex items-center gap-2"><FiFileText size={14} /> Describe your symptoms</label>
              <textarea
                {...register("symptoms")}
                rows={4}
                placeholder="Describe what you're experiencing..."
                className="input resize-none"
              />
            </div>
            <div>
              <label className="label">Any existing conditions? (optional)</label>
              <input {...register("conditions")} placeholder="e.g., Diabetes, Hypertension" className="input" />
            </div>
            <div>
              <label className="label">Current medications? (optional)</label>
              <input {...register("medications")} placeholder="e.g., Metformin 500mg" className="input" />
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Confirm Booking</h3>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              {[
                { label: "Doctor", value: doctor.name },
                { label: "Specialty", value: doctor.specialty },
                { label: "Date", value: selectedDate },
                { label: "Time", value: selectedSlot },
                { label: "Type", value: consultType === "video" ? "Video Call" : "In-Person" },
                { label: "Fee", value: `$${doctor.fee}` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="btn-outline flex-1">
            Back
          </button>
        )}
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
            className="btn-primary flex-1 justify-center"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit(handleBook)}
            disabled={loading}
            className="btn-primary flex-1 justify-center"
          >
            {loading ? "Booking..." : "Confirm & Pay $" + doctor.fee}
          </button>
        )}
      </div>
    </div>
  );
}
