import { DollarSign, LayoutList, CheckCircle2, Award } from "lucide-react";
import { StatTile } from "@/components/dashboard/ui/primitives";

type AccountStatus = {
  status?: string | null;
};

export function StatCards({ accounts = [], totalPayouts = 0 }: { accounts?: AccountStatus[], totalPayouts?: number }) {
  const activeCount = accounts.length;
  const passedCount = accounts.filter(a => a.status === 'passed').length;
  const fundedCount = accounts.filter(a => a.status === 'funded').length;

  // Format payouts
  const formattedPayouts = `$${totalPayouts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 sm:gap-4 lg:mb-8 xl:grid-cols-4">
      <StatTile
        label="Total Payouts"
        value={formattedPayouts}
        icon={<DollarSign className="h-4 w-4" aria-hidden="true" />}
        hint="Lifetime paid"
      />
      <StatTile
        label="Accounts"
        value={activeCount.toString()}
        icon={<LayoutList className="h-4 w-4" aria-hidden="true" />}
        hint="Total accounts"
      />
      <StatTile
        label="Passed"
        value={passedCount.toString()}
        icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
        hint="Evaluations passed"
      />
      <StatTile
        label="Funded"
        value={fundedCount.toString()}
        icon={<Award className="h-4 w-4" aria-hidden="true" />}
        hint="Live funded accounts"
      />
    </div>
  );
}
