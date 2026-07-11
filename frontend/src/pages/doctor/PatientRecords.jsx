import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiUser, FiFileText, FiCalendar, FiPhone, FiMail, FiActivity } from "react-icons/fi";

const patients = [
  { id: 1, name: "John Smith",   age: 45, gender: "Male",   phone: "+1 555-0101", email: "john@email.com", lastVisit: "2024-06-15", condition: "Hypertension", visits: 8 },
  { id: 2, name: "Maria Garcia", age: 32, gender: "Female", phone: "+1 555-0102", email: "maria@email.com", lastVisit: "2024-06-10", condition: "Chest Pain",   visits: 3 },
  { id: 3, name: "Robert Lee",   age: 58, gender: "Male",   phone: "+1 555-0103", email: "robert@email.com",lastVisit: "2024-06-01", condition: "Arrhythmia",   visits: 12 },
  { id: 4, name: "Emma Wilson",  age: 28, gender: "Female", phone: "+1 555-0104", email: "emma@email.com",  lastVisit: "2024-05-28", condition: "Checkup",      visits: 2 },
  { id: 5, name: "David Brown",  age: 67, gender: "Male",   phone: "+1 555-0105", email: "david@email.com", lastVisit: "2024-05-20", condition: "Heart Failure", visits: 15 },
];

export default function PatientRecords() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.condition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">My Patients</h1>
        <p className="text-gray-500 text-sm mt-1">{patients.length} patients under your care</p>
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input type="text" placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Patient list */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(p)}
              className={`card p-4 cursor-pointer transition-all ${selected?.id === p.id ? "ring-2 ring-primary-500" : "hover:shadow-card-hover"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {p.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.age}y · {p.gender} · {p.condition}</p>
                </div>
                <span className="text-xs text-gray-400">{p.visits} visits</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Patient detail */}
        {selected ? (
          <motion.div key={selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3 space-y-4">
            <div className="card p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center text-white font-bold text-xl">
                  {selected.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-gray-900 text-lg">{selected.name}</h3>
                  <p className="text-gray-500 text-sm">{selected.age} years · {selected.gender}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { icon: FiPhone,    label: "Phone",      value: selected.phone },
                  { icon: FiMail,     label: "Email",      value: selected.email },
                  { icon: FiCalendar, label: "Last Visit",  value: selected.lastVisit },
                  { icon: FiActivity, label: "Condition",   value: selected.condition },
                  { icon: FiUser,     label: "Total Visits",value: `${selected.visits} visits` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <item.icon size={14} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <p className="font-medium text-gray-900 text-xs">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-5 pt-5 border-t border-gray-100">
                <button className="btn-primary btn-sm flex-1 justify-center gap-1.5">
                  <FiFileText size={13} /> Write Prescription
                </button>
                <button className="btn-outline btn-sm flex-1 justify-center gap-1.5">
                  <FiFileText size={13} /> View Records
                </button>
              </div>
            </div>

            {/* Recent visits */}
            <div className="card p-5">
              <h4 className="font-semibold text-gray-900 mb-3">Recent Visits</h4>
              <div className="space-y-2">
                {[
                  { date: selected.lastVisit, reason: selected.condition, notes: "Medication adjusted" },
                  { date: "2024-05-01", reason: "Follow-up", notes: "Stable condition" },
                ].map((v, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{v.reason}</p>
                      <p className="text-xs text-gray-500">{v.notes}</p>
                    </div>
                    <span className="text-xs text-gray-400">{v.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="lg:col-span-3 card p-8 flex flex-col items-center justify-center text-center text-gray-400">
            <FiUser size={40} className="mb-3 opacity-40" />
            <p className="text-sm">Select a patient to view their details</p>
          </div>
        )}
      </div>
    </div>
  );
}
