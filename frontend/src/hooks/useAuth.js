import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, setUser, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user: u, token: t, refreshToken } = res.data.data;
    setAuth(u, t, refreshToken);
    return u;
  }, [setAuth]);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch { /* ignore */ }
    storeLogout();
    toast.success("Logged out successfully");
    navigate("/login");
  }, [storeLogout, navigate]);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await authAPI.getMe();
      setUser(res.data.data.user);
    } catch { /* ignore */ }
  }, [setUser]);

  const getDashboardPath = useCallback(() => {
    if (!user) return "/login";
    const map = { patient: "/patient/dashboard", doctor: "/doctor/dashboard", admin: "/admin/dashboard" };
    return map[user.role] || "/patient/dashboard";
  }, [user]);

  return { user, token, isAuthenticated, login, logout, refreshProfile, getDashboardPath };
};

export default useAuth;
