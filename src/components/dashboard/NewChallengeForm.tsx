"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Check, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  ALL_SIZES,
  addOns,
  feeFor,
  programs,
  type AccountSize,
  type AddOnKey,
  type ProgramKey,
} from "@/data/programs";
import { useHydratedPrograms } from "@/hooks/useHydratedPrograms";

type PlatformOption = {
  id: string | number;
  name: string;
  extra_fee_pct?: number | null;
};

/* ── Shared UI atoms ─────────────────────────────── */

function RadioCircle({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "shrink-0 flex items-center justify-center w-[18px] h-[18px] rounded-full border-2 transition-all",
        selected ? "border-[var(--teal-900)] bg-white" : "border-[var(--ink-300)] bg-white"
      )}
    >
      <span
        className={cn(
          "w-2 h-2 rounded-full bg-[var(--teal-900)] transition-transform",
          selected ? "scale-100" : "scale-0"
        )}
      />
    </span>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3 className="font-display font-bold text-[18px] text-[var(--ink-950)] tracking-tight">{title}</h3>
      {subtitle && <p className="text-[13px] text-[var(--ink-500)] mt-0.5">{subtitle}</p>}
    </div>
  );
}

const selectableCard = (selected: boolean) =>
  cn(
    "rounded-2xl border transition-all text-left cursor-pointer",
    selected
      ? "bg-[var(--lime-tint)] border-[var(--teal-800)] shadow-[0_2px_12px_-4px_rgba(18,43,40,0.18)]"
      : "bg-white border-[var(--border)] hover:border-[var(--ink-300)] shadow-sm"
  );

