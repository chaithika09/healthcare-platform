import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const dashMap = { patient: "/patient/dashboard", doctor: "/doctor/dashboard", admin: "/admin/dashboard" };
    return <Navigate to={dashMap[user?.role] || "/login"} replace />;
  }

  return <Outlet />;
}
