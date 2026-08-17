import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import App from "./App";
import "./index.css";

// ─── Service Worker (PWA) ─────────────────────────────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("✅ Service Worker registered:", reg.scope))
      .catch((err) => console.warn("SW registration failed:", err));
  });
}

// ─── React Query Client ───────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,       // 5 minutes
      gcTime: 1000 * 60 * 10,         // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// ─── Root Render ─────────────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          containerStyle={{ top: 72 }}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#FFFFFF",
              color: "#0F172A",
              borderRadius: "0.75rem",
              boxShadow:
                "0 4px 16px rgba(0, 102, 204, 0.12), 0 2px 4px rgba(0, 0, 0, 0.06)",
              fontSize: "0.875rem",
              fontFamily: "Inter, sans-serif",
              padding: "12px 16px",
              maxWidth: "380px",
            },
            success: {
              iconTheme: { primary: "#00A86B", secondary: "#FFFFFF" },
              style: { borderLeft: "4px solid #00A86B" },
            },
            error: {
              iconTheme: { primary: "#EF4444", secondary: "#FFFFFF" },
              style: { borderLeft: "4px solid #EF4444" },
            },
            loading: {
              iconTheme: { primary: "#0066CC", secondary: "#E6F0FA" },
              style: { borderLeft: "4px solid #0066CC" },
            },
          }}
        />

        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
