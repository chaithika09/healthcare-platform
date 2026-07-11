import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function OTPVerifyPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const refs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your email";

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      refs.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) { toast.error("Enter all 6 digits"); return; }
    setLoading(true);
    try {
      await authAPI.verifyOTP({ email, otp: code });
      toast.success("Email verified successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authAPI.resendOTP({ email });
      setResendTimer(60);
      toast.success("OTP resent!");
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <span className="text-3xl">📧</span>
      </div>
      <h1 className="text-2xl font-heading font-bold text-gray-900">Verify your email</h1>
      <p className="text-gray-500 mt-2 text-sm">
        We sent a 6-digit code to<br />
        <span className="font-semibold text-gray-700">{email}</span>
      </p>

      <div className="flex justify-center gap-3 mt-8" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all ${
              digit
                ? "border-primary-500 bg-primary-50 text-primary-700"
                : "border-gray-200 bg-white text-gray-900 focus:border-primary-400"
            }`}
          />
        ))}
      </div>

      <button
        onClick={handleVerify}
        disabled={loading || otp.join("").length < 6}
        className="btn-primary btn-lg w-full justify-center mt-8"
      >
        {loading ? "Verifying..." : "Verify Email"}
      </button>

      <div className="mt-4 text-sm text-gray-500">
        Didn't receive the code?{" "}
        {resendTimer > 0 ? (
          <span className="text-gray-400">Resend in {resendTimer}s</span>
        ) : (
          <button onClick={handleResend} className="text-primary-600 font-semibold hover:text-primary-700">
            Resend OTP
          </button>
        )}
      </div>
    </motion.div>
  );
}
