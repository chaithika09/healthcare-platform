import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCalendar, FiVideo, FiUser, FiClock, FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const appointments = [
  { id: 1, patient: "John Smith",   age: 45, date: "2024-06-27", time: "9:00 AM",  type: "video",     status: "upcoming",  reason: "Follow-up checkup" },
  { id: 2, patient: "Maria Garcia", age: 32, date: "2024-06-27", time: "10:30 AM", type: "in-person", status: "upcoming",  reason: "Chest pain evaluation" },
  { id: 3, patient: "Robert Lee",   age: 58, date: "2024-06-27", time: "11:00 AM", type: "video",     status: "completed", reason: "Hypertension management" },
  { id: 4, patient: "Emma Wilson",  age: 28, date: "2024-06-28", time: "2:00 PM",  type: "in-person", status: "upcoming",  reason: "Annual checkup" },
  { id: 5, patient: "David Brown",  age: 67, date: "2024-06-28", time: "3:30 PM",  type: "video",     status: "upcoming",  reason: "Medication review" },
  { id: 6, patient: "Lisa Chen",    age: 41, date: "2024-06-29", time: "9:30 AM",  type: "in-person", status: "cancelled", reason: "Skin rash" },
];

const statusColors = {
  upcoming:  "bg-primary-100 text-primary-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function DoctorAppointments() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const filtered = appointments.filter((a) => {
    const matchSearch = a.patient.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || a.status === filter;
    const matchDate = !selectedDate || a.date === selectedDate;
    return matchSearch && matchFilter && matchDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} appointments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input w-auto" />
        <div className="flex gap-2">
          {["all", "upcoming", "completed", "cancelled"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-all capitalize ${filter === f ? "bg-primary-500 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments */}
      <div className="space-y-3">
        {filtered.map((apt, i) => (
          <motion.div key={apt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-hero flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {apt.patient.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{apt.patient}</p>
                <p className="text-xs text-gray-500">Age {apt.age} · {apt.reason}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="flex items-center gap-1 text-gray-500"><FiCalendar size={13} /> {apt.date}</span>
              <span className="flex items-center gap-1 text-gray-500"><FiClock size={13} /> {apt.time}</span>
              <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${apt.type === "video" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>
                {apt.type === "video" ? <FiVideo size={10} /> : <FiUser size={10} />}
                {apt.type === "video" ? "Video" : "In-person"}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[apt.status]}`}>
                {apt.status}
              </span>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              {apt.status === "upcoming" && (
                <>
                  {apt.type === "video" && (
                    <Link to={`/video-call/${apt.id}`} className="btn-primary btn-sm gap-1">
                      <FiVideo size={12} /> Join Call
                    </Link>
                  )}
                  <Link to="/doctor/patients" className="btn-outline btn-sm">
                    View Details
                  </Link>
                </>
              )}
              {apt.status === "completed" && (
                <Link to="/doctor/patients" className="btn-ghost btn-sm text-primary-600">
                  Medical Records
                </Link>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl">📅</span>
          <p className="text-gray-500 mt-4">No appointments found.</p>
        </div>
      )}
    </div>
  );
}
