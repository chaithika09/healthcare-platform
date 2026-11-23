import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTruck, FiMapPin, FiPhone, FiClock, FiAlertCircle,
  FiCheckCircle, FiRefreshCw, FiExternalLink,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { ambulanceAPI } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import io from "socket.io-client";

const STATUS_CFG = {
  pending:    { bg: "bg-red-50 dark:bg-red-900/20",    text: "text-red-600 dark:text-red-400",    dot: "bg-red-500",    label: "Pending"    },
  dispatched: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600 dark:text-orange-400", dot: "bg-orange-500", label: "Dispatched" },
  arrived:    { bg: "bg-blue-50 dark:bg-blue-900/20",  text: "text-blue-600 dark:text-blue-400",  dot: "bg-blue-500",   label: "Arrived"    },
  completed:  { bg: "bg-green-50 dark:bg-green-900/20",text: "text-green-600 dark:text-green-400",dot: "bg-green-500",  label: "Completed"  },
  cancelled:  { bg: "bg-gray-50 dark:bg-slate-800",    text: "text-gray-500 dark:text-slate-400", dot: "bg-gray-400",   label: "Cancelled"  },
};

// eslint-disable-next-line no-unused-vars
const STATUS_FLOW = ["pending", "dispatched", "arrived", "completed"];

