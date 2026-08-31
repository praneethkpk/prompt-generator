import React from "react";
import { Menu, Zap } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useSettingsStore } from "@/store/settingsStore";

export default function Header({ onMenuToggle }) {
  const apiKey = useSettingsStore((s) => s.apiKey);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile menu + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-bold tracking-tight">PromptGen</span>
          </div>
        </div>

        {/* Right: Status + Theme */}
        <div className="flex items-center gap-2">
          {/* API Key Status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                apiKey ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span className="text-muted-foreground font-medium">
              {apiKey ? "Key Active" : "No Key"}
            </span>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
