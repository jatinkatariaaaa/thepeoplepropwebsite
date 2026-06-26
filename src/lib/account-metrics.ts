export type TradeDirection = "buy" | "sell";

export type MetricsTradeRow = {
  id: string;
  symbol: string | null;
  direction: TradeDirection | string | null;
  volume: number | string | null;
  open_time: string | null;
  close_time: string | null;
  gross_pnl: number | string | null;
  commission: number | string | null;
  swap: number | string | null;
  net_pnl: number | string | null;
};

export type TerminalAccountSnapshot = {
  balance: number;
  equity: number;
  highest_equity: number;
  status: string;
};

export type MetricPoint = {
  time: string;
  date: string;
  label: string;
  balance: number;
  equity: number;
  pnl: number;
};

export type DailyPnlPoint = {
  date: string;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
  volume: number;
};

export type WeeklyPnlPoint = {
  weekStart: string;
  weekEnd: string;
  label: string;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
  volume: number;
};

export type DirectionStats = {
  direction: TradeDirection;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  grossProfit: number;
  grossLoss: number;
  netPnl: number;
  averageWin: number;
  averageLoss: number;
  volume: number;
};

export type DurationBucket = {
  key: string;
  label: string;
  trades: number;
  pnl: number;
};

export type AccountMetrics = {
  totalTrades: number;
  wins: number;
  losses: number;
  breakevenTrades: number;
  winRate: number;
  profitFactor: number | null;
  averageWin: number;
  averageLoss: number;
  biggestWin: number;
  biggestLoss: number;
  grossProfit: number;
  grossLoss: number;
  totalPnL: number;
  totalVolume: number;
  dailyPnL: DailyPnlPoint[];
  weeklyPnL: WeeklyPnlPoint[];
  equityCurve: MetricPoint[];
  balanceCurve: MetricPoint[];
  longStats: DirectionStats;
  shortStats: DirectionStats;
  durationBuckets: DurationBucket[];
  terminal: TerminalAccountSnapshot | null;
  lastUpdated: string;
};

type CalculateInput = {
  trades: MetricsTradeRow[];
  startingBalance: number | string | null;
  terminal?: Partial<TerminalAccountSnapshot> | null;
  now?: Date;
};

const DURATION_BUCKETS = [
  { key: "under_5m", label: "< 5m", min: 0, max: 5 * 60 * 1000 },
  { key: "5m_30m", label: "5m - 30m", min: 5 * 60 * 1000, max: 30 * 60 * 1000 },
  { key: "30m_2h", label: "30m - 2h", min: 30 * 60 * 1000, max: 2 * 60 * 60 * 1000 },
  { key: "2h_1d", label: "2h - 1d", min: 2 * 60 * 60 * 1000, max: 24 * 60 * 60 * 1000 },
  { key: "over_1d", label: "1d+", min: 24 * 60 * 60 * 1000, max: Number.POSITIVE_INFINITY },
] as const;

function numberValue(value: number | string | null | undefined): number {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
}

function roundMetric(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  const rounded = Math.round((value + Number.EPSILON) * factor) / factor;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function isoDate(value: string | null | undefined): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function formatPointLabel(value: string | null | undefined): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "Live";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function weekStart(dateValue: string): Date {
  const date = new Date(`${dateValue}T00:00:00.000Z`);
  const day = date.getUTCDay();
  return addDays(date, -day);
}

function isoFromDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function emptyDirectionStats(direction: TradeDirection): DirectionStats {
  return {
    direction,
    trades: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    grossProfit: 0,
    grossLoss: 0,
    netPnl: 0,
    averageWin: 0,
    averageLoss: 0,
    volume: 0,
  };
}

function createDirectionStats(direction: TradeDirection, trades: MetricsTradeRow[]): DirectionStats {
  const stats = emptyDirectionStats(direction);

  for (const trade of trades) {
    if (trade.direction !== direction) continue;

    const net = numberValue(trade.net_pnl);
    const volume = numberValue(trade.volume);

    stats.trades += 1;
    stats.volume += volume;
    stats.netPnl += net;

    if (net > 0) {
      stats.wins += 1;
      stats.grossProfit += net;
    } else if (net < 0) {
      stats.losses += 1;
      stats.grossLoss += Math.abs(net);
    }
  }

  stats.winRate = stats.trades > 0 ? roundMetric((stats.wins / stats.trades) * 100) : 0;
  stats.averageWin = stats.wins > 0 ? roundMetric(stats.grossProfit / stats.wins) : 0;
  stats.averageLoss = stats.losses > 0 ? roundMetric(stats.grossLoss / stats.losses) : 0;
  stats.grossProfit = roundMetric(stats.grossProfit);
  stats.grossLoss = roundMetric(stats.grossLoss);
  stats.netPnl = roundMetric(stats.netPnl);
  stats.volume = roundMetric(stats.volume, 4);

  return stats;
}

function createDurationBuckets(trades: MetricsTradeRow[]): DurationBucket[] {
  const buckets = DURATION_BUCKETS.map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    trades: 0,
    pnl: 0,
  }));

  for (const trade of trades) {
    if (!trade.open_time || !trade.close_time) continue;

    const opened = new Date(trade.open_time).getTime();
    const closed = new Date(trade.close_time).getTime();
    if (!Number.isFinite(opened) || !Number.isFinite(closed)) continue;

    const duration = Math.max(0, closed - opened);
    const bucketIndex = DURATION_BUCKETS.findIndex(
      (bucket) => duration >= bucket.min && duration < bucket.max
    );
    const bucket = buckets[bucketIndex >= 0 ? bucketIndex : buckets.length - 1];

    bucket.trades += 1;
    bucket.pnl += numberValue(trade.net_pnl);
  }

  return buckets.map((bucket) => ({
    ...bucket,
    pnl: roundMetric(bucket.pnl),
  }));
}

