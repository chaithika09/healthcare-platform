import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiDownload, FiSearch, FiCreditCard, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";
import toast from "react-hot-toast";

const payments = [
  { id: "PAY-001", description: "Consultation - Dr. Sarah Johnson", date: "2024-06-15", amount: 150, status: "paid",    method: "Visa •••• 4242" },
  { id: "PAY-002", description: "Lab Test - CBC + Lipid Profile",   date: "2024-06-10", amount: 60,  status: "paid",    method: "Mastercard •••• 5555" },
  { id: "PAY-003", description: "Consultation - Dr. Emily Davis",   date: "2024-06-01", amount: 120, status: "paid",    method: "PayPal" },
  { id: "PAY-004", description: "Consultation - Dr. Michael Chen",  date: "2024-05-28", amount: 180, status: "refunded",method: "Visa •••• 4242" },
  { id: "PAY-005", description: "Lab Test - HbA1c",                 date: "2024-05-15", amount: 30,  status: "paid",    method: "Google Pay" },
  { id: "PAY-006", description: "Consultation - Dr. James Wilson",  date: "2024-05-10", amount: 100, status: "pending", method: "Visa •••• 4242" },
];

const statusConfig = {
  paid:     { label: "Paid",     icon: FiCheckCircle, color: "text-green-600 bg-green-100" },
  refunded: { label: "Refunded", icon: FiXCircle,     color: "text-blue-600 bg-blue-100" },
  pending:  { label: "Pending",  icon: FiClock,       color: "text-amber-600 bg-amber-100" },
};

export default function PaymentHistory() {
  const handleDownloadReceipt = (p) => {
    const text = `
============================================================
 SMART HEALTHCARE PORTAL — PAYMENT RECEIPT
============================================================
 Transaction ID  : ${p.id}
 Date & Time     : ${p.date}
 Description     : ${p.description}
 Payment Method  : ${p.method}
 Total Amount    : $${p.amount}.00 USD
 Payment Status  : ${p.status.toUpperCase()}
============================================================

 THANK YOU FOR YOUR PAYMENT.
 For billing queries or support, contact billing@mediq.com.
 SHA256 Verification Code: ${Math.random().toString(36).substring(2, 14).toUpperCase()}
============================================================
`;
    const blob = new Blob([text.trim()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Receipt_${p.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded receipt for ${p.id}!`);
  };
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = payments.filter((p) => {
    const matchSearch = p.description.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  const total = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Payment History</h1>
        <p className="text-gray-500 text-sm mt-1">All your transactions in one place</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Spent", value: `$${total}`, color: "bg-primary-50 text-primary-700" },
          { label: "Transactions", value: payments.length, color: "bg-green-50 text-green-700" },
          { label: "Pending", value: payments.filter((p) => p.status === "pending").length, color: "bg-amber-50 text-amber-700" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.color}`}>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
        <div className="flex gap-2">
          {["all", "paid", "pending", "refunded"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-all capitalize ${filter === f ? "bg-primary-500 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Date</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const s = statusConfig[p.status];
                return (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{p.description}</p>
                        <p className="text-xs text-gray-400">{p.id}</p>
                      </div>
                    </td>
                    <td className="text-sm text-gray-600">{p.date}</td>
                    <td>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <FiCreditCard size={13} /> {p.method}
                      </div>
                    </td>
                    <td className="font-semibold text-gray-900">${p.amount}</td>
                    <td>
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${s.color}`}>
                        <s.icon size={11} /> {s.label}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleDownloadReceipt(p)} className="btn-ghost btn-sm gap-1 text-gray-500 hover:text-primary-600">
                        <FiDownload size={13} /> Receipt
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FiCreditCard size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
}
