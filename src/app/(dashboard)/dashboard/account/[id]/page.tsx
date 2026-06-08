import { AccountHeader } from "@/components/dashboard/account/AccountHeader";
import { TopMetrics } from "@/components/dashboard/account/TopMetrics";
import { PerformanceCharts } from "@/components/dashboard/account/PerformanceCharts";
import { AccountBalanceChart } from "@/components/dashboard/account/AccountBalanceChart";
import { TradingObjectives } from "@/components/dashboard/account/TradingObjectives";
import { DailySummary } from "@/components/dashboard/account/DailySummary";
import { AnalysisGrid } from "@/components/dashboard/account/AnalysisGrid";

export default function AccountDashboardPage({ params }: { params: { id: string } }) {
  // Use the ID from the URL parameter (e.g. 100626155)
  // If no params yet (during build/preview), fallback to a dummy ID
  const accountId = params?.id || "100626155";

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20">
      <AccountHeader accountId={accountId} />
      <TopMetrics />
      <PerformanceCharts />
      <AccountBalanceChart />
      <TradingObjectives />
      <DailySummary />
      <AnalysisGrid />
    </div>
  );
}
