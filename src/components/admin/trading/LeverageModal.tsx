"use client";

import { useState } from "react";
import { Scale, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LEVERAGE_OPTIONS } from "@/lib/trading";

interface LeverageModalProps {
  open: boolean;
  currentLeverage: number;
  loading?: boolean;
  onSave: (leverage: number) => void;
  onCancel: () => void;
}

export function LeverageModal({
  open,
  currentLeverage,
  loading = false,
  onSave,
  onCancel,
}: LeverageModalProps) {
  const [leverage, setLeverage] = useState<number>(currentLeverage || 100);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <h2 className="font-bold text-[18px] text-[var(--ink-950)] flex items-center gap-2">
            <Scale className="w-5 h-5" /> Change Leverage
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
          <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">
            Leverage (1:N)
          </label>
          <select
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
          >
            {LEVERAGE_OPTIONS.map((lev) => (
              <option key={lev} value={lev}>
                1:{lev}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-[var(--ink-500)] mt-1.5">
            Current leverage is 1:{currentLeverage}.
          </p>
        </div>

        <div className="p-5 border-t border-[var(--border)] bg-[var(--paper)] flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={() => onSave(leverage)}
            disabled={loading || leverage === currentLeverage}
          >
            {loading ? "Saving..." : "Save Leverage"}
          </Button>
        </div>
      </div>
    </div>
  );
}
