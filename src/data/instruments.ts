/** The instruments TPP Terminal trades, with what the calculators need to size a position. */

export type InstrumentType = "Forex" | "Metals" | "Crypto";

export interface Instrument {
  symbol: string;
  label: string;
  type: InstrumentType;
  /** price change that counts as one pip (or one point for metals and crypto) */
  pip: number;
  digits: number;
  /** units per 1.00 lot */
  contract: number;
  /** currency the price is quoted in */
  quote: string;
  /** used until live prices load */
  ref: number;
}

const fx = (symbol: string, label: string, ref: number): Instrument => {
  const quote = symbol.slice(3);
  const jpy = quote === "JPY";
  const wide = quote === "MXN" || quote === "ZAR";
  return { symbol, label, type: "Forex", pip: jpy ? 0.01 : 0.0001, digits: jpy ? 3 : wide ? 4 : 5, contract: 100_000, quote, ref };
};

export const instruments: Instrument[] = [
  fx("EURUSD", "Euro / US Dollar", 1.085),
  fx("GBPUSD", "British Pound / US Dollar", 1.27),
  fx("USDJPY", "US Dollar / Japanese Yen", 156.4),
  fx("USDCHF", "US Dollar / Swiss Franc", 0.88),
  fx("AUDUSD", "Australian Dollar / US Dollar", 0.662),
  fx("USDCAD", "US Dollar / Canadian Dollar", 1.368),
  fx("NZDUSD", "New Zealand Dollar / US Dollar", 0.607),
  fx("EURGBP", "Euro / British Pound", 0.854),
  fx("EURJPY", "Euro / Japanese Yen", 169.7),
  fx("GBPJPY", "British Pound / Japanese Yen", 198.6),
  fx("EURCHF", "Euro / Swiss Franc", 0.955),
  fx("AUDJPY", "Australian Dollar / Japanese Yen", 103.5),
  fx("CHFJPY", "Swiss Franc / Japanese Yen", 177.7),
  fx("EURAUD", "Euro / Australian Dollar", 1.639),
  fx("GBPAUD", "British Pound / Australian Dollar", 1.918),
  fx("USDSGD", "US Dollar / Singapore Dollar", 1.286),
  fx("USDMXN", "US Dollar / Mexican Peso", 18.62),
  fx("USDZAR", "US Dollar / South African Rand", 17.85),
  { symbol: "XAUUSD", label: "Gold / US Dollar", type: "Metals", pip: 0.1, digits: 2, contract: 100, quote: "USD", ref: 2650 },
  { symbol: "BTC/USD", label: "Bitcoin / US Dollar", type: "Crypto", pip: 1, digits: 2, contract: 1, quote: "USD", ref: 65000 },
  { symbol: "ETH/USD", label: "Ethereum / US Dollar", type: "Crypto", pip: 1, digits: 2, contract: 1, quote: "USD", ref: 2600 },
];

export const instrumentMap: Record<string, Instrument> = Object.fromEntries(instruments.map((i) => [i.symbol, i]));

/** USD value of one unit of `currency`, from a symbol → price map. */
export function usdPer(currency: string, prices: Record<string, number>): number {
  if (currency === "USD") return 1;
  const direct = prices[`${currency}USD`];
  if (direct > 0) return direct;
  const inverse = prices[`USD${currency}`];
  if (inverse > 0) return 1 / inverse;
  return 1;
}

export const referencePrices: Record<string, number> = Object.fromEntries(instruments.map((i) => [i.symbol, i.ref]));
