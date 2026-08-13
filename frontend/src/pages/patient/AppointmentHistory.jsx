import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiCalendar, FiClock, FiVideo, FiUser, FiSearch,
  FiFilter, FiCheckCircle, FiXCircle, FiAlertCircle, FiRefreshCw
} from "react-icons/fi";
import { appointmentAPI } from "../../services/api";
import { useAuthStore } from "../../store/authStore";

const STATUS_STYLES = {
  confirmed:  { bg: "bg-green-100 dark:bg-green-900/30",  text: "text-green-700 dark:text-green-400",  icon: FiCheckCircle,  label: "Confirmed"  },
  completed:  { bg: "bg-blue-100 dark:bg-blue-900/30",    text: "text-blue-700 dark:text-blue-400",    icon: FiCheckCircle,  label: "Completed"  },
  cancelled:  { bg: "bg-red-100 dark:bg-red-900/30",      text: "text-red-700 dark:text-red-400",      icon: FiXCircle,      label: "Cancelled"  },
  pending:    { bg: "bg-amber-100 dark:bg-amber-900/30",  text: "text-amber-700 dark:text-amber-400",  icon: FiAlertCircle,  label: "Pending"    },
  rescheduled:{ bg: "bg-purple-100 dark:bg-purple-900/30",text: "text-purple-700 dark:text-purple-400",icon: FiRefreshCw,    label: "Rescheduled"},
};

// Demo appointments shown when API is unavailable
const DEMO_APPOINTMENTS = [
  {
    _id: "apt-001",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    avatar: "SJ",
    date: "2026-08-10",
    timeSlot: "10:00 AM",
    type: "video",
    status: "completed",
    symptoms: "Chest pain and shortness of breath",
    confirmationId: "APT-K2X9P",
  },
  {
    _id: "apt-002",
    doctorName: "Dr. Michael Chen",
    specialty: "Neurologist",
    avatar: "MC",
    date: "2026-08-19",
    timeSlot: "10:00 AM",
    type: "video",
    status: "confirmed",
    symptoms: "Frequent headaches",
    confirmationId: "APT-M8T3R",
  },
  {
    _id: "apt-003",
    doctorName: "Dr. Priya Sharma",
    specialty: "Dermatologist",
    avatar: "PS",
    date: "2026-07-28",
    timeSlot: "3:00 PM",
    type: "in-person",
    status: "completed",
    symptoms: "Skin rash on arm",
    confirmationId: "APT-D4F7Z",
  },
  {
    _id: "apt-004",
    doctorName: "Dr. James Wilson",
    specialty: "General Physician",
    avatar: "JW",
    date: "2026-07-15",
    timeSlot: "11:00 AM",
    type: "video",
    status: "cancelled",
    symptoms: "Fever and cough",
    confirmationId: "APT-C1N6Q",
  },
];

const gradients = [
  "from-blue-500 to-blue-700",
  "from-green-500 to-green-700",
  "from-purple-500 to-purple-700",
  "from-orange-500 to-orange-700",
  "from-pink-500 to-pink-700",
  "from-teal-500 to-teal-700",
];

