import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, password: data.password });
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed. Link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8">
        <FiArrowLeft size={16} /> Back to login
      </Link>

      <div className="mb-8">
        <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
          <FiLock size={24} className="text-primary-600" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Reset password</h1>
        <p className="text-gray-500 mt-1 text-sm">Create a strong new password for your account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="label">New Password</label>
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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.password && <p className="error-message">{errors.password.message}</p>}
        </div>

        <div>
          <label className="label">Confirm Password</label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (val) => val === watch("password") || "Passwords do not match",
              })}
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              className={`input pl-10 pr-10 ${errors.confirmPassword ? "input-error" : ""}`}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
        </div>

        {/* Password strength hints */}
        <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
          {[
            { label: "At least 8 characters", test: (v) => v?.length >= 8 },
            { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v || "") },
            { label: "One lowercase letter", test: (v) => /[a-z]/.test(v || "") },
            { label: "One number", test: (v) => /\d/.test(v || "") },
          ].map((rule) => {
            const pass = rule.test(watch("password"));
            return (
              <div key={rule.label} className="flex items-center gap-2 text-xs">
                <span className={pass ? "text-green-500" : "text-gray-400"}>{pass ? "✓" : "○"}</span>
                <span className={pass ? "text-green-600" : "text-gray-500"}>{rule.label}</span>
              </div>
            );
          })}
        </div>

        <button type="submit" disabled={loading} className="btn-primary btn-lg w-full justify-center">
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </motion.div>
  );
}
