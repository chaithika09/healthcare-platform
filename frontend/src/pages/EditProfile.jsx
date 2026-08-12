import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { FiArrowLeft, FiCamera, FiSave, FiQrCode } from "react-icons/fi";
import { useAuthStore } from "../store/authStore";
import { patientAPI, doctorAPI } from "../services/api";
import toast from "react-hot-toast";

export default function EditProfile() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [qrPreview, setQrPreview] = useState(user?.profile?.paymentQRCode || null);
  const qrRef = useRef();

  const existingProfile = user?.profile || {};
  const isDoctor = user?.role === "doctor";

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name:        user?.name        || "",
      email:       user?.email       || "",
      phone:       user?.phone       || "",
      dob:         existingProfile.dateOfBirth?.split('T')[0] || "",
      gender:      existingProfile.gender       || "",
      bloodGroup:  existingProfile.bloodGroup   || "",
      height:      existingProfile.height       || "",
      weight:      existingProfile.weight       || "",
      address:     existingProfile.address      || "",
      allergies:   existingProfile.medicalHistory?.allergies?.join(", ")  || "",
      conditions:  existingProfile.medicalHistory?.conditions?.join(", ") || "",
      medications: existingProfile.medicalHistory?.medications?.join(", ")|| "",
      // Doctor specific
      specialty:   existingProfile.specialty || "",
      hospital:    existingProfile.hospital  || "",
      bio:         existingProfile.bio       || "",
      experience:  existingProfile.experience|| "",
    },
  });

  const handleQrUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isDoctor) {
        const updateData = {
          name: data.name,
          phone: data.phone,
          specialty: data.specialty,
          hospital: data.hospital,
          bio: data.bio,
          experience: parseInt(data.experience),
          paymentQRCode: qrPreview
        };
        const res = await doctorAPI.updateProfile(updateData);
        const updatedDoc = res.data.data.doctor;
        setUser({ ...user, name: updatedDoc.user.name, phone: updatedDoc.user.phone, profile: updatedDoc });
      } else {
        const updateData = {
          name: data.name,
          phone: data.phone,
          dateOfBirth: data.dob,
          gender: data.gender,
          bloodGroup: data.bloodGroup,
          height: data.height,
          weight: data.weight,
          address: data.address,
          medicalHistory: {
            allergies: data.allergies ? data.allergies.split(",").map(s => s.trim()).filter(Boolean) : [],
            conditions: data.conditions ? data.conditions.split(",").map(s => s.trim()).filter(Boolean) : [],
            medications: data.medications ? data.medications.split(",").map(s => s.trim()).filter(Boolean) : [],
          }
        };
        const res = await patientAPI.updateProfile(updateData);
        const updatedPatient = res.data.data.patient;
        setUser({ ...user, name: updatedPatient.user.name, phone: updatedPatient.user.phone, profile: updatedPatient });
      }

      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed. Please try again.");
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
        <p className="text-gray-500 text-sm mt-1">Fill in your personal information</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-hero flex items-center justify-center text-white font-bold text-2xl">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <button
            type="button"
            onClick={() => toast.success("Photo upload triggered! Selected new profile photo.")}
            aria-label="Upload profile photo"
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors"
          >
            <FiCamera size={13} />
          </button>
        </div>
        <div>
          <p className="font-medium text-gray-900 text-sm">Profile Photo</p>
          <p className="text-xs text-gray-500">Click camera icon to change</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input
                {...register("name", { required: "Name is required" })}
                placeholder="Enter your full name"
                className={`input ${errors.name ? "input-error" : ""}`}
              />
              {errors.name && <p className="error-message">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input {...register("email")} type="email" disabled className="input opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input {...register("phone")} type="tel" placeholder="+1 555-0100" className="input" />
            </div>
            {!isDoctor && (
              <>
                <div>
                  <label className="label">Date of Birth</label>
                  <input {...register("dob")} type="date" className="input" />
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select {...register("gender")} className="input">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not">Prefer not to say</option>
                  </select>
                </div>
              </>
            )}
            {isDoctor && (
              <>
                <div>
                  <label className="label">Specialty</label>
                  <input {...register("specialty")} placeholder="e.g. Cardiologist" className="input" />
                </div>
                <div>
                  <label className="label">Experience (Years)</label>
                  <input {...register("experience")} type="number" placeholder="e.g. 10" className="input" />
                </div>
                <div className="col-span-2">
                  <label className="label">Hospital / Clinic</label>
                  <input {...register("hospital")} placeholder="e.g. City General Hospital" className="input" />
                </div>
                <div className="col-span-2">
                  <label className="label">Bio</label>
                  <textarea {...register("bio")} rows={3} placeholder="Write a short bio..." className="input resize-none" />
                </div>
              </>
            )}
            {!isDoctor && (
              <div className="col-span-2">
                <label className="label">Address</label>
                <input {...register("address")} placeholder="Your full address" className="input" />
              </div>
            )}
          </div>
        </div>

        {/* Doctor Payment QR Section */}
        {isDoctor && (
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <FiQrCode className="text-primary-600" /> Payment QR Code
            </h3>
            <p className="text-xs text-gray-500">Upload your payment QR code (UPI, PayPal, etc.) so patients can pay you directly.</p>

            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
              {qrPreview ? (
                <div className="relative group">
                  <img src={qrPreview} alt="QR Preview" className="w-48 h-48 object-contain rounded-lg shadow-md bg-white p-2" />
                  <button
                    type="button"
                    onClick={() => { setQrPreview(null); }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <FiSave className="rotate-45" size={14} />
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <FiQrCode size={28} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">No QR Code Uploaded</p>
                </div>
              )}

              <input
                ref={qrRef}
                type="file"
                accept="image/*"
                onChange={handleQrUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => qrRef.current?.click()}
                className="mt-4 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
              >
                {qrPreview ? "Change QR Code" : "Upload QR Code"}
              </button>
            </div>
          </div>
        )}

        {/* Medical Info (Only for patients) */}
        {!isDoctor && (
          <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-900">Medical Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Blood Group</label>
              <select {...register("bloodGroup")} className="input">
                <option value="">Select blood group</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Height (cm)</label>
              <input {...register("height")} type="number" placeholder="e.g. 170" className="input" />
            </div>
            <div>
              <label className="label">Weight (kg)</label>
              <input {...register("weight")} type="number" placeholder="e.g. 65" className="input" />
            </div>
          </div>
          <div>
            <label className="label">Allergies <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <input {...register("allergies")} placeholder="e.g. Penicillin, Pollen, Dust" className="input" />
          </div>
          <div>
            <label className="label">Chronic Conditions <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <input {...register("conditions")} placeholder="e.g. Diabetes, Hypertension" className="input" />
          </div>
          <div>
            <label className="label">Current Medications <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <input {...register("medications")} placeholder="e.g. Metformin 500mg, Amlodipine 5mg" className="input" />
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
