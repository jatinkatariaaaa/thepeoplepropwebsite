export interface Challenge {
  id: string;
  size: number;
  sizeLabel: string;
  price: number;
  priceLabel: string;
  profitTarget: number;
  profitTargetPct: number;
  dailyDrawdown: number;
  maxDrawdown: number;
  profitSplit: number;
  minTradingDays: number;
  consistencyRule: string;
  featured?: boolean;
  tag?: string;
}

export const challenges: Challenge[] = [
  {
    id: "starter-5k",
    size: 5_000,
    sizeLabel: "$5,000",
    price: 49,
    priceLabel: "$49",
    profitTarget: 500,
    profitTargetPct: 10,
    dailyDrawdown: 4,
    maxDrawdown: 8,
    profitSplit: 80,
    minTradingDays: 3,
    consistencyRule: "30%",
    tag: "Starter",
  },
  {
    id: "core-10k",
    size: 10_000,
    sizeLabel: "$10,000",
    price: 89,
    priceLabel: "$89",
    profitTarget: 1_000,
    profitTargetPct: 10,
    dailyDrawdown: 4,
    maxDrawdown: 8,
    profitSplit: 85,
    minTradingDays: 3,
    consistencyRule: "30%",
    tag: "Core",
  },
  {
    id: "pro-25k",
    size: 25_000,
    sizeLabel: "$25,000",
    price: 189,
    priceLabel: "$189",
    profitTarget: 2_500,
    profitTargetPct: 10,
    dailyDrawdown: 4,
    maxDrawdown: 8,
    profitSplit: 90,
    minTradingDays: 3,
    consistencyRule: "30%",
    featured: true,
    tag: "Most Popular",
  },
  {
    id: "elite-50k",
    size: 50_000,
    sizeLabel: "$50,000",
    price: 329,
    priceLabel: "$329",
    profitTarget: 5_000,
    profitTargetPct: 10,
    dailyDrawdown: 4,
    maxDrawdown: 8,
    profitSplit: 90,
    minTradingDays: 3,
    consistencyRule: "30%",
    tag: "Elite",
  },
];
