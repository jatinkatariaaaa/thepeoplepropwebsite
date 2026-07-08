type AccountSummary = {
  equity?: number | string | null;
  starting_balance?: number | string | null;
  phase?: string | null;
};

export function TopMetrics({ account }: { account: AccountSummary }) {
  const currentEquity = Number(account?.equity || 0);
  const startingBalance = Number(account?.starting_balance || 0);
  const totalProfit = currentEquity - startingBalance;

  const phaseLabel =
    account.phase === 'challenge' ? 'Phase 1'
    : account.phase === 'verification' ? 'Phase 2'
    : account.phase === 'phase_3' ? 'Phase 3'
    : account.phase === 'funded' ? 'Funded'
    : account.phase || 'Phase 1';

  const metrics = [
    { label: "Account Size", value: `$${startingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}` },
    { label: "Current Equity", value: `$${currentEquity.toLocaleString(undefined, {minimumFractionDigits: 2})}` },
    {
      label: "Total Profit",
      value: `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}`,
      className: totalProfit > 0 ? "text-[var(--dash-positive)]" : totalProfit < 0 ? "text-[var(--dash-negative)]" : undefined,
    },
    { label: "Phase", value: phaseLabel, plain: true },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {metrics.map((m, i) => (
        <div key={i} className="dash-card p-4 sm:p-5">
          <p className="dash-overline">{m.label}</p>
          <p
            className={`mt-2 text-[22px] leading-tight ${
              m.plain
                ? "font-semibold capitalize tracking-tight text-ink"
                : `dash-figure ${m.className ?? ""}`
            }`}
          >
            {m.value}
          </p>
        </div>
      ))}
    </div>
  );
}
