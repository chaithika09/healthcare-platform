import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiTrash2, FiBell, FiClock, FiCheckCircle, FiX, FiVolume2 } from "react-icons/fi";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const initialReminders = [
  { id: 1, medicine: "Amlodipine 5mg",  times: ["08:00 AM"], frequency: "Daily",       taken: false, color: "bg-blue-100 text-blue-700" },
  { id: 2, medicine: "Lisinopril 10mg", times: ["08:00 AM"], frequency: "Daily",       taken: true,  color: "bg-green-100 text-green-700" },
  { id: 3, medicine: "Metformin 500mg", times: ["08:00 AM", "08:00 PM"], frequency: "Twice daily", taken: false, color: "bg-purple-100 text-purple-700" },
];

const colors = [
  "bg-blue-100 text-blue-700", "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700", "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700", "bg-teal-100 text-teal-700",
];

// Helper to play a chime sound using Web Audio API
const playChimeSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch (e) {
    console.warn("Audio chime error:", e);
  }
};

export default function MedicineReminder() {
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem("mediq_medicine_reminders");
    return saved ? JSON.parse(saved) : initialReminders;
  });

  const [showAdd, setShowAdd] = useState(false);
  const [notifPermission, setNotifPermission] = useState("default");
  const { register, handleSubmit, reset } = useForm();

  // Save to localStorage on update
  useEffect(() => {
    localStorage.setItem("mediq_medicine_reminders", JSON.stringify(reminders));
  }, [reminders]);

  // Request browser notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const enableNotifications = async () => {
    if ("Notification" in window) {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === "granted") {
        toast.success("Desktop notifications enabled! 🔔");
        new Notification("MedIQ+ Medicine Reminder", {
          body: "Notifications are now active! You will be alerted when it is time for your medicine.",
          icon: "/favicon.ico",
        });
        playChimeSound();
      } else {
        toast.error("Notification permission denied by browser.");
      }
    } else {
      toast.error("Browser does not support desktop notifications.");
    }
  };

  // Check current time against reminders every 15 seconds
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      
      const format12Hour = (h, m) => {
        const period = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        const mFormatted = m < 10 ? `0${m}` : m;
        return `${h12}:${mFormatted} ${period}`;
      };

      const nowString = format12Hour(currentHours, currentMinutes);

      reminders.forEach((r) => {
        if (!r.taken) {
          r.times.forEach((timeStr) => {
            // Compare time string like "08:00 AM" or "8:00 AM"
            const normTimeStr = timeStr.replace(/^0/, "");
            const normNowStr = nowString.replace(/^0/, "");

            if (normTimeStr === normNowStr) {
              playChimeSound();
              toast(
                (t) => (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 text-primary-600 rounded-full">
                      <FiBell size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">Medicine Alert! 💊</p>
                      <p className="text-xs text-gray-600">Time to take {r.medicine}</p>
                    </div>
                    <button
                      onClick={() => {
                        toggleTaken(r.id);
                        toast.dismiss(t.id);
                      }}
                      className="ml-auto text-xs bg-green-600 text-white px-2.5 py-1.5 rounded-lg font-medium"
                    >
                      Mark Taken
                    </button>
                  </div>
                ),
                { duration: 10000, id: `reminder-${r.id}-${nowString}` }
              );

              if ("Notification" in window && Notification.permission === "granted") {
                new Notification(`💊 Medicine Time: ${r.medicine}`, {
                  body: `It is ${nowString}. Please take your prescribed dose (${r.medicine}).`,
                  icon: "/favicon.ico",
                });
              }
            }
          });
        }
      });
    };

    const interval = setInterval(checkReminders, 15000);
    return () => clearInterval(interval);
  }, [reminders]);

  const toggleTaken = (id) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, taken: !r.taken } : r))
    );
  };

  const deleteReminder = (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    toast.success("Reminder deleted");
  };

  const triggerTestAlert = (reminder) => {
    playChimeSound();
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4 border-l-4 border-primary-500`}
        >
          <div className="flex-1 w-0">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <span className="text-2xl">💊</span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-gray-900">
                  Reminder Alert Test
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Time to take <strong>{reminder.medicine}</strong> ({reminder.frequency})
                </p>
              </div>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex items-center gap-2">
            <button
              onClick={() => {
                toggleTaken(reminder.id);
                toast.dismiss(t.id);
                toast.success("Marked as taken!");
              }}
              className="bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-700 transition-all"
            >
              Mark Taken
            </button>
          </div>
        </div>
      ),
      { duration: 6000 }
    );

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`💊 Reminder Test: ${reminder.medicine}`, {
        body: `Scheduled for ${reminder.times.join(", ")} (${reminder.frequency})`,
        icon: "/favicon.ico",
      });
    }
  };

  const onAdd = (data) => {
    // Format input type="time" (e.g. 14:30 -> 02:30 PM)
    const [hStr, mStr] = data.time.split(":");
    let h = parseInt(hStr, 10);
    const period = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    const formattedTime = `${h < 10 ? "0" + h : h}:${mStr} ${period}`;

    const newReminder = {
      id: Date.now(),
      medicine: `${data.name} ${data.dose}`,
      times: [formattedTime],
      frequency: data.frequency,
      taken: false,
      color: colors[reminders.length % colors.length],
    };

    setReminders((prev) => [...prev, newReminder]);
    reset();
    setShowAdd(false);
    toast.success(`Reminder added for ${formattedTime}!`);
    playChimeSound();
  };

  const takenCount = reminders.filter((r) => r.taken).length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900 flex items-center gap-2">
            Medicine Reminder <FiBell className="text-primary-500 animate-bounce" size={20} />
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {takenCount}/{reminders.length} doses taken today
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notifPermission !== "granted" && (
            <button
              onClick={enableNotifications}
              className="btn-outline text-xs px-3 py-2 border-primary-500 text-primary-600 hover:bg-primary-50 gap-1.5"
            >
              <FiBell size={14} /> Enable Desktop Alerts
            </button>
          )}
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm gap-2">
            <FiPlus size={16} /> Add Reminder
          </button>
        </div>
      </div>

      {/* Enable Notification Banner */}
      {notifPermission !== "granted" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <FiBell size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-900">Desktop Notifications Disabled</p>
              <p className="text-xs text-amber-700">Click Enable Alerts so your browser alerts you even when working in another tab.</p>
            </div>
          </div>
          <button
            onClick={enableNotifications}
            className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Allow Alerts
          </button>
        </div>
      )}

      {/* Progress Card */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Today's Progress</span>
          <span className="text-sm font-bold text-primary-600">
            {reminders.length > 0 ? Math.round((takenCount / reminders.length) * 100) : 0}%
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${reminders.length > 0 ? (takenCount / reminders.length) * 100 : 0}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{takenCount} taken</span>
          <span>{reminders.length - takenCount} remaining</span>
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`card p-4 flex items-center gap-4 transition-all ${
              r.taken ? "opacity-60 bg-gray-50 border-gray-200" : "hover:border-primary-200"
            }`}
          >
            <button
              onClick={() => toggleTaken(r.id)}
              title={r.taken ? "Mark as not taken" : "Mark as taken"}
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                r.taken
                  ? "bg-green-500 text-white shadow-md shadow-green-100"
                  : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
              }`}
            >
              <FiCheckCircle size={20} />
            </button>

            <div className="flex-1 min-w-0">
              <p
                className={`font-semibold text-sm ${
                  r.taken ? "line-through text-gray-400" : "text-gray-900"
                }`}
              >
                {r.medicine}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                  <FiClock size={11} /> {r.times.join(", ")}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.color}`}>
                  {r.frequency}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => triggerTestAlert(r)}
                title="Test Alarm Sound & Notification"
                className="p-2 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors flex items-center gap-1 text-xs"
              >
                <FiVolume2 size={15} />
                <span className="hidden sm:inline">Test Alert</span>
              </button>
              <button
                onClick={() => deleteReminder(r.id)}
                title="Delete Reminder"
                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              >
                <FiTrash2 size={15} />
              </button>
            </div>
          </motion.div>
        ))}

        {reminders.length === 0 && (
          <div className="card p-8 text-center text-gray-500">
            <FiBell className="mx-auto text-gray-300 mb-2" size={32} />
            <p className="font-semibold text-sm">No medicine reminders set</p>
            <p className="text-xs text-gray-400 mt-1">Click "Add Reminder" above to set your first alert.</p>
          </div>
        )}
      </div>

      {/* Add Reminder Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="modal-content p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-semibold text-gray-900 text-lg">Add Medicine Reminder</h3>
                <button
                  onClick={() => setShowAdd(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
                <div>
                  <label className="label">Medicine Name *</label>
                  <input
                    {...register("name", { required: true })}
                    placeholder="e.g., Amlodipine"
                    className="input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Dosage *</label>
                    <input
                      {...register("dose", { required: true })}
                      placeholder="e.g., 5mg"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Time *</label>
                    <input
                      {...register("time", { required: true })}
                      type="time"
                      className="input"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Frequency</label>
                  <select {...register("frequency")} className="input">
                    <option>Daily</option>
                    <option>Twice daily</option>
                    <option>Three times daily</option>
                    <option>Weekly</option>
                    <option>As needed</option>
                  </select>
                </div>
                <div>
                  <label className="label">Notes (optional)</label>
                  <input
                    {...register("notes")}
                    placeholder="e.g., Take with food after breakfast"
                    className="input"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="btn-outline flex-1 justify-center"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1 justify-center">
                    Add & Set Alert
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
