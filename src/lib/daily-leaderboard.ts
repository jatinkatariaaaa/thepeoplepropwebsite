// Daily rotating leaderboard data generator.
// Uses the current date as a seed, so every day the leaderboard shows
// a fresh set of trader names and stats — and stays consistent all day.

export interface LeaderboardEntry {
  rank: number;
  trader: string;
  country: string;
  account_size: string;
  profit: number;
  profit_percent: number;
  win_ratio: number;
  pair: string;
  avg_win: number;
  avg_loss: number;
  duration: string;
  trades: number;
  losing_streak: number;
}

// --- Seeded PRNG (mulberry32) so data is deterministic per day ---
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateSeed(): number {
  const now = new Date();
  // UTC date so it flips at the same moment for everyone
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth() + 1;
  const d = now.getUTCDate();
  return y * 10000 + m * 100 + d;
}

const FIRST_NAMES = [
  "Aarav", "Liam", "Mateo", "Noah", "Ethan", "Lucas", "Kai", "Omar",
  "Yusuf", "Daniel", "Marco", "Felix", "Andre", "Viktor", "Hiroshi",
  "Chen", "Ravi", "Arjun", "Samuel", "David", "Jonas", "Emil", "Nikolai",
  "Tariq", "Hassan", "Diego", "Rafael", "Thiago", "Mohammed", "Ali",
  "Sofia", "Emma", "Elena", "Amara", "Priya", "Yuki", "Fatima", "Isabella",
  "Nina", "Zara", "Leila", "Ingrid", "Chloe", "Mia", "Ana", "Aisha",
];

const LAST_NAMES = [
  "Sharma", "Nguyen", "Silva", "Müller", "Kowalski", "Tanaka", "Kim",
  "Rossi", "Fernandez", "Petrov", "Johansson", "Van Dijk", "O'Brien",
  "Costa", "Alvarez", "Hussain", "Rahman", "Okafor", "Mensah", "Osei",
  "Novak", "Horvat", "Dimitrov", "Ionescu", "Karlsson", "Berg", "Fischer",
  "Weber", "Moreau", "Dubois", "Santos", "Oliveira", "Khan", "Patel",
  "Gupta", "Wong", "Chan", "Lee", "Park", "Sato", "Ito", "Yamamoto",
];

const COUNTRIES = [
  "🇮🇳", "🇺🇸", "🇬🇧", "🇩🇪", "🇫🇷", "🇧🇷", "🇯🇵", "🇰🇷", "🇸🇬", "🇦🇪",
  "🇨🇦", "🇦🇺", "🇳🇱", "🇸🇪", "🇨🇭", "🇪🇸", "🇮🇹", "🇵🇱", "🇿🇦", "🇳🇬",
  "🇲🇽", "🇦🇷", "🇹🇷", "🇮🇩", "🇻🇳", "🇵🇭", "🇪🇬", "🇸🇦", "🇲🇾", "🇹🇭",
];

const ACCOUNT_SIZES = ["$10,000", "$25,000", "$50,000", "$100,000", "$200,000"];
const ACCOUNT_SIZE_VALUES = [10000, 25000, 50000, 100000, 200000];

const PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "XAU/USD", "GBP/JPY",
  "AUD/USD", "US30", "NAS100", "BTC/USD", "USD/CAD",
];

const DURATIONS = [
  "1h 24m", "2h 10m", "45m", "3h 05m", "1h 52m", "4h 18m",
  "58m", "2h 47m", "1h 15m", "5h 02m", "36m", "3h 33m",
];

function pickUnique<T>(rand: () => number, pool: T[], count: number): T[] {
  const copy = [...pool];
  const result: T[] = [];
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(rand() * copy.length);
    result.push(copy.splice(idx, 1)[0]);
  }
  return result;
}

export function getDailyLeaderboard(count = 20): LeaderboardEntry[] {
  const rand = mulberry32(dateSeed());

  const firsts = pickUnique(rand, FIRST_NAMES, count);
  const lasts = pickUnique(rand, LAST_NAMES, count);

  const entries: LeaderboardEntry[] = [];

  for (let i = 0; i < count; i++) {
    const sizeIdx = Math.floor(rand() * ACCOUNT_SIZES.length);
    const accountValue = ACCOUNT_SIZE_VALUES[sizeIdx];

    // Profit between 4% and 32% of account size, skewed higher for bigger accounts
    const profitPercent = 4 + rand() * 28;
    const profit = (accountValue * profitPercent) / 100 + rand() * 500;

    const winRatio = 52 + rand() * 38; // 52% – 90%
    const trades = 18 + Math.floor(rand() * 120);
    const avgWin = 120 + rand() * 1800;
    const avgLoss = avgWin * (0.3 + rand() * 0.45);
    const losingStreak = 1 + Math.floor(rand() * 5);

    entries.push({
      rank: 0, // assigned after sorting
      trader: `${firsts[i]} ${lasts[i]}`,
      country: COUNTRIES[Math.floor(rand() * COUNTRIES.length)],
      account_size: ACCOUNT_SIZES[sizeIdx],
      profit: Math.round(profit * 100) / 100,
      profit_percent: Math.round(profitPercent * 100) / 100,
      win_ratio: Math.round(winRatio * 10) / 10,
      pair: PAIRS[Math.floor(rand() * PAIRS.length)],
      avg_win: Math.round(avgWin * 100) / 100,
      avg_loss: Math.round(avgLoss * 100) / 100,
      duration: DURATIONS[Math.floor(rand() * DURATIONS.length)],
      trades,
      losing_streak: losingStreak,
    });
  }

  // Sort by profit descending and assign ranks
  entries.sort((a, b) => b.profit - a.profit);
  entries.forEach((e, idx) => {
    e.rank = idx + 1;
  });

  return entries;
}
