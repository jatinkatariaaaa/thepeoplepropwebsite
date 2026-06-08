import { StatCards } from "@/components/dashboard/StatCards";
import { ActiveAccounts } from "@/components/dashboard/ActiveAccounts";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <StatCards />
      <ActiveAccounts />
    </div>
  );
}
