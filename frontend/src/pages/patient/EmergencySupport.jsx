import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiPhone, FiMapPin, FiAlertCircle, FiTruck, FiHeart, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";

const emergencyContacts = [
  { label: "Emergency (911)", number: "911", color: "bg-red-500", icon: FiPhone },
  { label: "Ambulance",       number: "1-800-AMB",  color: "bg-orange-500", icon: FiTruck },
  { label: "Poison Control",  number: "1-800-222-1222", color: "bg-purple-500", icon: FiAlertCircle },
  { label: "Mental Health",   number: "988",        color: "bg-blue-500", icon: FiHeart },
];

const nearbyHospitals = [
  { name: "City General Hospital",    distance: "0.8 km", time: "3 min", address: "123 Main St", open: true },
  { name: "St. Mary's Medical Center",distance: "1.2 km", time: "5 min", address: "456 Oak Ave", open: true },
  { name: "University Hospital",      distance: "2.1 km", time: "8 min", address: "789 College Rd", open: true },
];

export default function EmergencySupport() {
  const [ambulanceBooked, setAmbulanceBooked] = useState(false);
  const [booking, setBooking] = useState(false);
  const [location, setLocation] = useState("");

  const bookAmbulance = async () => {
    if (!location) { toast.error("Please enter your location"); return; }
    setBooking(true);
    await new Promise((r) => setTimeout(r, 2000));
    setAmbulanceBooked(true);
    setBooking(false);
    toast.success("Ambulance dispatched! ETA: 8 minutes");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Emergency banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-red-500 rounded-3xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <FiAlertCircle size={24} />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold">Emergency Support</h1>
              <p className="text-red-100 text-sm">24/7 emergency assistance available</p>
            </div>
          </div>
          <a href="tel:911" className="inline-flex items-center gap-2 bg-white text-red-600 font-bold px-6 py-3 rounded-2xl text-sm hover:bg-red-50 transition-colors">
            <FiPhone size={16} /> Call 911 Now
          </a>
        </div>
      </motion.div>

      {/* Emergency contacts */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Emergency Contacts</h2>
        <div className="grid grid-cols-2 gap-3">
          {emergencyContacts.map((c) => (
            <a key={c.label} href={`tel:${c.number}`}
              className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-all">
              <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center text-white flex-shrink-0`}>
                <c.icon size={18} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{c.label}</p>
                <p className="text-xs text-primary-600 font-medium">{c.number}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Ambulance booking */}
      <div className="card p-6">
        <h2 className="font-heading font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiTruck size={18} className="text-orange-500" /> Book Ambulance
        </h2>

        {!ambulanceBooked ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label flex items-center gap-2 mb-0"><FiMapPin size={14} /> Your Location</label>
                <button
                  type="button"
                  onClick={() => { setLocation("Current GPS Location (Main St)"); toast.success("Location auto-detected!"); }}
                  className="text-xs text-primary-600 font-semibold hover:underline"
                >
                  📍 Detect GPS Location
                </button>
              </div>
              <input
                type="text"
                placeholder="Enter your address or click GPS..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Emergency Type</label>
              <select className="input">
                <option>Cardiac Emergency</option>
                <option>Accident / Trauma</option>
                <option>Breathing Difficulty</option>
                <option>Stroke</option>
                <option>Other Medical Emergency</option>
              </select>
            </div>
            <div>
              <label className="label">Additional Notes (optional)</label>
              <textarea rows={2} placeholder="Any additional information for paramedics..." className="input resize-none" />
            </div>
            <button onClick={bookAmbulance} disabled={booking}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2">
              {booking ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Dispatching...</>
              ) : (
                <><FiTruck size={18} /> Request Ambulance</>
              )}
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle size={32} className="text-green-500" />
            </div>
            <h3 className="font-bold text-gray-900">Ambulance Dispatched!</h3>
            <p className="text-gray-500 text-sm mt-1">Estimated arrival: <span className="font-bold text-orange-500">8 minutes</span></p>
            <div className="bg-orange-50 rounded-xl p-3 mt-4 text-sm text-orange-700">
              🚑 Unit #A-247 is on the way. Stay calm and keep your phone accessible.
            </div>
          </motion.div>
        )}
      </div>

      {/* Nearby hospitals */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Nearby Hospitals</h2>
        <div className="space-y-3">
          {nearbyHospitals.map((h) => (
            <div key={h.name} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🏥</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{h.name}</p>
                <p className="text-xs text-gray-500">{h.address}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><FiMapPin size={10} /> {h.distance}</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1"><FiTruck size={10} /> {h.time} drive</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${h.open ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {h.open ? "Open" : "Closed"}
                  </span>
                </div>
              </div>
              <a href="tel:911" className="btn-outline btn-sm">Call</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
