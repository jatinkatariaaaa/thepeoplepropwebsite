import { DollarSign, LayoutList, CheckCircle2, Award } from "lucide-react";
import { cn } from "@/lib/utils";

type AccountStatus = {
  status?: string | null;
};

export function StatCards({ accounts = [], totalPayouts = 0 }: { accounts?: AccountStatus[], totalPayouts?: number }) {
  const activeCount = accounts.length;
  const passedCount = accounts.filter(a => a.status === 'passed').length;
  const fundedCount = accounts.filter(a => a.status === 'funded').length;
  
  // Format payouts
  const formattedPayouts = `$${totalPayouts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const dynamicStats = [
    {
      label: "Total Payouts",
      value: formattedPayouts,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Number of Accounts",
      value: activeCount.toString(),
      icon: LayoutList,
      color: "text-[var(--teal-800)]",
      bgColor: "bg-[var(--teal-50)]",
    },
    {
      label: "Accounts Passed",
      value: passedCount.toString(),
      icon: CheckCircle2,
      color: "text-[var(--violet-700)]",
      bgColor: "bg-[var(--violet-50)]",
    },
    {
      label: "Funded Accounts",
      value: fundedCount.toString(),
      icon: Award,
      color: "text-[var(--amber-700)]",
      bgColor: "bg-[var(--amber-50)]",
    },
  ];

  return (
    <div className="grid grid-cols-1 min-[520px]:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6 lg:mb-8">
      {dynamicStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div 
            key={stat.label} 
            className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-sm border border-[var(--border)] relative overflow-hidden group hover:shadow-md hover:border-[var(--teal-100)] transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <span className="min-w-0 text-[12px] sm:text-[13px] font-semibold text-[var(--ink-500)] tracking-wide leading-tight">
                {stat.label}
              </span>
              <div className={cn("shrink-0 w-10 h-10 rounded-full flex items-center justify-center", stat.bgColor)}>
                <Icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            <div className="text-[26px] sm:text-[30px] lg:text-[32px] font-display font-bold text-[var(--teal-950)] tracking-tight leading-none break-words">
              {stat.value}
            </div>
            
            {/* Subtle bottom accent line that glows on hover */}
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[var(--border)] to-transparent opacity-50 group-hover:via-[var(--teal-800)] transition-all duration-500" />
          </div>
        );
      })}
    </div>
  );
}
