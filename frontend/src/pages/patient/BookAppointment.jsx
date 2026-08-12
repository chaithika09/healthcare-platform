import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { FiArrowLeft, FiCalendar, FiVideo, FiUser, FiClock, FiFileText } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { appointmentAPI, doctorAPI } from "../../services/api";

const steps = ["Select Date & Time", "Consultation Type", "Symptoms", "Confirm"];

export default function BookAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [consultType, setConsultType] = useState("video");
  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [doctor, setDoctor] = useState(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { user } = useAuthStore();

  // Fetch doctor details
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await doctorAPI.getById(id);
        const data = res.data.data.doctor;
        setDoctor({
          ...data,
          name: data.user?.name || data.name || "Doctor",
          avatar: data.avatar || (data.user?.name || data.name || "DR").split(" ").map(n => n[0]).join("").slice(0, 2),
          fee: (consultType === "video" ? data.consultationFee?.video : data.consultationFee?.inPerson) || 150
        });
      } catch (err) {
        // Fallback for demo if API fails or not found
        const demoDocs = [
          { id: 1, name: "Dr. Sarah Johnson", specialty: "Cardiologist", fee: 150, avatar: "SJ", user: { _id: id } },
          { id: 2, name: "Dr. Michael Chen",  specialty: "Neurologist",  fee: 180, avatar: "MC", user: { _id: id } },
        ];
        const d = demoDocs.find(d => d.id === parseInt(id)) || demoDocs[0];
        setDoctor({ ...d, user: d.user });
      }
    };
    fetchDoc();
  }, [id, consultType]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (selectedDate && doctor) {
      const getSlots = async () => {
        setFetchingSlots(true);
        try {
          const res = await appointmentAPI.getSlots(doctor.user?._id || id, selectedDate);
          setAvailableSlots(res.data.data.available);
        } catch (err) {
          setAvailableSlots(["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]);
        } finally {
          setFetchingSlots(false);
        }
      };
      getSlots();
    }
  }, [selectedDate, doctor, id]);

  const handleBook = async (data) => {
    if (!selectedDate || !selectedSlot) return toast.error("Please select date and time");

    setLoading(true);
    try {
      const res = await appointmentAPI.book({
        doctorId: doctor.user?._id || id,
        date: selectedDate,
        timeSlot: selectedSlot,
        type: consultType,
        symptoms: data.symptoms,
        conditions: data.conditions,
        medications: data.medications
      });

      toast.success("Appointment slot reserved! Proceed to payment.");
      navigate("/payment", {
        state: {
          doctor: { ...doctor, name: doctor.name || doctor.user?.name },
          date: selectedDate,
          slot: selectedSlot,
          type: consultType,
          amount: doctor.fee || doctor.consultationFee?.video || 150,
          appointmentId: res.data.data.appointment._id
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Booking failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return selectedDate && selectedSlot;
    if (step === 1) return consultType;
    return true;
  };

  if (!doctor) return <div className="p-10 text-center text-gray-500">Loading doctor profile...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to={`/doctors/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <FiArrowLeft size={16} /> Back to Profile
      </Link>

      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-500 text-sm mt-1">with {doctor?.name || doctor?.user?.name || "the doctor"}</p>
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
      <div className="card p-4 flex items-center gap-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
          {doctor?.avatar || "DR"}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{doctor?.name || doctor?.user?.name || "Doctor"}</p>
          <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{doctor?.specialty || "Specialist"}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xl font-bold text-gray-900 dark:text-white">${doctor?.fee || 150}</p>
          <p className="text-xs text-gray-400">per session</p>
        </div>
      </div>

      {/* Step content */}
      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="label flex items-center gap-2 dark:text-slate-300"><FiCalendar size={14} /> Select Date</label>
              <input
                type="date"
                className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            {selectedDate && (
              <div>
                <label className="label flex items-center gap-2 dark:text-slate-300"><FiClock size={14} /> Select Time Slot</label>
                {fetchingSlots ? (
                  <p className="text-xs text-gray-400">Loading slots...</p>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-2 rounded-xl text-xs font-medium border-2 transition-all ${
                          selectedSlot === slot
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                            : "border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-primary-300"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-red-500">No slots available for this date.</p>
                )}
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Consultation Type</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "video", icon: FiVideo, label: "Video Call", desc: "Consult from home", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
                { value: "in-person", icon: FiUser, label: "In-Person", desc: "Visit the clinic", color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setConsultType(t.value)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    consultType === t.value ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-slate-700 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.color} mb-3`}>
                    <t.icon size={22} />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">{t.label}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <form className="space-y-4">
            <div>
              <label className="label flex items-center gap-2 dark:text-slate-300"><FiFileText size={14} /> Describe your symptoms</label>
              <textarea
                {...register("symptoms")}
                rows={4}
                placeholder="Describe what you're experiencing..."
                className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white resize-none"
              />
            </div>
            <div>
              <label className="label dark:text-slate-300">Any existing conditions? (optional)</label>
              <input {...register("conditions")} placeholder="e.g., Diabetes, Hypertension" className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
            </div>
            <div>
              <label className="label dark:text-slate-300">Current medications? (optional)</label>
              <input {...register("medications")} placeholder="e.g., Metformin 500mg" className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Confirm Booking</h3>
            <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-3">
              {[
                { label: "Doctor", value: doctor?.name || doctor?.user?.name || "Doctor" },
                { label: "Specialty", value: doctor?.specialty || "Specialist" },
                { label: "Date", value: selectedDate },
                { label: "Time", value: selectedSlot },
                { label: "Type", value: consultType === "video" ? "Video Call" : "In-Person" },
                { label: "Fee", value: `$${doctor?.fee || 150}` },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm border-b border-gray-100 dark:border-slate-700 pb-2 last:border-0 last:pb-0">
                  <span className="text-gray-500 dark:text-slate-400">{item.label}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
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
            {loading ? "Booking..." : "Confirm & Pay $" + (doctor?.fee || 150)}
          </button>
        )}
      </div>
    </div>
  );
}
