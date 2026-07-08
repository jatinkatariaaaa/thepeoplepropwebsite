import { Clock, Info } from "lucide-react";

function Money({ value }: { value: number }) {
  return (
    <span className="dash-num">
      ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
    </span>
  );
}

function ObjectiveRow({
  title,
  badge,
  rightLabel,
  rightValue,
  facts,
  progress,
  barColor,
}: {
  title: string;
  badge?: React.ReactNode;
  rightLabel: string;
  rightValue: number;
  facts: Array<{ label: string; value: number }>;
  progress: number;
  barColor: string;
}) {
  return (
    <div className="p-4 sm:p-5">
      <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2.5">
          <h4 className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            {title}
            <Info className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
          </h4>
          {badge}
        </div>
        <div className="text-[13px] text-ink-500">
          {rightLabel}:{" "}
          <span className="dash-num font-medium text-ink">
            ${rightValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-ink-500">
        {facts.map((f) => (
          <span key={f.label}>
            {f.label}: <Money value={f.value} />
          </span>
        ))}
      </div>

      <div className="dash-track">
        <div className={barColor} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

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
      <h3 className="mb-3 text-[15px] font-semibold tracking-tight text-ink">Trading Objectives</h3>

      <div className="dash-card divide-y divide-[var(--dash-hairline)] overflow-hidden">
        <ObjectiveRow
          title="Maximum Daily Loss"
          badge={
            <span className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-ink-50 px-2 py-0.5 text-[11px] font-medium text-ink-600">
              <Clock className="h-3 w-3" aria-hidden="true" />
              Resets in 24:00:00
            </span>
          }
          rightLabel="Remaining"
          rightValue={remainingDailyLoss}
          facts={[
            { label: "Max allowed daily loss", value: maxAllowedDailyLoss },
            { label: "Today's starting equity", value: startingBalance },
            { label: "Balance threshold", value: dailyBalanceThreshold },
          ]}
          progress={dailyLossProgress}
          barColor={dailyLossProgress > 90 ? "bg-[var(--dash-negative)]" : "bg-ink"}
        />

        <ObjectiveRow
          title="Maximum Overall Loss"
          rightLabel="Remaining"
          rightValue={remainingOverallLoss}
          facts={[
            { label: "Max allowed loss", value: maxAllowedOverallLoss },
            { label: "Balance threshold", value: overallBalanceThreshold },
          ]}
          progress={overallLossProgress}
          barColor={overallLossProgress > 90 ? "bg-[var(--dash-negative)]" : "bg-ink"}
        />

        <ObjectiveRow
          title="Profit Target"
          rightLabel="Current Profit"
          rightValue={currentProfit}
          facts={[
            { label: "Target amount", value: profitTargetAmount },
            { label: "Target balance", value: startingBalance + profitTargetAmount },
          ]}
          progress={profitTargetProgress}
          barColor="bg-[var(--dash-positive)]"
        />
      </div>
    </div>
  );
}
