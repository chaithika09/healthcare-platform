import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone,
  FiMapPin, FiHash, FiHome,
} from "react-icons/fi";
import { authAPI } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const HOSPITAL_TYPES = [
  { value: "government",      label: "🏛️ Government Hospital" },
  { value: "private",         label: "🏥 Private Hospital" },
  { value: "multispeciality", label: "🔬 Multispeciality Hospital" },
  { value: "clinic",          label: "🩺 Clinic / Nursing Home" },
  { value: "other",           label: "🏢 Other" },
];

export default function HospitalRegisterPage() {
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [step,      setStep]      = useState(1); // 1 = account, 2 = hospital details
  const navigate    = useNavigate();
  const { setAuth } = useAuthStore();

  const { register, handleSubmit, getValues, formState: { errors } } = useForm({
    defaultValues: { hospitalType: "private" },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Register with hospital role
      await authAPI.register({
        name:               data.contactName,
        email:              data.email,
        password:           data.password,
        phone:              data.phone,
        role:               "hospital",
        hospitalName:       data.hospitalName,
        registrationNumber: data.registrationNumber,
        address:            data.address,
        city:               data.city,
        state:              data.state,
        pincode:            data.pincode,
        emergencyPhone:     data.emergencyPhone || data.phone,
        hospitalType:       data.hospitalType,
      });

      // Auto-login
      const loginRes = await authAPI.login({ email: data.email, password: data.password });
      const { user, token, refreshToken } = loginRes.data.data;
      setAuth(user, token, refreshToken);
      toast.success(`Welcome, ${data.hospitalName}! Your emergency portal is ready.`);
      navigate("/hospital/dashboard", { replace: true });

    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      if (msg.toLowerCase().includes("already registered")) {
        toast.error("This email is already registered.");
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
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🏥</span>
        </div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Hospital Portal</h1>
        <p className="text-gray-500 mt-1 text-sm">Register your hospital to receive emergency alerts</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-6">
        {[1, 2].map((s) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 flex-1 ${s === 1 ? '' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                step >= s ? "bg-red-500 text-white" : "bg-gray-100 text-gray-400"
              }`}>{s}</div>
              <span className={`text-xs font-semibold ${step >= s ? "text-red-600" : "text-gray-400"}`}>
                {s === 1 ? "Account Info" : "Hospital Details"}
              </span>
            </div>
            {s === 1 && <div className={`h-px flex-1 ${step > 1 ? "bg-red-400" : "bg-gray-200"}`} />}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* ── STEP 1: Account Info ── */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div>
              <label className="label">Contact Person Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  {...register("contactName", { required: "Name is required", minLength: { value: 2, message: "Min 2 characters" } })}
                  placeholder="Dr. Admin / Hospital Manager"
                  className={`input pl-10 ${errors.contactName ? "input-error" : ""}`}
                />
              </div>
              {errors.contactName && <p className="error-message">{errors.contactName.message}</p>}
            </div>

            <div>
              <label className="label">Official Email</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
                  })}
                  type="email"
                  placeholder="emergency@yourhospital.com"
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
                    pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: "Must include uppercase, lowercase, and number" },
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

            <button type="button"
              onClick={() => {
                const v = getValues();
                if (!v.contactName || !v.email || !v.phone || !v.password) {
                  toast.error("Please fill all fields before continuing");
                  return;
                }
                setStep(2);
              }}
              className="btn-primary btn-lg w-full justify-center bg-red-500 hover:bg-red-600 border-red-500">
              Continue to Hospital Details →
            </button>
          </motion.div>
        )}

        {/* ── STEP 2: Hospital Details ── */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div>
              <label className="label">Hospital Name</label>
              <div className="relative">
                <FiHome className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  {...register("hospitalName", { required: "Hospital name is required" })}
                  placeholder="City General Hospital"
                  className={`input pl-10 ${errors.hospitalName ? "input-error" : ""}`}
                />
              </div>
              {errors.hospitalName && <p className="error-message">{errors.hospitalName.message}</p>}
            </div>

            <div>
              <label className="label">Registration Number</label>
              <div className="relative">
                <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  {...register("registrationNumber", { required: "Registration number is required" })}
                  placeholder="AP/HOSP/2024/XXXXX"
                  className={`input pl-10 ${errors.registrationNumber ? "input-error" : ""}`}
                />
              </div>
              {errors.registrationNumber && <p className="error-message">{errors.registrationNumber.message}</p>}
            </div>

            <div>
              <label className="label">Hospital Type</label>
              <select
                {...register("hospitalType")}
                className="input"
              >
                {HOSPITAL_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Full Address</label>
              <div className="relative">
                <FiMapPin className="absolute left-3.5 top-3 text-gray-400" size={16} />
                <textarea
                  {...register("address", { required: "Address is required" })}
                  placeholder="Door No, Street, Area"
                  rows={2}
                  className={`input pl-10 resize-none ${errors.address ? "input-error" : ""}`}
                />
              </div>
              {errors.address && <p className="error-message">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">City</label>
                <input
                  {...register("city", { required: "Required" })}
                  placeholder="Hindupur"
                  className={`input ${errors.city ? "input-error" : ""}`}
                />
              </div>
              <div>
                <label className="label">State</label>
                <input
                  {...register("state", { required: "Required" })}
                  placeholder="Andhra Pradesh"
                  className={`input ${errors.state ? "input-error" : ""}`}
                />
              </div>
              <div>
                <label className="label">Pincode</label>
                <input
                  {...register("pincode", { required: "Required" })}
                  placeholder="515201"
                  className={`input ${errors.pincode ? "input-error" : ""}`}
                />
              </div>
            </div>

            <div>
              <label className="label">Emergency Helpline (optional)</label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  {...register("emergencyPhone")}
                  type="tel"
                  placeholder="Dedicated emergency number"
                  className="input pl-10"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">This number is shown to patients calling for help</p>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="btn-outline flex-1 justify-center">
                ← Back
              </button>
              <button type="submit" disabled={loading} className="flex-1 btn-lg justify-center flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-colors disabled:opacity-50">
                {loading ? (
                  <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg> Registering…</>
                ) : "🏥 Register Hospital"}
              </button>
            </div>
          </motion.div>
        )}
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already registered?{" "}
        <Link to="/login" className="text-red-600 font-semibold hover:text-red-700">Sign in</Link>
      </p>
    </motion.div>
  );
}
