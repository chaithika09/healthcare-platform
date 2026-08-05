import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { FiMail, FiArrowLeft, FiCopy, FiExternalLink } from "react-icons/fi";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState(null);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, getValues } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authAPI.forgotPassword(data);
      setSent(true);
      // Dev mode: backend returns the reset URL directly
      if (res.data?.data?.resetUrl) {
        setResetUrl(res.data.data.resetUrl);
      }
      toast.success("Reset link generated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(resetUrl);
    toast.success("Link copied to clipboard!");
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
            <p className="text-gray-500 mt-1 text-sm">Enter your email and we'll generate a reset link.</p>
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
              {loading ? "Generating..." : "Get Reset Link"}
            </button>
          </form>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-xl font-heading font-bold text-gray-900">Reset Link Ready!</h2>
            <p className="text-gray-500 mt-2 text-sm">
              For <span className="font-semibold text-gray-700">{getValues("email")}</span>
            </p>
          </div>

          {resetUrl ? (
            <div className="space-y-4">
              {/* Dev mode — show link directly */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="text-xs font-semibold text-blue-700 mb-2">
                  🔧 Development Mode — Click the link below to reset your password:
                </p>
                <div className="bg-white rounded-xl p-3 border border-blue-100 break-all text-xs text-blue-800 font-mono">
                  {resetUrl}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={copyLink}
                  className="btn-outline flex-1 gap-2 justify-center"
                >
                  <FiCopy size={14} /> Copy Link
                </button>
                <button
                  onClick={() => {
                    const token = new URL(resetUrl).searchParams.get("token");
                    navigate(`/reset-password?token=${token}`);
                  }}
                  className="btn-primary flex-1 gap-2 justify-center"
                >
                  <FiExternalLink size={14} /> Open Reset Page
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700">
                  ⚠️ <strong>Note:</strong> In production, this link will be sent to your email automatically.
                  Configure SMTP settings in <code className="bg-amber-100 px-1 rounded">backend/.env</code> to enable real email delivery.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <p className="text-sm text-gray-600">
                Check your email inbox for the reset link.<br />
                <span className="text-xs text-gray-400 mt-1 block">
                  (If not received, configure SMTP in backend/.env)
                </span>
              </p>
            </div>
          )}

          <Link to="/login" className="btn-outline btn-lg w-full justify-center block text-center">
            Back to Login
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
