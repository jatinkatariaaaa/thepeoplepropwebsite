import { DollarSign, LayoutList, CheckCircle2, Award } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  {
    label: "Total Payouts",
    value: "$0.00",
    icon: DollarSign,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    label: "Number of Accounts",
    value: "1",
    icon: LayoutList,
    color: "text-[var(--accent-700)]",
    bgColor: "bg-[var(--accent-50)]",
  },
  {
    label: "Accounts Passed",
    value: "0",
    icon: CheckCircle2,
    color: "text-[var(--violet-700)]",
    bgColor: "bg-[var(--violet-50)]",
  },
  {
    label: "Funded Accounts",
    value: "0",
    icon: Award,
    color: "text-[var(--amber-700)]",
    bgColor: "bg-[var(--amber-50)]",
  },
];

export function StatCards({ accounts = [] }: { accounts?: any[] }) {
  const activeCount = accounts.length;
  const passedCount = accounts.filter(a => a.status === 'passed').length;
  const fundedCount = accounts.filter(a => a.status === 'funded').length;
  
  // Calculate total payouts if available, else 0
  const totalPayouts = "$0.00"; // Can be dynamic later

  const dynamicStats = [
    {
      label: "Total Payouts",
      value: totalPayouts,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Number of Accounts",
      value: activeCount.toString(),
      icon: LayoutList,
      color: "text-[var(--accent-700)]",
      bgColor: "bg-[var(--accent-50)]",
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-10">
      {dynamicStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div 
            key={stat.label} 
            className="bg-white rounded-[24px] p-6 shadow-sm border border-[var(--border)] relative overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-semibold text-[var(--ink-500)] tracking-wide">
                {stat.label}
              </span>
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", stat.bgColor)}>
                <Icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            <div className="text-[32px] font-display font-bold text-[var(--ink-950)] tracking-tight leading-none">
              {stat.value}
            </div>
            
            {/* Subtle bottom accent line that glows on hover */}
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[var(--border)] to-transparent opacity-50 group-hover:via-[var(--accent)] transition-all duration-500" />
          </div>
        );
      })}
    </div>
  );
}
