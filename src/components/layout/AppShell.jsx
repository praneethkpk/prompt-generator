import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MobileNav from "./MobileNav";

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar - Desktop */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Footer - Desktop */}
        <footer className="hidden lg:block border-t border-border py-4 text-center text-xs text-muted-foreground">
          <div className="max-w-5xl mx-auto px-8 space-y-1">
            <div>
              BYOK Security Model &middot; Zero Storage Guarantee &middot; Client-Side Direct Connections
            </div>
            <div className="text-[10px] text-muted-foreground/60">
              Keyboard Shortcuts: <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground/70 font-mono">Ctrl+Enter</kbd> Generate &middot;{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground/70 font-mono">Ctrl+Shift+T</kbd> Templates &middot;{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground/70 font-mono">Ctrl+Shift+H</kbd> History
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
