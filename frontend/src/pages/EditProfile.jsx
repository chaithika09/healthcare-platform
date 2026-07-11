import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { FiArrowLeft, FiCamera, FiSave } from "react-icons/fi";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

export default function EditProfile() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dob: "1985-01-15",
      gender: "male",
      bloodGroup: "O+",
      address: "123 Main St, New York, NY",
      bio: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      setUser({ ...user, ...data });
      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch {
      toast.error("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/profile" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <FiArrowLeft size={16} /> Back to Profile
      </Link>

      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Update your personal information</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-hero flex items-center justify-center text-white font-bold text-2xl">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors">
            <FiCamera size={13} />
          </button>
        </div>
        <div>
          <p className="font-medium text-gray-900 text-sm">Profile Photo</p>
          <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input {...register("name", { required: "Name is required" })} className={`input ${errors.name ? "input-error" : ""}`} />
              {errors.name && <p className="error-message">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email *</label>
              <input {...register("email", { required: true })} type="email" className="input" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input {...register("phone")} type="tel" className="input" />
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input {...register("dob")} type="date" className="input" />
            </div>
            <div>
              <label className="label">Gender</label>
              <select {...register("gender")} className="input">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not">Prefer not to say</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <input {...register("address")} placeholder="Your address" className="input" />
          </div>
          <div>
            <label className="label">Bio (optional)</label>
            <textarea {...register("bio")} rows={3} placeholder="Tell us about yourself..." className="input resize-none" />
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Medical Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Blood Group</label>
              <select {...register("bloodGroup")} className="input">
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Height (cm)</label>
              <input {...register("height")} type="number" placeholder="178" className="input" />
            </div>
            <div>
              <label className="label">Weight (kg)</label>
              <input {...register("weight")} type="number" placeholder="70" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Allergies (comma separated)</label>
            <input {...register("allergies")} placeholder="e.g., Penicillin, Sulfa drugs" className="input" />
          </div>
          <div>
            <label className="label">Chronic Conditions</label>
            <input {...register("conditions")} placeholder="e.g., Hypertension, Diabetes" className="input" />
          </div>
        </div>

        <div className="flex gap-3">
          <Link to="/profile" className="btn-outline flex-1 justify-center">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center gap-2">
            {loading ? "Saving..." : <><FiSave size={16} /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
