import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { FiUsers, FiCalendar, FiDollarSign, FiActivity, FiArrowRight, FiTrendingUp, FiShield, FiAlertCircle } from "react-icons/fi";

const userGrowth = [
  { month: "Jan", patients: 120, doctors: 8 }, { month: "Feb", patients: 180, doctors: 12 },
  { month: "Mar", patients: 240, doctors: 15 }, { month: "Apr", patients: 310, doctors: 18 },
  { month: "May", patients: 420, doctors: 22 }, { month: "Jun", patients: 580, doctors: 28 },
];

const revenueData = [
  { month: "Jan", revenue: 12000 }, { month: "Feb", revenue: 18000 },
  { month: "Mar", revenue: 15000 }, { month: "Apr", revenue: 22000 },
  { month: "May", revenue: 28000 }, { month: "Jun", revenue: 32000 },
];

const specialtyData = [
  { name: "Cardiology",    value: 28, color: "#0066CC" },
  { name: "Neurology",     value: 18, color: "#00A86B" },
  { name: "Dermatology",   value: 15, color: "#F59E0B" },
  { name: "Pediatrics",    value: 22, color: "#8B5CF6" },
  { name: "Other",         value: 17, color: "#94A3B8" },
];

const recentActivity = [
  { type: "user",    message: "New patient registered: John Smith",       time: "2 min ago",  color: "bg-blue-100 text-blue-600" },
  { type: "doctor",  message: "Dr. Emily Davis verified and approved",    time: "15 min ago", color: "bg-green-100 text-green-600" },
  { type: "payment", message: "Payment of $150 received from Maria G.",   time: "1 hr ago",   color: "bg-purple-100 text-purple-600" },
  { type: "alert",   message: "System backup completed successfully",     time: "2 hr ago",   color: "bg-amber-100 text-amber-600" },
  { type: "doctor",  message: "New doctor application: Dr. Robert Kim",   time: "3 hr ago",   color: "bg-orange-100 text-orange-600" },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

export default function AdminDashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Platform overview and management</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/verify-doctors" className="btn-outline gap-2">
            <FiShield size={16} /> Verify Doctors
          </Link>
          <Link to="/admin/analytics" className="btn-primary gap-2">
            <FiActivity size={16} /> Analytics
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users",       value: "10,248", icon: FiUsers,       color: "bg-blue-50 text-blue-600",   change: "+580 this month" },
          { label: "Total Doctors",     value: "248",    icon: FiShield,      color: "bg-green-50 text-green-600", change: "28 pending verification" },
          { label: "Appointments",      value: "3,842",  icon: FiCalendar,    color: "bg-purple-50 text-purple-600",change: "+12% this month" },
          { label: "Monthly Revenue",   value: "$32K",   icon: FiDollarSign,  color: "bg-amber-50 text-amber-600", change: "+15% vs last month" },
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

      {/* Alerts */}
      <motion.div variants={fadeUp} className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Pending Verifications", value: 5,  color: "bg-amber-50 border-amber-200 text-amber-700", icon: FiShield, link: "/admin/verify-doctors" },
          { label: "Support Tickets",       value: 12, color: "bg-red-50 border-red-200 text-red-700",       icon: FiAlertCircle, link: "/help" },
          { label: "System Alerts",         value: 2,  color: "bg-blue-50 border-blue-200 text-blue-700",    icon: FiActivity, link: "/admin/logs" },
        ].map((a) => (
          <Link key={a.label} to={a.link} className={`flex items-center gap-3 p-4 rounded-2xl border ${a.color} hover:shadow-sm transition-all`}>
            <a.icon size={20} />
            <div>
              <p className="font-bold text-lg leading-none">{a.value}</p>
              <p className="text-xs mt-0.5">{a.label}</p>
            </div>
            <FiArrowRight size={14} className="ml-auto" />
          </Link>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} className="lg:col-span-2 card p-6">
          <h2 className="font-heading font-semibold text-gray-900 mb-1">User Growth</h2>
          <p className="text-xs text-gray-500 mb-5">Patients and doctors registered over time</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="patGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066CC" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0066CC" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="docGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A86B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#00A86B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" }} />
              <Area type="monotone" dataKey="patients" stroke="#0066CC" strokeWidth={2} fill="url(#patGrad)" />
              <Area type="monotone" dataKey="doctors"  stroke="#00A86B" strokeWidth={2} fill="url(#docGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fadeUp} className="card p-6">
          <h2 className="font-heading font-semibold text-gray-900 mb-1">Specialties</h2>
          <p className="text-xs text-gray-500 mb-4">Doctor distribution</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={specialtyData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {specialtyData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {specialtyData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-900">{d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Revenue chart */}
      <motion.div variants={fadeUp} className="card p-6">
        <h2 className="font-heading font-semibold text-gray-900 mb-1">Revenue Overview</h2>
        <p className="text-xs text-gray-500 mb-5">Monthly platform revenue</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={revenueData} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" }} formatter={(v) => [`$${v.toLocaleString()}`, "Revenue"]} />
            <Bar dataKey="revenue" fill="#0066CC" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent activity */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
          <Link to="/admin/logs" className="text-sm text-primary-600 flex items-center gap-1">View all <FiArrowRight size={14} /></Link>
        </div>
        <div className="card divide-y divide-gray-50">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${a.color}`}>
                <FiActivity size={14} />
              </div>
              <p className="text-sm text-gray-700 flex-1">{a.message}</p>
              <span className="text-xs text-gray-400 flex-shrink-0">{a.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