export default function AppointmentHistory() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // Load from localStorage first
        const localApts = JSON.parse(localStorage.getItem("myAppointments") || "[]");

        // Try to get from API
        const res = await appointmentAPI.getAll({ patient: user?._id });
        const raw = res.data.data.appointments || [];
        const mapped = raw.map((a) => ({
          _id: a._id,
          doctorName: a.doctor?.user?.name || a.doctor?.name || "Doctor",
          specialty: a.doctor?.specialty || "Specialist",
          avatar: (a.doctor?.user?.name || a.doctor?.name || "DR")
            .split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
          date: a.date?.split("T")[0] || a.date,
          timeSlot: a.timeSlot,
          type: a.type || "video",
          status: a.status || "confirmed",
          symptoms: a.symptoms || "",
          confirmationId: a.confirmationId || "APT-" + a._id?.slice(-5).toUpperCase(),
        }));

        // Merge: local + API + demo (if nothing else)
        const merged = [...localApts, ...mapped];
        const unique = Array.from(new Map(merged.map(a => [a._id, a])).values());
        setAppointments(unique.length > 0 ? unique : DEMO_APPOINTMENTS);
      } catch {
        // API failed — use localStorage + demo
        const localApts = JSON.parse(localStorage.getItem("myAppointments") || "[]");
        setAppointments(localApts.length > 0 ? localApts : DEMO_APPOINTMENTS);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user]);

  const filtered = appointments.filter((a) => {
    const matchSearch =
      a.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      a.specialty.toLowerCase().includes(search.toLowerCase()) ||
      a.confirmationId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchType   = filterType   === "all" || a.type   === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const stats = {
    total:     appointments.length,
    upcoming:  appointments.filter(a => a.status === "confirmed" || a.status === "pending").length,
    completed: appointments.filter(a => a.status === "completed").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            My Appointments
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            All your appointment history in one place
          </p>
        </div>
        <Link to="/doctors" className="btn-primary btn-sm gap-1.5">
          <FiCalendar size={14} /> Book New
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total",     value: stats.total,     color: "bg-gray-50 dark:bg-slate-800",    text: "text-gray-900 dark:text-white" },
          { label: "Upcoming",  value: stats.upcoming,  color: "bg-blue-50 dark:bg-blue-900/20",  text: "text-blue-700 dark:text-blue-400" },
          { label: "Completed", value: stats.completed, color: "bg-green-50 dark:bg-green-900/20",text: "text-green-700 dark:text-green-400" },
          { label: "Cancelled", value: stats.cancelled, color: "bg-red-50 dark:bg-red-900/20",    text: "text-red-700 dark:text-red-400" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            placeholder="Search by doctor, specialty or ref ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input w-auto dark:bg-slate-800 dark:border-slate-700 dark:text-white cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input w-auto dark:bg-slate-800 dark:border-slate-700 dark:text-white cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="video">Video</option>
            <option value="in-person">In-Person</option>
          </select>
        </div>
      </div>

      {/* Appointment cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl">📅</span>
          <p className="text-gray-500 dark:text-slate-400 mt-4 font-medium">No appointments found</p>
          <Link to="/doctors" className="btn-primary mt-4 inline-flex gap-2">
            <FiCalendar size={16} /> Book Your First Appointment
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((apt, i) => {
            const s = STATUS_STYLES[apt.status] || STATUS_STYLES.pending;
            const StatusIcon = s.icon;
            const isUpcoming = apt.status === "confirmed" || apt.status === "pending";

            return (
              <motion.div
                key={apt._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card p-5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                    {apt.avatar}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{apt.doctorName}</p>
                        <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{apt.specialty}</p>
                      </div>
                      {/* Status badge */}
                      <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${s.bg} ${s.text}`}>
                        <StatusIcon size={12} />
                        {s.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <FiCalendar size={13} />
                        {apt.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FiClock size={13} />
                        {apt.timeSlot}
                      </span>
                      <span className="flex items-center gap-1.5">
                        {apt.type === "video" ? <FiVideo size={13} /> : <FiUser size={13} />}
                        {apt.type === "video" ? "Video Call" : "In-Person"}
                      </span>
                    </div>

                    {apt.symptoms && (
                      <p className="mt-2 text-xs text-gray-400 dark:text-slate-500 truncate">
                        📝 {apt.symptoms}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                      <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">
                        Ref: {apt.confirmationId}
                      </span>
                      {isUpcoming && apt.type === "video" && (
                        <Link
                          to={`/video-call/${apt._id}`}
                          className="text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <FiVideo size={11} /> Join Call
                        </Link>
                      )}
                      {isUpcoming && apt.type === "in-person" && (
                        <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg">
                          Visit Clinic
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
