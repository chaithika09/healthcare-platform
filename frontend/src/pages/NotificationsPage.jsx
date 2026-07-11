import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiBell, FiCalendar, FiFileText, FiCreditCard, FiAlertCircle, FiCheckCircle, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

const notifications = [
  { id: 1, type: "appointment", title: "Appointment Reminder",    message: "Your appointment with Dr. Sarah Johnson is tomorrow at 3:00 PM.", time: "2 hours ago",  read: false },
  { id: 2, type: "record",      title: "Lab Results Available",   message: "Your blood test results from June 15 are now available.", time: "5 hours ago",  read: false },
  { id: 3, type: "payment",     title: "Payment Confirmed",       message: "Payment of $150 for consultation has been processed.", time: "1 day ago",   read: false },
  { id: 4, type: "alert",       title: "Medicine Reminder",       message: "Time to take your Amlodipine 5mg.", time: "1 day ago",   read: true },
  { id: 5, type: "appointment", title: "Appointment Confirmed",   message: "Your appointment with Dr. Michael Chen on June 28 is confirmed.", time: "2 days ago",  read: true },
  { id: 6, type: "record",      title: "Prescription Updated",    message: "Dr. Emily Davis has updated your prescription.", time: "3 days ago",  read: true },
];

const typeConfig = {
  appointment: { icon: FiCalendar,    color: "bg-blue-100 text-blue-600" },
  record:      { icon: FiFileText,    color: "bg-green-100 text-green-600" },
  payment:     { icon: FiCreditCard,  color: "bg-purple-100 text-purple-600" },
  alert:       { icon: FiAlertCircle, color: "bg-amber-100 text-amber-600" },
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(notifications);
  const [filter, setFilter] = useState("all");

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const markRead = (id) => {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotif = (id) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = notifs.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-ghost btn-sm gap-1.5 text-primary-600">
            <FiCheckCircle size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "unread", "read"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${filter === f ? "bg-primary-500 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
            {f} {f === "unread" && unreadCount > 0 && `(${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="space-y-2">
        {filtered.map((notif, i) => {
          const config = typeConfig[notif.type];
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => markRead(notif.id)}
              className={`card p-4 flex items-start gap-3 cursor-pointer transition-all hover:shadow-card-hover ${!notif.read ? "border-l-4 border-l-primary-500" : ""}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                <config.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${notif.read ? "text-gray-700" : "text-gray-900"}`}>{notif.title}</p>
                  {!notif.read && <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1.5">{notif.time}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                className="p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
              >
                <FiTrash2 size={14} />
              </button>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBell size={28} className="text-gray-400" />
          </div>
          <p className="text-gray-500">No notifications here</p>
        </div>
      )}
    </div>
  );
}
