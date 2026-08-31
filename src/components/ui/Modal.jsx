import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const contentVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 10 },
};

export default function Modal({
  isOpen,
  onClose,
  children,
  className = "",
  showClose = true,
  maxWidth = "max-w-lg",
}) {
  const handleEscape = useCallback(
    (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleEscape]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            className={cn(
              "relative w-full shadow-2xl rounded-xl border bg-card text-card-foreground overflow-hidden",
              maxWidth,
              className
            )}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.15, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
          >
            {showClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function ModalHeader({ children, className = "" }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-6 py-4 border-b border-border",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ModalTitle({ children, className = "" }) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold tracking-tight pr-8",
        className
      )}
    >
      {children}
    </h2>
  );
}

export function ModalDescription({ children, className = "" }) {
  return (
    <p className={cn("text-sm text-muted-foreground mt-1", className)}>
      {children}
    </p>
  );
}

export function ModalContent({ children, className = "" }) {
  return (
    <div className={cn("px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]", className)}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className = "" }) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2 px-6 py-4 border-t border-border",
        className
      )}
    >
      {children}
    </div>
  );
}
