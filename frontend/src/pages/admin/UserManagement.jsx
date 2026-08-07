import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiEdit2, FiTrash2, FiUserPlus, FiFilter, FiMoreVertical } from "react-icons/fi";
import toast from "react-hot-toast";

const users = [
  { id: 1, name: "John Smith",    email: "john@email.com",   role: "patient", status: "active",   joined: "2024-01-15", appointments: 8 },
  { id: 2, name: "Dr. Sarah J.",  email: "sarah@email.com",  role: "doctor",  status: "active",   joined: "2023-11-20", appointments: 312 },
  { id: 3, name: "Maria Garcia",  email: "maria@email.com",  role: "patient", status: "active",   joined: "2024-02-10", appointments: 3 },
  { id: 4, name: "Dr. Mike Chen", email: "mike@email.com",   role: "doctor",  status: "pending",  joined: "2024-06-01", appointments: 0 },
  { id: 5, name: "Emma Wilson",   email: "emma@email.com",   role: "patient", status: "inactive", joined: "2024-03-05", appointments: 2 },
  { id: 6, name: "Admin User",    email: "admin@email.com",  role: "admin",   status: "active",   joined: "2023-01-01", appointments: 0 },
];

const roleColors = {
  patient: "bg-blue-100 text-blue-700",
  doctor:  "bg-green-100 text-green-700",
  admin:   "bg-purple-100 text-purple-700",
};

const statusColors = {
  active:   "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  pending:  "bg-amber-100 text-amber-700",
};

export default function UserManagement() {
  const [userList, setUserList] = useState(users);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "patient" });

  const filtered = userList.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const handleDelete = (id) => {
    setUserList((prev) => prev.filter((u) => u.id !== id));
    toast.success("User deleted successfully");
  };

  const handleStatusToggle = (id, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    setUserList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u))
    );
    toast.success(`User ${nextStatus === "active" ? "activated" : "deactivated"}`);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      toast.error("Please provide both name and email");
      return;
    }
    const created = {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "active",
      joined: new Date().toISOString().split("T")[0],
      appointments: 0,
    };
    setUserList((prev) => [created, ...prev]);
    setNewUser({ name: "", email: "", role: "patient" });
    setShowAddModal(false);
    toast.success("User added successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">{userList.length} total users</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary gap-2 self-start">
          <FiUserPlus size={16} /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-48 relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input w-auto">
          <option value="all">All Roles</option>
          <option value="patient">Patients</option>
          <option value="doctor">Doctors</option>
          <option value="admin">Admins</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total", value: userList.length, color: "bg-gray-50" },
          { label: "Patients", value: userList.filter((u) => u.role === "patient").length, color: "bg-blue-50" },
          { label: "Doctors", value: userList.filter((u) => u.role === "doctor").length, color: "bg-green-50" },
          { label: "Pending", value: userList.filter((u) => u.status === "pending").length, color: "bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Activity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-hero flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${roleColors[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="text-sm text-gray-600">{u.joined}</td>
                  <td className="text-sm text-gray-600">{u.appointments} appts</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStatusToggle(u.id, u.status)}
                        title={u.status === "active" ? "Deactivate User" : "Activate User"}
                        className="p-1.5 hover:bg-amber-50 rounded-lg text-gray-400 hover:text-amber-600 transition-colors"
                      >
                        <FiMoreVertical size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        title="Delete User"
                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="jane@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="input"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Create User
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
