"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Reusable confirmation dialog for destructive / important admin actions.
 * Matches the existing modal styling used across the trading module.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <h2 className="font-bold text-[18px] text-[var(--ink-950)] flex items-center gap-2">
            <AlertTriangle
              className={cn(
                "w-5 h-5",
                destructive ? "text-red-600" : "text-amber-500"
              )}
            />
            {title}
          </h2>
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)] text-[var(--ink-400)] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-[14px] text-[var(--ink-700)] leading-relaxed">{message}</p>
        </div>

        <div className="p-5 border-t border-[var(--border)] bg-[var(--paper)] flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "dark" : "primary"}
            className={cn(
              "flex-1",
              destructive && "bg-red-600 text-white hover:bg-red-700"
            )}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Working..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
