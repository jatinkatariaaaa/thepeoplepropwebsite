"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  X,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface CreateTradeRecordProps {
  accountId: string; // trading_account_id (CRM)
  onClose: () => void;
  onSuccess: () => void;
}

const PAIR_CATEGORIES: Record<string, string[]> = {
  "Major Forex": [
    "EURUSD",
    "GBPUSD",
    "USDJPY",
    "USDCHF",
    "USDCAD",
    "AUDUSD",
    "NZDUSD",
  ],
  "Minor Forex": [
    "EURGBP",
    "EURJPY",
    "GBPJPY",
    "EURAUD",
    "GBPAUD",
    "AUDJPY",
    "CHFJPY",
    "EURCHF",
  ],
  Exotics: ["USDMXN", "USDSGD", "USDZAR"],
  Commodities: ["XAUUSD", "XAGUSD", "USOIL", "WTIUSD"],
  Crypto: ["BTCUSDT", "ETHUSDT", "SOLUSDT"],
};

const USD_PAIRS = ["EURUSD", "GBPUSD", "AUDUSD", "NZDUSD"];
const JPY_PAIRS = [
  "USDJPY",
  "EURJPY",
  "GBPJPY",
  "AUDJPY",
  "CHFJPY",
];
const OIL_PAIRS = ["USOIL", "WTIUSD"];
const CRYPTO_PAIRS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"];

function calculateGrossPnl(
  symbol: string,
  direction: "buy" | "sell",
  volume: number,
  openPrice: number,
  closePrice: number
): number {
  const diff = closePrice - openPrice;
  let pnl = 0;

  if (symbol === "XAUUSD") {
    pnl = diff * volume * 100;
  } else if (symbol === "XAGUSD") {
    pnl = diff * volume * 5000;
  } else if (OIL_PAIRS.includes(symbol)) {
    pnl = diff * volume * 1000;
  } else if (CRYPTO_PAIRS.includes(symbol)) {
    pnl = diff * volume * 1;
  } else if (USD_PAIRS.includes(symbol) || JPY_PAIRS.includes(symbol)) {
    pnl = diff * volume * 100000;
  } else {
    // Default for other forex pairs
    pnl = diff * volume * 100000;
  }

  if (direction === "sell") {
    pnl *= -1;
  }

  return pnl;
}

