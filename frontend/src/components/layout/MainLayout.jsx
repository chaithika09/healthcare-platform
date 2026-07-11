import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import { useUIStore } from "../../store/uiStore";

export default function MainLayout() {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6"
        >
          <Outlet />
        </main>
      </div>
      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  );
}
