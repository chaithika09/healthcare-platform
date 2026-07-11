import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUIStore = create(
  persist(
    (set) => ({
      darkMode: false,
      sidebarOpen: true,
      language: "en",
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setLanguage: (language) => set({ language }),
    }),
    { name: "healthcare-ui" }
  )
);
