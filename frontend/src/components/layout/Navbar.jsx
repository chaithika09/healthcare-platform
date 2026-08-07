import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBell, FiSearch, FiMenu, FiSun, FiMoon,
  FiUser, FiSettings, FiLogOut, FiChevronDown
} from "react-icons/fi";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode, toggleSidebar } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifCount, setNotifCount] = useState(0);

  // Fetch real unread count from API
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const { notificationAPI } = await import("../../services/api");
        const res = await notificationAPI.getAll();
        setNotifCount(res.data.data.unreadCount || 0);
      } catch {
        setNotifCount(0);
      }
    };
    if (isAuthenticated) fetchCount();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <FiMenu size={20} />
        </button>

        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-72 focus-within:border-primary-400 focus-within:bg-white transition-all">
          <FiSearch size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search doctors, records... (Press Enter)"
            className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Mobile search */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          onClick={() => setShowSearch(!showSearch)}
        >
          <FiSearch size={20} />
        </button>

        {/* Dark mode */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <FiBell size={20} />
          {notifCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {notifCount}
            </span>
          )}
        </Link>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-hero flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name?.split(" ")[0] || "User"}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || "patient"}</p>
            </div>
            <FiChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
              >
                <div className="p-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="p-2">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FiUser size={15} /> My Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FiSettings size={15} /> Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut size={15} /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 p-3 md:hidden z-40"
          >
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <FiSearch size={16} className="text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search doctors, records..."
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
