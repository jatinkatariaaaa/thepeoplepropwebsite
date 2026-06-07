"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Copy,
  Lock,
  Plus,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  ALL_SIZES,
  addOns,
  feeFor,
  formatSize,
  formatSizeLong,
  platforms,
  programOffersSize,
  programs,
  type AccountSize,
  type AddOnKey,
  type PlatformKey,
  type ProgramKey,
} from "@/data/programs";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
   Configurator — Atlas-style, TPP-themed.
   Top row: program-type pills
   Promo strip
   Body: [platform column] [size grid] [live spec card]
   Bottom: add-on toggles
   ───────────────────────────────────────────────────────────── */

const DEFAULT_PROGRAM: ProgramKey = "1-step";
const DEFAULT_SIZE: AccountSize = 25_000;
const DEFAULT_PLATFORM: PlatformKey = "mt5";

export function ChallengeCalculator() {
  const [programKey, setProgramKey] = useState<ProgramKey>(DEFAULT_PROGRAM);
  const [size, setSize] = useState<AccountSize>(DEFAULT_SIZE);
  const [platformKey, setPlatformKey] = useState<PlatformKey>(DEFAULT_PLATFORM);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnKey[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ fullName: "", email: "", country: "", address: "" });
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);



  const program = useMemo(
    () => programs.find((p) => p.key === programKey) ?? programs[0],
    [programKey],
  );

  // If the active size isn't offered by the new program, fall back to its largest available size.
  const effectiveSize = useMemo<AccountSize>(() => {
    if (programOffersSize(program, size)) return size;
    const offered = (Object.keys(program.fees) as unknown as string[])
      .map((s) => Number(s) as AccountSize)
      .sort((a, b) => a - b);
    // Prefer the closest size <= current, otherwise the smallest offered.
    const lowerOrEqual = offered.filter((s) => s <= size).pop();
    return lowerOrEqual ?? offered[0];
  }, [program, size]);

  const { base, total, addOnFees } = useMemo(
    () => feeFor(program, effectiveSize, selectedAddOns),
    [program, effectiveSize, selectedAddOns],
  );

  // Compute final price locally based on discount
  const finalPrice = total != null ? total * (1 - appliedDiscount) : null;

  const handleCryptoPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (finalPrice == null) return;
    try {
      setIsProcessingPayment(true);
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_amount: finalPrice,
          price_currency: "usd",
          program_key: programKey,
          size: size,
          order_id: `TPP-${Date.now()}`,
          ...checkoutForm
        }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate payment");
      }
      if (data.invoice_url) {
        window.location.href = data.invoice_url;
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      alert(`Payment Error: ${err.message || "Failed to connect to gateway"}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const profitTargetUsd = useMemo(() => {
    // Approximate the $ profit target from the headline %
    const m = program.profitTarget.match(/(\d+(?:\.\d+)?)/);
    if (!m) return null;
    const pct = parseFloat(m[1]);
    return Math.round((effectiveSize * pct) / 100);
  }, [program, effectiveSize]);

  const { copied, copy } = useCopyToClipboard();

  // Build spec rows
  const specs = useMemo(() => {
    let profitTargetValue: React.ReactNode = "—";
    
    if (program.key === "1-step") {
      const pct = parseFloat(program.profitTarget);
      const usd = Math.round((effectiveSize * pct) / 100);
      profitTargetValue = `${program.profitTarget} · $${usd.toLocaleString("en-US")}`;
    } else if (program.key === "2-step") {
      const matches = [...program.profitTarget.matchAll(/(\d+(?:\.\d+)?)%/g)];
      if (matches.length >= 2) {
        const p1 = parseFloat(matches[0][1]);
        const p2 = parseFloat(matches[1][1]);
        const u1 = Math.round((effectiveSize * p1) / 100);
        const u2 = Math.round((effectiveSize * p2) / 100);
        profitTargetValue = (
          <span className="flex flex-col items-end gap-0.5 text-right">
            <span className="leading-tight">Phase 1: {p1}% · ${u1.toLocaleString("en-US")}</span>
            <span className="text-[11.5px] leading-tight text-[var(--ink-500)] font-normal">Phase 2: {p2}% · ${u2.toLocaleString("en-US")}</span>
          </span>
        );
      }
    } else if (program.key === "3-step") {
      const m = program.profitTarget.match(/(\d+(?:\.\d+)?)/);
      const pct = m ? parseFloat(m[1]) : 6;
      const usd = Math.round((effectiveSize * pct) / 100);
      profitTargetValue = `${pct}% per phase · $${usd.toLocaleString("en-US")}`;
    }

    return [
      {
        label: "Account size",
        value: formatSizeLong(effectiveSize),
        strong: true,
      },
      {
        label: "Profit target",
        value: profitTargetValue,
      },
      {
        label: "Max. daily loss",
        value: program.dailyDrawdown,
      },
      {
        label: "Max. overall loss",
        value: program.maxDrawdown,
      },
      {
        label: "Min. trading days",
        value:
          program.key === "instant"
            ? `${program.minTradingDays} on funded`
            : `${program.minTradingDays} per phase`,
      },
      {
        label: "Profit split",
        value: selectedAddOns.includes("split-100")
          ? `100%`
          : `${program.profitSplit}%`,
        accent: true,
      },
      {
        label: "Payout cycle",
        value: selectedAddOns.includes("payout-on-demand")
          ? "On demand"
          : program.payoutCycle,
      },
      {
        label: "Consistency rule",
        value: program.consistencyRule,
      },
      {
        label: "Expert advisors",
        value: "Allowed",
        icon: ShieldCheck,
      },
    ];
  }, [program, effectiveSize, selectedAddOns]);

  // Reset add-ons when switching program if any are no longer applicable
  function selectProgram(k: ProgramKey) {
    setProgramKey(k);
    setSelectedAddOns((curr) =>
      curr.filter((key) =>
        addOns
          .find((a) => a.key === key)!
          .appliesTo.includes(k),
      ),
    );
  }

  function toggleAddOn(k: AddOnKey) {
    setSelectedAddOns((curr) =>
      curr.includes(k) ? curr.filter((x) => x !== k) : [...curr, k],
    );
  }

  const applicableAddOns = addOns.filter((a) =>
    a.appliesTo.includes(program.key),
  );

  return (
    <section id="calculator" className="relative py-12 md:py-32 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-grid bg-grid-fade opacity-40 pointer-events-none"
      />
      {/* Floating color orbs */}
      <div aria-hidden className="orb orb-blue animate-float-slow" style={{ width: 360, height: 360, top: 100, left: -120, opacity: 0.22 }} />
      <div aria-hidden className="orb orb-violet animate-float-slower" style={{ width: 320, height: 320, bottom: 80, right: -100, opacity: 0.20 }} />
      <div aria-hidden className="orb orb-amber animate-drift" style={{ width: 200, height: 200, top: 40, right: 30 + "%", opacity: 0.20 }} />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Build Your Challenge"
          title={
            <>
              Choose your{" "}
              <span className="word-serif">trading</span> account.
            </>
          }
          description="Pick a program, account size, and platform. Specs and pricing update live as you customise."
          className="mb-10 md:mb-14"
        />

        {/* Program type pills (Atlas-style hero bar) - Desktop */}
        <div className="hidden md:flex mx-auto mb-5 w-full max-w-3xl flex-wrap items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-white p-1.5 shadow-[0_2px_0_rgba(11,15,26,0.02)]">
          {programs.map((p) => {
            const active = p.key === program.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => selectProgram(p.key)}
                aria-pressed={active}
                className={cn(
                  "relative inline-flex items-center gap-2 rounded-full px-4 md:px-5 py-2 text-[13px] md:text-[13.5px] font-medium transition-colors",
                  active
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--ink-600)] hover:text-[var(--ink-950)]",
                )}
              >
                {p.shortLabel}
                {p.badge && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[9px] tracking-eyebrow font-semibold",
                      active
                        ? "bg-white text-[var(--accent)]"
                        : "bg-[var(--accent-50)] text-[var(--accent-700)]",
                    )}
                  >
                    {p.badge.toUpperCase()}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Program type segmented control - Mobile */}
        <div className="md:hidden mx-auto mb-5 flex w-full max-w-full bg-[var(--paper-2)] p-1 rounded-full items-center shadow-inner border border-black/[0.04]">
          {programs.map((p) => {
            const active = p.key === program.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => selectProgram(p.key)}
                aria-pressed={active}
                className={cn(
                  "relative inline-flex items-center justify-center whitespace-nowrap rounded-full px-2 py-2.5 transition-all flex-1",
                  active
                    ? "bg-white text-[var(--ink-950)] shadow-[0_2px_8px_-2px_rgba(11,15,26,0.08)]"
                    : "text-[var(--ink-500)] hover:text-[var(--ink-950)]",
                )}
              >
                <span className="text-[11px] sm:text-[12px] font-semibold tracking-tight">{p.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Promo strip (dark, cobalt accent) */}
        <div className="mx-auto mb-10 flex w-full max-w-3xl items-center justify-center gap-3 rounded-full bg-[var(--ink-950)] px-5 py-3 text-[12.5px] text-white/85">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] text-white/55">
            <Tag className="w-3 h-3" strokeWidth={2.5} />
            Exclusive Offer
          </span>
          <span className="hidden sm:block h-3 w-px bg-white/15" />
          <span>
            <span className="text-[var(--accent-400)] font-medium">50% off</span> + free
            retry add-on
          </span>
          <span className="h-3 w-px bg-white/15" />
          <button
            type="button"
            onClick={() => copy("FIRSTTPP")}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11.5px] font-mono tracking-wider text-white hover:bg-white/15 transition-colors"
            aria-label="Copy promo code"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[var(--accent-400)]" strokeWidth={2.5} />
                Copied
              </>
            ) : (
              <>
                Code: FIRSTTPP <Copy className="w-3 h-3" strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr_minmax(0,420px)] gap-5 lg:gap-6 items-start">
          {/* ── Platform column ── */}
          <div className="glass-strong rounded-2xl p-5 lift">
            <ColumnHeading>Choose a platform</ColumnHeading>
            {/* Desktop Platform List */}
            <div className="hidden md:block space-y-2">
              {platforms.map((p) => {
                const active = p.key === platformKey;
                const disabled = p.status === "soon";
                return (
                  <button
                    key={p.key}
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setPlatformKey(p.key)}
                    aria-pressed={active}
                    className={cn(
                      "relative w-full rounded-full sm:rounded-xl border px-3.5 py-3 text-left transition-all lift",
                      disabled && "opacity-55 cursor-not-allowed",
                      active && !disabled
                        ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                        : "border-[var(--border)] bg-white hover:border-[var(--ink-950)]",
                    )}
                  >
                    <span
                      className={cn(
                        "block text-[13px] font-medium",
                        active && !disabled
                          ? "text-white"
                          : "text-[var(--ink-950)]",
                      )}
                    >
                      {p.label}
                    </span>
                    <span
                      className={cn(
                        "block text-[11px] mt-0.5",
                        active && !disabled
                          ? "text-white/55"
                          : "text-[var(--ink-500)]",
                      )}
                    >
                      {p.sub}
                    </span>
                    {disabled && (
                      <Lock
                        className="absolute top-3 right-3 w-3.5 h-3.5 text-[var(--ink-400)]"
                        strokeWidth={2.2}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Platform Segmented Control */}
            <div className="md:hidden flex w-full max-w-full bg-[var(--paper-2)] p-1 rounded-full items-center shadow-inner border border-black/[0.04]">
              {platforms.map((p) => {
                const active = p.key === platformKey;
                const disabled = p.status === "soon";
                return (
                  <button
                    key={p.key}
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setPlatformKey(p.key)}
                    aria-pressed={active}
                    className={cn(
                      "relative inline-flex flex-col items-center justify-center whitespace-nowrap rounded-full px-1 py-2 transition-all flex-1",
                      disabled && "opacity-55 cursor-not-allowed",
                      active && !disabled
                        ? "bg-white text-[var(--ink-950)] shadow-[0_2px_8px_-2px_rgba(11,15,26,0.08)]"
                        : "text-[var(--ink-500)] hover:text-[var(--ink-950)]",
                    )}
                  >
                    <span className="block font-semibold text-[10.5px] sm:text-[11.5px] tracking-tight">
                      {p.label}
                    </span>
                    {disabled && (
                      <Lock
                        className="absolute top-1.5 right-2 w-2.5 h-2.5 text-[var(--ink-400)]"
                        strokeWidth={2}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Size column ── */}
          <div className="glass-strong rounded-2xl p-5 lift">
            <ColumnHeading>Choose account size</ColumnHeading>
            
            {/* Desktop Size Grid */}
            <div className="hidden md:grid grid-cols-3 lg:grid-cols-3 gap-2">
              {ALL_SIZES.map((s) => {
                const offered = program.fees[s] != null;
                const active = s === effectiveSize && offered;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => offered && setSize(s)}
                    disabled={!offered}
                    aria-pressed={active}
                    className={cn(
                      "relative rounded-xl border px-3 py-3.5 text-center transition-all duration-200 lift",
                      !offered && "opacity-35 cursor-not-allowed",
                      active
                        ? "border-[var(--accent)] bg-[var(--accent-50)] text-[var(--ink-950)] shadow-[0_8px_22px_-14px_rgba(37,99,235,0.45)]"
                        : "border-[var(--border)] bg-white text-[var(--ink-950)] hover:border-[var(--ink-950)]",
                    )}
                  >
                    <span className="block font-medium text-[15px] md:text-[17px] tabular-nums tracking-tight">
                      {formatSize(s)}
                    </span>
                    {offered && program.fees[s] != null && (
                      <span
                        className={cn(
                          "block text-[10.5px] mt-0.5 tabular-nums",
                          active
                            ? "text-[var(--accent-700)] font-medium"
                            : "text-[var(--ink-500)]",
                        )}
                      >
                        from ${program.fees[s]}
                      </span>
                    )}
                    {!offered && (
                      <span className="block text-[10.5px] mt-0.5 text-[var(--ink-400)]">
                        n/a
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Size Segmented Control */}
            <div className="md:hidden flex w-full max-w-full bg-[var(--paper-2)] p-1 rounded-full items-center shadow-inner border border-black/[0.04]">
              {ALL_SIZES.map((s) => {
                const offered = program.fees[s] != null;
                const active = s === effectiveSize && offered;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => offered && setSize(s)}
                    disabled={!offered}
                    aria-pressed={active}
                    className={cn(
                      "relative flex flex-col items-center justify-center whitespace-nowrap rounded-full px-0.5 py-2.5 transition-all flex-1",
                      !offered && "opacity-35 cursor-not-allowed hidden",
                      active
                        ? "bg-white text-[var(--ink-950)] shadow-[0_2px_8px_-2px_rgba(11,15,26,0.08)]"
                        : "text-[var(--ink-600)] hover:text-[var(--ink-950)]",
                    )}
                  >
                    <span className="block font-semibold text-[10.5px] sm:text-[11.5px] tabular-nums tracking-tighter">
                      {formatSize(s).replace("$", "")}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Add-ons */}
            <div className="mt-6">
              <ColumnHeading>Optional add-ons</ColumnHeading>
              <div className="grid grid-cols-2 gap-2">
                {applicableAddOns.map((a) => {
                  const active = selectedAddOns.includes(a.key);
                  return (
                    <button
                      key={a.key}
                      type="button"
                      onClick={() => toggleAddOn(a.key)}
                      aria-pressed={active}
                      className={cn(
                        "group relative rounded-[28px] sm:rounded-xl border p-3 sm:p-3 text-left transition-all lift flex flex-col sm:block justify-between min-h-[85px] sm:min-h-0",
                        active
                          ? "border-[var(--ink-950)] bg-[var(--ink-950)] text-white"
                          : "border-[var(--border)] bg-white hover:border-[var(--ink-950)]",
                      )}
                    >
                      {/* Desktop layout wrapper & Mobile top row */}
                      <div className="flex items-start sm:items-start justify-between w-full sm:w-auto gap-3">
                        {/* Mobile percentage (hidden on desktop) */}
                        <span
                          className={cn(
                            "sm:hidden text-[11px] font-bold tabular-nums mt-0.5",
                            active ? "text-[var(--accent-400)]" : "text-[var(--accent-700)]",
                          )}
                        >
                          +{a.feePct}%
                        </span>

                        {/* Desktop text content (hidden on mobile) */}
                        <div className="hidden sm:block min-w-0">
                          <p
                            className={cn(
                              "text-[13px] font-medium leading-tight",
                              active ? "text-white" : "text-[var(--ink-950)]",
                            )}
                          >
                            {a.label}
                          </p>
                          <p
                            className={cn(
                              "text-[11.5px] mt-1 leading-snug",
                              active
                                ? "text-white/60"
                                : "text-[var(--ink-500)]",
                            )}
                          >
                            {a.description}
                          </p>
                        </div>

                        {/* Checkbox (shared) */}
                        <span
                          className={cn(
                            "shrink-0 grid place-items-center w-5 h-5 rounded-md border transition-colors",
                            active
                              ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                              : "border-[var(--border-strong)] bg-white",
                          )}
                        >
                          {active ? (
                            <Check className="w-3 h-3" strokeWidth={3} />
                          ) : (
                            <Plus
                              className="w-3 h-3 text-[var(--ink-500)]"
                              strokeWidth={2.5}
                            />
                          )}
                        </span>
                      </div>

                      {/* Mobile label (bottom row, hidden on desktop) */}
                      <div className="sm:hidden mt-2 w-full">
                        <p
                          className={cn(
                            "text-[12px] font-medium leading-tight pr-2",
                            active ? "text-white" : "text-[var(--ink-950)]",
                          )}
                        >
                          {a.label}
                        </p>
                      </div>

                      {/* Desktop percentage (absolute top-right, hidden on mobile) */}
                      <span
                        className={cn(
                          "hidden sm:block absolute top-3 right-9 text-[10.5px] font-medium tabular-nums",
                          active ? "text-[var(--accent-400)]" : "text-[var(--accent-700)]",
                        )}
                      >
                        +{a.feePct}%
                      </span>
                    </button>
                  );
                })}
                })}
              </div>
            </div>

            {/* Promo / Coupon Code Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-[var(--ink-600)] tracking-widest uppercase">Promo Code</span>
                <span className="text-[10px] bg-[var(--accent-50)] text-[var(--accent-700)] px-2 py-0.5 rounded-full uppercase tracking-wider">Optional</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="w-full rounded-[16px] border border-[var(--border)] px-4 py-3.5 text-[15px] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all bg-white text-[var(--ink-950)] font-mono uppercase placeholder:normal-case shadow-sm"
                  placeholder="Enter code here..."
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (promoCode === "FIRSTTPP") {
                      setAppliedDiscount(0.5);
                    } else {
                      setAppliedDiscount(0);
                      alert("Invalid promo code.");
                    }
                  }}
                  className="shrink-0 rounded-[16px] px-6 bg-[var(--ink-950)] text-white hover:bg-[var(--ink-800)] font-medium"
                >
                  Apply
                </Button>
              </div>
              {appliedDiscount > 0 && (
                <p className="text-[13px] font-medium text-[#10B981] mt-2.5 flex items-center gap-1.5">
                  <Check className="w-4 h-4" strokeWidth={3} />
                  50% Discount Applied Successfully!
                </p>
              )}
            </div>
          </div>

          {/* ── Live spec card (Desktop) ── */}
          <div className="hidden lg:block lg:sticky lg:top-24">
            <div className="glass-strong rounded-2xl overflow-hidden lift relative">
              {/* Heading inside card */}
              <div className="relative px-5 md:px-6 pt-5 md:pt-6 pb-4 border-b border-[var(--border)] bg-white/30">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="chip chip-accent">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] pulse-dot" />
                    Live configuration
                  </span>
                  <span className="text-[11px] tracking-eyebrow text-[var(--ink-400)]">
                    {program.shortLabel}
                  </span>
                </div>
                <p className="text-[12.5px] text-[var(--ink-500)]">
                  {program.tagline}
                </p>
              </div>

              {/* Dotted-leader spec rows */}
              <ul className="px-5 md:px-6 py-4 divide-y divide-[var(--border)]">
                {specs.map((row) => {
                  const Icon = row.icon;
                  return (
                    <li
                      key={row.label}
                      className="flex items-baseline gap-2 py-2.5"
                    >
                      <span className="text-[13px] text-[var(--ink-600)] shrink-0">
                        {row.label}
                      </span>
                      <span
                        className="flex-1 h-px translate-y-[6px] opacity-90"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle, rgba(11,15,26,0.22) 1px, transparent 1.2px)",
                          backgroundSize: "6px 1px",
                          backgroundRepeat: "repeat-x",
                        }}
                        aria-hidden="true"
                      />
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={`${row.label}-${program.key}-${effectiveSize}-${selectedAddOns.length}`}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.18 }}
                          className={cn(
                            "inline-flex items-center gap-1.5 text-[13.5px] tabular-nums shrink-0 font-medium",
                            row.strong
                              ? "text-[var(--ink-950)] text-[15px]"
                              : row.accent
                                ? "text-[var(--accent-700)]"
                                : "text-[var(--ink-950)]",
                          )}
                        >
                          {row.value}
                          {Icon && (
                            <Icon
                              className="w-3.5 h-3.5 text-[var(--accent-700)]"
                              strokeWidth={2.4}
                            />
                          )}
                        </motion.span>
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>

              {/* Price row */}
              <div className="relative px-5 md:px-6 py-4 border-t border-[var(--border)] bg-white/30">
                <div className="flex items-end justify-between gap-3 mb-3">
                  <div>
                    <p className="text-[10.5px] uppercase tracking-[0.2em] text-[var(--ink-500)] mb-0.5">
                      Average payout
                    </p>
                    <p className="text-[14px] font-medium text-[var(--ink-950)] tabular-nums">
                      $
                      {Math.round(
                        ((profitTargetUsd ?? effectiveSize * 0.05) *
                          (selectedAddOns.includes("split-100")
                            ? program.profitSplitMax
                            : program.profitSplit)) /
                          100,
                      ).toLocaleString("en-US")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10.5px] uppercase tracking-[0.2em] text-[var(--ink-500)] mb-0.5">
                      One-time fee
                    </p>
                    <AnimatePresence mode="popLayout">
                      <motion.div
                        key={`${program.key}-${effectiveSize}-${selectedAddOns.join(",")}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium text-[26px] md:text-[28px] tabular-nums leading-none tracking-tight text-[var(--ink-950)] flex flex-col items-end"
                      >
                        {appliedDiscount > 0 && total != null && (
                          <span className="text-[15px] font-medium text-[var(--ink-400)] line-through leading-none mb-0.5">
                            ${total.toLocaleString("en-US")}
                          </span>
                        )}
                        <span>{finalPrice != null ? `$${finalPrice.toLocaleString("en-US")}` : "—"}</span>
                      </motion.div>
                    </AnimatePresence>
                    {base != null && total != null && total !== base && (
                      <p className="mt-1 text-[11px] text-[var(--ink-500)] tabular-nums">
                        base ${base} + add-ons $
                        {addOnFees
                          .reduce((s, a) => s + a.amount, 0)
                          .toLocaleString("en-US")}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => setShowCheckoutModal(true)}
                  disabled={total == null}
                  variant="primary"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2"
                >
                  Pay with Crypto
                </Button>

                {/* Payment icons */}
                <div className="mt-3 flex items-center justify-center gap-3 opacity-60">
                  {["Visa", "Mastercard", "Apple Pay", "Google Pay", "Crypto"].map(
                    (p) => (
                      <span
                        key={p}
                        className="text-[10.5px] uppercase tracking-[0.15em] text-[var(--ink-500)]"
                      >
                        {p}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Highlights below card */}
            <ul className="mt-4 grid grid-cols-1 gap-1.5 text-[12.5px] text-[var(--ink-600)]">
              {program.highlights.map((h) => (
                <li key={h} className="flex items-center gap-2">
                  <Check
                    className="w-3.5 h-3.5 text-[var(--accent-700)]"
                    strokeWidth={2.5}
                  />
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Mobile Live spec card ── */}
          <div className="lg:hidden mt-2 bg-white rounded-[24px] border border-[var(--border)] p-5 relative shadow-[0_4px_24px_rgba(11,15,26,0.04)]">
            {/* Top Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center rounded-full bg-[#415C9C] px-3.5 py-1 text-[10px] font-bold tracking-widest text-white uppercase">
                Most Popular
              </span>
            </div>

            {/* Price */}
            <div className="text-center mt-2 mb-6">
              {appliedDiscount > 0 && total != null && (
                <p className="text-[20px] font-medium text-[#94A3B8] line-through leading-none mb-1.5">
                  ${total.toLocaleString("en-US")}
                </p>
              )}
              <h3 className="text-[52px] font-display font-bold text-[#0F172A] tracking-tight leading-none">
                {finalPrice != null ? `$${finalPrice.toLocaleString("en-US")}` : "—"}
              </h3>
              <p className="text-[14px] text-[#64748B] mt-3 font-medium">
                for {formatSizeLong(effectiveSize)} Account
              </p>
              {selectedAddOns.length > 0 && (
                <p className="text-[12.5px] text-[#475569] mt-3 font-medium">
                  Add-on available: <span className="text-[#0F172A]">{selectedAddOns.map(k => addOns.find(a => a.key === k)?.label).join(", ")}</span>
                </p>
              )}
            </div>

            {/* Buy Button */}
            <Button
              onClick={() => setShowCheckoutModal(true)}
              disabled={total == null}
              className="w-full bg-[#0B1E4A] hover:bg-[#061230] text-white rounded-[18px] h-[54px] text-[15px] font-semibold mb-6 shadow-md"
            >
              Pay with Crypto
            </Button>

            {/* Specs Grey Box */}
            <div className="bg-[#F8FAFC] rounded-[20px] p-5 space-y-4">
              {specs.map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-[13.5px] text-[#334155] font-semibold flex items-center gap-1.5">
                      {row.label}
                    </span>
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={`${row.label}-${program.key}-${effectiveSize}-${selectedAddOns.length}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[14px] tabular-nums font-bold text-[#0F172A] text-right"
                      >
                        {row.value}
                        {Icon && <Icon className="inline-block ml-1 w-3.5 h-3.5 text-[#0F172A]" strokeWidth={3} />}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCheckoutModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                <div>
                  <h3 className="text-lg font-bold text-[var(--ink-950)]">Checkout Details</h3>
                  <p className="text-[13px] text-[var(--ink-500)]">Please fill in your details to proceed to payment.</p>
                </div>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="rounded-full p-2 text-[var(--ink-500)] hover:bg-[var(--paper-2)] hover:text-[var(--ink-950)] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCryptoPayment} className="p-6 space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-[var(--ink-950)]">Full Name</label>
                  <input
                    required
                    type="text"
                    value={checkoutForm.fullName}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, fullName: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-[14px] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all bg-white text-black"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-[var(--ink-950)]">Email Address</label>
                  <input
                    required
                    type="email"
                    value={checkoutForm.email}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-[14px] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all bg-white text-black"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-[var(--ink-950)]">Country</label>
                    <input
                      required
                      type="text"
                      value={checkoutForm.country}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, country: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-[14px] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all bg-white text-black"
                      placeholder="United States"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-[var(--ink-950)]">Address</label>
                    <input
                      required
                      type="text"
                      value={checkoutForm.address}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-[14px] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all bg-white text-black"
                      placeholder="123 Trading St"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)] mt-2">
                  <div className="flex justify-between items-center mb-4 px-1">
                    <span className="text-[14px] font-medium text-[var(--ink-600)]">Total to Pay</span>
                    <span className="text-[20px] font-bold text-[var(--ink-950)]">
                      ${finalPrice?.toLocaleString("en-US")}
                    </span>
                  </div>
                  <Button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="w-full bg-[var(--accent)] hover:bg-[var(--accent-700)] text-white rounded-xl h-[48px] text-[15px] font-semibold shadow-md flex items-center justify-center gap-2"
                  >
                    {isProcessingPayment ? "Connecting to NOWPayments..." : `Pay $${finalPrice?.toLocaleString("en-US")} via Crypto`}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] tracking-eyebrow font-medium text-[var(--ink-500)] mb-3 flex items-center gap-2">
      <span className="h-px w-5 bg-[var(--border)]" aria-hidden="true" />
      {children}
    </p>
  );
}