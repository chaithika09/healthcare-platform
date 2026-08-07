import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiSun, FiMoon, FiGlobe, FiBell, FiShield, FiTrash2, FiChevronRight } from "react-icons/fi";
import { useUIStore } from "../store/uiStore";
import toast from "react-hot-toast";

const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
  { code: "zh", label: "中文" },
];

export default function SettingsPage() {
  const { darkMode, toggleDarkMode, language, setLanguage } = useUIStore();
  const [notifications, setNotifications] = useState({
    appointments: true, reminders: true, messages: true, promotions: false, email: true, sms: false,
  });
  const [twoFA, setTwoFA] = useState(true);

  const toggleNotif = (key) => setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  const ToggleSwitch = ({ checked, onChange }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-primary-500" : "bg-gray-300"}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your preferences and account settings</p>
      </div>

      {/* Appearance */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Appearance</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <FiMoon size={18} className="text-gray-600" /> : <FiSun size={18} className="text-amber-500" />}
            <div>
              <p className="text-sm font-medium text-gray-900">Dark Mode</p>
              <p className="text-xs text-gray-500">Switch between light and dark theme</p>
            </div>
          </div>
          <ToggleSwitch checked={darkMode} onChange={toggleDarkMode} />
        </div>
      </div>

      {/* Language */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2"><FiGlobe size={16} /> Language</h2>
        <div className="grid grid-cols-3 gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => { setLanguage(lang.code); toast.success(`Language set to ${lang.label}`); }}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${language === lang.code ? "border-primary-500 bg-primary-50 text-primary-700" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2"><FiBell size={16} /> Notifications</h2>
        {[
          { key: "appointments", label: "Appointment Reminders", desc: "Get notified about upcoming appointments" },
          { key: "reminders",    label: "Medicine Reminders",    desc: "Daily medication reminders" },
          { key: "messages",     label: "New Messages",          desc: "Notifications for new chat messages" },
          { key: "promotions",   label: "Promotions & Updates",  desc: "Health tips and platform updates" },
          { key: "email",        label: "Email Notifications",   desc: "Receive notifications via email" },
          { key: "sms",          label: "SMS Notifications",     desc: "Receive notifications via SMS" },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <ToggleSwitch checked={notifications[item.key]} onChange={() => toggleNotif(item.key)} />
          </div>
        ))}
      </div>

      {/* Security */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2"><FiShield size={16} /> Security</h2>
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
            <p className="text-xs text-gray-500">Add an extra layer of security</p>
          </div>
          <ToggleSwitch checked={twoFA} onChange={() => setTwoFA(!twoFA)} />
        </div>
        {[
          { label: "Change Password",    desc: "Update your account password", action: () => toast.success("Password reset email sent to your inbox!") },
          { label: "Active Sessions",    desc: "Manage devices logged into your account", action: () => toast.success("1 active session: Current Web Browser") },
          { label: "Privacy Settings",   desc: "Control your data and privacy", action: () => toast.success("Privacy preferences saved!") },
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded-xl px-2 -mx-2 transition-colors"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
            <FiChevronRight size={16} className="text-gray-400" />
          </button>
        ))}
      </div>

      {/* Danger zone */}
      <div className="card p-5 border-red-100">
        <h2 className="font-semibold text-red-600 mb-4 flex items-center gap-2"><FiTrash2 size={16} /> Danger Zone</h2>
        <div className="space-y-3">
          <button
            onClick={() => toast.error("To delete your account permanently, please contact support@smarthealth.com")}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-red-200 hover:bg-red-50 transition-colors text-left"
          >
            <div>
              <p className="text-sm font-medium text-red-700">Delete Account</p>
              <p className="text-xs text-red-500">Permanently delete your account and all data</p>
            </div>
            <FiChevronRight size={16} className="text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
