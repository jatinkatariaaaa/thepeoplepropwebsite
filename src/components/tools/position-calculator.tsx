"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { instrumentMap, instruments, referencePrices, usdPer } from "@/data/instruments";

/**
 * Position size calculator. Sizes a trade from the account balance, the risk
 * the trader accepts and the distance to the stop, using the same contract
 * sizes and USD conversion as TPP Terminal. Renders on the dark public site
 * (`tone="dark"`) and on the light dashboard (`tone="light"`).
 */

type Tone = "dark" | "light";
type StopMode = "price" | "pips";
type TargetMode = "price" | "pips" | "rr";

const SUPABASE_READY = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const STYLES: Record<Tone, Record<string, string>> = {
  dark: {
    panel: "g-glass g-hair",
    label: "text-white/50",
    text: "text-white",
    muted: "text-white/55",
    field: "bg-white/[0.06] text-white ring-white/10 placeholder:text-white/25 focus-within:ring-[var(--g-lime)]/70",
    chip: "bg-white/[0.05] text-white/65 ring-white/10 hover:bg-white/[0.1] hover:text-white",
    chipOn: "bg-white text-[var(--g-ink)] ring-white",
    rule: "border-white/[0.08]",
    inset: "bg-white/[0.04] ring-white/[0.08]",
    seg: "bg-white/[0.06] ring-white/10",
    segOn: "bg-white text-[var(--g-ink)]",
    segOff: "text-white/55 hover:text-white",
    result: "g-card-dark g-hair",
    resultKey: "text-white/45",
    resultHero: "g-shade-lime",
  },
  light: {
    panel: "g-glass-light g-hair g-hair-ink",
    label: "text-[var(--g-muted-ink)]",
    text: "text-[var(--g-ink)]",
    muted: "text-[var(--g-muted-ink)]",
    field: "bg-white/70 text-[var(--g-ink)] ring-black/10 placeholder:text-black/30 focus-within:ring-[var(--g-emerald)]/70",
    chip: "bg-white/60 text-[var(--g-muted-ink)] ring-black/10 hover:bg-white hover:text-[var(--g-ink)]",
    chipOn: "bg-[var(--g-ink)] text-white ring-[var(--g-ink)]",
    rule: "border-black/[0.07]",
    inset: "bg-black/[0.03] ring-black/[0.06]",
    seg: "bg-black/[0.05] ring-black/[0.06]",
    segOn: "bg-white text-[var(--g-ink)] shadow-[0_1px_2px_rgba(14,17,16,0.1)]",
    segOff: "text-[var(--g-muted-ink)] hover:text-[var(--g-ink)]",
    result: "g-card-dark g-hair",
    resultKey: "text-white/45",
    resultHero: "g-shade-lime",
  },
};

const num = (v: string) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};
const usd = (n: number, d = 2) => `$${n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })}`;

function useLivePrices() {
  const [prices, setPrices] = useState<Record<string, number>>(referencePrices);
  const [live, setLive] = useState(false);
  useEffect(() => {
    if (!SUPABASE_READY) return;
    let alive = true;
    supabase
      .from("prices")
      .select("symbol, price")
      .then(({ data }) => {
        if (!alive || !data?.length) return;
        setPrices((prev) => ({ ...prev, ...Object.fromEntries(data.map((r: { symbol: string; price: number }) => [r.symbol, Number(r.price)])) }));
        setLive(true);
      });
    return () => {
      alive = false;
    };
  }, []);
  return { prices, live };
}

