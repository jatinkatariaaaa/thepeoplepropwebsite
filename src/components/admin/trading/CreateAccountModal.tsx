"use client";

import { useEffect, useState } from "react";
import { Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  fetchTradingPlatforms,
  fetchTradingRules,
  fetchCustomers,
} from "@/lib/trading-client";
import { LEVERAGE_OPTIONS } from "@/lib/trading";
import { toast } from "sonner";

interface CreateAccountModalProps {
  open: boolean;
  loading?: boolean;
  onCreate: (payload: {
    user_id: string;
    platform_id: string;
    rule_id?: string | null;
    starting_balance: number;
    leverage: number;
    phase: string;
  }) => void;
  onCancel: () => void;
}

export function CreateAccountModal({
  open,
  loading = false,
  onCreate,
  onCancel,
}: CreateAccountModalProps) {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [loadingLists, setLoadingLists] = useState(false);

  const [form, setForm] = useState({
    user_id: "",
    platform_id: "",
    rule_id: "",
    starting_balance: 10000,
    leverage: 100,
    phase: "phase_1",
  });

  // Load platforms + rules when the modal opens.
  useEffect(() => {
    if (!open) return;
    setForm({
      user_id: "",
      platform_id: "",
      rule_id: "",
      starting_balance: 10000,
      leverage: 100,
      phase: "phase_1",
    });
    setLoadingLists(true);
    Promise.all([fetchTradingPlatforms(), fetchTradingRules()])
      .then(([p, r]) => {
        setPlatforms(p.platforms.filter((pl: any) => pl.is_active));
        setRules(r.rules);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoadingLists(false));
  }, [open]);

  // Debounced customer search.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      fetchCustomers(customerSearch)
        .then((res) => setCustomers(res.users))
        .catch((e) => toast.error(e.message));
    }, 300);
    return () => clearTimeout(t);
  }, [open, customerSearch]);

  if (!open) return null;

  const canSubmit =
    form.user_id && form.platform_id && form.starting_balance > 0;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <h2 className="font-bold text-[18px] text-[var(--ink-950)] flex items-center gap-2">
            <Wallet className="w-5 h-5" /> Issue Trading Account
          </h2>
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)] text-[var(--ink-400)] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Customer */}
          <div>
            <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">
              Customer
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full mb-2 bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
            />
            <select
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
            >
              <option value="">Select a customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.display_name ? `${c.display_name} (${c.email})` : c.email}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Platform */}
            <div>
              <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">
                Platform
              </label>
              <select
                value={form.platform_id}
                onChange={(e) => setForm({ ...form, platform_id: e.target.value })}
                disabled={loadingLists}
                className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
              >
                <option value="">{loadingLists ? "Loading..." : "Select platform"}</option>
                {platforms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rule template */}
            <div>
              <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">
                Challenge (optional)
              </label>
              <select
                value={form.rule_id}
                onChange={(e) => setForm({ ...form, rule_id: e.target.value })}
                disabled={loadingLists}
                className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
              >
                <option value="">No template</option>
                {rules.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Starting balance */}
            <div className="col-span-1">
              <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">
                Balance ($)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.starting_balance}
                onChange={(e) =>
                  setForm({ ...form, starting_balance: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
              />
            </div>

            {/* Leverage */}
            <div className="col-span-1">
              <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">
                Leverage
              </label>
              <select
                value={form.leverage}
                onChange={(e) => setForm({ ...form, leverage: parseInt(e.target.value) })}
                className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
              >
                {LEVERAGE_OPTIONS.map((lev) => (
                  <option key={lev} value={lev}>
                    1:{lev}
                  </option>
                ))}
              </select>
            </div>

            {/* Phase */}
            <div className="col-span-1">
              <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">
                Phase
              </label>
              <select
                value={form.phase}
                onChange={(e) => setForm({ ...form, phase: e.target.value })}
                className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
              >
                <option value="phase_1">Phase 1</option>
                <option value="phase_2">Phase 2</option>
                <option value="funded">Funded</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-[var(--border)] bg-[var(--paper)] flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={() =>
              onCreate({
                user_id: form.user_id,
                platform_id: form.platform_id,
                rule_id: form.rule_id || null,
                starting_balance: Number(form.starting_balance),
                leverage: form.leverage,
                phase: form.phase,
              })
            }
            disabled={loading || !canSubmit}
          >
            {loading ? "Creating..." : "Issue Account"}
          </Button>
        </div>
      </div>
    </div>
  );
}
