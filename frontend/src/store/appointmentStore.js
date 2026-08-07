import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAppointmentStore = create(
  persist(
    (set, get) => ({
      appointments: [],

      addAppointment: (apt) => {
        const newApt = {
          id: "apt_" + Date.now(),
          createdAt: new Date().toISOString(),
          status: "upcoming",
          ...apt,
        };
        set((state) => ({
          appointments: [newApt, ...state.appointments],
        }));
        return newApt;
      },

      cancelAppointment: (id) => {
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === id ? { ...a, status: "cancelled" } : a
          ),
        }));
      },

      getAppointmentsByUser: (userEmail) => {
        if (!userEmail) return [];
        return get().appointments.filter(
          (a) => a.patientEmail?.toLowerCase() === userEmail?.toLowerCase()
        );
      },
    }),
    {
      name: "healthcare-appointments-store",
    }
  )
);
