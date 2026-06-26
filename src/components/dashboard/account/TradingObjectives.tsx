import { Clock, Info } from "lucide-react";

export function TradingObjectives({ account }: { account: any }) {
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
      <h3 className="font-bold text-[16px] text-[var(--ink-950)] mb-4">Trading Objectives</h3>
      
      <div className="bg-white border border-[var(--border)] rounded-[24px] shadow-sm divide-y divide-[var(--border)] overflow-hidden">
        
        {/* Daily Loss */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <h4 className="font-bold text-[15px] text-[var(--ink-950)] flex items-center gap-2">
                Maximum Daily Loss <Info className="w-4 h-4 text-[var(--ink-400)]" />
              </h4>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--ink-950)] text-white text-[12px] font-bold">
                <Clock className="w-3.5 h-3.5" />
                Resets In: 24:00:00
              </div>
            </div>
            <div className="text-[13px] font-medium text-[var(--ink-950)]">
              Remaining: ${remainingDailyLoss.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 text-[13px] text-[var(--ink-500)] mb-4 font-medium">
            <span>Maximum Allowed Daily Loss: ${maxAllowedDailyLoss.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            <span>Todays Starting Equity: ${startingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            <span>Balance Threshold: ${dailyBalanceThreshold.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>

          <div className="h-2 w-full bg-[var(--paper-2)] rounded-full overflow-hidden">
            <div className={`h-full ${dailyLossProgress > 90 ? 'bg-rose-500' : 'bg-[var(--accent)]'}`} style={{ width: `${dailyLossProgress}%` }} />
          </div>
        </div>

        {/* Max Loss */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h4 className="font-bold text-[15px] text-[var(--ink-950)] flex items-center gap-2">
              Maximum Overall Loss <Info className="w-4 h-4 text-[var(--ink-400)]" />
            </h4>
            <div className="text-[13px] font-medium text-[var(--ink-950)]">
              Remaining: ${remainingOverallLoss.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 text-[13px] text-[var(--ink-500)] mb-4 font-medium">
            <span>Maximum Allowed Loss: ${maxAllowedOverallLoss.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            <span>Balance Threshold: ${overallBalanceThreshold.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>

          <div className="h-2 w-full bg-[var(--paper-2)] rounded-full overflow-hidden">
            <div className={`h-full ${overallLossProgress > 90 ? 'bg-rose-500' : 'bg-[var(--accent)]'}`} style={{ width: `${overallLossProgress}%` }} />
          </div>
        </div>

        {/* Profit Target */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h4 className="font-bold text-[15px] text-[var(--ink-950)] flex items-center gap-2">
              Profit Target <Info className="w-4 h-4 text-[var(--ink-400)]" />
            </h4>
            <div className="text-[13px] font-medium text-[var(--ink-950)]">
              Current Profit: ${currentProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 text-[13px] text-[var(--ink-500)] mb-4 font-medium">
            <span>Target Amount: ${profitTargetAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            <span>Target Balance: ${(startingBalance + profitTargetAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>

          <div className="h-2 w-full bg-[var(--paper-2)] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${profitTargetProgress}%` }} />
          </div>
        </div>

      </div>
    </div>
  );
}
