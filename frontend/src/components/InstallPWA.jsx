import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiDownload, FiX, FiSmartphone } from "react-icons/fi";

/**
 * InstallPWA
 * Shows an install banner at the bottom of the screen on mobile.
 * On desktop, shows a small button in the corner.
 * Completely hidden once installed.
 */
export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show,          setShow]           = useState(false);
  const [installed,     setInstalled]      = useState(false);
  const [installing,    setInstalling]     = useState(false);

  useEffect(() => {
    // Already installed as standalone
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Listen for the browser's install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Detect when installed
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShow(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setShow(false);
    }
    setDeferredPrompt(null);
    setInstalling(false);
  };

  if (installed || !show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        exit={{   y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-6 left-4 right-4 z-[9999] md:left-auto md:right-6 md:w-80"
      >
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          {/* Gradient top bar */}
          <div className="h-1 bg-gradient-to-r from-primary-500 to-teal-500" />

          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* App icon */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                <FiSmartphone size={22} className="text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">Install MediQ App</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      Add to home screen for quick access
                    </p>
                  </div>
                  <button
                    onClick={() => setShow(false)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors ml-2"
                  >
                    <FiX size={16} />
                  </button>
                </div>

                {/* Features */}
                <div className="flex gap-3 mt-2.5 mb-3">
                  {["Works offline", "No app store", "Fast & secure"].map((f) => (
                    <span key={f} className="text-[10px] text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                      {f}
                    </span>
                  ))}
                </div>

                <button
                  onClick={handleInstall}
                  disabled={installing}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow disabled:opacity-60"
                >
                  <FiDownload size={15} />
                  {installing ? "Installing…" : "Install App"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
