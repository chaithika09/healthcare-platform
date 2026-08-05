import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiEdit2, FiMapPin, FiPhone, FiMail, FiShield, FiUser, FiAlertCircle
} from "react-icons/fi";
import { useAuthStore } from "../store/authStore";

export default function UserProfile() {
  const { user } = useAuthStore();

  // Only show what the user has actually filled in
  const profileData = user?.profile || {};

  const personalFields = [
    { label: "Full Name",     value: user?.name },
    { label: "Date of Birth", value: profileData.dateOfBirth },
    { label: "Gender",        value: profileData.gender },
    { label: "Blood Group",   value: profileData.bloodGroup },
    { label: "Height",        value: profileData.height ? `${profileData.height} cm` : null },
    { label: "Weight",        value: profileData.weight ? `${profileData.weight} kg` : null },
  ];

  const hasPersonalData = personalFields.some(f => f.value);
  const hasAllergies   = profileData.allergies?.length > 0;
  const hasConditions  = profileData.conditions?.length > 0;
  const hasMedications = profileData.medications?.length > 0;
  const hasMedicalData = hasAllergies || hasConditions || hasMedications;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
        <div className="h-24 bg-gradient-hero relative">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 right-8 w-16 h-16 bg-white rounded-full" />
            <div className="absolute bottom-1 left-12 w-10 h-10 bg-white rounded-full" />
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-8 mb-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-hero flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <Link to="/profile/edit" className="btn-primary btn-sm gap-1.5">
              <FiEdit2 size={13} /> Edit Profile
            </Link>
          </div>

          <h1 className="text-xl font-heading font-bold text-gray-900">{user?.name || "—"}</h1>
          <p className="text-primary-600 font-medium text-sm capitalize">{user?.role || "Patient"}</p>

          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
            {user?.email && (
              <span className="flex items-center gap-1.5"><FiMail size={13} /> {user.email}</span>
            )}
            {user?.phone && (
              <span className="flex items-center gap-1.5"><FiPhone size={13} /> {user.phone}</span>
            )}
            {profileData.address && (
              <span className="flex items-center gap-1.5"><FiMapPin size={13} /> {profileData.address}</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Personal info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-gray-900">Personal Information</h2>
          <Link to="/profile/edit" className="text-xs text-primary-600 hover:underline">+ Add Info</Link>
        </div>

        {hasPersonalData ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {personalFields.filter(f => f.value).map((item) => (
              <div key={item.label}>
                <p className="text-gray-500 text-xs">{item.label}</p>
                <p className="font-medium text-gray-900 mt-0.5 capitalize">{item.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <FiUser size={20} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No personal information added yet</p>
            <Link to="/profile/edit" className="btn-primary btn-sm mt-4">
              Complete Your Profile
            </Link>
          </div>
        )}
      </motion.div>

      {/* Medical info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-gray-900">Medical Information</h2>
          <Link to="/profile/edit" className="text-xs text-primary-600 hover:underline">+ Add Info</Link>
        </div>

        {hasMedicalData ? (
          <div className="space-y-3 text-sm">
            {hasAllergies && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Allergies</p>
                <div className="flex flex-wrap gap-2">
                  {profileData.allergies.map((a) => (
                    <span key={a} className="badge-error">{a}</span>
                  ))}
                </div>
              </div>
            )}
            {hasConditions && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Chronic Conditions</p>
                <div className="flex flex-wrap gap-2">
                  {profileData.conditions.map((c) => (
                    <span key={c} className="badge-warning">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {hasMedications && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Current Medications</p>
                <div className="flex flex-wrap gap-2">
                  {profileData.medications.map((m) => (
                    <span key={m} className="badge-primary">{m}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <FiAlertCircle size={20} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No medical information added yet</p>
            <Link to="/profile/edit" className="btn-outline btn-sm mt-4">
              Add Medical Info
            </Link>
          </div>
        )}
      </motion.div>

      {/* Security */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-6">
        <h2 className="font-heading font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FiShield size={16} className="text-primary-600" /> Account
        </h2>
        <div className="space-y-3">
          {[
            { label: "Email",      value: user?.email || "—" },
            { label: "Role",       value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "—" },
            { label: "Account Status", value: user?.isActive ? "Active" : "Inactive", color: user?.isActive ? "text-green-600" : "text-red-500" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-700">{item.label}</span>
              <span className={`text-xs font-medium ${item.color || "text-gray-600"}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