export default function EmergencyDashboard() {
  const { token } = useAuthStore();
  const [requests,  setRequests]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [selected,  setSelected]  = useState(null);
  const [updating,  setUpdating]  = useState(null);
  const [filterStatus, setFilter] = useState("all");
  const [liveAlert, setLiveAlert] = useState(null);
  const socketRef = useRef(null);

  /* ── Load all requests ── */
  const load = useCallback(async () => {
    try {
      const res = await ambulanceAPI.getAllRequests();
      setRequests(res.data?.data?.requests || []);
    } catch {
      toast.error("Could not load emergency requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Socket.io — live alerts ── */
  useEffect(() => {
    const socketUrl = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";
    const socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Emergency dashboard connected to socket");
    });

    // New ambulance request arrives in real-time
    socket.on("ambulance:new-request", (data) => {
      toast.custom((t) => (
        <div className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-sm w-full bg-red-600 text-white shadow-xl rounded-2xl pointer-events-auto flex items-start gap-3 p-4`}>
          <FiAlertCircle size={24} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">🚨 New Ambulance Request!</p>
            <p className="text-sm text-red-100 mt-0.5">{data.patientName} — {data.emergencyType}</p>
            <p className="text-xs text-red-200 mt-0.5 truncate">{data.location}</p>
          </div>
        </div>
      ), { duration: 8000, position: "top-right" });

      setLiveAlert(data);
      load(); // Refresh the list
    });

    // Status update confirmation
    socket.on("ambulance:status-update", () => { load(); });

    return () => { socket.disconnect(); };
  }, [token, load]);

  /* ── Update request status ── */
  const updateStatus = async (id, status, extra = {}) => {
    setUpdating(id);
    try {
      await ambulanceAPI.updateRequest(id, { status, ...extra });
      toast.success(`Request marked as ${status}`);
      setSelected(null);
      await load();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = requests.filter(r => filterStatus === "all" || r.status === filterStatus);

  const counts = {
    pending:    requests.filter(r => r.status === "pending").length,
    dispatched: requests.filter(r => r.status === "dispatched").length,
    arrived:    requests.filter(r => r.status === "arrived").length,
    completed:  requests.filter(r => r.status === "completed").length,
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse inline-block" />
            Emergency Dashboard
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-0.5">Live ambulance request monitoring</p>
        </div>
        <button onClick={load} className="btn-outline gap-2 text-sm">
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Live Alert Banner ── */}
      <AnimatePresence>
        {liveAlert && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-600 text-white rounded-2xl p-4 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
              <FiTruck size={22} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">🚨 Incoming Emergency Request!</p>
              <p className="text-red-100 text-sm">{liveAlert.patientName} · {liveAlert.emergencyType}</p>
              <p className="text-red-200 text-xs mt-0.5 truncate">📍 {liveAlert.location}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {liveAlert.mapsLink && (
                <a href={liveAlert.mapsLink} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 bg-white text-red-600 font-bold px-3 py-1.5 rounded-xl text-xs">
                  <FiMapPin size={12} /> Maps
                </a>
              )}
              <button onClick={() => setLiveAlert(null)}
                className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-xs font-semibold">
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { key: "pending",    icon: "🔴", label: "Pending",    color: "text-red-600" },
          { key: "dispatched", icon: "🟠", label: "Dispatched", color: "text-orange-600" },
          { key: "arrived",    icon: "🔵", label: "Arrived",    color: "text-blue-600" },
          { key: "completed",  icon: "🟢", label: "Completed",  color: "text-green-600" },
        ].map(s => (
          <div key={s.key} className="card p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFilter(filterStatus === s.key ? "all" : s.key)}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className={`text-2xl font-black ${s.color}`}>{counts[s.key]}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", "pending", "dispatched", "arrived", "completed", "cancelled"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              filterStatus === s
                ? "bg-primary-600 text-white"
                : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:border-primary-300"
            }`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== "all" && counts[s] > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5">{counts[s]}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Requests List ── */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <FiCheckCircle size={40} className="text-green-400 mx-auto mb-3" />
          <p className="font-semibold text-gray-900 dark:text-white">No emergency requests</p>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
            {filterStatus === "all" ? "All clear!" : `No ${filterStatus} requests`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req, i) => {
            const cfg  = STATUS_CFG[req.status] || STATUS_CFG.pending;
            const maps = req.gpsCoords?.lat
              ? `https://www.google.com/maps?q=${req.gpsCoords.lat},${req.gpsCoords.lng}`
              : `https://maps.google.com/?q=${encodeURIComponent(req.location)}`;

            return (
              <motion.div key={req._id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`card p-5 border-l-4 ${req.status === "pending" ? "border-l-red-500" : req.status === "dispatched" ? "border-l-orange-500" : req.status === "arrived" ? "border-l-blue-500" : "border-l-green-500"}`}>

                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${
                    req.status === "pending" ? "bg-red-500" :
                    req.status === "dispatched" ? "bg-orange-500" :
                    req.status === "arrived" ? "bg-blue-500" : "bg-green-500"
                  }`}>
                    {(req.patientName || "P").charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{req.patientName || "Unknown Patient"}</p>
                        <p className="text-sm text-red-600 dark:text-red-400 font-semibold mt-0.5">{req.emergencyType}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 max-w-xs truncate">
                        <FiMapPin size={11} /> {req.location}
                      </span>
                      {req.patientPhone && (
                        <a href={`tel:${req.patientPhone}`}
                          className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                          <FiPhone size={11} /> {req.patientPhone}
                        </a>
                      )}
                      <span className="flex items-center gap-1">
                        <FiClock size={11} /> {new Date(req.createdAt).toLocaleString("en-IN")}
                      </span>
                    </div>

                    {req.notes && (
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5 italic">📝 {req.notes}</p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <a href={maps} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 px-3 py-1.5 rounded-xl transition-colors">
                        <FiExternalLink size={12} /> Maps
                      </a>

                      {req.patientPhone && (
                        <a href={`tel:${req.patientPhone}`}
                          className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 px-3 py-1.5 rounded-xl transition-colors">
                          <FiPhone size={12} /> Call Patient
                        </a>
                      )}

                      {req.status === "pending" && (
                        <button
                          disabled={updating === req._id}
                          onClick={() => updateStatus(req._id, "dispatched", { assignedUnit: "Unit-1", eta: "8–12 minutes" })}
                          className="flex items-center gap-1 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-60">
                          <FiTruck size={12} /> Dispatch Unit
                        </button>
                      )}

                      {req.status === "dispatched" && (
                        <button
                          disabled={updating === req._id}
                          onClick={() => updateStatus(req._id, "arrived")}
                          className="flex items-center gap-1 text-xs font-bold text-white bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-60">
                          <FiCheckCircle size={12} /> Mark Arrived
                        </button>
                      )}

                      {req.status === "arrived" && (
                        <button
                          disabled={updating === req._id}
                          onClick={() => updateStatus(req._id, "completed")}
                          className="flex items-center gap-1 text-xs font-bold text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-60">
                          <FiCheckCircle size={12} /> Mark Completed
                        </button>
                      )}

                      {["pending", "dispatched"].includes(req.status) && (
                        <button
                          disabled={updating === req._id}
                          onClick={() => updateStatus(req._id, "cancelled")}
                          className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-xl transition-colors">
                          Cancel
                        </button>
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
