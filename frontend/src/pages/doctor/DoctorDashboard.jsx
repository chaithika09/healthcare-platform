import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import { FiCalendar, FiUsers, FiStar, FiTrendingUp, FiClock, FiVideo, FiUser, FiArrowRight } from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";

const weeklyData = [
  { day: "Mon", appointments: 8, patients: 7 },
  { day: "Tue", appointments: 12, patients: 10 },
  { day: "Wed", appointments: 6, patients: 6 },
  { day: "Thu", appointments: 15, patients: 13 },
  { day: "Fri", appointments: 10, patients: 9 },
  { day: "Sat", appointments: 4, patients: 4 },
  { day: "Sun", appointments: 2, patients: 2 },
];

const revenueData = [
  { month: "Jan", revenue: 4200 }, { month: "Feb", revenue: 5800 },
  { month: "Mar", revenue: 4900 }, { month: "Apr", revenue: 6200 },
  { month: "May", revenue: 7100 }, { month: "Jun", revenue: 6800 },
];

const todayAppointments = [
  { id: 1, patient: "John Smith",    age: 45, time: "9:00 AM",  type: "video",     status: "upcoming", reason: "Follow-up" },
  { id: 2, patient: "Maria Garcia",  age: 32, time: "10:30 AM", type: "in-person", status: "upcoming", reason: "Chest pain" },
  { id: 3, patient: "Robert Lee",    age: 58, time: "11:00 AM", type: "video",     status: "completed",reason: "Hypertension" },
  { id: 4, patient: "Emma Wilson",   age: 28, time: "2:00 PM",  type: "in-person", status: "upcoming", reason: "Annual checkup" },
  { id: 5, patient: "David Brown",   age: 67, time: "3:30 PM",  type: "video",     status: "upcoming", reason: "Medication review" },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function DoctorDashboard() {
  const { user } = useAuthStore();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            Good morning, {user?.name?.split(" ")[0] || "Doctor"} 👨‍⚕️
          </h1>
          <p className="text-gray-500 text-sm mt-1">You have 4 appointments today</p>
        </div>
        <div className="flex gap-3">
          <Link to="/doctor/appointments" className="btn-outline gap-2">
            <FiCalendar size={16} /> Schedule
          </Link>
          <Link to="/chat" className="btn-primary gap-2">
            Messages
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Appointments", value: "8",    icon: FiCalendar,    color: "bg-blue-50 text-blue-600",   change: "+2 from yesterday" },
          { label: "Total Patients",        value: "248",  icon: FiUsers,       color: "bg-green-50 text-green-600", change: "+12 this month" },
          { label: "Average Rating",        value: "4.9",  icon: FiStar,        color: "bg-amber-50 text-amber-600", change: "312 reviews" },
          { label: "Monthly Revenue",       value: "$6.8K",icon: FiTrendingUp,  color: "bg-purple-50 text-purple-600",change: "+8% vs last month" },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color} mb-3`}>
              <s.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-600 font-medium mt-0.5">{s.label}</p>
            <p className="text-xs text-gray-400 mt-1">{s.change}</p>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={fadeUp} className="card p-6">
          <h2 className="font-heading font-semibold text-gray-900 mb-1">Weekly Appointments</h2>
          <p className="text-xs text-gray-500 mb-5">This week's schedule overview</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" }} />
              <Bar dataKey="appointments" fill="#0066CC" radius={[6, 6, 0, 0]} />
              <Bar dataKey="patients" fill="#00A86B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fadeUp} className="card p-6">
          <h2 className="font-heading font-semibold text-gray-900 mb-1">Revenue Trend</h2>
          <p className="text-xs text-gray-500 mb-5">Monthly earnings overview</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" }} formatter={(v) => [`$${v}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="#0066CC" strokeWidth={2.5} dot={{ fill: "#0066CC", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Today's appointments */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Today's Appointments</h2>
          <Link to="/doctor/appointments" className="text-sm text-primary-600 flex items-center gap-1">
            View all <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {todayAppointments.map((apt) => (
                  <tr key={apt.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {apt.patient.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{apt.patient}</p>
                          <p className="text-xs text-gray-400">Age {apt.age}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <FiClock size={12} /> {apt.time}
                      </span>
                    </td>
                    <td>
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${apt.type === "video" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"}`}>
                        {apt.type === "video" ? <FiVideo size={10} /> : <FiUser size={10} />}
                        {apt.type === "video" ? "Video" : "In-person"}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600">{apt.reason}</td>
                    <td>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${apt.status === "upcoming" ? "bg-primary-100 text-primary-700" : "bg-green-100 text-green-700"}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td>
                      {apt.status === "upcoming" ? (
                        apt.type === "video" ? (
                          <Link to={`/video-call/${apt.id}`} className="btn-primary btn-sm gap-1">
                            <FiVideo size={12} /> Join
                          </Link>
                        ) : (
                          <button className="btn-outline btn-sm">Start</button>
                        )
                      ) : (
                        <button className="btn-ghost btn-sm text-gray-500">View</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
