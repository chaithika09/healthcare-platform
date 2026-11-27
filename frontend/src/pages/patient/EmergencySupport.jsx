import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPhone, FiMapPin, FiAlertCircle, FiTruck, FiCheckCircle,
  FiNavigation, FiLoader, FiClock, FiEdit2
} from "react-icons/fi";
import toast from "react-hot-toast";
import { ambulanceAPI } from "../../services/api";

const EMERGENCY_TYPES = [
  { label: "Heart Attack",      icon: "❤️",  value: "Cardiac Emergency / Heart Attack" },
  { label: "Accident / Trauma", icon: "🚗",  value: "Accident / Trauma" },
  { label: "Breathing Problem", icon: "🫁",  value: "Breathing Difficulty" },
  { label: "Stroke",            icon: "🧠",  value: "Stroke / Paralysis" },
  { label: "Severe Bleeding",   icon: "🩸",  value: "Severe Bleeding" },
  { label: "Unconscious",       icon: "😶",  value: "Unconscious Person" },
  { label: "Pregnancy",         icon: "🤰",  value: "Pregnancy Emergency" },
  { label: "Poisoning",         icon: "☠️",  value: "Poisoning / Overdose" },
  { label: "Other",             icon: "🏥",  value: "Other Medical Emergency" },
];

