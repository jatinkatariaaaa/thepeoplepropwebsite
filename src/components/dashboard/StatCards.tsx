import { DollarSign, LayoutList, CheckCircle2, Award, type LucideIcon } from "lucide-react";

type AccountStatus = {
  status?: string | null;
};

/* Rise-style pill stat card */
function PillStat({
  label,
  value,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col justify-center rounded-2xl px-5 py-5 ${
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
      <p className="mt-1 text-xl font-bold tracking-tight text-[var(--ink-950)] break-words">
        {value}
      </p>
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
        icon={DollarSign}
        highlight
      />
      <PillStat
        label="Number of Accounts"
        value={activeCount.toString()}
        icon={LayoutList}
      />
      <PillStat
        label="Accounts Passed"
        value={passedCount.toString()}
        icon={CheckCircle2}
      />
      <PillStat
        label="Funded Accounts"
        value={fundedCount.toString()}
        icon={Award}
      />
    </div>
  );
}