export function NewChallengeForm() {
  const router = useRouter();
  const [programKey, setProgramKey] = useState<ProgramKey>(programs[0].key);
  const [size, setSize] = useState<AccountSize>(ALL_SIZES[2]); // Default 25k
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnKey[]>([]);
  const [currency, setCurrency] = useState("USD");
  const [platform, setPlatform] = useState("TPP Dashboard");
  const [paymentMethod, setPaymentMethod] = useState("Credit / Debit Card");
  const [agreed, setAgreed] = useState(false);

  // Promo State
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [promoError, setPromoError] = useState("");
  const [appliedDiscountPct, setAppliedDiscountPct] = useState(0);

  // Personal Info State
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    zipCode: ""
  });

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");

  const { programs: livePrograms, isLoading: isLoadingPrograms } = useHydratedPrograms();
  const [livePlatforms, setLivePlatforms] = useState<PlatformOption[]>([]);

  // Auth Check & Fetch Platforms
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login?redirect=/dashboard/new-challenge");
      }
    });

    // Fetch platforms
    const fetchPlatforms = async () => {
      try {
        const platformsRes = await supabase
            .from("tpp_platforms")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: true });

        if (platformsRes.error) throw platformsRes.error;

        const fetchedPlatforms = (platformsRes.data ?? []) as PlatformOption[];

        if (fetchedPlatforms.length > 0) {
          setLivePlatforms(fetchedPlatforms);
          // Auto-select the first available platform if the current one isn't valid
          if (!fetchedPlatforms.find((p) => p.name === platform)) {
            setPlatform(fetchedPlatforms[0].name);
          }
        }
      } catch (err) {
        console.error("Error fetching platforms:", err);
      }
    };
    fetchPlatforms();
  }, [platform, router]);

  const program = useMemo(
    () => livePrograms.find((p) => p.key === programKey) ?? livePrograms[0],
    [programKey, livePrograms]
  );

  // Fallback size if current program doesn't offer it
  const effectiveSize = useMemo<AccountSize>(() => {
    if (program.fees[size] !== undefined) return size;
    const offered = (Object.keys(program.fees) as unknown as string[])
      .map((s) => Number(s) as AccountSize)
      .sort((a, b) => a - b);
    const lowerOrEqual = offered.filter((s) => s <= size).pop();
    return lowerOrEqual ?? offered[0];
  }, [program, size]);

  const { base, total: prePlatformTotal } = useMemo(
    () => feeFor(program, effectiveSize, selectedAddOns),
    [program, effectiveSize, selectedAddOns]
  );

  // Promo Logic
  let promoDiscountAmt = 0;
  const isFirstTpp = appliedPromo === "FIRSTTPP";
  if (appliedDiscountPct > 0) {
    promoDiscountAmt = (base ?? 0) * (appliedDiscountPct / 100);
  }

  // Adjust total for free retry if coupon is applied
  let freeRetryAdjustment = 0;
  if (isFirstTpp && selectedAddOns.includes("free-retry")) {
    const retryDef = addOns.find(a => a.key === "free-retry");
    if (retryDef) freeRetryAdjustment = (base ?? 0) * (retryDef.feePct / 100);
  }

  // Platform logic
  const selectedPlatformData = livePlatforms.find(p => p.name === platform);
  const selectedPlatformFeePct = Number(selectedPlatformData?.extra_fee_pct ?? 0);
  let platformExtras = 0;
  if (selectedPlatformFeePct > 0) {
    platformExtras = (base ?? 0) * (selectedPlatformFeePct / 100);
  }

  const total = prePlatformTotal ? prePlatformTotal + platformExtras - promoDiscountAmt - freeRetryAdjustment : 0;

  // Payment gateway fees
  let paymentFeePct = 0;
  if (paymentMethod === "Neteller" || paymentMethod === "Skrill") {
    paymentFeePct = 4;
  }
  if (paymentMethod === "Paysafecard") {
    paymentFeePct = 10;
  }

  const finalTotal = total * (1 + (paymentFeePct / 100));

  const handleApplyPromo = async () => {
    setPromoError("");
    const code = promoInput.toUpperCase().trim();
    if (!code) {
      setAppliedPromo("");
      setAppliedDiscountPct(0);
      return;
    }

    if (code === "FIRSTTPP") {
      setAppliedPromo("FIRSTTPP");
      setAppliedDiscountPct(50);
      setPaymentMethod("Crypto");
      if (!selectedAddOns.includes("free-retry")) {
        setSelectedAddOns(prev => [...prev, "free-retry"]);
      }
      return;
    }

    const { data, error } = await supabase
      .from("tpp_coupons")
      .select("discount_pct, is_active")
      .eq("code", code)
      .single();

    if (error || !data || !data.is_active) {
      setPromoError("Invalid or expired promo code");
      setAppliedPromo("");
      setAppliedDiscountPct(0);
    } else {
      setAppliedPromo(code);
      setAppliedDiscountPct(data.discount_pct);
    }
  };

  // Currency Conversion Logic
  const CURRENCY_RATES: Record<string, { symbol: string, rate: number, prefix: boolean }> = {
    USD: { symbol: "$", rate: 1, prefix: true },
    EUR: { symbol: "€", rate: 0.95, prefix: true },
    GBP: { symbol: "£", rate: 0.82, prefix: true },
    CHF: { symbol: "CHF", rate: 0.9, prefix: false },
    INR: { symbol: "₹", rate: 96, prefix: true }
  };

  const currentCurrency = CURRENCY_RATES[currency] || CURRENCY_RATES["USD"];

  const formatCurrency = (usdAmount: number) => {
    if (usdAmount === 0) return "Free";
    const converted = usdAmount * currentCurrency.rate;
    const formatted = converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return currentCurrency.prefix ? `${currentCurrency.symbol}${formatted}` : `${formatted} ${currentCurrency.symbol}`;
  };

  const formatCompactAmount = (value: number) => {
    if (value >= 1_000_000) return `${Number((value / 1_000_000).toFixed(1))}M`;
    if (value >= 1_000) return `${Number((value / 1_000).toFixed(1))}K`;
    return value.toLocaleString("en-US");
  };

  const formatAccSize = (usdSize: number) => {
    if (currency === "INR") {
      const inr = usdSize * 96;
      return `INR ${Number((inr / 100000).toFixed(1))}L`;
    }
    const converted = usdSize * currentCurrency.rate;
    return currentCurrency.prefix
      ? `${currentCurrency.symbol}${formatCompactAmount(converted)}`
      : `${formatCompactAmount(converted)} ${currentCurrency.symbol}`;
  };

  const toggleAddOn = (key: AddOnKey) => {
    setSelectedAddOns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutMessage("");
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token && { "Authorization": `Bearer ${session.access_token}` })
        },
        body: JSON.stringify({
          programKey,
          accountSize: size,
          priceAmount: finalTotal,
          fullName: `${personalInfo.firstName} ${personalInfo.lastName}`,
          address: `${personalInfo.address}, ${personalInfo.city}, ${personalInfo.zipCode}`,
          country: "Unknown", // Can be added to form later
          platform,
          promoCode: appliedPromo
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCheckoutMessage("Redirecting to payment gateway...");
        if (data.invoice_url) {
          window.location.href = data.invoice_url;
        } else {
          setCheckoutMessage("Error: Missing invoice URL");
        }
      } else {
        setCheckoutMessage(data.error || "Checkout failed");
      }
    } catch {
      setCheckoutMessage("An error occurred during checkout");
    }
    setIsCheckingOut(false);
  };

  const inputClasses = "w-full bg-white border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--teal-800)] focus:ring-2 focus:ring-[var(--teal-800)]/10 transition-all";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)] gap-6 lg:gap-10 pb-16 sm:pb-20">

      {/* Left Column: Configuration */}
      <div className="min-w-0 space-y-9 sm:space-y-10">

        {/* Challenge Type — model-style radio cards */}
        <section>
          <SectionHeading title="Challenge Type" subtitle="Choose the type of challenge you want to take" />
          {isLoadingPrograms ? (
            <div className="animate-pulse bg-white h-20 rounded-2xl border border-[var(--border)] w-full" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {livePrograms.map(prog => {
                const selected = programKey === prog.key;
                return (
                  <button
                    key={prog.key}
                    onClick={() => setProgramKey(prog.key as ProgramKey)}
                    className={cn(selectableCard(selected), "flex items-start gap-3 p-4 min-h-[72px]")}
                  >
                    <span className="mt-0.5"><RadioCircle selected={selected} /></span>
                    <span className="min-w-0">
                      <span className={cn(
                        "block text-[14px] font-bold leading-tight",
                        selected ? "text-[var(--teal-900)]" : "text-[var(--ink-950)]"
                      )}>
                        {prog.shortLabel}
                      </span>
                      <span className="block text-[12px] text-[var(--ink-500)] mt-1 leading-snug line-clamp-2">
                        {prog.tagline}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Account Size */}
        <section>
          <SectionHeading title="Account Size" subtitle="Choose your preferred account size" />
          {isLoadingPrograms ? (
            <div className="animate-pulse bg-white h-24 rounded-2xl border border-[var(--border)] w-full" />
          ) : (
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.keys(program.fees)
                .map((s) => Number(s) as AccountSize)
                .sort((a, b) => a - b)
                .map((s) => {
                  const selected = effectiveSize === s;
                  const fee = program.fees[s] ?? 0;
                  return (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={cn(selectableCard(selected), "flex items-center gap-3 px-4 py-3.5")}
                    >
                      <RadioCircle selected={selected} />
                      <span className="min-w-0">
                        <span className={cn(
                          "block text-[15px] font-display font-bold tabular-nums leading-tight",
                          selected ? "text-[var(--teal-900)]" : "text-[var(--ink-950)]"
                        )}>
                          {formatAccSize(s)}
                        </span>
                        <span className="block text-[12px] text-[var(--ink-500)] mt-0.5 tabular-nums">
                          {formatCurrency(fee)}
                        </span>
                      </span>
                    </button>
                  );
                })}
            </div>
          )}
        </section>

        {/* Customise Trading Rules (Add-ons) */}
        <section>
          <SectionHeading title="Customise Trading Rules" subtitle="Adjust your challenge parameters to match your trading style" />

          <div className="space-y-5">
            {addOns.filter(a => a.appliesTo.includes(programKey)).map(addon => {
              const isActive = selectedAddOns.includes(addon.key);
              let extraCost = (base ?? 0) * (addon.feePct / 100);
              if (isFirstTpp && addon.key === "free-retry") extraCost = 0;

              let noLabel = "No";
              let noSub = "Default";
              let yesLabel = "Yes";

              if (addon.key === "no-min-days") {
                noLabel = `${program.minTradingDays} Days`;
                noSub = "Minimum";
                yesLabel = "0 Days";
              } else if (addon.key === "payout-on-demand") {
                noLabel = program.payoutCycle;
                noSub = "Regular";
                yesLabel = "On Demand";
              } else if (addon.key === "split-100") {
                noLabel = `${program.profitSplit}%`;
                noSub = "Split";
                yesLabel = "100%";
              }

              return (
                <div key={addon.key}>
                  <div className="text-[14px] font-bold text-[var(--ink-950)]">{addon.label}</div>
                  <p className="text-[12px] text-[var(--ink-500)] mt-0.5 mb-2.5">{addon.description}</p>
                  <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
                    <button
                      onClick={() => isActive && toggleAddOn(addon.key)}
                      className={cn(selectableCard(!isActive), "flex items-center justify-between gap-3 px-4 py-3.5 min-h-[52px]")}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <RadioCircle selected={!isActive} />
                        <span className={cn("text-[13px] font-bold truncate", !isActive ? "text-[var(--teal-900)]" : "text-[var(--ink-950)]")}>
                          {noLabel}
                        </span>
                      </span>
                      <span className="shrink-0 text-[var(--ink-400)] text-[12px]">{noSub}</span>
                    </button>
                    <button
                      onClick={() => !isActive && toggleAddOn(addon.key)}
                      className={cn(selectableCard(isActive), "flex items-center justify-between gap-3 px-4 py-3.5 min-h-[52px]")}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <RadioCircle selected={isActive} />
                        <span className={cn("text-[13px] font-bold truncate", isActive ? "text-[var(--teal-900)]" : "text-[var(--ink-950)]")}>
                          {yesLabel}
                        </span>
                      </span>
                      <span className="shrink-0 text-emerald-600 font-bold text-[12px]">{extraCost === 0 ? "Free" : `+${formatCurrency(extraCost)}`}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {addOns.filter(a => a.appliesTo.includes(programKey)).length === 0 && (
              <div className="text-[13px] text-[var(--ink-500)] p-4 border border-[var(--border)] rounded-2xl bg-white">
                No customisations available for this challenge type.
              </div>
            )}
          </div>
        </section>

        {/* Currency */}
        <section>
          <SectionHeading title="Currency" subtitle="Select your billing currency" />
          <div className="grid grid-cols-2 min-[420px]:grid-cols-3 sm:flex sm:flex-wrap gap-3">
            {[
              { id: "USD", flag: "🇺🇸" },
              { id: "CHF", flag: "🇨🇭" },
              { id: "EUR", flag: "🇪🇺" },
              { id: "GBP", flag: "🇬🇧" },
              { id: "INR", flag: "🇮🇳" }
            ].map(c => {
              const selected = currency === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCurrency(c.id)}
                  className={cn(selectableCard(selected), "flex items-center justify-center gap-2.5 min-h-11 py-2.5 px-4 sm:px-5")}
                >
                  <RadioCircle selected={selected} />
                  <span className={cn("text-[13px] font-bold", selected ? "text-[var(--teal-900)]" : "text-[var(--ink-950)]")}>
                    <span className="mr-1.5">{c.flag}</span>{c.id}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Trading Platform */}
        <section>
          <SectionHeading title="Trading Platform" subtitle="Choose your preferred trading platform" />
          {isLoadingPrograms ? (
            <div className="animate-pulse bg-white h-14 rounded-2xl border border-[var(--border)] w-full" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {livePlatforms.map(plat => {
                const extraCost = (base ?? 0) * (Number(plat.extra_fee_pct ?? 0) / 100);
                const selected = platform === plat.name;
                return (
                  <button
                    key={plat.id}
                    onClick={() => setPlatform(plat.name)}
                    className={cn(selectableCard(selected), "flex items-center justify-between gap-3 px-4 py-3.5 min-h-[52px]")}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <RadioCircle selected={selected} />
                      <span className={cn("text-[13px] font-bold truncate", selected ? "text-[var(--teal-900)]" : "text-[var(--ink-950)]")}>
                        {plat.name}
                      </span>
                    </span>
                    <span className={cn("shrink-0 text-[12px]", extraCost === 0 ? "text-emerald-600 font-bold" : "text-[var(--ink-400)]")}>
                      {extraCost === 0 ? "Free" : `+${formatCurrency(extraCost)}`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Personal Information */}
        <section>
          <SectionHeading title="Personal Information" subtitle="Please enter your billing and contact details" />
          <div className="bg-white rounded-2xl border border-[var(--border)] p-4 sm:p-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">First Name</label>
                <input
                  type="text"
                  value={personalInfo.firstName}
                  onChange={e => setPersonalInfo({...personalInfo, firstName: e.target.value})}
                  className={inputClasses}
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={personalInfo.lastName}
                  onChange={e => setPersonalInfo({...personalInfo, lastName: e.target.value})}
                  className={inputClasses}
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={personalInfo.phone}
                  onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})}
                  className={inputClasses}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">Zip/Postal Code</label>
                <input
                  type="text"
                  value={personalInfo.zipCode}
                  onChange={e => setPersonalInfo({...personalInfo, zipCode: e.target.value})}
                  className={inputClasses}
                  placeholder="10001"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">Billing Address</label>
                <input
                  type="text"
                  value={personalInfo.address}
                  onChange={e => setPersonalInfo({...personalInfo, address: e.target.value})}
                  className={inputClasses}
                  placeholder="123 Trading St, Suite 400"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Payment Gateway */}
        <section>
          <SectionHeading title="Payment Gateway" subtitle="Choose your preferred payment method" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: "Credit / Debit Card", logo: "VISA", rightLogo: "Mastercard" },
              { id: "Crypto", logo: "₿" },
              { id: "AstroPay", logo: "AstroPay" },
              { id: "PayPal", logo: "PayPal" },
              { id: "Neteller", logo: "NETELLER", fee: "+4%" },
              { id: "Paysafecard", logo: "paysafecard", fee: "+10%" },
              { id: "Skrill", logo: "Skrill", fee: "+4%" },
            ].map(method => {
              const selected = paymentMethod === method.id;
              return (
                <label
                  key={method.id}
                  className={cn(selectableCard(selected), "flex items-center justify-between gap-3 px-4 py-3.5 min-h-[52px]")}
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selected}
                      onChange={(e) => {
                        if (isFirstTpp && method.id !== "Crypto") return;
                        setPaymentMethod(e.target.value);
                      }}
                      className="sr-only"
                    />
                    <RadioCircle selected={selected} />
                    <span className={cn("min-w-0 text-[13px] font-bold flex items-center gap-2 truncate", selected ? "text-[var(--teal-900)]" : "text-[var(--ink-950)]")}>
                      {method.id}
                      {method.fee && <span className="text-[11px] font-medium text-[var(--ink-400)]">{method.fee}</span>}
                    </span>
                  </div>
                  <div className="shrink-0 text-right text-[11px] sm:text-[12px] font-bold text-[var(--ink-900)] opacity-60">
                    {method.logo} {method.rightLogo && <span>{method.rightLogo}</span>}
                  </div>
                </label>
              );
            })}
          </div>

          {isFirstTpp && paymentMethod !== "Crypto" && (
            <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-[12px] font-bold text-red-700 shadow-sm">
              Promo code applied only on crypto payments
            </div>
          )}
        </section>

      </div>


      {/* Right Column: Coupon + Order Summary */}
      <div className="w-full min-w-0">
        <div className="xl:sticky xl:top-24 space-y-6">

          {/* Coupon Code */}
          <section>
            <SectionHeading title="Coupon Code" subtitle="Enter a coupon to get a discount" />
            <div className="flex flex-col min-[420px]:flex-row gap-2.5">
              <input
                type="text"
                value={promoInput}
                onChange={e => setPromoInput(e.target.value)}
                placeholder="ENTER COUPON CODE"
                className="min-w-0 flex-1 bg-white border border-[var(--border)] rounded-xl h-12 px-4 text-[13px] font-medium uppercase tracking-wide placeholder:text-[var(--ink-400)] focus:outline-none focus:border-[var(--teal-800)] focus:ring-2 focus:ring-[var(--teal-800)]/10 transition-all shadow-sm"
              />
              <button
                onClick={handleApplyPromo}
                className="h-12 px-6 bg-[var(--teal-900)] hover:bg-[var(--teal-800)] text-white text-[13px] font-bold rounded-xl transition-all shadow-sm"
              >
                Apply
              </button>
            </div>
            {promoError && <p className="text-red-500 text-[12px] font-medium mt-2 px-1">{promoError}</p>}
            {appliedPromo && <p className="text-emerald-600 text-[12px] font-bold mt-2 px-1">Coupon &quot;{appliedPromo}&quot; applied successfully!</p>}
          </section>

          {/* Order Summary Card */}
          <div className="bg-white rounded-2xl border border-[var(--border)] shadow-md overflow-hidden">

            <div className="p-5 sm:p-6 border-b border-[var(--border)]">
              <h3 className="font-display font-bold text-[18px] text-[var(--ink-950)] tracking-tight">Order Summary</h3>
            </div>

            <div className="p-5 sm:p-6 border-b border-[var(--border)]">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-4 text-[13px] font-medium text-[var(--ink-700)]">
                  <span className="min-w-0 break-words">{formatAccSize(effectiveSize)} — {program.shortLabel}</span>
                  <span className="shrink-0 font-bold text-[var(--ink-950)] tabular-nums">{formatCurrency(base ?? 0)}</span>
                </div>
                <div className="flex justify-between items-start gap-4 text-[13px] font-medium text-[var(--ink-500)]">
                  <span className="min-w-0 break-words">Platform: {platform}</span>
                  {platformExtras > 0 ? (
                    <span className="shrink-0 tabular-nums">+{formatCurrency(platformExtras)}</span>
                  ) : (
                    <span className="shrink-0 text-emerald-600 font-bold">Free</span>
                  )}
                </div>

                {selectedAddOns.map(key => {
                  const addOnDef = addOns.find(a => a.key === key);
                  if (!addOnDef) return null;
                  let cost = (base ?? 0) * (addOnDef.feePct / 100);
                  if (isFirstTpp && key === "free-retry") cost = 0;
                  return (
                    <div key={key} className="flex justify-between items-start gap-4 text-[13px] font-medium text-[var(--ink-500)]">
                      <span className="min-w-0 break-words">{addOnDef.label}</span>
                      <span className={cn("shrink-0 tabular-nums", cost === 0 ? "text-emerald-600 font-bold" : "")}>
                        {cost === 0 ? "Free" : `+${formatCurrency(cost)}`}
                      </span>
                    </div>
                  );
                })}

                {promoDiscountAmt > 0 && (
                  <div className="flex justify-between items-center text-[13px] font-bold text-emerald-600 pt-2 border-t border-[var(--border)]">
                    <span>Coupon ({appliedPromo.toUpperCase()})</span>
                    <span className="tabular-nums">-{formatCurrency(promoDiscountAmt)}</span>
                  </div>
                )}

                {paymentFeePct > 0 && (
                  <div className="flex justify-between items-center text-[13px] font-medium text-amber-600">
                    <span>Payment Gateway Fee</span>
                    <span>+{paymentFeePct}%</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end gap-4 mt-5 pt-4 border-t border-[var(--border)]">
                <span className="font-bold text-[15px] text-[var(--ink-950)]">Total</span>
                <span className="min-w-0 text-right">
                  <span className="block text-[28px] sm:text-[32px] font-display font-bold text-[var(--ink-950)] leading-none break-words tabular-nums">{formatCurrency(finalTotal)}</span>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--ink-400)] mt-1">{currency}</span>
                </span>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 rounded border border-[var(--ink-300)] bg-white peer-checked:bg-[var(--teal-900)] peer-checked:border-[var(--teal-900)] transition-colors" />
                  <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <div className="text-[12px] text-[var(--ink-600)] leading-relaxed flex-1 select-none">
                  <span className="block font-bold text-[var(--ink-950)] mb-1.5">I agree with all the following terms:</span>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>I have read and agreed to the <span className="text-[var(--ink-950)] font-medium underline underline-offset-2">Trading Objectives</span> and <span className="text-[var(--ink-950)] font-medium underline underline-offset-2">Terms &amp; Conditions</span>.</li>
                    <li>All information provided is correct and matches government-issued ID.</li>
                    <li>I confirm that I am not a U.S. citizen or resident.</li>
                  </ul>
                </div>
              </label>

              <button
                onClick={handleCheckout}
                disabled={!agreed || (isFirstTpp && paymentMethod !== "Crypto") || isCheckingOut}
                className="w-full mt-6 h-13 min-h-12 flex items-center justify-center gap-2.5 bg-[var(--teal-900)] hover:bg-[var(--teal-800)] text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_10px_26px_-10px_rgba(18,43,40,0.55)] active:scale-[0.98]"
              >
                <CreditCard className="w-4.5 h-4.5" />
                {isCheckingOut ? "Processing..." : "Proceed to Payment"}
              </button>
              {checkoutMessage && (
                <div className="mt-4 text-center text-[13px] font-bold text-emerald-600">
                  {checkoutMessage}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