function formatDuration(start: string, end: string): string {
  if (!start || !end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (isNaN(ms) || ms < 0) return "—";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(" ");
}

function formatNumber(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default function CreateTradeRecord({
  accountId,
  onClose,
  onSuccess,
}: CreateTradeRecordProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPair, setSelectedPair] = useState<string>("");

  // Form state
  const [direction, setDirection] = useState<"buy" | "sell">("buy");
  const [volume, setVolume] = useState<string>("1.00");
  const [entryPrice, setEntryPrice] = useState<string>("");
  const [entryTime, setEntryTime] = useState<string>("");
  const [closePrice, setClosePrice] = useState<string>("");
  const [closeTime, setCloseTime] = useState<string>("");
  const [stopLoss, setStopLoss] = useState<string>("");
  const [takeProfit, setTakeProfit] = useState<string>("");
  const [closeReason, setCloseReason] = useState<"tp" | "sl" | "manual">("manual");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const grossPnl = useMemo(() => {
    const vol = parseFloat(volume);
    const open = parseFloat(entryPrice);
    const close = parseFloat(closePrice);
    if (isNaN(vol) || isNaN(open) || isNaN(close) || vol <= 0) return null;
    return calculateGrossPnl(selectedPair, direction, vol, open, close);
  }, [selectedPair, direction, volume, entryPrice, closePrice]);

  const commission = useMemo(() => {
    const vol = parseFloat(volume);
    if (isNaN(vol) || vol <= 0) return 0;
    return vol * 6;
  }, [volume]);

  const netPnl = useMemo(() => {
    if (grossPnl === null) return null;
    return grossPnl - commission;
  }, [grossPnl, commission]);

  const duration = useMemo(() => {
    return formatDuration(entryTime, closeTime);
  }, [entryTime, closeTime]);

  const isFormValid = useMemo(() => {
    const vol = parseFloat(volume);
    const open = parseFloat(entryPrice);
    const close = parseFloat(closePrice);
    if (isNaN(vol) || vol <= 0) return false;
    if (isNaN(open) || isNaN(close)) return false;
    if (!entryTime) return false;
    if (!closeTime) return false;
    // Entry must be in the past
    if (new Date(entryTime) >= new Date()) return false;
    // Close must be after entry
    if (new Date(closeTime) <= new Date(entryTime)) return false;
    return true;
  }, [volume, entryPrice, closePrice, entryTime, closeTime]);

  const handleSelectPair = (pair: string) => {
    setSelectedPair(pair);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!isFormValid || grossPnl === null) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/demo-trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trading_account_id: accountId,
          symbol: selectedPair,
          direction,
          volume: parseFloat(volume),
          open_price: parseFloat(entryPrice),
          close_price: parseFloat(closePrice),
          open_time: new Date(entryTime).toISOString(),
          close_time: new Date(closeTime).toISOString(),
          stop_loss: stopLoss ? parseFloat(stopLoss) : undefined,
          take_profit: takeProfit ? parseFloat(takeProfit) : undefined,
          reason: closeReason,
          gross_pnl: grossPnl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create trade record");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border"
        style={{
          backgroundColor: "var(--paper)",
          borderColor: "var(--border)",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b rounded-t-2xl"
          style={{
            backgroundColor: "var(--paper)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={handleBack}
                className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                style={{ backgroundColor: "var(--paper-2)" }}
              >
                <ArrowLeft
                  size={18}
                  style={{ color: "var(--ink-500)" }}
                />
              </button>
            )}
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--ink-950)" }}
            >
              {step === 1 ? "Create Trade Record" : `Create Trade — ${selectedPair}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ backgroundColor: "var(--paper-2)" }}
          >
            <X size={18} style={{ color: "var(--ink-500)" }} />
          </button>
        </div>

        <div className="p-6">
          {/* STEP 1: Select Pair */}
          {step === 1 && (
            <div className="space-y-5">
              <p
                className="text-sm"
                style={{ color: "var(--ink-500)" }}
              >
                Select a trading pair to create a demo trade record.
              </p>

              {Object.entries(PAIR_CATEGORIES).map(([category, pairs]) => (
                <div key={category}>
                  <h3
                    className="text-xs font-medium uppercase tracking-wider mb-2"
                    style={{ color: "var(--ink-400)" }}
                  >
                    {category}
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {pairs.map((pair) => (
                      <button
                        key={pair}
                        onClick={() => handleSelectPair(pair)}
                        className={cn(
                          "px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                          "border hover:scale-[1.02] active:scale-[0.98]"
                        )}
                        style={{
                          backgroundColor: "var(--paper-2)",
                          borderColor: "var(--border)",
                          color: "var(--ink-950)",
                        }}
                      >
                        {pair}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 2: Trade Details */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Direction toggle */}
              <div>
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-2"
                  style={{ color: "var(--ink-400)" }}
                >
                  Direction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDirection("buy")}
                    className={cn(
                      "py-2.5 rounded-xl text-sm font-semibold transition-all",
                      "border"
                    )}
                    style={{
                      backgroundColor:
                        direction === "buy" ? "#16a34a" : "var(--paper-2)",
                      borderColor:
                        direction === "buy" ? "#16a34a" : "var(--border)",
                      color: direction === "buy" ? "#fff" : "var(--ink-500)",
                    }}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <TrendingUp size={16} />
                      BUY
                    </span>
                  </button>
                  <button
                    onClick={() => setDirection("sell")}
                    className={cn(
                      "py-2.5 rounded-xl text-sm font-semibold transition-all",
                      "border"
                    )}
                    style={{
                      backgroundColor:
                        direction === "sell" ? "#dc2626" : "var(--paper-2)",
                      borderColor:
                        direction === "sell" ? "#dc2626" : "var(--border)",
                      color: direction === "sell" ? "#fff" : "var(--ink-500)",
                    }}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      <TrendingDown size={16} />
                      SELL
                    </span>
                  </button>
                </div>
              </div>

              {/* Volume */}
              <div>
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-2"
                  style={{ color: "var(--ink-400)" }}
                >
                  Volume (Lots)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:ring-2 focus:ring-blue-500/30"
                  style={{
                    backgroundColor: "var(--paper-2)",
                    borderColor: "var(--border)",
                    color: "var(--ink-950)",
                  }}
                />
              </div>

              {/* Entry Price + Entry Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-medium uppercase tracking-wider mb-2"
                    style={{ color: "var(--ink-400)" }}
                  >
                    Entry Price
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(e.target.value)}
                    placeholder="0.00000"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:ring-2 focus:ring-blue-500/30"
                    style={{
                      backgroundColor: "var(--paper-2)",
                      borderColor: "var(--border)",
                      color: "var(--ink-950)",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium uppercase tracking-wider mb-2"
                    style={{ color: "var(--ink-400)" }}
                  >
                    Entry Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={entryTime}
                    onChange={(e) => setEntryTime(e.target.value)}
                    max={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:ring-2 focus:ring-blue-500/30"
                    style={{
                      backgroundColor: "var(--paper-2)",
                      borderColor: "var(--border)",
                      color: "var(--ink-950)",
                    }}
                  />
                </div>
              </div>

              {/* Close Price + Close Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-medium uppercase tracking-wider mb-2"
                    style={{ color: "var(--ink-400)" }}
                  >
                    Close Price
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={closePrice}
                    onChange={(e) => setClosePrice(e.target.value)}
                    placeholder="0.00000"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:ring-2 focus:ring-blue-500/30"
                    style={{
                      backgroundColor: "var(--paper-2)",
                      borderColor: "var(--border)",
                      color: "var(--ink-950)",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium uppercase tracking-wider mb-2"
                    style={{ color: "var(--ink-400)" }}
                  >
                    Close Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    min={entryTime || undefined}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:ring-2 focus:ring-blue-500/30"
                    style={{
                      backgroundColor: "var(--paper-2)",
                      borderColor: "var(--border)",
                      color: "var(--ink-950)",
                    }}
                  />
                </div>
              </div>

              {/* Stop Loss + Take Profit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-medium uppercase tracking-wider mb-2"
                    style={{ color: "var(--ink-400)" }}
                  >
                    Stop Loss{" "}
                    <span style={{ color: "var(--ink-400)" }}>(optional)</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    placeholder="—"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:ring-2 focus:ring-blue-500/30"
                    style={{
                      backgroundColor: "var(--paper-2)",
                      borderColor: "var(--border)",
                      color: "var(--ink-950)",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium uppercase tracking-wider mb-2"
                    style={{ color: "var(--ink-400)" }}
                  >
                    Take Profit{" "}
                    <span style={{ color: "var(--ink-400)" }}>(optional)</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    placeholder="—"
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors focus:ring-2 focus:ring-blue-500/30"
                    style={{
                      backgroundColor: "var(--paper-2)",
                      borderColor: "var(--border)",
                      color: "var(--ink-950)",
                    }}
                  />
                </div>
              </div>

              {/* Close Reason */}
              <div>
                <label
                  className="block text-xs font-medium uppercase tracking-wider mb-2"
                  style={{ color: "var(--ink-400)" }}
                >
                  Close Reason
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: "tp", label: "TP" },
                      { value: "sl", label: "SL" },
                      { value: "manual", label: "Manual" },
                    ] as const
                  ).map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setCloseReason(r.value)}
                      className={cn(
                        "py-2.5 rounded-xl text-sm font-medium transition-all border"
                      )}
                      style={{
                        backgroundColor:
                          closeReason === r.value
                            ? "var(--ink-950)"
                            : "var(--paper-2)",
                        borderColor:
                          closeReason === r.value
                            ? "var(--ink-950)"
                            : "var(--border)",
                        color:
                          closeReason === r.value
                            ? "var(--paper)"
                            : "var(--ink-500)",
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Card */}
              <div
                className="rounded-xl border p-4 space-y-3"
                style={{
                  backgroundColor: "var(--paper-2)",
                  borderColor: "var(--border)",
                }}
              >
                <h4
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--ink-400)" }}
                >
                  Trade Preview
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {/* Gross P/L */}
                  <div className="space-y-0.5">
                    <span
                      className="text-xs"
                      style={{ color: "var(--ink-400)" }}
                    >
                      Gross P/L
                    </span>
                    <p
                      className="text-lg font-bold"
                      style={{
                        color:
                          grossPnl === null
                            ? "var(--ink-400)"
                            : grossPnl >= 0
                            ? "#16a34a"
                            : "#dc2626",
                      }}
                    >
                      {grossPnl !== null
                        ? `${grossPnl >= 0 ? "+" : ""}$${formatNumber(grossPnl)}`
                        : "—"}
                    </p>
                  </div>

                  {/* Commission */}
                  <div className="space-y-0.5">
                    <span
                      className="text-xs"
                      style={{ color: "var(--ink-400)" }}
                    >
                      Commission
                    </span>
                    <p
                      className="text-lg font-bold"
                      style={{ color: "var(--ink-950)" }}
                    >
                      -${formatNumber(commission)}
                    </p>
                  </div>

                  {/* Net P/L */}
                  <div className="space-y-0.5">
                    <span
                      className="text-xs"
                      style={{ color: "var(--ink-400)" }}
                    >
                      Net P/L
                    </span>
                    <p
                      className="text-lg font-bold"
                      style={{
                        color:
                          netPnl === null
                            ? "var(--ink-400)"
                            : netPnl >= 0
                            ? "#16a34a"
                            : "#dc2626",
                      }}
                    >
                      {netPnl !== null
                        ? `${netPnl >= 0 ? "+" : ""}$${formatNumber(netPnl)}`
                        : "—"}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="space-y-0.5">
                    <span
                      className="text-xs flex items-center gap-1"
                      style={{ color: "var(--ink-400)" }}
                    >
                      <Clock size={12} />
                      Duration
                    </span>
                    <p
                      className="text-lg font-bold"
                      style={{ color: "var(--ink-950)" }}
                    >
                      {duration}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || loading}
                className={cn(
                  "w-full py-3 rounded-xl text-sm font-semibold transition-all",
                  "flex items-center justify-center gap-2",
                  !isFormValid || loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:opacity-90 active:scale-[0.99]"
                )}
                style={{
                  backgroundColor: "var(--ink-950)",
                  color: "var(--paper)",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Create Trade Record
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
