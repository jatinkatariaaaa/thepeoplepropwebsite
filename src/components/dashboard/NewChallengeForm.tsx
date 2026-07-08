"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";
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
  const [isPromoOpen, setIsPromoOpen] = useState(false);
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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)] gap-5 sm:gap-6 lg:gap-8 pb-16 sm:pb-20">
      
      {/* Left Column: Configuration */}
      <div className="min-w-0 space-y-6 sm:space-y-8">
        
        {/* Personal Information */}
        <div className="dash-card p-4 sm:p-6">
          <h3 className="mb-1 text-[15px] font-semibold tracking-tight text-ink">Personal Information</h3>
          <p className="mb-5 text-[13px] text-ink-500">Please enter your billing and contact details</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-ink-700">First Name</label>
              <input 
                type="text" 
                value={personalInfo.firstName}
                onChange={e => setPersonalInfo({...personalInfo, firstName: e.target.value})}
                className="h-10 w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                placeholder="John"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Last Name</label>
              <input 
                type="text" 
                value={personalInfo.lastName}
                onChange={e => setPersonalInfo({...personalInfo, lastName: e.target.value})}
                className="h-10 w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                placeholder="Doe"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Phone Number</label>
              <input 
                type="tel" 
                value={personalInfo.phone}
                onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})}
                className="h-10 w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Zip/Postal Code</label>
              <input 
                type="text" 
                value={personalInfo.zipCode}
                onChange={e => setPersonalInfo({...personalInfo, zipCode: e.target.value})}
                className="h-10 w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                placeholder="10001"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Billing Address</label>
              <input 
                type="text" 
                value={personalInfo.address}
                onChange={e => setPersonalInfo({...personalInfo, address: e.target.value})}
                className="h-10 w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                placeholder="123 Trading St, Suite 400"
              />
            </div>
          </div>
        </div>

        {/* Challenge Type */}
        <div>
          <h3 className="mb-3 text-[15px] font-semibold tracking-tight text-ink">Challenge Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {livePrograms.map(prog => (
              <button
                key={prog.key}
                onClick={() => setProgramKey(prog.key as ProgramKey)}
                className={cn(
                  "flex min-h-11 items-center justify-center rounded-[10px] border px-2.5 py-2.5 text-center text-[13px] font-medium leading-tight transition-all",
                  programKey === prog.key 
                    ? "border-ink-950 bg-white text-ink shadow-[0_1px_2px_rgba(16,24,40,0.06)] ring-1 ring-ink-950" 
                    : "border-[var(--dash-hairline)] bg-white text-ink-600 hover:border-[var(--dash-hairline-strong)]"
                )}
              >
                {prog.shortLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Customise Trading Rules (Add-ons) */}
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-ink">Customise Trading Rules</h3>
          <p className="mb-4 mt-0.5 text-[13px] text-ink-500">Adjust your challenge parameters to match your trading style</p>
          
          <div className="space-y-4">
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
                  <div className="mb-0.5 text-[13px] font-semibold text-ink">{addon.label}</div>
                  <p className="mb-2 text-[12px] text-ink-500">{addon.description}</p>
                  <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2">
                    <button
                      onClick={() => isActive && toggleAddOn(addon.key)}
                      className={cn(
                        "flex min-h-11 items-center justify-between gap-3 rounded-[10px] border px-3.5 py-2.5 text-[13px] font-medium transition-all",
                        !isActive 
                          ? "border-ink-950 bg-white text-ink shadow-[0_1px_2px_rgba(16,24,40,0.06)] ring-1 ring-ink-950" 
                          : "border-[var(--dash-hairline)] bg-white text-ink-600 hover:border-[var(--dash-hairline-strong)]"
                      )}
                    >
                      <span className="font-medium">{noLabel}</span>
                      <span className="text-[11px] text-ink-400">{noSub}</span>
                    </button>
                    <button
                      onClick={() => !isActive && toggleAddOn(addon.key)}
                      className={cn(
                        "flex min-h-11 items-center justify-between gap-3 rounded-[10px] border px-3.5 py-2.5 text-[13px] font-medium transition-all",
                        isActive 
                          ? "border-ink-950 bg-white text-ink shadow-[0_1px_2px_rgba(16,24,40,0.06)] ring-1 ring-ink-950" 
                          : "border-[var(--dash-hairline)] bg-white text-ink-600 hover:border-[var(--dash-hairline-strong)]"
                      )}
                    >
                      <span className="font-medium">{yesLabel}</span>
                      <span className="dash-num text-[11px] font-semibold text-[var(--dash-positive)]">{extraCost === 0 ? "Free" : `+${formatCurrency(extraCost)}`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
            
            {addOns.filter(a => a.appliesTo.includes(programKey)).length === 0 && (
              <div className="rounded-[10px] border border-[var(--dash-hairline)] bg-white p-4 text-[13px] text-ink-500">
                No customisations available for this challenge type.
              </div>
            )}
          </div>
        </div>

        {/* Currency */}
        <div>
          <h3 className="mb-3 text-[15px] font-semibold tracking-tight text-ink">Currency</h3>
          <div className="grid grid-cols-2 min-[420px]:grid-cols-3 sm:flex sm:flex-wrap gap-2">
            {[
              { id: "USD", flag: "🇺🇸" },
              { id: "CHF", flag: "🇨🇭" },
              { id: "EUR", flag: "🇪🇺" },
              { id: "GBP", flag: "🇬🇧" },
              { id: "INR", flag: "🇮🇳" }
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setCurrency(c.id)}
                className={cn(
                  "flex min-h-10 items-center justify-center gap-2 rounded-[10px] border px-3 py-2 text-[13px] font-medium transition-all sm:px-4",
                  currency === c.id 
                    ? "bg-[var(--paper-2)] border-[var(--ink-400)] text-[var(--ink-950)]" 
                    : "bg-white border-[var(--border)] text-[var(--ink-600)] hover:border-[var(--ink-300)]"
                )}
              >
                <span>{c.flag}</span>
                {c.id}
              </button>
            ))}
          </div>
        </div>

        {/* Account Size */}
        <div>
          <h3 className="mb-3 mt-2 text-[15px] font-semibold tracking-tight text-ink">Account Size</h3>
          {isLoadingPrograms ? (
            <div className="dash-skeleton h-24 w-full"></div>
          ) : (
            <div className="grid grid-cols-2 min-[430px]:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5">
              {Object.keys(program.fees)
                .map((s) => Number(s) as AccountSize)
                .sort((a, b) => a - b)
                .map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={cn(
                      "flex min-h-[64px] flex-col items-center justify-center gap-1 overflow-hidden rounded-[10px] border px-2.5 py-3 text-center transition-all",
                      effectiveSize === s
                        ? "border-ink-950 bg-white text-ink shadow-[0_1px_2px_rgba(16,24,40,0.06)] ring-1 ring-ink-950" 
                        : "border-[var(--dash-hairline)] bg-white text-ink-600 hover:border-[var(--dash-hairline-strong)]"
                    )}
                  >
                    <span className="dash-num block max-w-full whitespace-nowrap text-[14px] font-semibold leading-none sm:text-[15px]">
                      {formatAccSize(s)}
                    </span>
                    <span className="text-[10px] font-semibold uppercase leading-none tracking-[0.08em] text-ink-400">
                      Account
                    </span>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Trading Platform */}
        <div>
          <h3 className="mb-3 text-[15px] font-semibold tracking-tight text-ink">Trading Platform</h3>
          {isLoadingPrograms ? (
            <div className="dash-skeleton h-14 w-full"></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {livePlatforms.map(plat => {
                const extraCost = (base ?? 0) * (Number(plat.extra_fee_pct ?? 0) / 100);
                return (
                  <button
                    key={plat.id}
                    onClick={() => setPlatform(plat.name)}
                    className={cn(
                      "flex min-h-11 items-center justify-between gap-3 rounded-[10px] border px-3.5 py-2.5 text-[13px] font-medium transition-all",
                      platform === plat.name 
                        ? "border-ink-950 bg-white text-ink shadow-[0_1px_2px_rgba(16,24,40,0.06)] ring-1 ring-ink-950" 
                        : "border-[var(--dash-hairline)] bg-white text-ink-600 hover:border-[var(--dash-hairline-strong)]"
                    )}
                  >
                    <span className="font-medium">{plat.name}</span>
                    <span className={extraCost === 0 ? "dash-num text-[11px] font-semibold text-[var(--dash-positive)]" : "dash-num text-[11px] text-ink-400"}>
                      {extraCost === 0 ? "Free" : `+${formatCurrency(extraCost)}`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>


      {/* Right Column: Billing */}
      <div className="w-full min-w-0">
        <div className="dash-card overflow-hidden xl:sticky xl:top-20">
          
          <div className="border-b border-[var(--dash-hairline)] p-4 sm:p-5">
            <div className="flex items-center justify-between mb-1 cursor-pointer">
              <h3 className="text-[15px] font-semibold tracking-tight text-ink">Billing Details</h3>
              <ChevronDown className="h-4 w-4 text-ink-400" />
            </div>
            <p className="text-[13px] text-ink-500">Enter your billing information for the challenge purchase</p>
          </div>

          <div className="border-b border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-4 sm:p-5">
            <div className="mb-6">
              <button 
                onClick={() => setIsPromoOpen(!isPromoOpen)}
                className="flex items-center gap-1.5 text-[13px] font-medium text-ink-700 transition-colors hover:text-ink"
              >
                Have a promo code? <ChevronDown className={cn("w-4 h-4 transition-transform", isPromoOpen && "rotate-180")} />
              </button>
              
              {isPromoOpen && (
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex flex-col min-[420px]:flex-row gap-2">
                    <input 
                      type="text"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value)}
                      placeholder="Enter promo code"
                      className="h-9 min-w-0 flex-1 rounded-lg border border-[var(--dash-hairline)] bg-white px-3 text-[13px] uppercase text-ink outline-none transition-colors focus:border-ink-400"
                    />
                    <button 
                      onClick={handleApplyPromo}
                      className="h-9 rounded-lg bg-ink px-4 text-[13px] font-semibold text-white transition-colors hover:bg-ink-800"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="px-1 text-[12px] font-medium text-[var(--dash-negative)]">{promoError}</p>}
                  {appliedPromo && <p className="px-1 text-[12px] font-medium text-[var(--dash-positive)]">Promo applied successfully!</p>}
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start justify-between gap-4 text-[13px] text-ink-700">
                <span className="min-w-0 break-words">{formatAccSize(effectiveSize)} • {program.shortLabel}</span>
                <span className="dash-num shrink-0 font-semibold text-ink">{formatCurrency(base ?? 0)}</span>
              </div>
              <div className="flex items-start justify-between gap-4 text-[13px] text-ink-500">
                <span className="min-w-0 break-words">Platform: {platform}</span>
                {platformExtras > 0 ? (
                  <span className="dash-num shrink-0">+{formatCurrency(platformExtras)}</span>
                ) : (
                  <span className="shrink-0 font-semibold text-[var(--dash-positive)]">Free</span>
                )}
              </div>
              
              {selectedAddOns.map(key => {
                const addOnDef = addOns.find(a => a.key === key);
                if (!addOnDef) return null;
                let cost = (base ?? 0) * (addOnDef.feePct / 100);
                if (isFirstTpp && key === "free-retry") cost = 0;
                return (
                  <div key={key} className="flex items-start justify-between gap-4 text-[13px] text-ink-500">
                    <span className="min-w-0 break-words">{addOnDef.label}</span>
                    <span className={cn("dash-num shrink-0", cost === 0 ? "font-semibold text-[var(--dash-positive)]" : "")}>
                      {cost === 0 ? "Free" : `+${formatCurrency(cost)}`}
                    </span>
                  </div>
                );
              })}

              {promoDiscountAmt > 0 && (
                <div className="dash-num flex items-center justify-between border-t border-[var(--dash-hairline)] pt-2 text-[13px] font-semibold text-[var(--dash-positive)]">
                  <span>Promo ({appliedPromo.toUpperCase()})</span>
                  <span>-{formatCurrency(promoDiscountAmt)}</span>
                </div>
              )}

              {paymentFeePct > 0 && (
                 <div className="dash-num flex items-center justify-between text-[13px] font-medium text-[var(--dash-pending)]">
                  <span>Payment Gateway Fee</span>
                  <span>+{paymentFeePct}%</span>
                </div>
              )}
            </div>

            <div className="flex items-end justify-between gap-4 border-t border-[var(--dash-hairline)] pt-4">
              <span className="text-sm font-semibold text-ink">Total</span>
              <span className="dash-figure min-w-0 break-words text-right text-[22px] leading-none sm:text-[26px]">{formatCurrency(finalTotal)}</span>
            </div>
          </div>

          <div className="border-b border-[var(--dash-hairline)] p-4 sm:p-5">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="peer sr-only" 
                />
                <div className="h-4 w-4 rounded border border-ink-300 bg-white transition-colors peer-checked:border-ink-950 peer-checked:bg-ink-950" />
                <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <div className="flex-1 select-none text-[12px] leading-relaxed text-ink-500">
                I have read and agreed to the <span className="font-medium text-ink underline underline-offset-2">Trading Objectives</span> and <span className="font-medium text-ink underline underline-offset-2">Terms & Conditions</span>. All information provided is correct and matches government-issued ID. I confirm that I am not a U.S. citizen or resident.
              </div>
            </label>
          </div>

          <div className="p-4 sm:p-6">
            <h3 className="mb-3 text-[15px] font-semibold tracking-tight text-ink">Select payment method</h3>
            
            <div className="space-y-1 rounded-[10px] border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-1.5">
              {[
                { id: "Credit / Debit Card", logo: "VISA", rightLogo: "Mastercard" },
                { id: "Crypto", logo: "₿" },
                { id: "AstroPay", logo: "AstroPay" },
                { id: "PayPal", logo: "PayPal" },
                { id: "Neteller", logo: "NETELLER", fee: "+4%" },
                { id: "Paysafecard", logo: "paysafecard", fee: "+10%" },
                { id: "Skrill", logo: "Skrill", fee: "+4%" },
              ].map(method => (
                <label 
                  key={method.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-2.5 transition-colors",
                    paymentMethod === method.id 
                      ? "border-ink-950 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)]" 
                      : "border-transparent hover:bg-white"
                  )}
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="radio" 
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => {
                          if (isFirstTpp && method.id !== "Crypto") return;
                          setPaymentMethod(e.target.value);
                        }}
                        className="peer sr-only" 
                      />
                      <div className="h-4 w-4 rounded-full border border-ink-300 bg-white transition-all peer-checked:border-[5px] peer-checked:border-ink-950" />
                    </div>
                    <span className="flex min-w-0 items-center gap-2 truncate text-[13px] font-medium text-ink">
                      {method.id}
                      {method.fee && <span className="dash-num text-[11px] text-ink-400">{method.fee}</span>}
                    </span>
                  </div>
                  <div className="shrink-0 text-right text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-400 sm:text-[12px]">
                    {method.logo} {method.rightLogo && <span>{method.rightLogo}</span>}
                  </div>
                </label>
              ))}
            </div>

            {isFirstTpp && paymentMethod !== "Crypto" && (
              <div className="mt-4 rounded-[8px] border border-[#FECDD3] bg-rose-50 p-3 text-[12px] font-medium text-rose-700">
                Promo code applied only on crypto payments
              </div>
            )}

            <button 
              onClick={handleCheckout}
              disabled={!agreed || (isFirstTpp && paymentMethod !== "Crypto") || isCheckingOut}
              className="mt-5 h-11 w-full rounded-lg bg-ink text-sm font-semibold text-white transition-all hover:bg-ink-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCheckingOut ? "Processing..." : "Proceed to Payment"}
            </button>
            {checkoutMessage && (
              <div className="mt-4 text-center text-[13px] font-medium text-[var(--dash-positive)]">
                {checkoutMessage}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
