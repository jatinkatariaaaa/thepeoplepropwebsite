import { DollarSign, LayoutList, CheckCircle2, Award, type LucideIcon } from "lucide-react";

type AccountStatus = {
  status?: string | null;
};

/* Rise-style pill stat card */
function PillStat({
  label,
  value,
  progress,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: string;
  progress: number; // 0–100
  icon: LucideIcon;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl px-5 py-4 ${
        highlight ? "bg-[#cbfb45]" : "bg-[#f4f4f2]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={`text-[12px] font-semibold ${
            highlight ? "text-[#0c0c0c]/60" : "text-[var(--ink-400)]"
          }`}
        >
          {label}
        </p>
        <Icon
          className={`h-4 w-4 ${
            highlight ? "text-[#0c0c0c]" : "text-[var(--ink-400)]"
          }`}
        />
      </div>
      <p className="mt-0.5 text-xl font-bold tracking-tight text-[var(--ink-950)] break-words">
        {value}
      </p>
      <div
        className={`mt-3 h-1.5 w-full overflow-hidden rounded-full ${
          highlight ? "bg-[#0c0c0c]/15" : "bg-[var(--ink-200)]"
        }`}
      >
        <div
          className="h-full rounded-full bg-[#0c0c0c]"
          style={{ width: `${Math.min(Math.max(progress, 4), 100)}%` }}
        />
      </div>
    </div>
  );
}

export function StatCards({
  accounts = [],
  totalPayouts = 0,
}: {
  accounts?: AccountStatus[];
  totalPayouts?: number;
}) {
  const activeCount = accounts.length;
  const passedCount = accounts.filter((a) => a.status === "passed").length;
  const fundedCount = accounts.filter((a) => a.status === "funded").length;

  const formattedPayouts = `$${totalPayouts.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 xl:grid-cols-4">
      <PillStat
        label="Total Payouts"
        value={formattedPayouts}
        progress={totalPayouts > 0 ? 70 : 0}
        icon={DollarSign}
        highlight
      />
      <PillStat
        label="Number of Accounts"
        value={activeCount.toString()}
        progress={activeCount > 0 ? Math.min(activeCount * 20, 100) : 0}
        icon={LayoutList}
      />
      <PillStat
        label="Accounts Passed"
        value={passedCount.toString()}
        progress={activeCount > 0 ? (passedCount / activeCount) * 100 : 0}
        icon={CheckCircle2}
      />
      <PillStat
        label="Funded Accounts"
        value={fundedCount.toString()}
        progress={activeCount > 0 ? (fundedCount / activeCount) * 100 : 0}
        icon={Award}
      />
    </div>
  );
}
