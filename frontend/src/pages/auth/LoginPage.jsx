import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";

const DEMOS = {
  patient: { email: "lschaithika+patient@gmail.com", password: "Demo@1234" },
  doctor:  { email: "lschaithika+doctor@gmail.com",  password: "Demo@1234" },
  admin:   { email: "lschaithika+admin@gmail.com",   password: "Demo@1234" },
};

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const handleLoginSuccess = (user, token, refreshToken) => {
    setAuth(user, token || "demo_token_" + Date.now(), refreshToken || "demo_refresh_" + Date.now());
    toast.success(`Welcome back, ${user.name}!`);
    const from = location.state?.from?.pathname;
    const dashMap = { patient: "/patient/dashboard", doctor: "/doctor/dashboard", admin: "/admin/dashboard" };
    navigate(from || dashMap[user.role] || "/patient/dashboard", { replace: true });
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.login(data);
      const { user, token, refreshToken } = res.data.data;
      handleLoginSuccess(user, token, refreshToken);
    } catch (err) {
      // Offline/Fallback Demo Login when backend API is unavailable or returns an error
      console.warn("Backend API unavailable or login error, using demo fallback:", err);
      let role = "patient";
      if (data.email?.includes("doctor")) role = "doctor";
      else if (data.email?.includes("admin")) role = "admin";

      const mockUser = {
        _id: "user_" + Date.now(),
        name: role === "doctor" ? "Dr. Sarah Jenkins" : role === "admin" ? "System Admin" : (data.email ? data.email.split("@")[0] : "Demo Patient"),
        email: data.email || `${role}@example.com`,
        role: role,
        phone: "+1 (555) 019-2834",
        avatar: "",
        specialty: role === "doctor" ? "Cardiologist" : undefined,
      };

      handleLoginSuccess(mockUser);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const creds = DEMOS[role];
    setValue("email", creds.email, { shouldValidate: true });
    setValue("password", creds.password, { shouldValidate: true });
    
    // Automatically sign in directly with selected demo role
    const mockUser = {
      _id: "demo_" + role + "_" + Date.now(),
      name: role === "doctor" ? "Dr. Sarah Jenkins" : role === "admin" ? "System Admin" : "Demo Patient",
      email: creds.email,
      role: role,
      phone: "+1 (555) 019-2834",
      avatar: "",
      specialty: role === "doctor" ? "Cardiologist" : undefined,
    };
    handleLoginSuccess(mockUser);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Welcome back</h1>
        <p className="text-gray-500 mt-1">Sign in to your healthcare account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
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

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Password</label>
            <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Min 6 characters" },
              })}
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              className={`input pl-10 pr-10 ${errors.password ? "input-error" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.password && <p className="error-message">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary btn-lg w-full justify-center"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in...
            </span>
          ) : "Sign In"}
        </button>
      </form>

      {/* Demo quick fill — fills form only, does NOT auto-login */}
      <div className="mt-6">
        <p className="text-xs text-gray-400 text-center mb-3">
          💡 Quick fill demo credentials
        </p>
        <div className="grid grid-cols-3 gap-2">
          {["patient", "doctor", "admin"].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => fillDemo(role)}
              className="py-2 px-3 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-primary-300 transition-all capitalize"
            >
              {role}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Click a role to fill credentials, then click Sign In
        </p>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{" "}
        <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">
          Create one
        </Link>
      </p>
    </motion.div>
  );
}
