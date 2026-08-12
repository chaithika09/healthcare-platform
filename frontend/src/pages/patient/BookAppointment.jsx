import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { FiArrowLeft, FiCalendar, FiVideo, FiUser, FiClock, FiFileText, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import { appointmentAPI, doctorAPI } from "../../services/api";

export default function BookAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [consultType, setConsultType] = useState("video");
  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [doctor, setDoctor] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();
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

  // Fetch available slots
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
        symptoms: data.symptoms || "Regular Checkup",
        conditions: data.conditions || "",
        medications: data.medications || ""
      });

      toast.success("Appointment booked successfully!");
      navigate("/appointment-confirm", {
        state: {
          doctor: { ...doctor, name: doctor.name || doctor.user?.name },
          date: selectedDate,
          slot: selectedSlot,
          type: consultType,
          aptId: res.data.data.appointment._id
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Booking failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!doctor) return <div className="p-10 text-center text-gray-500">Loading doctor profile...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to={`/doctors/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <FiArrowLeft size={16} /> Back to Profile
      </Link>

      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">Quick Booking</h1>
        <p className="text-gray-500 text-sm mt-1">Book your appointment with {doctor?.name}</p>
      </div>

      {/* Doctor card */}
      <div className="card p-4 flex items-center gap-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
          {doctor?.avatar}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{doctor?.name}</p>
          <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{doctor?.specialty}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xl font-bold text-gray-900 dark:text-white">${doctor?.fee}</p>
          <p className="text-xs text-gray-400">Consultation Fee</p>
        </div>
      </div>

      <div className="card p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 space-y-6">
        {/* 1. Consultation Type */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Consultation Type</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "video", icon: FiVideo, label: "Video Call", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
              { value: "in-person", icon: FiUser, label: "In-Person", color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setConsultType(t.value)}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  consultType === t.value ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-slate-700 hover:border-gray-300"
                }`}
              >
                <t.icon size={20} className={`mx-auto mb-2 ${t.color}`} />
                <p className="font-bold text-gray-900 dark:text-white text-xs">{t.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Select Date */}
        <div className="space-y-3">
          <label className="label flex items-center gap-2 dark:text-slate-300 font-semibold"><FiCalendar size={14} /> Select Date</label>
          <input
            type="date"
            className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            min={new Date().toISOString().split("T")[0]}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        {/* 3. Select Time Slot */}
        {selectedDate && (
          <div className="space-y-3">
            <label className="label flex items-center gap-2 dark:text-slate-300 font-semibold"><FiClock size={14} /> Select Time Slot</label>
            {fetchingSlots ? (
              <p className="text-xs text-gray-400">Checking availability...</p>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border-2 transition-all ${
                      selectedSlot === slot
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                        : "border-gray-100 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:border-primary-300"
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

        {/* 4. Optional Symptoms */}
        <div className="space-y-3">
          <label className="label flex items-center gap-2 dark:text-slate-300 font-semibold"><FiFileText size={14} /> Symptoms (Optional)</label>
          <textarea
            {...register("symptoms")}
            rows={2}
            placeholder="How are you feeling?"
            className="input dark:bg-slate-800 dark:border-slate-700 dark:text-white resize-none text-sm"
          />
        </div>

        {/* Book Button */}
        <button
          onClick={handleSubmit(handleBook)}
          disabled={loading || !selectedDate || !selectedSlot}
          className="btn-primary btn-lg w-full justify-center gap-2 shadow-xl shadow-primary-500/20 disabled:opacity-50"
        >
          {loading ? (
            <><svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> Booking...</>
          ) : (
            <><FiCheckCircle size={18} /> Confirm & Book Appointment</>
          )}
        </button>
      </div>
    </div>
  );
}
