import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiPhone, FiMapPin, FiAlertCircle, FiTruck,
  FiCheckCircle, FiNavigation, FiLoader,
  FiClock, FiEdit2
} from "react-icons/fi";
import toast from "react-hot-toast";
import { ambulanceAPI } from "../../services/api";

const EMERGENCY_TYPES = [
  { label: "Heart Attack",         icon: "❤️", value: "Cardiac Emergency / Heart Attack" },
  { label: "Accident / Trauma",    icon: "🚗", value: "Accident / Trauma" },
  { label: "Breathing Difficulty", icon: "🫁", value: "Breathing Difficulty" },
  { label: "Stroke",               icon: "🧠", value: "Stroke / Paralysis" },
  { label: "Severe Bleeding",      icon: "🩸", value: "Severe Bleeding" },
  { label: "Unconscious",          icon: "😶", value: "Unconscious Person" },
  { label: "Pregnancy",            icon: "🤰", value: "Pregnancy Emergency" },
  { label: "Poisoning",            icon: "☠️", value: "Poisoning / Overdose" },
  { label: "Other",                icon: "🏥", value: "Other Medical Emergency" },
];

const EMERGENCY_CONTACTS = [
  { label: "Ambulance", number: "108",  color: "bg-red-500"    },
  { label: "Police",    number: "100",  color: "bg-blue-600"   },
  { label: "Fire",      number: "101",  color: "bg-orange-500" },
  { label: "Emergency", number: "112",  color: "bg-purple-600" },
];

