import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiCheckCircle, FiXCircle, FiEye, FiShield, FiFileText, FiUser } from "react-icons/fi";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function DoctorVerification() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPendingDoctors();
      setDoctors(res.data.data.doctors || []);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (id, action) => {
    if (action === "reject" && !rejectReason) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setProcessing(true);
    try {
      await adminAPI.verifyDoctor(id, { action, reason: rejectReason });
      toast.success(`Doctor ${action}ed successfully`);
      setDoctors((prev) => prev.filter((d) => d.user?._id !== id));
      setSelected(null);
      setShowReject(false);
      setRejectReason("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading applications...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Doctor Verification</h1>
        <p className="text-gray-500 text-sm mt-1">{doctors.length} applications pending review</p>
      </div>

      {doctors.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle size={40} className="text-green-500" />
          </div>
          <h3 className="font-semibold text-gray-900">All caught up!</h3>
          <p className="text-gray-500 text-sm mt-1">No pending doctor verifications.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-3">
            {doctors.map((doc, i) => (
              <motion.div key={doc._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(doc)}
                className={`card p-4 cursor-pointer transition-all ${selected?._id === doc._id ? "ring-2 ring-primary-500" : "hover:shadow-card-hover"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(doc.user?.name || "DR").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{doc.user?.name}</p>
                    <p className="text-xs text-gray-500">{doc.specialty} · {doc.experience}y exp</p>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Pending</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Submitted: {new Date(doc.createdAt).toLocaleDateString()}</p>
              </motion.div>
            ))}
          </div>

          {/* Detail */}
          {selected ? (
            <motion.div key={selected._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3 space-y-4">
              <div className="card p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center text-white font-bold text-xl">
                    {(selected.user?.name || "DR").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-gray-900 text-lg">{selected.user?.name}</h3>
                    <p className="text-primary-600 font-medium text-sm">{selected.specialty}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-5">
                  {[
                    { label: "Experience", value: `${selected.experience} years` },
                    { label: "License No.", value: selected.licenseNumber },
                    { label: "Submitted",   value: new Date(selected.createdAt).toLocaleDateString() },
                    { label: "Documents",   value: `${(selected.verificationDocuments || []).length} files` },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="font-semibold text-gray-900 mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-5">
                  <h4 className="font-semibold text-gray-900 text-sm mb-3">Submitted Documents</h4>
                  <div className="space-y-2">
                    {(selected.verificationDocuments || []).length > 0 ? selected.verificationDocuments.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <FiFileText size={14} className="text-primary-600" /> Document #{idx+1}
                        </div>
                        <button
                          onClick={() => window.open(doc, '_blank')}
                          className="btn-ghost btn-sm gap-1 text-gray-500 hover:text-primary-600"
                        >
                          <FiEye size={12} /> View
                        </button>
                      </div>
                    )) : <p className="text-xs text-gray-400">No documents uploaded.</p>}
                  </div>
                </div>

                {!showReject ? (
                  <div className="flex gap-3">
                    <button onClick={() => setShowReject(true)} disabled={processing} className="btn-danger flex-1 justify-center gap-2">
                      <FiXCircle size={16} /> Reject
                    </button>
                    <button onClick={() => handleAction(selected.user?._id, 'approve')} disabled={processing} className="btn-secondary flex-1 justify-center gap-2">
                      <FiCheckCircle size={16} /> {processing ? 'Approving...' : 'Approve'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="label">Rejection Reason *</label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                        placeholder="Explain why the application is being rejected..."
                        className="input resize-none"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setShowReject(false)} className="btn-outline flex-1">Cancel</button>
                      <button onClick={() => handleAction(selected.user?._id, 'reject')} disabled={processing} className="btn-danger flex-1 justify-center">
                        {processing ? 'Rejecting...' : 'Confirm Rejection'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="lg:col-span-3 card p-8 flex flex-col items-center justify-center text-center text-gray-400">
              <FiShield size={40} className="mb-3 opacity-40" />
              <p className="text-sm">Select a doctor application to review</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
