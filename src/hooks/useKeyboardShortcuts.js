// src/hooks/useKeyboardShortcuts.js
import { useEffect } from "react";

export function useKeyboardShortcuts({
  onGenerate,
  onCloseModals,
  onOpenHistory,
  onOpenTemplates,
  onOpenSettings,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Enter or Cmd+Enter -> Generate Prompt
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (onGenerate) {
          e.preventDefault();
          onGenerate();
        }
      }

      // Esc -> Close Modals
      if (e.key === "Escape") {
        if (onCloseModals) {
          onCloseModals();
        }
      }

      // Ctrl+Shift+H -> History
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "H" || e.key === "h")) {
        if (onOpenHistory) {
          e.preventDefault();
          onOpenHistory();
        }
      }

      // Ctrl+Shift+T -> Templates
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "T" || e.key === "t")) {
        if (onOpenTemplates) {
          e.preventDefault();
          onOpenTemplates();
        }
      }

      // Ctrl+Shift+S -> Settings
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "S" || e.key === "s")) {
        if (onOpenSettings) {
          e.preventDefault();
          onOpenSettings();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onGenerate, onCloseModals, onOpenHistory, onOpenTemplates, onOpenSettings]);
}
