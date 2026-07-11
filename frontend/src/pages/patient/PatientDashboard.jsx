import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import {
  FiCalendar, FiFileText, FiActivity, FiHeart, FiAlertCircle,
  FiArrowRight, FiClock, FiCheckCircle, FiUser, FiVideo
} from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";

const healthData = [
  { month: "Jan", bp: 120, sugar: 95, weight: 72 },
  { month: "Feb", bp: 118, sugar: 98, weight: 71 },
  { month: "Mar", bp: 122, sugar: 92, weight: 73 },
  { month: "Apr", bp: 115, sugar: 88, weight: 70 },
  { month: "May", bp: 119, sugar: 94, weight: 71 },
  { month: "Jun", bp: 117, sugar: 90, weight: 70 },
];

const appointments = [
  { id: 1, doctor: "Dr. Sarah Johnson", specialty: "Cardiologist", date: "Today, 3:00 PM", type: "video", status: "upcoming", avatar: "SJ" },
  { id: 2, doctor: "Dr. Michael Chen",  specialty: "Neurologist",  date: "Jun 28, 10:00 AM", type: "in-person", status: "upcoming", avatar: "MC" },
  { id: 3, doctor: "Dr. Emily Davis",   specialty: "Dermatologist", date: "Jun 20, 2:00 PM", type: "video", status: "completed", avatar: "ED" },
];

const quickActions = [
  { to: "/doctors",          icon: FiUser,        label: "Find Doctor",    color: "bg-blue-100 text-blue-600" },
  { to: "/lab-tests",        icon: FiActivity,    label: "Book Lab Test",  color: "bg-green-100 text-green-600" },
  { to: "/upload-reports",   icon: FiFileText,    label: "Upload Report",  color: "bg-purple-100 text-purple-600" },
  { to: "/emergency",        icon: FiAlertCircle, label: "Emergency",      color: "bg-red-100 text-red-600" },
];

const vitals = [
  { label: "Blood Pressure", value: "117/78", unit: "mmHg", icon: "❤️", status: "normal", trend: "↓ 2%" },
  { label: "Blood Sugar",    value: "90",     unit: "mg/dL", icon: "🩸", status: "normal", trend: "↓ 4%" },
  { label: "Heart Rate",     value: "72",     unit: "bpm",   icon: "💓", status: "normal", trend: "→ 0%" },
  { label: "Weight",         value: "70",     unit: "kg",    icon: "⚖️", status: "normal", trend: "↓ 1%" },
];

const pieData = [
  { name: "Completed", value: 12, color: "#00A86B" },
  { name: "Upcoming",  value: 3,  color: "#0066CC" },
  { name: "Cancelled", value: 1,  color: "#EF4444" },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function PatientDashboard() {
  const { user } = useAuthStore();

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            Good morning, {user?.name?.split(" ")[0] || "Patient"} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's your health overview for today</p>
        </div>
        <Link to="/book-appointment/new" className="btn-primary gap-2 self-start sm:self-auto">
          <FiCalendar size={16} /> Book Appointment
        </Link>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Appointments", value: "16", icon: FiCalendar, color: "bg-blue-50 text-blue-600",   change: "+2 this month" },
          { label: "Medical Records",    value: "8",  icon: FiFileText, color: "bg-green-50 text-green-600", change: "Last updated 2d ago" },
          { label: "Prescriptions",      value: "3",  icon: FiActivity, color: "bg-purple-50 text-purple-600",change: "2 active" },
          { label: "Lab Tests",          value: "5",  icon: FiHeart,    color: "bg-orange-50 text-orange-600",change: "1 pending" },
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

      {/* Quick Actions */}
      <motion.div variants={fadeUp}>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((a) => (
            <Link key={a.to} to={a.to}
              className="card p-4 flex flex-col items-center gap-2 hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 text-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${a.color}`}>
                <a.icon size={22} />
              </div>
              <span className="text-xs font-medium text-gray-700">{a.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Health Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-semibold text-gray-900">Health Trends</h2>
              <p className="text-xs text-gray-500 mt-0.5">Last 6 months overview</p>
            </div>
            <select className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 outline-none">
              <option>Blood Pressure</option>
              <option>Blood Sugar</option>
              <option>Weight</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={healthData}>
              <defs>
                <linearGradient id="bpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066CC" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0066CC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" }} />
              <Area type="monotone" dataKey="bp" stroke="#0066CC" strokeWidth={2.5} fill="url(#bpGrad)" dot={{ fill: "#0066CC", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Appointment stats pie */}
        <motion.div variants={fadeUp} className="card p-6">
          <h2 className="font-heading font-semibold text-gray-900 mb-1">Appointments</h2>
          <p className="text-xs text-gray-500 mb-4">All time summary</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Vitals */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Latest Vitals</h2>
          <Link to="/medical-records" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
            View all <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {vitals.map((v) => (
            <div key={v.label} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{v.icon}</span>
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">{v.trend}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{v.value} <span className="text-sm font-normal text-gray-400">{v.unit}</span></p>
              <p className="text-xs text-gray-500 mt-0.5">{v.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Upcoming Appointments */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Appointments</h2>
          <Link to="/doctors" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
            Book new <FiArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {appointments.map((apt) => (
            <div key={apt.id} className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-hero flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {apt.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{apt.doctor}</p>
                <p className="text-xs text-gray-500">{apt.specialty}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <FiClock size={11} /> {apt.date}
                  </span>
                  <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                    apt.type === "video" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                  }`}>
                    {apt.type === "video" ? <FiVideo size={10} /> : <FiUser size={10} />}
                    {apt.type === "video" ? "Video" : "In-person"}
                  </span>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                apt.status === "upcoming" ? "bg-primary-100 text-primary-700" : "bg-green-100 text-green-700"
              }`}>
                {apt.status === "upcoming" ? "Upcoming" : <span className="flex items-center gap-1"><FiCheckCircle size={11} /> Done</span>}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
