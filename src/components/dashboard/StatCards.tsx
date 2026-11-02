import { DollarSign, LayoutList, CheckCircle2, Award } from "lucide-react";
import { Stat } from "./glass";

type AccountStatus = {
  status?: string | null;
};

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
      <Stat
        label="Total Payouts"
        value={formattedPayouts}
        icon={DollarSign}
        highlight
      />
      <Stat
        label="Number of Accounts"
        value={activeCount.toString()}
        icon={LayoutList}
      />
      <Stat
        label="Accounts Passed"
        value={passedCount.toString()}
        icon={CheckCircle2}
      />
      <Stat
        label="Funded Accounts"
        value={fundedCount.toString()}
        icon={Award}
      />
    </div>
  );
}
