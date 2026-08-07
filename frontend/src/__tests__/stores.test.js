import { useAuthStore } from "../store/authStore";
import { useAppointmentStore } from "../store/appointmentStore";
import { useUIStore } from "../store/uiStore";

describe("Zustand State Stores Suite", () => {
  beforeEach(() => {
    useAuthStore.getState().logout();
  });

  test("authStore handles login and logout states", () => {
    const mockUser = { _id: "123", name: "John Patient", role: "patient", email: "john@example.com" };
    useAuthStore.getState().setAuth(mockUser, "token_123", "refresh_123");

    let state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user.name).toBe("John Patient");
    expect(state.token).toBe("token_123");

    useAuthStore.getState().logout();
    state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  test("appointmentStore adds and cancels appointments", () => {
    const newApt = useAppointmentStore.getState().addAppointment({
      doctorName: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      date: "2026-09-01",
      time: "10:00 AM",
      patientEmail: "testpatient@example.com",
    });

    expect(newApt.id).toBeDefined();
    expect(newApt.status).toBe("upcoming");

    let userApts = useAppointmentStore.getState().getAppointmentsByUser("testpatient@example.com");
    expect(userApts.length).toBeGreaterThanOrEqual(1);

    useAppointmentStore.getState().cancelAppointment(newApt.id);
    const updated = useAppointmentStore.getState().appointments.find((a) => a.id === newApt.id);
    expect(updated.status).toBe("cancelled");
  });

  test("uiStore toggles dark mode and sidebar state", () => {
    const initialDark = useUIStore.getState().darkMode;
    useUIStore.getState().toggleDarkMode();
    expect(useUIStore.getState().darkMode).toBe(!initialDark);

    useUIStore.getState().setSidebarOpen(false);
    expect(useUIStore.getState().sidebarOpen).toBe(false);

    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });
});
