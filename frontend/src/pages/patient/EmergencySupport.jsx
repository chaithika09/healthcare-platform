import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPhone, FiMapPin, FiAlertCircle, FiTruck,
  FiHeart, FiCheckCircle, FiNavigation, FiLoader,
  FiExternalLink, FiClock, FiAlertTriangle
} from "react-icons/fi";
import toast from "react-hot-toast";

/* ── India Emergency Numbers ── */
const EMERGENCY_CONTACTS = [
  { label: "Ambulance",         number: "108",          color: "bg-red-500",    icon: FiTruck,      description: "Free ambulance service" },
  { label: "Police",            number: "100",          color: "bg-blue-600",   icon: FiAlertCircle,description: "Police emergency" },
  { label: "Fire Brigade",      number: "101",          color: "bg-orange-500", icon: FiAlertTriangle, description: "Fire & rescue" },
  { label: "Women Helpline",    number: "1091",         color: "bg-pink-500",   icon: FiHeart,      description: "Women safety helpline" },
  { label: "National Emergency", number: "112",          color: "bg-purple-600", icon: FiPhone,      description: "All emergencies" },
  { label: "Child Helpline",    number: "1098",         color: "bg-green-500",  icon: FiHeart,      description: "Child in distress" },
];

/* ── Emergency Types ── */
const EMERGENCY_TYPES = [
  "Cardiac Emergency / Heart Attack",
  "Accident / Trauma",
  "Breathing Difficulty",
  "Stroke / Paralysis",
  "Severe Bleeding",
  "Unconscious Person",
  "Pregnancy Emergency",
  "Poisoning / Overdose",
  "Other Medical Emergency",
];

