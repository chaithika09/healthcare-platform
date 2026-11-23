import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiMapPin, FiHash, FiHome } from "react-icons/fi";
import { authAPI } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const roles = [
  {
    value: "patient",
    label: "Patient",
    emoji: "🧑‍⚕️",
    desc: "Book appointments & manage health",
    color: "border-primary-500 bg-primary-50",
  },
  {
    value: "doctor",
    label: "Doctor",
    emoji: "👨‍⚕️",
    desc: "Manage patients & consultations",
    color: "border-green-500 bg-green-50",
  },
  {
    value: "hospital",
    label: "Hospital",
    emoji: "🏥",
    desc: "Receive emergency calls & manage alerts",
    color: "border-red-500 bg-red-50",
  },
];

const HOSPITAL_TYPES = [
  { value: "government",      label: "Government Hospital" },
  { value: "private",         label: "Private Hospital" },
  { value: "multispeciality", label: "Multispeciality Hospital" },
  { value: "clinic",          label: "Clinic / Nursing Home" },
];

export default function RegisterPage() {
  const [showPass,      setShowPass]      = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [selectedRole,  setSelectedRole]  = useState("patient");
  const navigate  = useNavigate();
  const { setAuth } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { role: "patient", hospitalType: "government" },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Build payload based on role
      const payload = {
        name:     data.name,
        email:    data.email,
        phone:    data.phone,
        password: data.password,
        role:     selectedRole,
      };

      // Add hospital-specific fields
      if (selectedRole === "hospital") {
        payload.hospitalName       = data.hospitalName;
        payload.registrationNumber = data.registrationNumber;
        payload.address            = data.address;
        payload.city               = data.city;
        payload.state              = data.state;
        payload.pincode            = data.pincode;
        payload.emergencyPhone     = data.emergencyPhone || data.phone;
        payload.hospitalType       = data.hospitalType;
      }

      // Doctor-specific fields
      if (selectedRole === "doctor") {
        payload.specialty     = data.specialty     || "General";
        payload.licenseNumber = data.licenseNumber || "PENDING";
        payload.experience    = parseInt(data.experience) || 0;
      }

      // Step 1 — Register
      await authAPI.register(payload);

      // Step 2 — Auto-login
      const loginRes = await authAPI.login({ email: data.email, password: data.password });
      const { user, token, refreshToken } = loginRes.data.data;
      setAuth(user, token, refreshToken);

      toast.success(`Welcome, ${user.name}! Account created successfully.`);

      const dashMap = {
        patient:  "/patient/dashboard",
        doctor:   "/doctor/dashboard",
        hospital: "/hospital/dashboard",
        admin:    "/admin/dashboard",
      };
      navigate(dashMap[user.role] || "/patient/dashboard", { replace: true });

    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      if (msg.toLowerCase().includes("already registered")) {
        toast.error("This email is already registered. Please sign in.");
        navigate("/login");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Create account</h1>
        <p className="text-gray-500 mt-1">Choose your role and join the platform</p>
      </div>

      {/* ── Role Selector ── */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {roles.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setSelectedRole(r.value)}
            className={`p-3 rounded-2xl border-2 text-left transition-all ${
              selectedRole === r.value ? r.color + " shadow-sm" : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <span className="text-2xl">{r.emoji}</span>
            <p className="font-semibold text-sm text-gray-900 mt-1">{r.label}</p>
            <p className="text-xs text-gray-500 leading-tight mt-0.5">{r.desc}</p>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* ── Common Fields ── */}
        <div>
          <label className="label">{selectedRole === "hospital" ? "Contact Person Name" : "Full Name"}</label>
          <div className="relative">
            <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              {...register("name", { required: "Name is required", minLength: { value: 2, message: "Min 2 characters" } })}
              placeholder={selectedRole === "hospital" ? "Dr. Admin / Manager Name" : "John Doe"}
              className={`input pl-10 ${errors.name ? "input-error" : ""}`}
            />
          </div>
          {errors.name && <p className="error-message">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label">Email Address</label>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
              })}
              type="email"
              placeholder="you@example.com"
              className={`input pl-10 ${errors.email ? "input-error" : ""}`}
            />
          </div>
          {errors.email && <p className="error-message">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label">Phone Number</label>
          <div className="relative">
            <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              {...register("phone", { required: "Phone is required" })}
              type="tel"
              placeholder="+91 9876543210"
              className={`input pl-10 ${errors.phone ? "input-error" : ""}`}
            />
          </div>
          {errors.phone && <p className="error-message">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "Min 8 characters" },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: "Must include uppercase, lowercase, and number",
                },
              })}
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              className={`input pl-10 pr-10 ${errors.password ? "input-error" : ""}`}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.password && <p className="error-message">{errors.password.message}</p>}
        </div>

        {/* ── Doctor Extra Fields ── */}
        <AnimatePresence>
          {selectedRole === "doctor" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
              <div className="p-4 bg-green-50 border border-green-200 rounded-2xl space-y-3">
                <p className="text-sm font-bold text-green-800">👨‍⚕️ Doctor Details</p>
                <div>
                  <label className="label">Specialty</label>
                  <input {...register("specialty")} placeholder="e.g. Cardiologist, Dermatologist" className="input" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">License Number</label>
                    <input {...register("licenseNumber")} placeholder="MCI/AP/12345" className="input" />
                  </div>
                  <div>
                    <label className="label">Experience (years)</label>
                    <input {...register("experience")} type="number" placeholder="5" className="input" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Hospital Extra Fields ── */}
        <AnimatePresence>
          {selectedRole === "hospital" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-3">
                <p className="text-sm font-bold text-red-800">🏥 Hospital Details</p>

                <div>
                  <label className="label">Hospital Name *</label>
                  <div className="relative">
                    <FiHome className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      {...register("hospitalName", {
                        required: selectedRole === "hospital" ? "Hospital name is required" : false,
                      })}
                      placeholder="City General Hospital"
                      className={`input pl-10 ${errors.hospitalName ? "input-error" : ""}`}
                    />
                  </div>
                  {errors.hospitalName && <p className="error-message">{errors.hospitalName.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Registration Number *</label>
                    <div className="relative">
                      <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        {...register("registrationNumber", {
                          required: selectedRole === "hospital" ? "Registration number is required" : false,
                        })}
                        placeholder="AP/HOSP/2024/001"
                        className={`input pl-10 ${errors.registrationNumber ? "input-error" : ""}`}
                      />
                    </div>
                    {errors.registrationNumber && <p className="error-message">{errors.registrationNumber.message}</p>}
                  </div>
                  <div>
                    <label className="label">Hospital Type</label>
                    <select {...register("hospitalType")} className="input">
                      {HOSPITAL_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Address *</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3.5 top-3 text-gray-400" size={16} />
                    <textarea
                      {...register("address", {
                        required: selectedRole === "hospital" ? "Address is required" : false,
                      })}
                      placeholder="Door No, Street, Area"
                      rows={2}
                      className={`input pl-10 resize-none ${errors.address ? "input-error" : ""}`}
                    />
                  </div>
                  {errors.address && <p className="error-message">{errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="label">City *</label>
                    <input
                      {...register("city", { required: selectedRole === "hospital" ? "Required" : false })}
                      placeholder="Hindupur"
                      className={`input ${errors.city ? "input-error" : ""}`}
                    />
                  </div>
                  <div>
                    <label className="label">State *</label>
                    <input
                      {...register("state", { required: selectedRole === "hospital" ? "Required" : false })}
                      placeholder="Andhra Pradesh"
                      className={`input ${errors.state ? "input-error" : ""}`}
                    />
                  </div>
                  <div>
                    <label className="label">Pincode *</label>
                    <input
                      {...register("pincode", { required: selectedRole === "hospital" ? "Required" : false })}
                      placeholder="515201"
                      className={`input ${errors.pincode ? "input-error" : ""}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Emergency Helpline (optional)</label>
                  <input
                    {...register("emergencyPhone")}
                    type="tel"
                    placeholder="Dedicated emergency number"
                    className="input"
                  />
                  <p className="text-xs text-gray-400 mt-1">This number is shown to patients calling for help</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Terms */}
        <div className="flex items-start gap-2 pt-1">
          <input
            {...register("terms", { required: "You must accept the terms" })}
            type="checkbox"
            id="terms"
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            I agree to the{" "}
            <Link to="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
          </label>
        </div>
        {errors.terms && <p className="error-message">{errors.terms.message}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`btn-lg w-full justify-center mt-2 text-white font-bold rounded-2xl transition-colors flex items-center gap-2 ${
            selectedRole === "hospital"
              ? "bg-red-500 hover:bg-red-600"
              : selectedRole === "doctor"
              ? "bg-green-600 hover:bg-green-700"
              : "bg-primary-600 hover:bg-primary-700"
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating account...
            </span>
          ) : (
            `Create ${roles.find(r => r.value === selectedRole)?.emoji} ${roles.find(r => r.value === selectedRole)?.label} Account`
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
      </p>
    </motion.div>
  );
}