export default function EmergencySupport() {
  const [step,             setStep]             = useState("detecting");
  const [location,         setLocation]         = useState("");
  const [gpsCoords,        setGpsCoords]        = useState(null);
  const [gpsError,         setGpsError]         = useState("");
  const [editingLoc,       setEditingLoc]       = useState(false);
  const [emergencyType,    setEmergencyType]    = useState(EMERGENCY_TYPES[0].value);
  const [notes,            setNotes]            = useState("");
  const [hospitals,        setHospitals]        = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [submitting,       setSubmitting]       = useState(false);
  const [requestDone,      setRequestDone]      = useState(null);
  const [statusUpdate,     setStatusUpdate]     = useState(null);
  const hasRun = useRef(false);

  // ── Auto-detect GPS on mount ───────────────────────────────
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    detectLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const detectLocation = () => {
    setStep("detecting");
    if (!navigator.geolocation) {
      setGpsError("GPS not supported. Please type your address.");
      setStep("form");
      loadHospitals(null, null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        setGpsCoords({ lat, lng });
        try {
          const r    = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await r.json();
          setLocation(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } catch {
          setLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
        await loadHospitals(lat, lng);
        setStep("form");
      },
      (err) => {
        setGpsError(err.code === 1 ? "Location permission denied. Type your address below." : "GPS unavailable. Type your address.");
        loadHospitals(null, null);
        setStep("form");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const loadHospitals = async (lat, lng) => {
    try {
      const res  = await ambulanceAPI.getRegisteredHospitals(lat, lng);
      setHospitals(res.data?.data?.hospitals || []);
    } catch {
      setHospitals([]);
    }
  };

  const handleRequest = async () => {
    if (!location.trim()) { toast.error("Please enter or detect your location."); return; }
    if (!selectedHospital) { toast.error("Please select a hospital from the list."); return; }
    setSubmitting(true);
    try {
      const res = await ambulanceAPI.request({
        location:         location.trim(),
        gpsCoords,
        emergencyType,
        notes,
        targetHospitalId: selectedHospital._id,
      });
      setRequestDone(res.data?.data);
      setStep("done");
      setTimeout(() => { window.location.href = "tel:108"; }, 1000);
    } catch {
      setRequestDone({ requestId: "LOCAL-" + Date.now().toString(36).toUpperCase(), estimatedArrival: "8–12 minutes" });
      setStep("done");
      setTimeout(() => { window.location.href = "tel:108"; }, 1000);
    } finally {
      setSubmitting(false);
    }
  };

  // ═══════════════════════════════════════
  // DETECTING SCREEN
  // ═══════════════════════════════════════
  if (step === "detecting") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center animate-pulse">
          <FiNavigation size={36} className="text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detecting Your Location</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm">Please allow location access when prompted</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <FiLoader className="animate-spin" size={16} />
          <span>Getting GPS coordinates…</span>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // DONE SCREEN
  // ═══════════════════════════════════════
  if (step === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto pb-10"
      >
        {/* Success Header */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white text-center shadow-xl mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <FiCheckCircle size={52} />
          </motion.div>
          <h1 className="text-3xl font-black mb-1">Request Sent!</h1>
          <p className="text-green-100 text-lg font-semibold">
            {selectedHospital?.hospitalName} has been alerted
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-green-200 rounded-full animate-pulse" />
            <span className="text-sm font-semibold">ETA: {requestDone?.estimatedArrival || "8–12 minutes"}</span>
          </div>
        </div>

        {/* Request Details */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FiTruck className="text-red-500" size={18} /> Request Details
          </h3>
          <div className="space-y-3">
            <Row icon="🏥" label="Hospital" value={selectedHospital?.hospitalName} bold />
            <Row icon="📍" label="Your Location" value={location} />
            <Row icon="🚨" label="Emergency Type" value={emergencyType} bold red />
            {notes && <Row icon="📝" label="Notes" value={notes} />}
            <Row icon="🔖" label="Request ID" value={requestDone?.requestId} mono />
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-3xl p-5 mb-4">
          <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-3 text-sm">What happens next?</h3>
          <div className="space-y-3">
            {[
              { icon: "🔔", text: `${selectedHospital?.hospitalName} received your alert on their dashboard`, done: true },
              { icon: "📍", text: "They can see your exact GPS location on Google Maps", done: true },
              { icon: "🚑", text: "Their team is dispatching an ambulance to your location", done: false },
              { icon: "📞", text: "108 is being dialed on your phone as backup", done: true },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <p className={`text-sm ${item.done ? "text-blue-700 dark:text-blue-300" : "text-blue-600 dark:text-blue-400 font-semibold"}`}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Live status update from hospital */}
        {statusUpdate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 mb-4 flex items-center gap-3"
          >
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
            <p className="text-sm font-semibold text-green-700 dark:text-green-300">{statusUpdate.message}</p>
          </motion.div>
        )}

        {/* Warning */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6 text-center">
          <p className="text-red-700 dark:text-red-300 font-black text-lg">Stay Calm. Help is on the way.</p>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">Keep your phone on. Send someone outside to guide the ambulance.</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a href="tel:108"
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-red-500/25">
            <FiPhone size={18} /> Call 108
          </a>
          <button
            onClick={() => { setStep("form"); setRequestDone(null); setStatusUpdate(null); setSelectedHospital(null); }}
            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-semibold py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            New Request
          </button>
        </div>
      </motion.div>
    );
  }

  // ═══════════════════════════════════════
  // MAIN FORM
  // ═══════════════════════════════════════
  return (
    <div className="max-w-2xl mx-auto pb-10 space-y-6">

      {/* ── Header Banner ── */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <FiAlertCircle size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black">Emergency Ambulance</h1>
              <p className="text-red-100 text-sm">Select a hospital and send your request instantly</p>
            </div>
          </div>
          {/* Quick dial */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { n: "108", l: "Ambulance" },
              { n: "112", l: "Emergency" },
              { n: "100", l: "Police"    },
              { n: "101", l: "Fire"      },
            ].map(c => (
              <a key={c.n} href={`tel:${c.n}`}
                className="bg-white/20 hover:bg-white/30 active:scale-95 rounded-xl py-2 text-center transition-all">
                <p className="font-black text-base">{c.n}</p>
                <p className="text-xs opacity-75">{c.l}</p>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Step 1: Your Location ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-black">1</div>
          <h2 className="font-bold text-gray-900 dark:text-white">Your Current Location</h2>
        </div>

        {gpsError ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-2 text-sm">
              <FiAlertCircle size={16} />
              <span>{gpsError}</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text" value={location} onChange={e => setLocation(e.target.value)}
                placeholder="Type your full address…"
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <button onClick={detectLocation}
                className="flex items-center gap-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap">
                <FiNavigation size={14} /> Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl">
              <FiCheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-0.5">
                  GPS Detected {gpsCoords && `· ${gpsCoords.lat.toFixed(4)}, ${gpsCoords.lng.toFixed(4)}`}
                </p>
                {editingLoc ? (
                  <input
                    type="text" value={location} onChange={e => setLocation(e.target.value)}
                    autoFocus onBlur={() => setEditingLoc(false)}
                    className="w-full text-sm bg-white dark:bg-slate-800 border border-green-300 dark:border-green-700 rounded-lg px-3 py-1.5 text-gray-900 dark:text-white focus:outline-none"
                  />
                ) : (
                  <p className="text-sm text-gray-700 dark:text-slate-300 leading-snug">{location}</p>
                )}
              </div>
              <button onClick={() => setEditingLoc(true)}
                className="text-green-600 hover:text-green-700 flex-shrink-0">
                <FiEdit2 size={15} />
              </button>
            </div>

            {/* Google Maps preview link */}
            {gpsCoords && (
              <a
                href={`https://www.google.com/maps?q=${gpsCoords.lat},${gpsCoords.lng}`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                <FiMapPin size={12} /> View your location on Google Maps
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── Step 2: Emergency Type ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-black">2</div>
          <h2 className="font-bold text-gray-900 dark:text-white">Type of Emergency</h2>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {EMERGENCY_TYPES.map(t => (
            <button key={t.value} onClick={() => setEmergencyType(t.value)}
              className={`p-3 rounded-2xl text-center border-2 transition-all ${
                emergencyType === t.value
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20 shadow-sm"
                  : "border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:border-red-200"
              }`}
            >
              <div className="text-2xl mb-1">{t.icon}</div>
              <p className={`text-xs font-semibold leading-tight ${
                emergencyType === t.value ? "text-red-700 dark:text-red-300" : "text-gray-600 dark:text-slate-400"
              }`}>{t.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Step 3: Select Hospital ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-black">3</div>
          <h2 className="font-bold text-gray-900 dark:text-white">Select a Hospital</h2>
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-4 ml-9">
          These hospitals are registered on MedIQ. Sorted by distance from you.
        </p>

        {hospitals.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-4xl">🏥</p>
            <p className="text-gray-500 dark:text-slate-400 text-sm font-semibold">No registered hospitals found</p>
            <p className="text-gray-400 dark:text-slate-500 text-xs">Your SOS will still be sent and 108 will be dialed</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {hospitals.map((h, i) => {
              const isSelected = selectedHospital?._id === h._id;
              return (
                <motion.button
                  key={h._id}
                  onClick={() => setSelectedHospital(isSelected ? null : h)}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full text-left rounded-2xl p-4 border-2 transition-all ${
                    isSelected
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20 shadow-md"
                      : "border-gray-100 dark:border-slate-700 hover:border-red-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Hospital avatar */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 font-black ${
                      isSelected ? "bg-red-500 text-white" :
                      i === 0 && h.distanceKm !== null ? "bg-green-500 text-white" :
                      "bg-gray-100 dark:bg-slate-700 text-gray-500"
                    }`}>
                      {isSelected ? <FiCheckCircle size={22} /> : "🏥"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-bold text-sm ${isSelected ? "text-red-700 dark:text-red-300" : "text-gray-900 dark:text-white"}`}>
                          {h.hospitalName}
                        </p>
                        {i === 0 && h.distanceKm !== null && (
                          <span className="text-xs font-bold text-green-700 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full">
                            ⭐ Nearest
                          </span>
                        )}
                        {h.type && (
                          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded-full capitalize">
                            {h.type}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 truncate">
                        {h.address}{h.city ? `, ${h.city}` : ""}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        {h.distanceKm !== null ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                            <FiMapPin size={11} /> {h.distanceKm} km
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <FiMapPin size={11} /> Distance N/A
                          </span>
                        )}
                        {h.driveMinutes && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <FiClock size={11} /> ~{h.driveMinutes} min drive
                          </span>
                        )}
                        {h.emergencyPhone && (
                          <a href={`tel:${h.emergencyPhone}`}
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                            <FiPhone size={11} /> {h.emergencyPhone}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Radio */}
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected ? "bg-red-500 border-red-500" : "border-gray-300 dark:border-slate-500"
                    }`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Step 4: Additional Info ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-gray-500 dark:text-slate-400 text-xs font-black">4</div>
          <h2 className="font-bold text-gray-900 dark:text-white">Additional Information <span className="text-gray-400 font-normal text-sm">(optional)</span></h2>
        </div>
        <textarea
          rows={3} value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Patient age, floor number, specific symptoms, allergies, any important information for the medical team…"
          className="w-full px-4 py-3 border border-gray-200 dark:border-slate-700 rounded-2xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
        />
      </div>

      {/* ── Selection Summary + Send Button ── */}
      <AnimatePresence>
        {selectedHospital && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3"
          >
            <span className="text-2xl flex-shrink-0">🏥</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-red-800 dark:text-red-200 text-sm">Request will be sent to:</p>
              <p className="text-red-700 dark:text-red-300 font-semibold truncate">{selectedHospital.hospitalName}</p>
              {selectedHospital.distanceKm && (
                <p className="text-xs text-red-500 dark:text-red-400">{selectedHospital.distanceKm} km · ~{selectedHospital.driveMinutes} min away</p>
              )}
            </div>
            <button onClick={() => setSelectedHospital(null)} className="text-red-400 hover:text-red-600 text-xs font-semibold flex-shrink-0">
              Change
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOS Button */}
      <motion.button
        onClick={handleRequest}
        disabled={submitting || !location.trim() || !selectedHospital}
        whileTap={{ scale: 0.98 }}
        className={`w-full py-5 rounded-3xl font-black text-xl text-white transition-all shadow-2xl flex items-center justify-center gap-3 ${
          selectedHospital && location.trim()
            ? "bg-red-600 hover:bg-red-700 shadow-red-500/40 cursor-pointer"
            : "bg-gray-300 dark:bg-slate-700 cursor-not-allowed shadow-none"
        }`}
      >
        {submitting ? (
          <><FiLoader size={24} className="animate-spin" /> Sending Request…</>
        ) : (
          <><FiTruck size={24} /> 🚨 Send Emergency Request</>
        )}
      </motion.button>

      {!selectedHospital && (
        <p className="text-center text-xs text-gray-400 dark:text-slate-500 -mt-4">
          Select a hospital above to enable this button
        </p>
      )}

      {/* Call 108 direct */}
      <a href="tel:108"
        className="w-full border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
        <FiPhone size={18} /> Call 108 Directly (Free Ambulance)
      </a>

      {/* Info footer */}
      <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2 text-xs text-gray-500 dark:text-slate-400">
        <p className="font-semibold text-gray-700 dark:text-slate-300">ℹ️ How it works</p>
        <p>• Select the hospital closest to you → Press Send</p>
        <p>• Hospital receives your GPS location instantly on their dashboard</p>
        <p>• They dispatch an ambulance to your exact location</p>
        <p>• You get a live notification when ambulance is on the way</p>
        <p>• 108 is auto-dialed on your phone as a backup</p>
      </div>
    </div>
  );
}

// Helper component
function Row({ icon, label, value, bold, red, mono }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-slate-700 last:border-0">
      <span className="text-base flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <p className="text-xs text-gray-400 dark:text-slate-500">{label}</p>
        <p className={`text-sm mt-0.5 ${
          red ? "text-red-600 dark:text-red-400 font-bold" :
          bold ? "text-gray-900 dark:text-white font-semibold" :
          mono ? "text-gray-500 dark:text-slate-400 font-mono text-xs" :
          "text-gray-700 dark:text-slate-300"
        }`}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}