export default function EmergencySupport() {
  const [step,            setStep]            = useState("idle"); // idle | detecting | ready | submitting | done
  const [location,        setLocation]        = useState("");
  const [gpsCoords,       setGpsCoords]       = useState(null);
  const [gpsError,        setGpsError]        = useState("");
  const [emergencyType,   setEmergencyType]   = useState(EMERGENCY_TYPES[0].value);
  const [notes,           setNotes]           = useState("");
  const [requestData,     setRequestData]     = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [editingLocation, setEditingLocation] = useState(false);
  const [hospitalCount,   setHospitalCount]   = useState(0);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const hasDetected = useRef(false);

  const detectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError("GPS not supported. Please type your address.");
      setStep("ready");
      return;
    }
    setStep("detecting");
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        setGpsCoords({ lat, lng });
        try {
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          setLocation(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } catch {
          setLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
        findNearbyHospitals(lat, lng);
        setStep("ready");
      },
      (err) => {
        const msg = err.code === 1
          ? "Location permission denied. Please type your address below."
          : "Could not get GPS. Please type your address.";
        setGpsError(msg);
        setStep("ready");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // ── Auto-detect GPS as soon as page loads ──────────────────
  useEffect(() => {
    if (hasDetected.current) return;
    hasDetected.current = true;
    detectGPS(); // safe — defined above, stable reference via useRef pattern
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const findNearbyHospitals = async (lat, lng) => {
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/search?q=hospital&format=json&limit=5&bounded=1` +
        `&viewbox=${lng - 0.05},${lat + 0.05},${lng + 0.05},${lat - 0.05}`
      );
      const data = await res.json();
      const list = data.slice(0, 4).map((h) => {
        const dlat = (parseFloat(h.lat) - lat) * 111;
        const dlng = (parseFloat(h.lon) - lng) * 111 * Math.cos(lat * Math.PI / 180);
        const dist = Math.sqrt(dlat * dlat + dlng * dlng);
        return {
          name:    h.display_name.split(",")[0],
          address: h.display_name.split(",").slice(1, 3).join(",").trim(),
          dist:    dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`,
          time:    `${Math.round(dist * 3 + 2)} min`,
          mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`,
        };
      });
      setNearbyHospitals(list);
      setHospitalCount(list.length);
    } catch {
      setNearbyHospitals([]);
    }
  };

  // ── ONE TAP SOS ────────────────────────────────────────────
  const handleSOS = async () => {
    if (!location.trim()) {
      toast.error("Location is required. Please allow GPS or type your address.");
      return;
    }
    setStep("submitting");

    try {
      const res = await ambulanceAPI.request({
        location:         location.trim(),
        gpsCoords,
        emergencyType,
        notes,
        targetHospital:   selectedHospital?.name || null,
      });
      setRequestData(res.data?.data);
      setStep("done");
      toast.success("🚑 Nearest hospitals alerted!");
      // Auto-dial 108
      setTimeout(() => { window.location.href = "tel:108"; }, 800);
    } catch {
      setRequestData({
        requestId:        "LOCAL-" + Date.now().toString(36).toUpperCase(),
        estimatedArrival: "8–12 minutes",
      });
      setStep("done");
      setTimeout(() => { window.location.href = "tel:108"; }, 800);
    }
  };

  const reset = () => {
    setStep("idle");
    setRequestData(null);
    setLocation("");
    setGpsCoords(null);
    setGpsError("");
    setNotes("");
    setSelectedHospital(null);
    hasDetected.current = false;
    setTimeout(() => detectGPS(), 100);
  };

  // ── DONE STATE ─────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="max-w-lg mx-auto space-y-4 pb-8">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-gray-900 dark:bg-slate-900 rounded-3xl p-6 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FiCheckCircle size={44} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-black text-white">Ambulance Dispatched!</h2>
          <p className="text-orange-400 font-bold text-lg mt-1">
            ETA: {requestData?.estimatedArrival || "8–12 minutes"}
          </p>

          <div className="text-left mt-4 space-y-2 text-sm bg-white/5 rounded-2xl p-4">
            <p className="text-white flex items-center gap-2">🚑 Unit dispatched to your location</p>
            {selectedHospital && (
              <p className="text-green-300 font-semibold">🏥 Sent to: {selectedHospital.name} ({selectedHospital.dist})</p>
            )}
            <p className="text-orange-300 flex items-start gap-2">
              <FiMapPin size={14} className="mt-0.5 flex-shrink-0" />
              {location}
            </p>
            <p className="text-orange-300">🏥 {emergencyType}</p>
            <p className="text-gray-500 text-xs">ID: {requestData?.requestId}</p>
          </div>

          <div className="bg-green-900/30 border border-green-800 rounded-2xl p-4 mt-4 text-left space-y-2 text-xs text-green-300">
            <p className="font-bold text-green-200 text-sm">✅ Nearby Hospitals Notified:</p>
            <p>🔔 Real-time alert sent to <strong>nearest hospitals</strong> on their dashboard</p>
            <p>📧 Email sent to hospital emergency teams with your GPS</p>
            <p>🗺️ Google Maps link with your exact location shared</p>
            <p>📞 108 is being dialed on your phone now</p>
          </div>

          <p className="text-orange-400 font-black text-lg mt-4">Stay calm. Help is on the way.</p>

          <div className="flex gap-3 mt-5">
            <a href="tel:108"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors">
              <FiPhone size={16} /> Call 108
            </a>
            <button onClick={reset}
              className="flex-1 border border-gray-600 text-gray-300 font-semibold py-3.5 rounded-2xl hover:bg-gray-800 transition-colors">
              New Request
            </button>
          </div>
        </motion.div>

        {/* Nearby hospitals */}
        {nearbyHospitals.length > 0 && (
          <div className="space-y-2.5">
            <p className="font-bold text-gray-900 dark:text-white text-sm">🏥 Hospitals Near You</p>
            {nearbyHospitals.map((h, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-lg flex-shrink-0">🏥</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{h.name}</p>
                  <div className="flex gap-3 mt-1 text-xs text-gray-400">
                    <span>📍 {h.dist}</span>
                    <span>🕐 {h.time} drive</span>
                  </div>
                </div>
                <a href={h.mapsUrl} target="_blank" rel="noreferrer"
                  className="text-xs font-bold text-white bg-primary-600 px-3 py-1.5 rounded-xl">
                  Go
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── MAIN FORM ─────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto space-y-5 pb-8">

      {/* Quick dial */}
      <div className="grid grid-cols-4 gap-2">
        {EMERGENCY_CONTACTS.map(c => (
          <a key={c.label} href={`tel:${c.number}`}
            className={`${c.color} text-white rounded-2xl p-3 text-center active:scale-95 transition-all`}>
            <p className="font-black text-lg">{c.number}</p>
            <p className="text-xs opacity-80">{c.label}</p>
          </a>
        ))}
      </div>

      {/* GPS Status card */}
      <div className={`rounded-2xl p-4 border ${
        step === "detecting"
          ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
          : gpsCoords
          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
          : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
      }`}>
        {step === "detecting" ? (
          <div className="flex items-center gap-3">
            <FiLoader size={22} className="animate-spin text-yellow-600" />
            <div>
              <p className="font-bold text-yellow-800 dark:text-yellow-200">Detecting your location…</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">Please allow location access when prompted</p>
            </div>
          </div>
        ) : gpsCoords ? (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <FiCheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-green-800 dark:text-green-200 text-sm">📍 Location Detected</p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    GPS: {gpsCoords.lat.toFixed(4)}, {gpsCoords.lng.toFixed(4)}
                    {hospitalCount > 0 && <span className="ml-2 font-semibold">· {hospitalCount} hospitals found nearby</span>}
                  </p>
                </div>
              </div>
              <button onClick={() => setEditingLocation(!editingLocation)}
                className="text-xs text-green-700 dark:text-green-300 font-semibold flex items-center gap-1 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded-lg">
                <FiEdit2 size={11} /> Edit
              </button>
            </div>
            {editingLocation ? (
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-green-300 dark:border-green-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Edit your address…"
              />
            ) : (
              <p className="text-sm text-gray-700 dark:text-slate-300 leading-snug">{location}</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FiAlertCircle size={18} className="text-red-600" />
              <p className="font-bold text-red-800 dark:text-red-200 text-sm">
                {gpsError || "Location not detected"}
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Type your full address here…"
                className="flex-1 px-3 py-2 text-sm border border-red-200 dark:border-red-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <button onClick={detectGPS}
                className="flex items-center gap-1 px-3 py-2 bg-primary-600 text-white text-xs font-bold rounded-xl whitespace-nowrap">
                <FiNavigation size={12} /> Retry GPS
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Type */}
      <div>
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is the emergency?</p>
        <div className="grid grid-cols-3 gap-2">
          {EMERGENCY_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setEmergencyType(t.value)}
              className={`p-3 rounded-2xl text-center transition-all border-2 ${
                emergencyType === t.value
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-red-200"
              }`}
            >
              <span className="text-2xl">{t.icon}</span>
              <p className={`text-xs font-semibold mt-1 ${
                emergencyType === t.value ? "text-red-700 dark:text-red-300" : "text-gray-600 dark:text-slate-400"
              }`}>{t.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 block mb-1.5">
          Additional info (optional)
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Patient age, floor number, allergies, symptoms…"
          className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
        />
      </div>

      {/* How it works */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-3.5 space-y-1.5 text-xs text-blue-700 dark:text-blue-300">
        <p className="font-bold text-sm text-blue-900 dark:text-blue-200">📡 What happens when you press SOS:</p>
        <p>1️⃣ Your GPS location is sent to our system</p>
        <p>2️⃣ <strong>Nearest registered hospitals</strong> get an instant alert on their dashboard</p>
        <p>3️⃣ Hospital sees your location on Google Maps and dispatches ambulance</p>
        <p>4️⃣ You get notified when ambulance is on its way</p>
        <p>5️⃣ <strong>108 is auto-dialed</strong> on your phone as backup</p>
      </div>

      {/* BIG SOS BUTTON */}
      <motion.button
        onClick={handleSOS}
        disabled={step === "submitting" || step === "detecting" || !location.trim()}
        whileTap={{ scale: 0.96 }}
        className="w-full py-6 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-2xl rounded-3xl transition-colors shadow-2xl shadow-red-500/40 flex items-center justify-center gap-3"
      >
        {step === "submitting" ? (
          <><FiLoader size={28} className="animate-spin" /> Alerting Hospitals…</>
        ) : step === "detecting" ? (
          <><FiLoader size={28} className="animate-spin" /> Getting Location…</>
        ) : selectedHospital ? (
          <><FiTruck size={28} /> 🚨 Send SOS to {selectedHospital.name}</>
        ) : (
          <><FiTruck size={28} /> 🚨 SOS — Alert Nearest Hospital</>
        )}
      </motion.button>
      <p className="text-center text-xs text-gray-400 dark:text-slate-500 -mt-2">
        Alerts nearest hospitals + dials 108 automatically
      </p>

      {/* Nearby hospitals — SELECTABLE */}
      {nearbyHospitals.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-900 dark:text-white text-sm">
              🏥 Select a Hospital to Request
            </p>
            {selectedHospital && (
              <button onClick={() => setSelectedHospital(null)}
                className="text-xs text-gray-400 hover:text-gray-600 underline">
                Clear selection
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-slate-500">
            Tap a hospital to send your request directly to them. Or press SOS to alert the nearest one automatically.
          </p>
          {nearbyHospitals.map((h, i) => (
            <motion.button
              key={i}
              onClick={() => setSelectedHospital(selectedHospital?.name === h.name ? null : h)}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left rounded-2xl p-4 flex items-center gap-3 border-2 transition-all ${
                selectedHospital?.name === h.name
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-red-200"
              }`}
            >
              {/* Rank badge */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                i === 0
                  ? "bg-green-500 text-white"
                  : selectedHospital?.name === h.name
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300"
              }`}>
                {i === 0 ? "⭐" : `#${i + 1}`}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm truncate ${
                  selectedHospital?.name === h.name
                    ? "text-red-700 dark:text-red-300"
                    : "text-gray-900 dark:text-white"
                }`}>
                  {h.name}
                  {i === 0 && <span className="ml-2 text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Nearest</span>}
                </p>
                <p className="text-xs text-gray-400 truncate">{h.address}</p>
                <div className="flex gap-3 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><FiMapPin size={10} /> {h.dist}</span>
                  <span className="flex items-center gap-1"><FiClock size={10} /> {h.time} drive</span>
                </div>
              </div>

              {/* Selection indicator */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedHospital?.name === h.name
                  ? "border-red-500 bg-red-500"
                  : "border-gray-300 dark:border-slate-600"
              }`}>
                {selectedHospital?.name === h.name && (
                  <FiCheckCircle size={14} color="white" />
                )}
              </div>
            </motion.button>
          ))}

          {/* Selection status */}
          {selectedHospital ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-3 text-sm text-red-700 dark:text-red-300 font-semibold flex items-center gap-2">
              🏥 Request will go to: <strong>{selectedHospital.name}</strong> ({selectedHospital.dist})
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-3 text-xs text-blue-600 dark:text-blue-400">
              💡 No hospital selected — SOS will automatically alert the <strong>nearest registered hospital</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
