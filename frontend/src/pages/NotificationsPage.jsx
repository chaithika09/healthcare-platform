import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBell, FiCalendar, FiFileText, FiCreditCard,
  FiAlertCircle, FiCheckCircle, FiTrash2, FiRefreshCw
} from "react-icons/fi";
import { notificationAPI } from "../services/api";
import toast from "react-hot-toast";

const typeConfig = {
  appointment: { icon: FiCalendar,    color: "bg-blue-100 text-blue-600" },
  record:      { icon: FiFileText,    color: "bg-green-100 text-green-600" },
  payment:     { icon: FiCreditCard,  color: "bg-purple-100 text-purple-600" },
  alert:       { icon: FiAlertCircle, color: "bg-amber-100 text-amber-600" },
  message:     { icon: FiBell,        color: "bg-pink-100 text-pink-600" },
  system:      { icon: FiCheckCircle, color: "bg-gray-100 text-gray-600" },
  reminder:    { icon: FiAlertCircle, color: "bg-orange-100 text-orange-600" },
};

export default function NotificationsPage() {
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll();
      setNotifs(res.data.data.notifications || []);
    } catch {
      // API failed — show empty state, not fake data
      setNotifs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch { toast.error("Failed to update"); }
  };

  const markRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifs((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const deleteNotif = async (id) => {
    setNotifs((prev) => prev.filter((n) => n._id !== id));
    toast.success("Notification removed");
  };

  const filtered = notifs.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read")   return  n.isRead;
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? "Loading..." : unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchNotifications} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors" title="Refresh">
            <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-ghost btn-sm gap-1.5 text-primary-600">
              <FiCheckCircle size={14} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "unread", "read"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${filter === f ? "bg-primary-500 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300"}`}>
            {f} {f === "unread" && unreadCount > 0 ? `(${unreadCount})` : ""}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="card p-4 animate-pulse flex gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notifications list */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((notif, i) => {
              const config = typeConfig[notif.type] || typeConfig.system;
              const Icon = config.icon;
              return (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => markRead(notif._id)}
                  className={`card p-4 flex items-start gap-3 cursor-pointer transition-all hover:shadow-card-hover ${!notif.isRead ? "border-l-4 border-l-primary-500" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${notif.isRead ? "text-gray-700" : "text-gray-900"}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1.5">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotif(notif._id); }}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBell size={32} className="text-gray-300" />
          </div>
          <h3 className="font-semibold text-gray-900 text-base">
            {filter === "unread" ? "No unread notifications" :
             filter === "read"   ? "No read notifications" :
             "No notifications yet"}
          </h3>
          <p className="text-gray-400 text-sm mt-1 max-w-xs">
            {filter === "all"
              ? "You're all caught up! Notifications will appear here when you book appointments, receive messages, or get updates."
              : `Switch to "All" to see your notifications.`}
          </p>
        </motion.div>
      )}
    </div>
  );
}