export function calculateAccountMetrics({
  trades,
  startingBalance,
  terminal = null,
  now = new Date(),
}: CalculateInput): AccountMetrics {
  const start = numberValue(startingBalance);
  const sortedTrades = [...trades].sort((a, b) => {
    const aTime = new Date(a.close_time ?? 0).getTime();
    const bTime = new Date(b.close_time ?? 0).getTime();
    return aTime - bTime;
  });

  let wins = 0;
  let losses = 0;
  let breakevenTrades = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let biggestWin = 0;
  let biggestLoss = 0;
  let totalPnL = 0;
  let totalVolume = 0;
  let runningBalance = start;

  const dailyMap = new Map<string, DailyPnlPoint>();
  const weeklyMap = new Map<string, WeeklyPnlPoint>();
  const curve: MetricPoint[] = [
    {
      time: "start",
      date: "",
      label: "Start",
      balance: roundMetric(start),
      equity: roundMetric(start),
      pnl: 0,
    },
  ];

  for (const trade of sortedTrades) {
    const net = numberValue(trade.net_pnl);
    const volume = numberValue(trade.volume);
    const closeDate = isoDate(trade.close_time);

    totalPnL += net;
    totalVolume += volume;
    runningBalance += net;

    if (net > 0) {
      wins += 1;
      grossProfit += net;
      biggestWin = Math.max(biggestWin, net);
    } else if (net < 0) {
      losses += 1;
      grossLoss += Math.abs(net);
      biggestLoss = Math.min(biggestLoss, net);
    } else {
      breakevenTrades += 1;
    }

    const daily = dailyMap.get(closeDate) ?? {
      date: closeDate,
      pnl: 0,
      trades: 0,
      wins: 0,
      losses: 0,
      volume: 0,
    };
    daily.pnl += net;
    daily.trades += 1;
    daily.volume += volume;
    if (net > 0) daily.wins += 1;
    if (net < 0) daily.losses += 1;
    dailyMap.set(closeDate, daily);

    const startOfWeek = weekStart(closeDate);
    const weekKey = isoFromDate(startOfWeek);
    const endOfWeek = addDays(startOfWeek, 6);
    const weekly = weeklyMap.get(weekKey) ?? {
      weekStart: weekKey,
      weekEnd: isoFromDate(endOfWeek),
      label: `${weekKey} - ${isoFromDate(endOfWeek)}`,
      pnl: 0,
      trades: 0,
      wins: 0,
      losses: 0,
      volume: 0,
    };
    weekly.pnl += net;
    weekly.trades += 1;
    weekly.volume += volume;
    if (net > 0) weekly.wins += 1;
    if (net < 0) weekly.losses += 1;
    weeklyMap.set(weekKey, weekly);

    curve.push({
      time: trade.close_time ?? "",
      date: closeDate,
      label: formatPointLabel(trade.close_time),
      balance: roundMetric(runningBalance),
      equity: roundMetric(runningBalance),
      pnl: roundMetric(net),
    });
  }

  const terminalSnapshot = terminal
    ? {
        balance: roundMetric(numberValue(terminal.balance ?? runningBalance)),
        equity: roundMetric(numberValue(terminal.equity ?? runningBalance)),
        highest_equity: roundMetric(numberValue(terminal.highest_equity ?? runningBalance)),
        status: String(terminal.status ?? ""),
      }
    : null;

  if (terminalSnapshot) {
    const last = curve[curve.length - 1];
    const hasLiveEquity = Math.abs(terminalSnapshot.equity - last.equity) >= 0.01;
    const hasLiveBalance = Math.abs(terminalSnapshot.balance - last.balance) >= 0.01;

    if (hasLiveEquity || hasLiveBalance) {
      curve.push({
        time: now.toISOString(),
        date: isoDate(now.toISOString()),
        label: "Live",
        balance: terminalSnapshot.balance,
        equity: terminalSnapshot.equity,
        pnl: roundMetric(terminalSnapshot.equity - last.equity),
      });
    }
  }

  const totalTrades = sortedTrades.length;
  const dailyPnL = [...dailyMap.values()]
    .map((day) => ({
      ...day,
      pnl: roundMetric(day.pnl),
      volume: roundMetric(day.volume, 4),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const weeklyPnL = [...weeklyMap.values()]
    .map((week) => ({
      ...week,
      pnl: roundMetric(week.pnl),
      volume: roundMetric(week.volume, 4),
    }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));

  return {
    totalTrades,
    wins,
    losses,
    breakevenTrades,
    winRate: totalTrades > 0 ? roundMetric((wins / totalTrades) * 100) : 0,
    profitFactor: grossLoss > 0 ? roundMetric(grossProfit / grossLoss) : grossProfit > 0 ? null : 0,
    averageWin: wins > 0 ? roundMetric(grossProfit / wins) : 0,
    averageLoss: losses > 0 ? roundMetric(grossLoss / losses) : 0,
    biggestWin: roundMetric(biggestWin),
    biggestLoss: roundMetric(biggestLoss),
    grossProfit: roundMetric(grossProfit),
    grossLoss: roundMetric(grossLoss),
    totalPnL: roundMetric(totalPnL),
    totalVolume: roundMetric(totalVolume, 4),
    dailyPnL,
    weeklyPnL,
    equityCurve: curve,
    balanceCurve: curve.map((point) => ({
      ...point,
      equity: point.balance,
    })),
    longStats: createDirectionStats("buy", sortedTrades),
    shortStats: createDirectionStats("sell", sortedTrades),
    durationBuckets: createDurationBuckets(sortedTrades),
    terminal: terminalSnapshot,
    lastUpdated: now.toISOString(),
  };
}