export default function EmergencySupport() {
  const [booking,        setBooking]        = useState(false);
  const [booked,         setBooked]         = useState(false);
  const [location,       setLocation]       = useState("");
  const [gpsLoading,     setGpsLoading]     = useState(false);
  const [gpsCoords,      setGpsCoords]      = useState(null);
  const [emergencyType,  setEmergencyType]  = useState(EMERGENCY_TYPES[0]);
  const [notes,          setNotes]          = useState("");
  const [nearbyHospitals,setNearbyHospitals]= useState([]);
  const [hospitalsLoading,setHospitalsLoading]=useState(false);
  const [mapsUrl,        setMapsUrl]        = useState("");

  /* ── Get real GPS location ── */
  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("GPS not supported on this device");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setGpsCoords({ lat, lng });

        // Reverse geocode using free OpenStreetMap Nominatim API
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setLocation(addr);
          toast.success("📍 Location detected!");

          // Set Google Maps URL for nearby hospitals
          setMapsUrl(
            `https://www.google.com/maps/search/hospital+near+me/@${lat},${lng},14z`
          );

          // Simulate nearby hospitals based on real coords
          findNearbyHospitals(lat, lng);
        } catch {
          setLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          toast.success("📍 GPS coordinates captured");
        }
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) toast.error("Location permission denied. Please allow location access.");
        else if (err.code === 2) toast.error("Location unavailable. Enter address manually.");
        else toast.error("Could not get location. Try manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  /* ── Find nearby hospitals via Nominatim ── */
  const findNearbyHospitals = async (lat, lng) => {
    setHospitalsLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=hospital&format=json&limit=5&bounded=1&viewbox=${lng-0.05},${lat+0.05},${lng+0.05},${lat-0.05}`
      );
      const data = await res.json();
      if (data.length > 0) {
        const hospitals = data.slice(0, 4).map((h) => {
          // Calculate rough distance
          const dlat = (h.lat - lat) * 111;
          const dlng = (h.lon - lng) * 111 * Math.cos(lat * Math.PI / 180);
          const dist = Math.sqrt(dlat * dlat + dlng * dlng);
          const mins = Math.round(dist * 3 + 2); // rough drive time
          return {
            name:     h.display_name.split(",")[0],
            address:  h.display_name.split(",").slice(1, 3).join(",").trim(),
            distance: dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`,
            time:     `${mins} min`,
            mapsUrl:  `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`,
            open:     true,
          };
        });
        setNearbyHospitals(hospitals);
      } else {
        setNearbyHospitals([]);
      }
    } catch {
      setNearbyHospitals([]);
    } finally {
      setHospitalsLoading(false);
    }
  };

  /* ── Book ambulance ── */
  const bookAmbulance = async () => {
    if (!location.trim()) {
      toast.error("Please enter your location or detect GPS");
      return;
    }
    setBooking(true);
    // Simulate dispatch (in production: call your backend API)
    await new Promise((r) => setTimeout(r, 2000));
    setBooked(true);
    setBooking(false);
    toast.success("🚑 Ambulance dispatched! Dial 108 if urgent.");
  };

  const reset = () => {
    setBooked(false);
    setLocation("");
    setGpsCoords(null);
    setNotes("");
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-8">

      {/* ── Emergency Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-red-500 to-red-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
              <FiAlertCircle size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Emergency Support</h1>
              <p className="text-red-100 text-sm">24/7 emergency assistance available</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="tel:108"
              className="inline-flex items-center gap-2 bg-white text-red-600 font-bold px-5 py-2.5 rounded-2xl text-sm hover:bg-red-50 transition-colors shadow">
              <FiPhone size={15} /> Call 108 (Ambulance)
            </a>
            <a href="tel:112"
              className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-5 py-2.5 rounded-2xl text-sm hover:bg-white/30 transition-colors border border-white/30">
              <FiPhone size={15} /> Call 112 (Emergency)
            </a>
          </div>
        </div>
      </motion.div>

      {/* ── Emergency Contacts ── */}
      <div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <FiPhone size={16} className="text-red-500" /> Emergency Contacts
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {EMERGENCY_CONTACTS.map((c) => (
            <a key={c.label} href={`tel:${c.number}`}
              className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-3.5 flex items-center gap-3 hover:shadow-md active:scale-95 transition-all">
              <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center text-white flex-shrink-0`}>
                <c.icon size={17} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{c.label}</p>
                <p className="text-primary-600 dark:text-primary-400 font-bold text-sm">{c.number}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* ── Book Ambulance ── */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiTruck size={18} className="text-orange-500" /> Request Ambulance
        </h2>

        <AnimatePresence mode="wait">
          {!booked ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4">

              {/* Location */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FiMapPin size={13} /> Your Location *
                  </label>
                  <button type="button" onClick={detectLocation} disabled={gpsLoading}
                    className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline disabled:opacity-60">
                    {gpsLoading
                      ? <><FiLoader size={12} className="animate-spin" /> Detecting…</>
                      : <><FiNavigation size={12} /> Detect GPS</>}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Enter your full address or use GPS detect…"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
                {gpsCoords && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                    <FiCheckCircle size={11} /> GPS: {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)}
                  </p>
                )}
              </div>

              {/* Emergency type */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 block mb-1.5">
                  Emergency Type *
                </label>
                <select
                  value={emergencyType}
                  onChange={(e) => setEmergencyType(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  {EMERGENCY_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 block mb-1.5">
                  Additional Notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any extra info for paramedics — patient age, allergies, symptoms…"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
                />
              </div>

              <button onClick={bookAmbulance} disabled={booking || !location.trim()}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25">
                {booking
                  ? <><FiLoader size={18} className="animate-spin" /> Dispatching…</>
                  : <><FiTruck size={18} /> Request Ambulance (108)</>}
              </button>

              <p className="text-xs text-center text-gray-400 dark:text-slate-500">
                For immediate help, always call <strong>108</strong> directly
              </p>
            </motion.div>

          ) : (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle size={40} className="text-green-500" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Ambulance Dispatched!</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
                ETA: <span className="font-bold text-orange-500">8–12 minutes</span>
              </p>
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-2xl p-4 mt-4 text-sm text-orange-700 dark:text-orange-300 text-left space-y-1">
                <p>🚑 Unit dispatched to your location</p>
                <p>📍 Location: {location}</p>
                <p>🏥 Type: {emergencyType}</p>
                <p className="font-semibold">Stay calm. Keep your phone on.</p>
              </div>
              <div className="flex gap-3 mt-4">
                <a href="tel:108"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl text-sm transition-colors">
                  <FiPhone size={15} /> Call 108
                </a>
                <button onClick={reset}
                  className="flex-1 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-semibold rounded-2xl text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  New Request
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Nearby Hospitals ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🏥 Nearby Hospitals
          </h2>
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noreferrer"
              className="text-xs text-primary-600 dark:text-primary-400 font-semibold flex items-center gap-1 hover:underline">
              View on Maps <FiExternalLink size={11} />
            </a>
          )}
        </div>

        {!gpsCoords && !hospitalsLoading && nearbyHospitals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 text-center">
            <p className="text-gray-400 dark:text-slate-500 text-sm">
              📍 Detect your GPS location above to find nearby hospitals
            </p>
            <button onClick={detectLocation} disabled={gpsLoading}
              className="mt-3 btn-primary btn-sm gap-1.5">
              <FiNavigation size={13} /> Detect My Location
            </button>
          </div>
        ) : hospitalsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : nearbyHospitals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 text-center">
            <p className="text-gray-400 dark:text-slate-500 text-sm">
              No hospitals found nearby. Try Google Maps.
            </p>
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noreferrer"
                className="mt-3 btn-primary btn-sm gap-1.5 inline-flex">
                <FiExternalLink size={13} /> Open Google Maps
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {nearbyHospitals.map((h, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0 text-xl">
                  🏥
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{h.name}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{h.address}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FiMapPin size={10} /> {h.distance}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FiClock size={10} /> {h.time} drive
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      Open
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <a href={h.mapsUrl} target="_blank" rel="noreferrer"
                    className="text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors">
                    <FiNavigation size={11} /> Go
                  </a>
                  <a href="tel:108"
                    className="text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors">
                    <FiPhone size={11} /> 108
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Safety Tips ── */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4">
        <h3 className="font-bold text-blue-900 dark:text-blue-300 text-sm mb-2">💡 Emergency Tips</h3>
        <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-400">
          <li>• Stay calm and speak clearly when calling for help</li>
          <li>• Give exact location — landmark, street name, area</li>
          <li>• Don't move an injured person unless in danger</li>
          <li>• Keep the patient warm and conscious</li>
          <li>• Send someone to wait outside and guide the ambulance</li>
        </ul>
      </div>
    </div>
  );
}
