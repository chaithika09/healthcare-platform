import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiLock, FiCheckCircle } from "react-icons/fi";
import { paymentAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { appointmentId, doctor, amount } = location.state || {};

  useEffect(() => {
    if (!appointmentId) {
      toast.error("Invalid payment request");
      navigate("/patient/dashboard");
    }
  }, [appointmentId, navigate]);

  const handlePay = async () => {
    setLoading(true);
    try {
      await paymentAPI.initiate({ appointmentId, amount });

      // Since it's a simulated payment for the project
      toast.success("Processing payment...");
      await new Promise(r => setTimeout(r, 1500));

      toast.success("Payment successful!");
      navigate("/appointment-confirm", { state: location.state });
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Secure Payment</h1>
        <p className="text-gray-500 text-sm mt-1">Complete your booking with {doctor?.name || "the doctor"}</p>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Service</span>
            <span className="font-medium text-gray-900">Consultation Fee</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Amount</span>
            <span className="font-bold text-primary-600 text-lg">${amount || 150}.00</span>
          </div>
        </div>
      </div>

      <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <FiLock className="text-primary-600" size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-primary-900">Project Demo Mode</p>
          <p className="text-xs text-primary-700 mt-0.5 leading-relaxed">
            Payment processing is simulated for this project. No real money will be charged.
          </p>
        </div>
      </div>

      <button
        onClick={handlePay}
        disabled={loading}
        className="btn-primary btn-lg w-full justify-center shadow-lg shadow-primary-500/20"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : `Confirm & Pay $${amount || 150}.00`}
      </button>
    </div>
  );
}
