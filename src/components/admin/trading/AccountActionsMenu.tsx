"use client";

import { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal,
  RotateCcw,
  Scale,
  Power,
  PowerOff,
  Gauge,
  Trash2,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface AccountActionHandlers {
  onResetChallenge: () => void;
  onAssignChallenge: () => void;
  onEnable: () => void;
  onDisable: () => void;
  onChangeLeverage: () => void;
  onDelete: () => void;
}

interface AccountActionsMenuProps {
  account: any;
  handlers: AccountActionHandlers;
}

/**
 * Per-row actions menu for the trading accounts table.
 * Pops a small dropdown; each item triggers the relevant modal / confirm flow
 * owned by the parent page.
 */
export function AccountActionsMenu({ account, handlers }: AccountActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const isDisabled = account.status === "disabled";

  function run(fn: () => void) {
    setOpen(false);
    fn();
  }

  const itemClass =
    "w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[var(--ink-700)] hover:bg-[var(--dash-canvas)] transition-colors text-left";

  return (
    <div className="relative flex justify-end" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 hover:bg-[var(--dash-canvas)] rounded-lg text-[var(--ink-500)] transition-colors"
        aria-label="Account actions"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[var(--dash-hairline)] rounded-xl shadow-lg py-1 z-[100] overflow-hidden">
          <Link
            href={`/admin/trading/accounts/${account.id}`}
            className={itemClass}
            onClick={() => setOpen(false)}
          >
            <Eye className="w-4 h-4 text-[var(--ink-400)]" /> View Details
          </Link>
          <button className={itemClass} onClick={() => run(handlers.onAssignChallenge)}>
            <Scale className="w-4 h-4 text-violet-500" /> Assign Challenge
          </button>
          <button className={itemClass} onClick={() => run(handlers.onChangeLeverage)}>
            <Gauge className="w-4 h-4 text-blue-500" /> Change Leverage
          </button>
          <button className={itemClass} onClick={() => run(handlers.onResetChallenge)}>
            <RotateCcw className="w-4 h-4 text-amber-500" /> Reset Challenge
          </button>

          <div className="my-1 border-t border-[var(--dash-hairline)]" />

          {isDisabled ? (
            <button className={itemClass} onClick={() => run(handlers.onEnable)}>
              <Power className="w-4 h-4 text-emerald-500" /> Enable Account
            </button>
          ) : (
            <button className={itemClass} onClick={() => run(handlers.onDisable)}>
              <PowerOff className="w-4 h-4 text-amber-600" /> Disable Account
            </button>
          )}

          <button
            className={cn(itemClass, "text-red-600 hover:bg-red-50")}
            onClick={() => run(handlers.onDelete)}
          >
            <Trash2 className="w-4 h-4" /> Delete Account
          </button>
        </div>
      )}
    </div>
  );
}
