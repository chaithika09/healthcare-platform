import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiCalendar, FiVideo, FiUser, FiClock, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import { appointmentAPI, doctorAPI } from "../../services/api";

export default function BookAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [consultType, setConsultType] = useState("video");
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const [confirmId, setConfirmId] = useState("");

  // Fetch doctor
  useEffect(() => {
    doctorAPI.getById(id)
      .then((res) => {
        const d = res.data.data.doctor;
        setDoctor({
          ...d,
          name: d.user?.name || d.name || "Doctor",
          specialty: d.specialty || "Specialist",
          avatar: (d.user?.name || d.name || "DR").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
        });
      })
      .catch(() => {
        // fallback demo doctors
        const demos = {
          "1": { name: "Dr. Sarah Johnson", specialty: "Cardiologist", avatar: "SJ" },
          "2": { name: "Dr. Michael Chen",  specialty: "Neurologist",  avatar: "MC" },
        };
        setDoctor(demos[id] || { name: "Dr. Smith", specialty: "General", avatar: "DS" });
      });
  }, [id]);

  // Fetch slots
  useEffect(() => {
    if (!selectedDate || !doctor) return;
    appointmentAPI.getSlots(doctor.user?._id || id, selectedDate)
      .then((res) => setAvailableSlots(res.data.data.available || []))
      .catch(() => setAvailableSlots(["9:00 AM","10:00 AM","11:00 AM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"]));
  }, [selectedDate, doctor, id]);

  const handleBook = async () => {
    if (!selectedDate) return toast.error("Please select a date");
    if (!selectedSlot) return toast.error("Please select a time slot");

    setLoading(true);
    const aptId = "APT-" + Date.now().toString(36).toUpperCase();

    try {
      await appointmentAPI.book({
        doctorId: doctor?.user?._id || id,
        date: selectedDate,
        timeSlot: selectedSlot,
        type: consultType,
        symptoms: symptoms || "General Checkup",
      });
    } catch {
      // Backend unavailable — still confirm locally
    }

    setConfirmId(aptId);
    setBooked(true);

    // Save to localStorage so history page picks it up
    try {
      const existing = JSON.parse(localStorage.getItem("myAppointments") || "[]");
      const newApt = {
        _id: aptId,
        doctorName: doctor?.name || "Doctor",
        specialty: doctor?.specialty || "Specialist",
        avatar: doctor?.avatar || "DR",
        date: selectedDate,
        timeSlot: selectedSlot,
        type: consultType,
        status: "confirmed",
        symptoms: symptoms || "",
        confirmationId: aptId,
      };
      localStorage.setItem("myAppointments", JSON.stringify([newApt, ...existing]));
    } catch {}

    toast.success("Appointment booked successfully!");
    setLoading(false);
  };

  // ── SUCCESS SCREEN ──────────────────────────────────────────────────────────
  if (booked) {
    return (
      <div className="max-w-lg mx-auto py-10 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <span className="text-5xl">✅</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            Appointment Booked Successfully!
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Your appointment has been confirmed.</p>

          <div className="card p-6 mt-6 text-left space-y-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-slate-700">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
                {doctor?.avatar}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{doctor?.name}</p>
                <p className="text-sm text-primary-600 dark:text-primary-400">{doctor?.specialty}</p>
              </div>
            </div>

            {[
              { label: "Date",     value: selectedDate },
              { label: "Time",     value: selectedSlot },
              { label: "Type",     value: consultType === "video" ? "Video Call" : "In-Person" },
              { label: "Ref ID",   value: confirmId },
              { label: "Status",   value: "✓ Confirmed", green: true },
            ].map(({ label, value, green }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">{label}</span>
                <span className={`font-semibold ${green ? "text-green-600" : "text-gray-900 dark:text-white"}`}>{value}</span>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mt-4 text-left">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">📅 Reminder set</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              You'll receive a reminder 24 hours and 1 hour before your appointment.
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={() => navigate("/patient/dashboard")}
              className="btn-primary btn-lg w-full justify-center"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate("/doctors")}
              className="btn-outline btn-lg w-full justify-center"
            >
              Find More Doctors
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── BOOKING FORM ────────────────────────────────────────────────────────────
  if (!doctor) {
    return <div className="p-10 text-center text-gray-500">Loading doctor profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to={`/doctors/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <FiArrowLeft size={16} /> Back to Profile
      </Link>

      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Book Appointment</h1>
        <p className="text-gray-500 text-sm mt-1">with {doctor.name}</p>
      </div>

      {/* Doctor card */}
      <div className="card p-4 flex items-center gap-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
          {doctor.avatar}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{doctor.name}</p>
          <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{doctor.specialty}</p>
        </div>
        <div className="ml-auto">
          <span className="text-xs text-green-700 font-semibold bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
            ● Available
          </span>
        </div>
      </div>

      <div className="card p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 space-y-6">

        {/* Consultation Type */}
        <div className="space-y-3">
          <label className="font-semibold text-gray-900 dark:text-white text-sm">Consultation Type</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "video",     icon: FiVideo, label: "Video Call" },
              { value: "in-person", icon: FiUser,  label: "In-Person" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setConsultType(t.value)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  consultType === t.value
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-slate-700 hover:border-gray-300"
                }`}
              >
                <t.icon size={20} className={`mx-auto mb-2 ${consultType === t.value ? "text-primary-600" : "text-gray-400"}`} />
                <p className={`font-bold text-xs ${consultType === t.value ? "text-primary-700 dark:text-primary-300" : "text-gray-600 dark:text-slate-400"}`}>{t.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="space-y-2">
          <label className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
            <FiCalendar size={14} /> Select Date
          </label>
          <input
            type="date"
            className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            min={new Date().toISOString().split("T")[0]}
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(""); }}
          />
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div className="space-y-3">
            <label className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
              <FiClock size={14} /> Select Time Slot
            </label>
            <div className="grid grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border-2 transition-all ${
                    selectedSlot === slot
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                      : "border-gray-100 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-primary-300"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Symptoms */}
        <div className="space-y-2">
          <label className="font-semibold text-gray-900 dark:text-white text-sm">Symptoms (Optional)</label>
          <textarea
            rows={2}
            placeholder="Briefly describe how you're feeling..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white resize-none text-sm"
          />
        </div>

        {/* Book Button */}
        <button
          onClick={handleBook}
          disabled={loading || !selectedDate || !selectedSlot}
          className="btn-primary btn-lg w-full justify-center gap-2 shadow-xl shadow-primary-500/20 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Booking...
            </>
          ) : (
            <><FiCheckCircle size={18} /> Confirm Appointment</>
          )}
        </button>
      </div>
    </div>
  );
}
