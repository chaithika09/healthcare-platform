import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, getValues } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authAPI.forgotPassword(data);
      setSent(true);
      toast.success("Reset link sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8">
        <FiArrowLeft size={16} /> Back to login
      </Link>

      {!sent ? (
        <>
          <div className="mb-8">
            <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
              <FiMail size={24} className="text-primary-600" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">Forgot password?</h1>
            <p className="text-gray-500 mt-1 text-sm">Enter your email and we'll send you a reset link.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            <button type="submit" disabled={loading} className="btn-primary btn-lg w-full justify-center">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-xl font-heading font-bold text-gray-900">Check your inbox</h2>
          <p className="text-gray-500 mt-2 text-sm">
            We sent a password reset link to<br />
            <span className="font-semibold text-gray-700">{getValues("email")}</span>
          </p>
          <Link to="/login" className="btn-primary btn-lg inline-flex mt-8">Back to Login</Link>
        </motion.div>
      )}
    </motion.div>
  );
}
