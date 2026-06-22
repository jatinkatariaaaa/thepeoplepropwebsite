"use client";

import { useEffect, useState } from "react";
import { Scale, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fetchTradingRules } from "@/lib/trading-client";
import { toast } from "sonner";

interface AssignChallengeModalProps {
  open: boolean;
  currentRuleId?: string | null;
  loading?: boolean;
  onSave: (ruleId: string, phase: string) => void;
  onCancel: () => void;
}

export function AssignChallengeModal({
  open,
  currentRuleId,
  loading = false,
  onSave,
  onCancel,
}: AssignChallengeModalProps) {
  const [rules, setRules] = useState<any[]>([]);
  const [ruleId, setRuleId] = useState<string>(currentRuleId || "");
  const [phase, setPhase] = useState<string>("phase_1");
  const [loadingRules, setLoadingRules] = useState(false);

  useEffect(() => {
    if (!open) return;
    setRuleId(currentRuleId || "");
    setLoadingRules(true);
    fetchTradingRules()
      .then((res) => setRules(res.rules))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoadingRules(false));
  }, [open, currentRuleId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <h2 className="font-bold text-[18px] text-[var(--ink-950)] flex items-center gap-2">
            <Scale className="w-5 h-5" /> Assign Challenge
          </h2>
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)] text-[var(--ink-400)] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">
              Rule Template
            </label>
            <select
              value={ruleId}
              onChange={(e) => setRuleId(e.target.value)}
              disabled={loadingRules}
              className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
            >
              <option value="">{loadingRules ? "Loading..." : "Select a template"}</option>
              {rules.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">
              Phase
            </label>
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
            >
              <option value="phase_1">Phase 1</option>
              <option value="phase_2">Phase 2</option>
              <option value="funded">Funded</option>
            </select>
          </div>
        </div>

        <div className="p-5 border-t border-[var(--border)] bg-[var(--paper)] flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={() => onSave(ruleId, phase)}
            disabled={loading || !ruleId}
          >
            {loading ? "Assigning..." : "Assign Challenge"}
          </Button>
        </div>
      </div>
    </div>
  );
}
