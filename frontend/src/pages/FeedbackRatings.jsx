import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiStar } from "react-icons/fi";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function FeedbackRatings() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    if (!rating) { toast.error("Please select a rating"); return; }
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    toast.success("Thank you for your feedback!");
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">⭐</span>
        </div>
        <h2 className="text-2xl font-heading font-bold text-gray-900">Thank You!</h2>
        <p className="text-gray-500 mt-2">Your feedback helps us improve our services.</p>
        <button onClick={() => { setSubmitted(false); setRating(0); }} className="btn-primary mt-8">Submit Another</button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Feedback & Ratings</h1>
        <p className="text-gray-500 text-sm mt-1">Share your experience with us</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="card p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">How would you rate your experience?</h3>
          <p className="text-sm text-gray-500 mb-5">Your honest feedback helps us serve you better</p>
          <div className="flex justify-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110"
              >
                <FiStar
                  size={36}
                  className={`transition-colors ${(hover || rating) >= star ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm font-medium text-gray-700">
            {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : rating === 5 ? "Excellent!" : "Select a rating"}
          </p>
        </div>

        <div className="card p-5 space-y-4">
          <div>
            <label className="label">Category</label>
            <select {...register("category")} className="input">
              <option>Overall Experience</option>
              <option>Doctor Consultation</option>
              <option>App Usability</option>
              <option>Appointment Booking</option>
              <option>Payment Process</option>
              <option>Customer Support</option>
            </select>
          </div>
          <div>
            <label className="label">Your Feedback *</label>
            <textarea
              {...register("feedback", { required: "Please share your feedback" })}
              rows={4}
              placeholder="Tell us about your experience..."
              className={`input resize-none ${errors.feedback ? "input-error" : ""}`}
            />
            {errors.feedback && <p className="error-message">{errors.feedback.message}</p>}
          </div>
          <div>
            <label className="label">Would you recommend us?</label>
            <div className="flex gap-3">
              {["Yes, definitely", "Maybe", "No"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input {...register("recommend")} type="radio" value={opt} className="w-4 h-4 text-primary-600" />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary btn-lg w-full justify-center">Submit Feedback</button>
      </form>
    </div>
  );
}
