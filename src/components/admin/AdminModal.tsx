"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function AdminModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
}: AdminModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-2xl border border-[var(--dash-hairline)] overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto`}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--dash-hairline)] bg-[var(--dash-canvas)]">
                <div>
                  <h2 className="text-lg font-bold text-[var(--ink-950)]">{title}</h2>
                  {description && (
                    <p className="text-sm text-[var(--ink-500)] mt-0.5">{description}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 text-[var(--ink-400)] hover:text-[var(--ink-950)] hover:bg-ink-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
