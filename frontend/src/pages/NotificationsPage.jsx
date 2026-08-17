import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBell, FiCalendar, FiFileText, FiMessageSquare,
  FiAlertCircle, FiCheckCircle, FiTrash2, FiRefreshCw, FiChevronRight
} from "react-icons/fi";
import { notificationAPI } from "../services/api";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const typeConfig = {
  appointment: { icon: FiCalendar,      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",    route: (u) => u?.role === "doctor" ? "/doctor/appointments" : "/appointments" },
  record:      { icon: FiFileText,      color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400", route: () => "/medical-records" },
  message:     { icon: FiMessageSquare, color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",     route: () => "/chat" },
  alert:       { icon: FiAlertCircle,   color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400", route: () => null },
  system:      { icon: FiCheckCircle,   color: "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400",      route: () => null },
  reminder:    { icon: FiAlertCircle,   color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400", route: () => null },
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user }  = useAuthStore();
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

  const handleNotifClick = async (notif) => {
    // Mark as read
    if (!notif.isRead) await markRead(notif._id);

    // Navigate based on type
    const config = typeConfig[notif.type] || typeConfig.system;
    const route  = config.route?.(user);

    // If notification has specific appointment data, go to appointments
    if (notif.data?.appointmentId) {
      const dest = user?.role === "doctor" ? "/doctor/appointments" : "/appointments";
      navigate(dest);
      return;
    }
    if (notif.data?.conversationId) {
      navigate(`/chat/${notif.data.conversationId}`);
      return;
    }
    if (route) navigate(route);
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
                  onClick={() => handleNotifClick(notif)}
                  className={`card p-4 flex items-start gap-3 cursor-pointer transition-all hover:shadow-md dark:bg-slate-900 dark:border-slate-800 ${!notif.isRead ? "border-l-4 border-l-primary-500 bg-primary-50/30 dark:bg-primary-900/10" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${notif.isRead ? "text-gray-700 dark:text-slate-300" : "text-gray-900 dark:text-white"}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">
                      {new Date(notif.createdAt).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {(typeConfig[notif.type]?.route?.(user)) && (
                      <FiChevronRight size={14} className="text-gray-300 dark:text-slate-600" />
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteNotif(notif._id); }}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-300 dark:text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
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
