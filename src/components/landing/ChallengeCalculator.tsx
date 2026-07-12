"use client";

import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  ArrowUpRight,
  Bot,
  CalendarDays,
  Check,
  Copy,
  FileText,
  Lock,
  Percent,
  Plus,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingDown,
  Wallet,
  X,
  type LucideIcon,
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
  type Platform,
  type ProgramKey,
  type Program,
} from "@/data/programs";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useHydratedPrograms } from "@/hooks/useHydratedPrograms";
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
const DEFAULT_PLATFORM: PlatformKey = "tppdashboard";

/* Icon per spec row label (GFT-style rows) */
const SPEC_ICONS: Record<string, LucideIcon> = {
  "Account size": Wallet,
  "Profit target": Target,
  "Max. daily loss": TrendingDown,
  "Max. overall loss": ShieldAlert,
  "Min. trading days": CalendarDays,
  "Profit split": Percent,
  "Payout cycle": FileText,
  "Consistency rule": Scale,
  "Expert advisors": Bot,
};

export function ChallengeCalculator() {
  const router = useRouter();
  const [programKey, setProgramKey] = useState<ProgramKey>(DEFAULT_PROGRAM);
  const [size, setSize] = useState<AccountSize>(DEFAULT_SIZE);
  const [platformKey, setPlatformKey] = useState<PlatformKey>(DEFAULT_PLATFORM);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnKey[]>([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ fullName: "", email: "", country: "", address: "" });
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { programs: livePrograms, isLoading: isLoadingPrograms } = useHydratedPrograms();
  const [livePlatforms, setLivePlatforms] = useState<Platform[]>(platforms);

  // using imported supabase from lib

  useEffect(() => {
    setMounted(true);
    fetchLivePlatforms();
  }, []);

  
  async function fetchLivePlatforms() {
    try {
      const { data, error } = await supabase
        .from("tpp_platforms")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        const mappedPlatforms: Platform[] = data.map((d: any) => ({
          key: d.name.toLowerCase().replace(/[^a-z0-9]/g, '') as PlatformKey,
          label: d.name,
          sub: d.extra_fee_pct > 0 ? `+${d.extra_fee_pct}` : "Free",
          status: "live",
          extraFeePct: d.extra_fee_pct
        }));
        setLivePlatforms(mappedPlatforms);
        setPlatformKey(mappedPlatforms[0].key);
      }
    } catch (err) {
      console.error("Error fetching platforms:", err);
    }
  }



  const program = useMemo(
    () => livePrograms.find((p) => p.key === programKey) ?? livePrograms[0],
    [livePrograms, programKey],
  );

  const liveSizes = useMemo(() => {
    const sizes = new Set<number>();
    livePrograms.forEach(p => {
      Object.keys(p.fees || {}).forEach(k => sizes.add(Number(k)));
    });
    return Array.from(sizes).sort((a, b) => a - b) as AccountSize[];
  }, [livePrograms]);

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

  const { base, total: prePlatformTotal, addOnFees } = useMemo(
    () => feeFor(program, effectiveSize, selectedAddOns),
    [program, effectiveSize, selectedAddOns],
  );

  let platformExtras = 0;
  const currentPlatform = livePlatforms.find(p => p.key === platformKey);
  if (currentPlatform && currentPlatform.extraFeePct) {
    platformExtras = currentPlatform.extraFeePct; // It's absolute USD as per the new DB schema
  }
  const total = prePlatformTotal != null ? prePlatformTotal + platformExtras : null;

  // Compute final price locally based on discount
  const postPassFee = total != null ? total * (1 - appliedDiscount) : null;
  let finalPrice = postPassFee;
  
  if (programKey === "access") {
    finalPrice = 5;
  }

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
    <section id="calculator" className="w-full pb-16 lg:pb-24">
      <div className="w-full px-0">
        <div className="px-[5px] py-[5px]">
          <div className="relative rounded-2xl bg-[#0c0c0c] border border-white/[0.05] py-16 xl:py-24 px-[15px] lg:px-[35px] overflow-hidden">
            <div className="relative mx-auto max-w-7xl">
              <div className="text-center mb-8 md:mb-10">
                <h2
                  className="tracking-tight font-bold uppercase text-white text-balance mb-4"
                  style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)", lineHeight: 1 }}
                >
                  Choose your account
                </h2>
                <div className="flex items-center justify-center gap-2 text-[14px] text-white/70">
                  <span className="grid place-items-center w-6 h-6 rounded-[7px] bg-[#bcff2e]">
                    <Lock className="w-3.5 h-3.5 text-[#0c0c0c]" strokeWidth={2.5} />
                  </span>
                  Payout Guaranteed
                </div>
              </div>

        {/* Promo bar (GFT-style) */}
        <div className="mx-auto mb-6 flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-2xl bg-[#1a1a1a] border border-white/[0.05] px-5 py-4 text-[13px] sm:text-[14.5px] font-semibold text-white uppercase tracking-wide">
          <span>Limited Time</span>
          <span className="text-white/30">|</span>
          <span>50% Off + Free Retry</span>
          <span className="text-white/30">|</span>
          <button
            type="button"
            onClick={() => copy("FIRSTTPP")}
            className="inline-flex items-center gap-2 text-[#bcff2e] hover:text-[#a5e622] transition-colors uppercase"
            aria-label="Copy promo code FIRSTTPP"
          >
            Code: FIRSTTPP
            {copied ? (
              <Check className="w-4 h-4" strokeWidth={2.5} />
            ) : (
              <Copy className="w-4 h-4" strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,460px)] gap-5 lg:gap-6 items-start">
          {/* ── LEFT column: stacked config cards ── */}
          <div className="flex flex-col gap-5">
            {/* Model card */}
            <div className="bg-[#141414] border border-white/[0.05] rounded-3xl p-5 md:p-6">
              <h3 className="text-white font-semibold text-[17px] mb-4">Model</h3>
              <div className="flex flex-wrap items-start gap-x-2.5 gap-y-3">
                {livePrograms.map((p) => {
                  const active = p.key === program.key;
                  return (
                    <div key={p.key} className="flex flex-col items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => selectProgram(p.key)}
                        aria-pressed={active}
                        className={cn(
                          "inline-flex items-center rounded-full px-5 py-2.5 text-[14px] font-semibold transition-colors",
                          active
                            ? "bg-white text-[#0c0c0c]"
                            : "bg-[#2b2b2b] text-white hover:bg-[#383838]",
                        )}
                      >
                        {p.shortLabel}
                      </button>
                      {p.badge && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#bcff2e] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-[#0c0c0c]">
                          {p.badge}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Platform card */}
            <div className="bg-[#141414] border border-white/[0.05] rounded-3xl p-5 md:p-6">
              <h3 className="text-white font-semibold text-[17px] mb-4">Platform</h3>
              <div className="flex flex-wrap gap-2.5">
                {livePlatforms.map((p) => {
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
                        "relative inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-[14px] font-bold uppercase tracking-wide transition-colors",
                        disabled && "opacity-55 cursor-not-allowed",
                        active && !disabled
                          ? "bg-[#bcff2e] text-[#0c0c0c]"
                          : "bg-[#2b2b2b] text-white hover:bg-[#383838]",
                      )}
                    >
                      {p.label}
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal",
                          active && !disabled
                            ? "bg-[#0c0c0c]/85 text-white"
                            : "bg-white/[0.08] text-white/60",
                        )}
                      >
                        {p.sub}
                      </span>
                      {disabled && (
                        <Lock className="w-3.5 h-3.5 text-white/40" strokeWidth={2.2} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account size card */}
            <div className="bg-[#141414] border border-white/[0.05] rounded-3xl p-5 md:p-6">
              <h3 className="text-white font-semibold text-[17px] mb-4">Account size</h3>
              <div className="flex flex-wrap items-start gap-x-2.5 gap-y-3">
                {liveSizes.map((s) => {
                  const offered = program.fees[s] != null;
                  const active = s === effectiveSize && offered;
                  const isPopular = s === 25_000;
                  return (
                    <div key={s} className="flex flex-col items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => offered && setSize(s)}
                        disabled={!offered}
                        aria-pressed={active}
                        className={cn(
                          "inline-flex items-center rounded-full px-5 py-2.5 text-[14px] font-semibold tabular-nums transition-colors",
                          !offered && "opacity-35 cursor-not-allowed",
                          active
                            ? "bg-white text-[#0c0c0c]"
                            : "bg-[#2b2b2b] text-white hover:bg-[#383838]",
                        )}
                      >
                        {formatSize(s).replace("$", "")}
                      </button>
                      {isPopular && offered && (
                        <span className="inline-flex items-center rounded-md bg-[#bcff2e] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-[#0c0c0c]">
                          Most Popular
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add-ons card */}
            {applicableAddOns.length > 0 && (
              <div className="bg-[#141414] border border-white/[0.05] rounded-3xl p-5 md:p-6">
                <h3 className="text-white font-semibold text-[17px] mb-4">Optional add-ons</h3>
                <div className="flex flex-wrap items-start gap-x-2.5 gap-y-3">
                  {applicableAddOns.map((a) => {
                    const active = selectedAddOns.includes(a.key);
                    return (
                      <div key={a.key} className="flex flex-col items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleAddOn(a.key)}
                          aria-pressed={active}
                          className={cn(
                            "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold transition-colors",
                            active
                              ? "bg-white text-[#0c0c0c]"
                              : "bg-[#2b2b2b] text-white hover:bg-[#383838]",
                          )}
                        >
                          {active ? (
                            <Check className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                          ) : (
                            <Plus className="w-4 h-4 shrink-0 text-white/60" strokeWidth={2.5} />
                          )}
                          {a.label}
                        </button>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide",
                            active
                              ? "bg-[#bcff2e] text-[#0c0c0c]"
                              : "bg-white/[0.06] text-white/50",
                          )}
                        >
                          {a.feePct === 0 ? "Free" : `+${a.feePct}%`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Promo code card */}
            <div className="bg-[#141414] border border-white/[0.05] rounded-3xl p-5 md:p-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-white/40 tracking-widest uppercase">Promo Code</span>
                <span className="text-[10px] bg-white/[0.05] text-white/60 px-2 py-0.5 rounded-full uppercase tracking-wider">Optional</span>
              </div>
              <div className="relative flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  className="w-full rounded-[16px] border border-white/[0.08] px-4 py-3.5 text-[15px] outline-none focus:border-[#bcff2e] focus:ring-1 focus:ring-[#bcff2e] transition-all bg-white/[0.02] text-white font-mono uppercase placeholder:normal-case placeholder:text-white/20 shadow-sm"
                  placeholder="Enter code here..."
                />
                <Button
                  type="button"
                  onClick={async () => {
                    if (!promoCode) {
                      setAppliedDiscount(0);
                      return;
                    }
                    const { data, error } = await supabase
                      .from("tpp_coupons")
                      .select("discount_pct, is_active")
                      .eq("code", promoCode)
                      .single();
                    
                    if (error || !data || !data.is_active) {
                      setAppliedDiscount(0);
                      alert("Invalid or expired coupon code");
                    } else {
                      setAppliedDiscount(data.discount_pct / 100);
                      alert(`Promo applied: ${data.discount_pct}% OFF!`);
                    }
                  }}
                  className="shrink-0 rounded-[16px] px-6 bg-white/[0.08] text-white hover:bg-white/[0.12] border border-white/[0.05] font-medium"
                >
                  Apply
                </Button>
              </div>
              {appliedDiscount > 0 && (
                <p className="text-[13px] font-medium text-[#10B981] mt-2.5 flex items-center gap-1.5">
                  <Check className="w-4 h-4" strokeWidth={3} />
                  {appliedDiscount * 100}% Discount Applied Successfully!
                </p>
              )}
            </div>
            </div>
          </div>

          {/* ── Right column: spec rows + price card (Desktop, GFT-style) ── */}
          <div className="hidden lg:flex flex-col gap-5 lg:sticky lg:top-24">
            {/* Spec rows card */}
            <div className="bg-[#141414] border border-white/[0.05] rounded-3xl p-4 md:p-5">
              <ul className="space-y-2.5">
                {specs.map((row) => {
                  const SpecIcon = SPEC_ICONS[row.label] ?? Target;
                  return (
                    <li
                      key={row.label}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.03] border border-white/[0.04] px-4 py-3.5"
                    >
                      <span className="flex items-center gap-3 text-[14px] font-medium text-white/85 min-w-0">
                        <SpecIcon
                          className="w-4.5 h-4.5 shrink-0 text-[#bcff2e]"
                          strokeWidth={2.2}
                        />
                        {row.label}
                      </span>
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={`${row.label}-${program.key}-${effectiveSize}-${selectedAddOns.length}`}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.18 }}
                          className="text-[14.5px] font-bold text-white tabular-nums text-right shrink-0"
                        >
                          {row.value}
                        </motion.span>
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Price card */}
            <div className="bg-[#141414] border border-white/[0.05] rounded-3xl p-5 md:p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={finalPrice}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[44px] font-bold text-white tracking-tight leading-none tabular-nums"
                      >
                        {programKey === "access" ? "$5" : (finalPrice != null ? `$${finalPrice.toLocaleString("en-US")}` : "—")}
                      </motion.span>
                    </AnimatePresence>
                    {appliedDiscount > 0 && total != null && programKey !== "access" && (
                      <span className="text-[20px] font-medium text-white/30 line-through tabular-nums">
                        ${total.toLocaleString("en-US")}
                      </span>
                    )}
                  </div>
                  <p className="text-[15px] text-white/50 mt-2">
                    {formatSize(effectiveSize).replace("$", "")} Account
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/dashboard/new-challenge')}
                  disabled={total == null}
                  size="lg"
                  className="rounded-2xl bg-[#bcff2e] hover:bg-[#a5e622] text-[#0c0c0c] font-bold px-7 h-[54px] inline-flex items-center gap-2 transition-colors text-[15px]"
                >
                  Get Funded
                  <ArrowUpRight className="w-4.5 h-4.5" strokeWidth={2.5} />
                </Button>
              </div>
              {programKey === "access" && postPassFee != null ? (
                <p className="mt-4 text-[12.5px] text-[#bcff2e]/90 font-medium">
                  * Remaining ${postPassFee.toLocaleString("en-US")} due within 48h of passing.
                </p>
              ) : (
                <span className="mt-4 inline-flex items-center rounded-full bg-white/[0.05] border border-white/[0.06] px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-widest text-white/60">
                  One-time 100% refundable fee
                </span>
              )}
            </div>

            {/* Payment methods card */}
            <div className="bg-[#141414] border border-white/[0.05] rounded-3xl px-5 py-4 flex items-center justify-center gap-2.5 flex-wrap">
              {["VISA", "Mastercard", "PayPal", "Apple Pay", "Crypto"].map((p) => (
                <span
                  key={p}
                  className="rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-[#0c0c0c] whitespace-nowrap"
                >
                  {p}
                </span>
              ))}
            </div>

            {/* Highlights below card */}
            <ul className="grid grid-cols-1 gap-1.5 text-[12.5px] text-white/50">
              {program.highlights.map((h) => (
                <li key={h} className="flex items-center gap-2">
                  <Check
                    className="w-3.5 h-3.5 text-[#bcff2e]"
                    strokeWidth={2.5}
                  />
                  {h}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Mobile Live spec card ── */}
          <div className="lg:hidden mt-4 bg-[#111] rounded-[24px] border border-white/[0.05] p-5 relative shadow-2xl">
            {/* Top Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center rounded-full bg-[#bcff2e]/10 px-3.5 py-1 text-[10px] font-bold tracking-widest text-[#bcff2e] uppercase">
                Live config
              </span>
            </div>

            {/* Price */}
            <div className="text-center mt-2 mb-6">
              {appliedDiscount > 0 && total != null && programKey !== "access" && (
                <p className="text-[20px] font-medium text-white/30 line-through leading-none mb-1.5">
                  ${total.toLocaleString("en-US")}
                </p>
              )}
              <h3 className="text-[52px] font-display font-bold text-white tracking-tight leading-none">
                {finalPrice != null ? `$${finalPrice.toLocaleString("en-US")}` : "—"}
              </h3>
              <p className="text-[14px] text-white/50 mt-3 font-medium">
                for {formatSizeLong(effectiveSize)} Account
              </p>
              {programKey === "access" && postPassFee != null && (
                <p className="text-[13px] text-[#bcff2e]/90 mt-2 font-medium">
                  * Remaining ${postPassFee.toLocaleString("en-US")} due within 48h of passing.
                </p>
              )}
              {selectedAddOns.length > 0 && (
                <p className="text-[12.5px] text-white/40 mt-3 font-medium">
                  Add-ons: <span className="text-white/80">{selectedAddOns.map(k => addOns.find(a => a.key === k)?.label).join(", ")}</span>
                </p>
              )}
            </div>

            {/* Buy Button */}
            <Button
              onClick={() => router.push('/dashboard/new-challenge')}
              disabled={total == null}
              className="w-full bg-[#bcff2e] hover:bg-[#a5e622] text-[#0c0c0c] rounded-full h-[54px] text-[15px] font-semibold mb-6 shadow-[0_0_20px_rgba(188,255,46,0.15)] transition-colors"
            >
              Get Funded
            </Button>

            {/* Specs Grey Box */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-[20px] p-5 space-y-4">
              {specs.map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-[13.5px] text-white/60 font-semibold flex items-center gap-1.5">
                      {row.label}
                    </span>
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={`${row.label}-${program.key}-${effectiveSize}-${selectedAddOns.length}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-[14px] tabular-nums font-bold text-[#bcff2e] text-right"
                      >
                        {row.value}
                        {Icon && <Icon className="inline-block ml-1 w-3.5 h-3.5 text-white/60" strokeWidth={3} />}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom promo banner (GFT-style, lime border) */}
        <div className="mt-10 lg:mt-14 rounded-3xl bg-[#111] border-2 border-[#bcff2e]/70 px-6 py-7 md:px-10 md:py-8 flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
          <h3 className="flex-1 text-white font-bold uppercase tracking-tight text-pretty" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", lineHeight: 1.1 }}>
            New to TPP? <span className="text-[#bcff2e]">50% OFF</span>
          </h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => copy("FIRSTTPP")}
              className="flex flex-col items-center justify-center rounded-2xl bg-[#1a1a1a] border border-white/[0.08] px-8 py-2.5 hover:bg-white/[0.06] transition-colors"
              aria-label="Copy promo code FIRSTTPP"
            >
              <span className="text-[15px] font-bold tracking-wider text-white font-mono">FIRSTTPP</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-white/50 mt-0.5">
                {copied ? (
                  <>
                    Copied <Check className="w-3 h-3 text-[#bcff2e]" strokeWidth={2.5} />
                  </>
                ) : (
                  <>
                    Copy Code <Copy className="w-3 h-3" strokeWidth={2.5} />
                  </>
                )}
              </span>
            </button>
            <Button
              onClick={() => router.push('/dashboard/new-challenge')}
              className="rounded-2xl bg-[#bcff2e] hover:bg-[#a5e622] text-[#0c0c0c] font-bold px-8 h-[56px] inline-flex items-center justify-center gap-1.5 transition-colors text-[15px]"
            >
              Get Funded
              <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
            </Button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {showCheckoutModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setShowCheckoutModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md overflow-hidden rounded-[24px] bg-[#111] border border-white/[0.08] shadow-2xl"
              >
              <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 bg-white/[0.02]">
                <div>
                  <h3 className="text-lg font-bold text-white">Checkout Details</h3>
                  <p className="text-[13px] text-white/50">Please fill in your details to proceed to payment.</p>
                </div>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="rounded-full p-2 text-white/50 hover:bg-white/[0.05] hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCryptoPayment} className="p-6 space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-white/80">Full Name</label>
                  <input
                    required
                    type="text"
                    value={checkoutForm.fullName}
                    onChange={(e) => setCheckoutForm({...checkoutForm, fullName: e.target.value})}
                    className="w-full rounded-[14px] border border-white/[0.08] px-4 py-3 text-[14px] outline-none focus:border-[#bcff2e] transition-all bg-white/[0.02] text-white placeholder:text-white/20"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-white/80">Email Address</label>
                  <input
                    required
                    type="email"
                    value={checkoutForm.email}
                    onChange={(e) => setCheckoutForm({...checkoutForm, email: e.target.value})}
                    className="w-full rounded-[14px] border border-white/[0.08] px-4 py-3 text-[14px] outline-none focus:border-[#bcff2e] transition-all bg-white/[0.02] text-white placeholder:text-white/20"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-white/80">Country</label>
                  <input
                    required
                    type="text"
                    value={checkoutForm.country}
                    onChange={(e) => setCheckoutForm({...checkoutForm, country: e.target.value})}
                    className="w-full rounded-[14px] border border-white/[0.08] px-4 py-3 text-[14px] outline-none focus:border-[#bcff2e] transition-all bg-white/[0.02] text-white placeholder:text-white/20"
                    placeholder="United States"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-medium text-white/80">Billing Address</label>
                  <input
                    required
                    type="text"
                    value={checkoutForm.address}
                    onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})}
                    className="w-full rounded-[14px] border border-white/[0.08] px-4 py-3 text-[14px] outline-none focus:border-[#bcff2e] transition-all bg-white/[0.02] text-white placeholder:text-white/20"
                    placeholder="123 Trading Ave, NY"
                  />
                </div>

                <div className="pt-4 border-t border-white/[0.08]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[14px] font-medium text-white/80">Total Payment</span>
                    <span className="text-[20px] font-bold text-[#bcff2e]">${finalPrice?.toLocaleString("en-US")}</span>
                  </div>
                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-[#bcff2e] text-[#0c0c0c] hover:bg-[#a5e622] disabled:opacity-50 disabled:cursor-not-allowed h-[50px] font-semibold transition-colors shadow-[0_0_20px_rgba(188,255,46,0.15)]"
                  >
                    {isProcessingPayment ? "Processing..." : "Pay with Crypto"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
      )}
          </div>
        </div>
      </div>
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
