import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiTruck, FiMapPin, FiPhone, FiClock, FiAlertCircle,
  FiCheckCircle, FiRefreshCw, FiExternalLink,
  FiActivity,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuthStore } from "../../store/authStore";
import api from "../../services/api";
import io from "socket.io-client";

const getSocketUrl = () => {
  if (process.env.REACT_APP_SOCKET_URL) return process.env.REACT_APP_SOCKET_URL;
  const host = window.location.hostname;
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host)) return `http://${host}:5000`;
  return "http://localhost:5000";
};

const STATUS_CFG = {
  pending:    { bg: "bg-red-50 dark:bg-red-900/20",     text: "text-red-600",    dot: "bg-red-500",    label: "Pending"    },
  dispatched: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600", dot: "bg-orange-500", label: "Dispatched" },
  arrived:    { bg: "bg-blue-50 dark:bg-blue-900/20",   text: "text-blue-600",   dot: "bg-blue-500",   label: "Arrived"    },
  completed:  { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-600",  dot: "bg-green-500",  label: "Completed"  },
  cancelled:  { bg: "bg-gray-50 dark:bg-slate-800",     text: "text-gray-500",   dot: "bg-gray-400",   label: "Cancelled"  },
};

export default function HospitalDashboard() {
  const { user, token, logout } = useAuthStore();
  const [emergencies,  setEmergencies]  = useState([]);
  const [stats,        setStats]        = useState({ total: 0, todayCount: 0, pending: 0, dispatched: 0, completed: 0 });
  const [hospital,     setHospital]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [updating,     setUpdating]     = useState(null);
  const [filterStatus, setFilter]       = useState("all");
  const [liveAlert,    setLiveAlert]    = useState(null);
  const [activeTab,    setActiveTab]    = useState("emergencies");
  const socketRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [emRes, dashRes] = await Promise.all([
        api.get("/hospital/emergencies"),
        api.get("/hospital/dashboard"),
      ]);
      setEmergencies(emRes.data?.data?.requests || []);
      setStats(dashRes.data?.data?.stats || {});
      setHospital(dashRes.data?.data?.hospital);
    } catch (err) {
      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => { load(); }, [load]);

  /* ── Live socket ── */
  useEffect(() => {
    const socket = io(getSocketUrl(), {
      auth: { token },
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on("ambulance:new-request", (data) => {
      // Play alert sound (browser beep)
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        osc.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch {}

      toast.custom((t) => (
        <div className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-sm w-full bg-red-600 text-white shadow-2xl rounded-2xl p-4 flex items-start gap-3`}>
          <FiAlertCircle size={28} className="flex-shrink-0 mt-0.5 animate-pulse" />
          <div>
            <p className="font-black text-lg">🚨 EMERGENCY ALERT!</p>
            <p className="text-sm text-red-100 mt-0.5 font-semibold">{data.patientName}</p>
            <p className="text-sm text-red-200 font-semibold">{data.emergencyType}</p>
            <p className="text-xs text-red-300 mt-0.5 truncate">📍 {data.location}</p>
          </div>
        </div>
      ), { duration: 10000, position: "top-center" });

      setLiveAlert(data);
      load();
    });

    return () => { socket.disconnect(); };
  }, [token, load]);

  const updateStatus = async (id, status, extra = {}) => {
    setUpdating(id);
    try {
      await api.patch(`/hospital/emergencies/${id}`, { status, ...extra });
      toast.success(`Marked as ${status}`);
      await load();
    } catch {
      toast.error("Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = emergencies.filter(r => filterStatus === "all" || r.status === filterStatus);

  /* ── TOP NAV ── */
  const NavBar = () => (
    <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <span className="text-xl">🏥</span>
        </div>
        <div>
          <p className="font-black text-lg leading-tight">{hospital?.hospitalName || user?.name || "Hospital Portal"}</p>
          <p className="text-red-200 text-xs">{hospital?.city && hospital?.state ? `${hospital.city}, ${hospital.state}` : "Emergency Response Center"}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-red-200">Logged in as</p>
          <p className="text-sm font-bold">{user?.name}</p>
        </div>
        <button onClick={logout}
          className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl font-semibold transition-colors">
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col">
      <NavBar />

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-5">

        {/* ── Live Alert Banner ── */}
        <AnimatePresence>
          {liveAlert && (
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-red-600 text-white rounded-2xl p-5 flex items-center gap-4 shadow-xl">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse">
                <FiTruck size={26} />
              </div>
              <div className="flex-1">
                <p className="font-black text-xl">🚨 NEW EMERGENCY REQUEST!</p>
                <p className="text-red-100 font-semibold">{liveAlert.patientName} · {liveAlert.emergencyType}</p>
                <p className="text-red-200 text-sm mt-0.5">📍 {liveAlert.location}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {liveAlert.mapsLink && (
                  <a href={liveAlert.mapsLink} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 bg-white text-red-600 font-bold px-4 py-2 rounded-xl text-sm">
                    <FiMapPin size={14} /> Maps
                  </a>
                )}
                {liveAlert.patientPhone && (
                  <a href={`tel:${liveAlert.patientPhone}`}
                    className="flex items-center gap-1 bg-white/20 text-white font-bold px-4 py-2 rounded-xl text-sm">
                    <FiPhone size={14} /> Call
                  </a>
                )}
                <button onClick={() => setLiveAlert(null)}
                  className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold">
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total Requests", value: stats.total,      icon: FiActivity, color: "text-gray-700",   bg: "bg-white" },
            { label: "Today",          value: stats.todayCount, icon: FiClock,    color: "text-blue-600",   bg: "bg-blue-50" },
            { label: "Pending 🔴",     value: stats.pending,    icon: FiAlertCircle, color: "text-red-600", bg: "bg-red-50" },
            { label: "Dispatched 🟠",  value: stats.dispatched, icon: FiTruck,    color: "text-orange-600", bg: "bg-orange-50" },
            { label: "Completed 🟢",   value: stats.completed,  icon: FiCheckCircle, color: "text-green-600", bg: "bg-green-50" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-gray-100 dark:border-slate-700 shadow-sm`}>
              <p className={`text-3xl font-black ${s.color}`}>{s.value ?? 0}</p>
              <p className="text-xs text-gray-500 font-semibold mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex gap-1 bg-white dark:bg-slate-900 rounded-2xl p-1.5 border border-gray-100 dark:border-slate-700 w-fit shadow-sm">
          {[
            { id: "emergencies", label: "🚨 Emergency Requests", count: stats.pending },
            { id: "profile",     label: "🏥 Hospital Profile" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-red-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
              }`}>
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs rounded-full px-1.5 font-bold ${
                  activeTab === tab.id ? "bg-white/30 text-white" : "bg-red-100 text-red-600"
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
          <button onClick={load} className="px-3 py-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <FiRefreshCw size={16} />
          </button>
        </div>

        {/* ── EMERGENCY REQUESTS TAB ── */}
        {activeTab === "emergencies" && (
          <>
            {/* Filter chips */}
            <div className="flex gap-2 flex-wrap">
              {["all", "pending", "dispatched", "arrived", "completed", "cancelled"].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                    filterStatus === s
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 hover:border-red-300"
                  }`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                  {s !== "all" && stats[s] > 0 && (
                    <span className="ml-1.5 text-xs bg-red-500 text-white rounded-full px-1.5">{stats[s]}</span>
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-gray-100 dark:border-slate-700">
                <FiCheckCircle size={48} className="text-green-400 mx-auto mb-4" />
                <p className="font-bold text-gray-700 dark:text-white text-xl">All Clear!</p>
                <p className="text-gray-400 text-sm mt-2">No {filterStatus !== "all" ? filterStatus : ""} emergency requests</p>
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
                      className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border-l-4 shadow-sm border border-gray-100 dark:border-slate-700 ${
                        req.status === "pending"    ? "border-l-red-500" :
                        req.status === "dispatched" ? "border-l-orange-500" :
                        req.status === "arrived"    ? "border-l-blue-500" :
                        req.status === "completed"  ? "border-l-green-500" : "border-l-gray-300"
                      }`}>

                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0 ${
                          req.status === "pending"    ? "bg-red-500" :
                          req.status === "dispatched" ? "bg-orange-500" :
                          req.status === "arrived"    ? "bg-blue-500" :
                          req.status === "completed"  ? "bg-green-500" : "bg-gray-400"
                        }`}>
                          {(req.patientName || "P").charAt(0)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <p className="font-black text-gray-900 dark:text-white text-lg">{req.patientName || "Unknown"}</p>
                              <p className="text-red-600 dark:text-red-400 font-bold">{req.emergencyType}</p>
                            </div>
                            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-gray-500 dark:text-slate-400 mt-2">
                            <span className="flex items-center gap-1.5 max-w-sm truncate">
                              <FiMapPin size={13} /> {req.location}
                            </span>
                            {req.patientPhone && (
                              <a href={`tel:${req.patientPhone}`}
                                className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold hover:underline">
                                <FiPhone size={13} /> {req.patientPhone}
                              </a>
                            )}
                            <span className="flex items-center gap-1.5">
                              <FiClock size={13} /> {new Date(req.createdAt).toLocaleString("en-IN")}
                            </span>
                          </div>

                          {req.notes && (
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 italic bg-gray-50 dark:bg-slate-800 rounded-xl px-3 py-2">
                              📝 {req.notes}
                            </p>
                          )}

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 mt-4">
                            <a href={maps} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 text-sm font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 px-4 py-2 rounded-xl transition-colors">
                              <FiExternalLink size={14} /> Open Maps
                            </a>

                            {req.patientPhone && (
                              <a href={`tel:${req.patientPhone}`}
                                className="flex items-center gap-1.5 text-sm font-bold text-green-700 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 px-4 py-2 rounded-xl transition-colors">
                                <FiPhone size={14} /> Call Patient
                              </a>
                            )}

                            {req.status === "pending" && (
                              <button disabled={updating === req._id}
                                onClick={() => updateStatus(req._id, "dispatched", { assignedUnit: "Ambulance-1", eta: "8–12 minutes" })}
                                className="flex items-center gap-1.5 text-sm font-black text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl transition-colors disabled:opacity-60">
                                {updating === req._id
                                  ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                                  : <FiTruck size={14} />}
                                Dispatch Ambulance
                              </button>
                            )}

                            {req.status === "dispatched" && (
                              <button disabled={updating === req._id}
                                onClick={() => updateStatus(req._id, "arrived")}
                                className="flex items-center gap-1.5 text-sm font-black text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl transition-colors disabled:opacity-60">
                                <FiCheckCircle size={14} /> Mark Arrived
                              </button>
                            )}

                            {req.status === "arrived" && (
                              <button disabled={updating === req._id}
                                onClick={() => updateStatus(req._id, "completed")}
                                className="flex items-center gap-1.5 text-sm font-black text-white bg-green-500 hover:bg-green-600 px-4 py-2 rounded-xl transition-colors disabled:opacity-60">
                                <FiCheckCircle size={14} /> Mark Completed
                              </button>
                            )}

                            {["pending", "dispatched"].includes(req.status) && (
                              <button disabled={updating === req._id}
                                onClick={() => updateStatus(req._id, "cancelled")}
                                className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-xl transition-colors">
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
          </>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && hospital && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-3xl">🏥</div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">{hospital.hospitalName}</h2>
                <p className="text-gray-500 text-sm capitalize">{hospital.type} Hospital</p>
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full mt-1 ${
                  hospital.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {hospital.isVerified ? "✅ Verified" : "⏳ Pending Verification"}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: "Reg. Number",      value: hospital.registrationNumber },
                { label: "Emergency Phone",  value: hospital.emergencyPhone || hospital.phone },
                { label: "Address",          value: hospital.address },
                { label: "City / State",     value: `${hospital.city}, ${hospital.state} — ${hospital.pincode}` },
                { label: "Total Beds",       value: hospital.totalBeds || "N/A" },
                { label: "Emergency Beds",   value: hospital.emergencyBeds || "N/A" },
                { label: "Ambulance Fleet",  value: hospital.hasAmbulance ? `Yes — ${hospital.ambulanceCount} units` : "No" },
              ].map(f => (
                <div key={f.label} className="bg-gray-50 dark:bg-slate-800 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{f.label}</p>
                  <p className="text-gray-900 dark:text-white font-semibold mt-0.5">{f.value || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How to use footer hint */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 text-sm text-blue-700 dark:text-blue-300">
          <p className="font-bold mb-1">💡 How this portal works:</p>
          <p>When a patient submits an emergency request, you'll hear an alert and see it appear instantly above. Click <strong>Dispatch Ambulance</strong> to send help — the patient receives a live notification on their phone immediately.</p>
        </div>

      </div>
    </div>
  );
}
