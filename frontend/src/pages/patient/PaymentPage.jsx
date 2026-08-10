import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { FiCreditCard, FiLock, FiCheckCircle } from "react-icons/fi";
import toast from "react-hot-toast";

const paymentMethods = [
  { id: "card",   label: "Credit / Debit Card", icon: "💳" },
  { id: "paypal", label: "PayPal",               icon: "🅿️" },
  { id: "apple",  label: "Apple Pay",            icon: "🍎" },
  { id: "google", label: "Google Pay",           icon: "🔵" },
];

export default function PaymentPage() {
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const amount = 150;

  const onSubmit = async () => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 2000));
      toast.success("Payment successful!");
      navigate("/appointment-confirm");
    } catch {
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Payment</h1>
        <p className="text-gray-500 text-sm mt-1">Secure payment processing</p>
      </div>

      {/* Order summary */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Consultation Fee</span><span>$150.00</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Platform Fee</span><span>$0.00</span></div>
          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
            <span>Total</span><span className="text-primary-600">${amount}.00</span>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
        <div className="grid grid-cols-2 gap-3">
          {paymentMethods.map((m) => (
            <button key={m.id} onClick={() => setMethod(m.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${method === m.id ? "border-primary-500 bg-primary-50" : "border-gray-200 hover:border-gray-300"}`}>
              <span className="text-xl">{m.icon}</span>
              <p className="text-xs font-medium text-gray-900 mt-1">{m.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Card form */}
      {method === "card" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiCreditCard size={16} /> Card Details
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Card Number</label>
              <input {...register("cardNumber", { required: true })} placeholder="1234 5678 9012 3456" className="input" maxLength={19} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Expiry Date</label>
                <input {...register("expiry", { required: true })} placeholder="MM/YY" className="input" maxLength={5} />
              </div>
              <div>
                <label className="label">CVV</label>
                <input {...register("cvv", { required: true })} placeholder="123" className="input" maxLength={4} type="password" />
              </div>
            </div>
            <div>
              <label className="label">Cardholder Name</label>
              <input {...register("name", { required: true })} placeholder="John Doe" className="input" />
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
              <FiLock size={13} className="text-green-500 flex-shrink-0" />
              Your payment information is encrypted and secure.
            </div>

            <button type="submit" disabled={loading} className="btn-primary btn-lg w-full justify-center">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : `Pay $${amount}.00`}
            </button>
          </form>
        </motion.div>
      )}

      {method !== "card" && (
        <div className="card p-8 text-center">
          <span className="text-5xl">{paymentMethods.find((m) => m.id === method)?.icon}</span>
          <p className="text-gray-600 mt-4 text-sm">You'll be redirected to {paymentMethods.find((m) => m.id === method)?.label} to complete payment.</p>
          <button onClick={onSubmit} className="btn-primary btn-lg mt-6 w-full justify-center">
            Continue to {paymentMethods.find((m) => m.id === method)?.label}
          </button>
        </div>
      )}
    </div>
  );
}