export function PositionCalculator({ tone = "dark", defaultBalance = 10_000, className }: { tone?: Tone; defaultBalance?: number; className?: string }) {
  const s = STYLES[tone];
  const { prices, live } = useLivePrices();

  const [symbol, setSymbol] = useState("EURUSD");
  const [direction, setDirection] = useState<"long" | "short">("long");
  const [balance, setBalance] = useState(String(defaultBalance));
  const [risk, setRisk] = useState("1");
  const [leverage, setLeverage] = useState("100");
  const [entry, setEntry] = useState("");
  const [stopMode, setStopMode] = useState<StopMode>("pips");
  const [stop, setStop] = useState("20");
  const [targetMode, setTargetMode] = useState<TargetMode>("rr");
  const [target, setTarget] = useState("2");

  const inst = instrumentMap[symbol];
  const market = prices[symbol] ?? inst.ref;
  const fmt = (p: number) => p.toFixed(inst.digits);

  const r = useMemo(() => {
    const entryPrice = num(entry) || market;
    const sign = direction === "long" ? 1 : -1;
    const stopPips = stopMode === "pips" ? num(stop) : Math.abs(entryPrice - num(stop)) / inst.pip;
    const stopPrice = stopMode === "pips" ? entryPrice - sign * stopPips * inst.pip : num(stop);
    const wrongSide = stopMode === "price" && num(stop) > 0 && (direction === "long" ? num(stop) >= entryPrice : num(stop) <= entryPrice);

    const rate = usdPer(inst.quote, prices);
    const pipValue = inst.pip * inst.contract * rate; // USD per pip for 1.00 lot
    const riskAmount = (num(balance) * num(risk)) / 100;
    const rawLots = stopPips > 0 && pipValue > 0 ? riskAmount / (stopPips * pipValue) : 0;
    const lots = Math.floor(rawLots * 100) / 100;
    const actualRisk = lots * stopPips * pipValue;

    const marginPerLot = (inst.contract * entryPrice * rate) / Math.max(1, num(leverage));
    const margin = lots * marginPerLot;
    const maxLots = marginPerLot > 0 ? Math.floor((num(balance) / marginPerLot) * 100) / 100 : 0;

    let targetPips = 0;
    if (num(target) > 0) {
      if (targetMode === "rr") targetPips = stopPips * num(target);
      else if (targetMode === "pips") targetPips = num(target);
      else targetPips = Math.abs(num(target) - entryPrice) / inst.pip;
    }
    const targetPrice = targetPips > 0 ? entryPrice + sign * targetPips * inst.pip : 0;
    const profit = lots * targetPips * pipValue;
    const rr = stopPips > 0 && targetPips > 0 ? targetPips / stopPips : 0;
    const commission = inst.type === "Crypto" ? lots * 6 : lots * 6; // $3 per lot per side

    return { entryPrice, stopPips, stopPrice, wrongSide, pipValue, riskAmount, lots, actualRisk, margin, maxLots, targetPips, targetPrice, profit, rr, commission, marginBlocked: lots > maxLots };
  }, [entry, market, direction, stopMode, stop, inst, prices, balance, risk, leverage, target, targetMode]);

  const Label = ({ children, tone: t }: { children: React.ReactNode; tone?: "red" | "green" }) => (
    <span className={cn("block text-[11.5px] font-semibold tracking-[0.12em] uppercase", t === "red" ? "text-red-400" : t === "green" ? "text-emerald-400" : s.label, tone === "light" && t === "red" && "text-red-600", tone === "light" && t === "green" && "text-[var(--g-emerald)]")}>{children}</span>
  );
  const fieldBox = cn("flex h-12 items-center gap-2 rounded-[14px] px-4 ring-1 transition-shadow focus-within:ring-2", s.field);
  const input = "g-num h-full w-full min-w-0 bg-transparent text-[15px] outline-none";
  const Chips = ({ items, value, onPick, suffix = "" }: { items: (number | string)[]; value: string; onPick: (v: string) => void; suffix?: string }) => (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {items.map((v) => {
        const on = String(v) === value;
        const text = typeof v === "number" && v >= 1000 ? `$${v / 1000}k` : `${v}${suffix}`;
        return (
          <button key={v} type="button" aria-pressed={on} onClick={() => onPick(String(v))} className={cn("g-num h-8 rounded-[10px] px-3 text-[12.5px] font-semibold ring-1 transition-colors", on ? s.chipOn : s.chip)}>
            {text}
          </button>
        );
      })}
    </div>
  );
  const Seg = <T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: [T, string][] }) => (
    <span className={cn("inline-flex rounded-[10px] p-0.5 ring-1", s.seg)}>
      {options.map(([k, label]) => (
        <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)} className={cn("h-7 rounded-[8px] px-2.5 text-[12px] font-semibold transition-colors", value === k ? s.segOn : s.segOff)}>
          {label}
        </button>
      ))}
    </span>
  );

  const rows: [string, string][] = [
    ["Risk amount", usd(r.actualRisk)],
    ["Stop distance", `${r.stopPips.toFixed(1)} ${inst.type === "Forex" ? "pips" : "points"}`],
    ["Stop price", r.stopPips > 0 ? fmt(r.stopPrice) : "—"],
    ["Value per pip", usd(r.lots * r.pipValue)],
    ["Margin required", usd(r.margin)],
    ["Commission (round turn)", usd(r.commission)],
  ];

  return (
    <div className={cn("grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]", className)}>
      <div className={cn("rounded-[28px] p-5 sm:p-7", s.panel)}>
        <label className="block">
          <Label>Instrument</Label>
          <span className={cn(fieldBox, "relative mt-2")}>
            <select value={symbol} onChange={(e) => { setSymbol(e.target.value); setEntry(""); }} className={cn(input, "cursor-pointer appearance-none pr-8 font-semibold")}>
              {(["Forex", "Metals", "Crypto"] as const).map((type) => (
                <optgroup key={type} label={type}>
                  {instruments.filter((i) => i.type === type).map((i) => (
                    <option key={i.symbol} value={i.symbol} className="text-black">
                      {i.symbol}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronsUpDown className={cn("pointer-events-none absolute right-4 h-4 w-4", s.muted)} />
          </span>
        </label>
        <p className={cn("mt-2 text-[12.5px]", s.muted)}>
          {inst.label} · Pip <b className={s.text}>{inst.pip}</b> · 1 lot <b className={s.text}>{inst.contract.toLocaleString("en-US")}</b> · {live ? "Live" : "Reference"} price <b className={cn("g-num", s.text)}>{fmt(market)}</b>
        </p>

        <div className="mt-5">
          <Label>Direction</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["long", "short"] as const).map((d) => {
              const on = direction === d;
              const Icon = d === "long" ? ArrowUp : ArrowDown;
              return (
                <button key={d} type="button" aria-pressed={on} onClick={() => setDirection(d)} className={cn("flex h-12 items-center justify-center gap-2 rounded-[14px] text-[14.5px] font-semibold capitalize ring-1 transition-colors", on ? (d === "long" ? "bg-emerald-500/15 text-emerald-400 ring-emerald-400/50" : "bg-red-500/15 text-red-400 ring-red-400/50") : s.chip, on && tone === "light" && (d === "long" ? "text-emerald-700" : "text-red-600"))}>
                  <Icon className="h-4 w-4" strokeWidth={2.4} /> {d}
                </button>
              );
            })}
          </div>
        </div>

        <div className={cn("mt-6 grid gap-5 border-t pt-6 sm:grid-cols-2", s.rule)}>
          <label className="block">
            <Label>Balance</Label>
            <span className={cn(fieldBox, "mt-2")}>
              <span className={s.muted}>$</span>
              <input inputMode="decimal" value={balance} onChange={(e) => setBalance(e.target.value)} className={input} />
            </span>
            <Chips items={[5000, 10000, 25000, 50000, 100000, 200000]} value={balance} onPick={setBalance} />
          </label>
          <label className="block">
            <Label>Risk per trade</Label>
            <span className={cn(fieldBox, "mt-2")}>
              <input inputMode="decimal" value={risk} onChange={(e) => setRisk(e.target.value)} className={input} />
              <span className={s.muted}>%</span>
            </span>
            <Chips items={[0.25, 0.5, 1, 2]} value={risk} onPick={setRisk} suffix="%" />
          </label>
        </div>

        <label className={cn("mt-6 block border-t pt-6", s.rule)}>
          <Label>Leverage</Label>
          <span className="mt-2 flex flex-wrap items-center gap-2">
            <span className={cn(fieldBox, "w-28")}>
              <span className={s.muted}>1:</span>
              <input inputMode="numeric" value={leverage} onChange={(e) => setLeverage(e.target.value)} className={input} />
            </span>
            {[10, 20, 30, 50, 100].map((v) => (
              <button key={v} type="button" aria-pressed={leverage === String(v)} onClick={() => setLeverage(String(v))} className={cn("g-num h-12 rounded-[14px] px-3.5 text-[13px] font-semibold ring-1 transition-colors", leverage === String(v) ? s.chipOn : s.chip)}>
                1:{v}
              </button>
            ))}
          </span>
        </label>

        <div className={cn("mt-6 grid gap-5 rounded-[20px] p-4 ring-1 sm:p-5", s.inset)}>
          <label className="block">
            <Label>Entry</Label>
            <span className={cn(fieldBox, "mt-2")}>
              <input inputMode="decimal" value={entry} onChange={(e) => setEntry(e.target.value)} placeholder={fmt(market)} className={input} />
            </span>
          </label>
          <div>
            <span className="flex items-center justify-between">
              <Label tone="red">Stop loss</Label>
              <Seg value={stopMode} onChange={(m) => { setStopMode(m); setStop(m === "pips" ? "20" : ""); }} options={[["price", "Price"], ["pips", "Pips"]]} />
            </span>
            <span className={cn(fieldBox, "mt-2")}>
              <input inputMode="decimal" value={stop} onChange={(e) => setStop(e.target.value)} placeholder={stopMode === "pips" ? "20" : fmt(market - (direction === "long" ? 1 : -1) * 20 * inst.pip)} aria-label="Stop loss" className={input} />
              {stopMode === "pips" ? <span className={s.muted}>{inst.type === "Forex" ? "pips" : "pts"}</span> : null}
            </span>
          </div>
          <div>
            <span className="flex items-center justify-between">
              <span className="flex items-baseline gap-2">
                <Label tone="green">Take profit</Label>
                <span className={cn("text-[11.5px]", s.muted)}>(optional)</span>
              </span>
              <Seg value={targetMode} onChange={(m) => { setTargetMode(m); setTarget(m === "rr" ? "2" : ""); }} options={[["price", "Price"], ["pips", "Pips"], ["rr", "R:R"]]} />
            </span>
            <span className={cn(fieldBox, "mt-2")}>
              {targetMode === "rr" ? <span className={s.muted}>1:</span> : null}
              <input inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} placeholder={targetMode === "rr" ? "2" : targetMode === "pips" ? "40" : fmt(market + (direction === "long" ? 1 : -1) * 40 * inst.pip)} aria-label="Take profit" className={input} />
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className={cn("relative overflow-hidden rounded-[28px] p-6 sm:p-7", s.result)}>
          <span aria-hidden="true" className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.16),transparent)]" />
          <p className="relative text-[11.5px] font-semibold tracking-[0.12em] text-white/45 uppercase">Position size</p>
          <p className="relative mt-3 flex items-baseline gap-2">
            <span className={cn("g-num text-[56px] leading-none font-semibold tracking-[-0.04em] sm:text-[64px]", s.resultHero)}>{r.lots.toFixed(2)}</span>
            <span className="text-[16px] font-medium text-white/55">lots</span>
          </p>
          <p className="g-num relative mt-2 text-[13px] text-white/50">
            {(r.lots * inst.contract).toLocaleString("en-US", { maximumFractionDigits: 2 })} units · {direction === "long" ? "Buy" : "Sell"} {symbol} at {fmt(r.entryPrice)}
          </p>

          <dl className="relative mt-6 border-t border-white/[0.08]">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-3 last:border-b-0">
                <dt className={cn("text-[13px]", s.resultKey)}>{k}</dt>
                <dd className="g-num text-[14.5px] font-semibold text-white">{v}</dd>
              </div>
            ))}
          </dl>

          {r.targetPips > 0 ? (
            <div className="relative mt-4 grid grid-cols-3 gap-2 rounded-[18px] bg-white/[0.05] p-3 ring-1 ring-white/[0.08]">
              {[
                ["Target", fmt(r.targetPrice)],
                ["Potential profit", usd(r.profit)],
                ["Reward : risk", `${r.rr.toFixed(2)} : 1`],
              ].map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <p className="text-[11px] text-white/45">{k}</p>
                  <p className="g-num mt-0.5 truncate text-[14px] font-semibold text-emerald-400">{v}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {r.wrongSide ? (
          <p className={cn("flex gap-2.5 rounded-[18px] p-4 text-[13px] leading-relaxed ring-1", tone === "dark" ? "bg-red-500/10 text-red-300 ring-red-400/25" : "bg-red-500/10 text-red-700 ring-red-500/20")}>
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            For a {direction} trade the stop loss must be {direction === "long" ? "below" : "above"} the entry price.
          </p>
        ) : r.marginBlocked ? (
          <p className={cn("flex gap-2.5 rounded-[18px] p-4 text-[13px] leading-relaxed ring-1", tone === "dark" ? "bg-amber-400/10 text-amber-200 ring-amber-300/25" : "bg-amber-400/15 text-amber-800 ring-amber-500/25")}>
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            This size needs more margin than the balance covers at 1:{leverage}. The largest position you can open is {r.maxLots.toFixed(2)} lots.
          </p>
        ) : (
          <p className={cn("rounded-[18px] p-4 text-[13px] leading-relaxed ring-1", s.inset, s.muted)}>
            Size is rounded down to 0.01 lots, so the real risk is never above the amount you chose. Spread is not included: add it to your stop distance on short-term trades.
          </p>
        )}
      </div>
    </div>
  );
}
