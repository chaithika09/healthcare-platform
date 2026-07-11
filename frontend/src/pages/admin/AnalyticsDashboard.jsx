import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const monthlyData = [
  { month: "Jan", revenue: 12000, appointments: 320, newUsers: 120 },
  { month: "Feb", revenue: 18000, appointments: 480, newUsers: 180 },
  { month: "Mar", revenue: 15000, appointments: 410, newUsers: 150 },
  { month: "Apr", revenue: 22000, appointments: 590, newUsers: 240 },
  { month: "May", revenue: 28000, appointments: 720, newUsers: 310 },
  { month: "Jun", revenue: 32000, appointments: 850, newUsers: 420 },
];

const appointmentTypes = [
  { name: "Video Call",  value: 58, color: "#0066CC" },
  { name: "In-Person",   value: 42, color: "#00A86B" },
];

const topDoctors = [
  { name: "Dr. Sarah Johnson", specialty: "Cardiologist", appointments: 312, rating: 4.9, revenue: 46800 },
  { name: "Dr. James Wilson",  specialty: "Pediatrician", appointments: 421, rating: 4.9, revenue: 42100 },
  { name: "Dr. Priya Sharma",  specialty: "Gynecologist", appointments: 298, rating: 4.8, revenue: 41720 },
  { name: "Dr. Michael Chen",  specialty: "Neurologist",  appointments: 245, rating: 4.8, revenue: 44100 },
  { name: "Dr. Emily Davis",   specialty: "Dermatologist",appointments: 189, rating: 4.7, revenue: 22680 },
];

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState("6m");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Platform performance metrics</p>
        </div>
        <div className="flex gap-2">
          {["1m", "3m", "6m", "1y"].map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${period === p ? "bg-primary-500 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue",    value: "$127K", change: "+18%", positive: true },
          { label: "Total Appointments",value: "3,370", change: "+24%", positive: true },
          { label: "New Users",        value: "1,420", change: "+31%", positive: true },
          { label: "Avg. Rating",      value: "4.8★",  change: "+0.1", positive: true },
        ].map((k) => (
          <div key={k.label} className="card p-5">
            <p className="text-2xl font-bold text-gray-900">{k.value}</p>
            <p className="text-sm text-gray-600 mt-0.5">{k.label}</p>
            <span className={`text-xs font-medium mt-1 inline-block ${k.positive ? "text-green-600" : "text-red-500"}`}>
              {k.change} vs prev period
            </span>
          </div>
        ))}
      </div>

      {/* Revenue & Appointments */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-heading font-semibold text-gray-900 mb-5">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066CC" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0066CC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" }} formatter={(v) => [`$${v.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#0066CC" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="font-heading font-semibold text-gray-900 mb-5">Appointments & Users</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: "12px" }} />
              <Bar dataKey="appointments" fill="#0066CC" radius={[4, 4, 0, 0]} />
              <Bar dataKey="newUsers" fill="#00A86B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Appointment types & Top doctors */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="font-heading font-semibold text-gray-900 mb-4">Consultation Types</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={appointmentTypes} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                {appointmentTypes.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {appointmentTypes.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-bold text-gray-900">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 card p-6">
          <h2 className="font-heading font-semibold text-gray-900 mb-4">Top Performing Doctors</h2>
          <div className="space-y-3">
            {topDoctors.map((doc, i) => (
              <div key={doc.name} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
                <div className="w-9 h-9 rounded-full bg-gradient-hero flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {doc.name.split(" ").map((n) => n[0]).join("").slice(1, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.specialty}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">${(doc.revenue / 1000).toFixed(1)}k</p>
                  <p className="text-xs text-gray-500">{doc.appointments} appts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
