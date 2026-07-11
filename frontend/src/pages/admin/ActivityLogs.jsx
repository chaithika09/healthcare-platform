import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiActivity, FiUser, FiShield, FiCreditCard, FiAlertCircle, FiDownload } from "react-icons/fi";

const logs = [
  { id: 1, type: "auth",    action: "User Login",           user: "john@email.com",  ip: "192.168.1.1",  time: "2024-06-27 09:15:32", status: "success" },
  { id: 2, type: "doctor",  action: "Doctor Approved",      user: "admin@email.com", ip: "10.0.0.1",     time: "2024-06-27 09:10:15", status: "success" },
  { id: 3, type: "payment", action: "Payment Processed",    user: "maria@email.com", ip: "192.168.1.5",  time: "2024-06-27 08:55:44", status: "success" },
  { id: 4, type: "auth",    action: "Failed Login Attempt", user: "unknown",         ip: "203.0.113.1",  time: "2024-06-27 08:30:12", status: "failed" },
  { id: 5, type: "record",  action: "Medical Record Upload",user: "john@email.com",  ip: "192.168.1.1",  time: "2024-06-27 08:20:05", status: "success" },
  { id: 6, type: "system",  action: "Database Backup",      user: "system",          ip: "localhost",    time: "2024-06-27 02:00:00", status: "success" },
  { id: 7, type: "auth",    action: "Password Reset",       user: "emma@email.com",  ip: "192.168.2.10", time: "2024-06-26 18:45:22", status: "success" },
  { id: 8, type: "payment", action: "Refund Issued",        user: "admin@email.com", ip: "10.0.0.1",     time: "2024-06-26 16:30:11", status: "success" },
];

const typeConfig = {
  auth:    { icon: FiShield,      color: "bg-blue-100 text-blue-600" },
  doctor:  { icon: FiUser,        color: "bg-green-100 text-green-600" },
  payment: { icon: FiCreditCard,  color: "bg-purple-100 text-purple-600" },
  record:  { icon: FiActivity,    color: "bg-orange-100 text-orange-600" },
  system:  { icon: FiAlertCircle, color: "bg-gray-100 text-gray-600" },
};

export default function ActivityLogs() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = logs.filter((l) => {
    const matchSearch = l.action.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || l.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Activity Logs</h1>
          <p className="text-gray-500 text-sm mt-1">System audit trail and security events</p>
        </div>
        <button className="btn-outline gap-2 self-start">
          <FiDownload size={16} /> Export Logs
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input w-auto">
          <option value="all">All Types</option>
          <option value="auth">Authentication</option>
          <option value="doctor">Doctor</option>
          <option value="payment">Payment</option>
          <option value="record">Records</option>
          <option value="system">System</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Event</th>
                <th>User</th>
                <th>IP Address</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => {
                const config = typeConfig[log.type];
                return (
                  <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                          <config.icon size={14} />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{log.action}</span>
                      </div>
                    </td>
                    <td className="text-sm text-gray-600">{log.user}</td>
                    <td className="text-sm text-gray-500 font-mono">{log.ip}</td>
                    <td className="text-xs text-gray-500">{log.time}</td>
                    <td>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${log.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {log.status}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
