import { Clock, Info } from "lucide-react";
import { Meter, Panel, SectionTitle } from "../glass";

type ObjectivesAccount = {
  starting_balance?: number | string | null;
  equity?: number | string | null;
  trading_rules?: {
    max_daily_drawdown_pct?: number | string | null;
    max_overall_drawdown_pct?: number | string | null;
    profit_target_pct?: number | string | null;
  } | null;
};

export function TradingObjectives({ account }: { account: ObjectivesAccount }) {
  const startingBalance = Number(account?.starting_balance || 0);
  const currentEquity = Number(account?.equity || 0);

  // Calculate Daily Loss limit
  const maxDailyLossPercent = account?.trading_rules?.max_daily_drawdown_pct
    ? Number(account.trading_rules.max_daily_drawdown_pct) / 100
    : 0.05;
  const maxAllowedDailyLoss = startingBalance * maxDailyLossPercent;
  // Simplified daily loss remaining (assuming equity hasn't dropped below start)
  const currentDailyLoss = startingBalance - currentEquity > 0 ? startingBalance - currentEquity : 0;
  const remainingDailyLoss = Math.max(0, maxAllowedDailyLoss - currentDailyLoss);
  const dailyLossProgress = Math.min(100, (currentDailyLoss / maxAllowedDailyLoss) * 100) || 0;
  const dailyBalanceThreshold = startingBalance - maxAllowedDailyLoss;

  // Calculate Overall Loss limit
  const maxOverallLossPercent = account?.trading_rules?.max_overall_drawdown_pct
    ? Number(account.trading_rules.max_overall_drawdown_pct) / 100
    : 0.10;
  const maxAllowedOverallLoss = startingBalance * maxOverallLossPercent;
  const currentOverallLoss = startingBalance - currentEquity > 0 ? startingBalance - currentEquity : 0;
  const remainingOverallLoss = Math.max(0, maxAllowedOverallLoss - currentOverallLoss);
  const overallLossProgress = Math.min(100, (currentOverallLoss / maxAllowedOverallLoss) * 100) || 0;
  const overallBalanceThreshold = startingBalance - maxAllowedOverallLoss;

  // Calculate Profit Target
  const profitTargetPercent = account?.trading_rules?.profit_target_pct
    ? Number(account.trading_rules.profit_target_pct) / 100
    : 0.10;
  const profitTargetAmount = startingBalance * profitTargetPercent;
  const currentProfit = currentEquity - startingBalance > 0 ? currentEquity - startingBalance : 0;
  const profitTargetProgress = Math.min(100, (currentProfit / profitTargetAmount) * 100) || 0;

  return (
    <div className="mb-8">
      <SectionTitle as="h3" title="Trading Objectives" />

      <Panel className="divide-y divide-black/[0.06] overflow-hidden">

        {/* Daily Loss */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <h4 className="font-semibold text-[15px] text-[var(--g-ink)] flex items-center gap-2">
                Maximum Daily Loss <Info className="w-4 h-4 text-black/35" />
              </h4>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--g-ink)] text-white text-[12px] font-semibold">
                <Clock className="w-3.5 h-3.5 text-[var(--g-lime)]" />
                Resets In: 24:00:00
              </div>
            </div>
            <div className="g-num text-[13px] font-medium text-[var(--g-ink)]">
              Remaining: ${remainingDailyLoss.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-[13px] text-[var(--g-muted-ink)] mb-4 font-medium">
            <span>Maximum Allowed Daily Loss: ${maxAllowedDailyLoss.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            <span>Todays Starting Equity: ${startingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            <span>Balance Threshold: ${dailyBalanceThreshold.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>

          <Meter value={dailyLossProgress} tone={dailyLossProgress > 90 ? "red" : "ink"} />
        </div>

        {/* Max Loss */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h4 className="font-semibold text-[15px] text-[var(--g-ink)] flex items-center gap-2">
              Maximum Overall Loss <Info className="w-4 h-4 text-black/35" />
            </h4>
            <div className="g-num text-[13px] font-medium text-[var(--g-ink)]">
              Remaining: ${remainingOverallLoss.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-[13px] text-[var(--g-muted-ink)] mb-4 font-medium">
            <span>Maximum Allowed Loss: ${maxAllowedOverallLoss.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            <span>Balance Threshold: ${overallBalanceThreshold.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>

          <Meter value={overallLossProgress} tone={overallLossProgress > 90 ? "red" : "ink"} />
        </div>

        {/* Profit Target */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h4 className="font-semibold text-[15px] text-[var(--g-ink)] flex items-center gap-2">
              Profit Target <Info className="w-4 h-4 text-black/35" />
            </h4>
            <div className="g-num text-[13px] font-medium text-[var(--g-ink)]">
              Current Profit: ${currentProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-[13px] text-[var(--g-muted-ink)] mb-4 font-medium">
            <span>Target Amount: ${profitTargetAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            <span>Target Balance: ${(startingBalance + profitTargetAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>

          <Meter value={profitTargetProgress} tone="lime" />
        </div>

      </Panel>
    </div>
  );
}
