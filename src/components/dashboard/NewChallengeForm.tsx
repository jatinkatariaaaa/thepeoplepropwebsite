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
  formatSize,
  formatSizeLong,
  programs,
  type AccountSize,
  type AddOnKey,
  type ProgramKey,
} from "@/data/programs";

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

  // Personal Info State
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    zipCode: ""
  });

  // Auth Check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login?redirect=/dashboard/new-challenge");
      }
    });
  }, [router]);

  const program = useMemo(
    () => programs.find((p) => p.key === programKey) ?? programs[0],
    [programKey]
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

  const { base, total: prePlatformTotal, addOnFees } = useMemo(
    () => feeFor(program, effectiveSize, selectedAddOns),
    [program, effectiveSize, selectedAddOns]
  );

  // Promo Logic
  let promoDiscountAmt = 0;
  const isFirstTpp = appliedPromo.toLowerCase() === "firsttpp";
  if (isFirstTpp) {
    promoDiscountAmt = (base ?? 0) * 0.50; // 50% off
  }

  // Platform logic
  let platformExtras = 0;
  if (platform !== "TPP Dashboard") {
    platformExtras = (base ?? 0) * 0.10; // +10% of base fee
  }

  let total = prePlatformTotal ? prePlatformTotal + platformExtras - promoDiscountAmt : 0;
  
  // Payment gateway fees
  let paymentFeePct = 0;
  if (paymentMethod === "Neteller" || paymentMethod === "Skrill") {
    paymentFeePct = 4;
  }
  if (paymentMethod === "Paysafecard") {
    paymentFeePct = 10;
  }

  const finalTotal = total * (1 + (paymentFeePct / 100));

  const handleApplyPromo = () => {
    if (promoInput.toLowerCase() === "firsttpp") {
      setAppliedPromo("firsttpp");
      setPromoError("");
      setPaymentMethod("Crypto");
      if (!selectedAddOns.includes("free-retry")) {
        setSelectedAddOns(prev => [...prev, "free-retry"]);
      }
    } else {
      setPromoError("Invalid promo code");
      setAppliedPromo("");
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

  const formatAccSize = (usdSize: number) => {
    if (currency === "INR") {
      const inr = usdSize * 96;
      return `₹${inr / 100000} lakh`;
    }
    const converted = usdSize * currentCurrency.rate;
    return currentCurrency.prefix ? `${currentCurrency.symbol}${converted.toLocaleString('en-US')}` : `${converted.toLocaleString('en-US')} ${currentCurrency.symbol}`;
  };

  const toggleAddOn = (key: AddOnKey) => {
    setSelectedAddOns(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20">
      
      {/* Left Column: Configuration */}
      <div className="flex-1 space-y-8">
        
        {/* Personal Information */}
        <div className="bg-white rounded-[20px] border border-[var(--border)] p-6 shadow-sm">
          <h3 className="font-bold text-[16px] text-[var(--ink-950)] mb-1">Personal Information</h3>
          <p className="text-[13px] text-[var(--ink-500)] mb-6">Please enter your billing and contact details</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">First Name</label>
              <input 
                type="text" 
                value={personalInfo.firstName}
                onChange={e => setPersonalInfo({...personalInfo, firstName: e.target.value})}
                className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)] transition-colors"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">Last Name</label>
              <input 
                type="text" 
                value={personalInfo.lastName}
                onChange={e => setPersonalInfo({...personalInfo, lastName: e.target.value})}
                className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)] transition-colors"
                placeholder="Doe"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">Phone Number</label>
              <input 
                type="tel" 
                value={personalInfo.phone}
                onChange={e => setPersonalInfo({...personalInfo, phone: e.target.value})}
                className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)] transition-colors"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">Zip/Postal Code</label>
              <input 
                type="text" 
                value={personalInfo.zipCode}
                onChange={e => setPersonalInfo({...personalInfo, zipCode: e.target.value})}
                className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)] transition-colors"
                placeholder="10001"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">Billing Address</label>
              <input 
                type="text" 
                value={personalInfo.address}
                onChange={e => setPersonalInfo({...personalInfo, address: e.target.value})}
                className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)] transition-colors"
                placeholder="123 Trading St, Suite 400"
              />
            </div>
          </div>
        </div>

        {/* Challenge Type */}
        <div>
          <h3 className="font-bold text-[15px] text-[var(--ink-950)] mb-3">Challenge Type</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {programs.map(prog => (
              <button
                key={prog.key}
                onClick={() => setProgramKey(prog.key)}
                className={cn(
                  "py-3 px-2 rounded-xl text-[13px] font-bold border transition-all text-center",
                  programKey === prog.key 
                    ? "bg-[var(--paper-2)] border-[var(--ink-400)] text-[var(--ink-950)] shadow-sm" 
                    : "bg-white border-[var(--border)] text-[var(--ink-600)] hover:border-[var(--ink-300)]"
                )}
              >
                {prog.shortLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Customise Trading Rules (Add-ons) */}
        <div>
          <h3 className="font-bold text-[15px] text-[var(--ink-950)]">Customise Trading Rules</h3>
          <p className="text-[13px] text-[var(--ink-500)] mb-4">Adjust your challenge parameters to match your trading style</p>
          
          <div className="space-y-4">
            {addOns.filter(a => a.appliesTo.includes(programKey)).map(addon => {
              const isActive = selectedAddOns.includes(addon.key);
              const extraCost = (base ?? 0) * (addon.feePct / 100);
              
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
                  <div className="text-[14px] font-bold text-[var(--ink-700)] mb-1">{addon.label}</div>
                  <p className="text-[12px] text-[var(--ink-500)] mb-2">{addon.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => isActive && toggleAddOn(addon.key)}
                      className={cn(
                        "flex items-center justify-between py-3 px-4 rounded-xl text-[13px] font-medium border transition-all",
                        !isActive 
                          ? "bg-[var(--paper-2)] border-[var(--ink-400)] text-[var(--ink-950)]" 
                          : "bg-white border-[var(--border)] text-[var(--ink-600)]"
                      )}
                    >
                      <span className="font-bold">{noLabel}</span>
                      <span className="text-[var(--ink-400)] text-[12px]">{noSub}</span>
                    </button>
                    <button
                      onClick={() => !isActive && toggleAddOn(addon.key)}
                      className={cn(
                        "flex items-center justify-between py-3 px-4 rounded-xl text-[13px] font-medium border transition-all",
                        isActive 
                          ? "bg-[var(--paper-2)] border-[var(--ink-400)] text-[var(--ink-950)]" 
                          : "bg-white border-[var(--border)] text-[var(--ink-600)]"
                      )}
                    >
                      <span className="font-bold">{yesLabel}</span>
                      <span className="text-emerald-600 font-bold text-[12px]">{extraCost === 0 ? "Free" : `+${formatCurrency(extraCost)}`}</span>
                    </button>
                  </div>
                </div>
              );
            })}
            
            {addOns.filter(a => a.appliesTo.includes(programKey)).length === 0 && (
              <div className="text-[13px] text-[var(--ink-500)] p-4 border border-[var(--border)] rounded-xl bg-[var(--paper)]">
                No customisations available for this challenge type.
              </div>
            )}
          </div>
        </div>

        {/* Currency */}
        <div>
          <h3 className="font-bold text-[15px] text-[var(--ink-950)] mb-3">Currency</h3>
          <div className="flex flex-wrap gap-2">
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
                  "flex items-center gap-2 py-2 px-4 rounded-xl text-[13px] font-bold border transition-all",
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
          <h3 className="font-bold text-[15px] text-[var(--ink-950)] mb-3">Account Size</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ALL_SIZES.map(s => {
              const isAvailable = program.fees[s] !== undefined;
              return (
                <button
                  key={s}
                  disabled={!isAvailable}
                  onClick={() => setSize(s)}
                  className={cn(
                    "py-3 px-2 rounded-xl text-[13px] font-bold border transition-all text-center",
                    !isAvailable && "opacity-40 cursor-not-allowed bg-[var(--paper-2)]",
                    isAvailable && effectiveSize === s 
                      ? "bg-[var(--paper-2)] border-[var(--ink-400)] text-[var(--ink-950)] shadow-sm" 
                      : isAvailable && "bg-white border-[var(--border)] text-[var(--ink-600)] hover:border-[var(--ink-300)]"
                  )}
                >
                  {formatAccSize(s)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Trading Platform */}
        <div>
          <h3 className="font-bold text-[15px] text-[var(--ink-950)] mb-3">Trading Platform</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { id: "TPP Dashboard", extra: "Free" },
              { id: "MetaTrader 5", extra: `+${formatCurrency((base ?? 0) * 0.10)}` },
              { id: "TradeLocker", extra: `+${formatCurrency((base ?? 0) * 0.10)}` },
              { id: "MatchTrader", extra: `+${formatCurrency((base ?? 0) * 0.10)}` }
            ].map(plat => (
              <button
                key={plat.id}
                onClick={() => setPlatform(plat.id)}
                className={cn(
                  "flex items-center justify-between py-3 px-4 rounded-xl text-[13px] font-medium border transition-all",
                  platform === plat.id 
                    ? "bg-[var(--paper-2)] border-[var(--ink-400)] text-[var(--ink-950)] shadow-sm" 
                    : "bg-white border-[var(--border)] text-[var(--ink-600)] hover:border-[var(--ink-300)]"
                )}
              >
                <span className="font-bold">{plat.id}</span>
                {plat.extra && (
                  <span className={plat.extra === "Free" ? "text-emerald-600 font-bold text-[12px]" : "text-[var(--ink-400)] text-[12px]"}>
                    {plat.extra}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

      </div>


      {/* Right Column: Billing */}
      <div className="w-full lg:w-[450px] shrink-0">
        <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden sticky top-24">
          
          <div className="p-6 border-b border-[var(--border)]">
            <div className="flex items-center justify-between mb-1 cursor-pointer">
              <h3 className="font-bold text-[16px] text-[var(--ink-950)]">Billing Details</h3>
              <ChevronDown className="w-4 h-4 text-[var(--ink-500)]" />
            </div>
            <p className="text-[13px] text-[var(--ink-500)]">Enter your billing information for the challenge purchase</p>
          </div>

          <div className="p-6 border-b border-[var(--border)] bg-[var(--paper)]">
            <div className="mb-6">
              <button 
                onClick={() => setIsPromoOpen(!isPromoOpen)}
                className="flex items-center gap-2 text-[13px] font-bold text-[var(--ink-700)] hover:text-[var(--ink-950)] transition-colors"
              >
                Have a promo code? <ChevronDown className={cn("w-4 h-4 transition-transform", isPromoOpen && "rotate-180")} />
              </button>
              
              {isPromoOpen && (
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value)}
                      placeholder="Enter promo code"
                      className="flex-1 bg-white border border-[var(--border)] rounded-xl h-10 px-3 text-[13px] uppercase focus:outline-none focus:border-[var(--ink-400)] transition-colors"
                    />
                    <button 
                      onClick={handleApplyPromo}
                      className="h-10 px-4 bg-[var(--ink-950)] hover:bg-[var(--ink-800)] text-white text-[13px] font-bold rounded-xl transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-red-500 text-[12px] font-medium px-1">{promoError}</p>}
                  {appliedPromo && <p className="text-emerald-600 text-[12px] font-medium px-1">Promo applied successfully!</p>}
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-[13px] font-medium text-[var(--ink-700)]">
                <span>{formatAccSize(effectiveSize)} • {program.shortLabel}</span>
                <span className="font-bold text-[var(--ink-950)]">{formatCurrency(base ?? 0)}</span>
              </div>
              <div className="flex justify-between items-center text-[13px] font-medium text-[var(--ink-500)]">
                <span>Platform: {platform}</span>
                {platformExtras > 0 ? (
                  <span>+{formatCurrency(platformExtras)}</span>
                ) : (
                  <span className="text-emerald-600 font-bold">Free</span>
                )}
              </div>
              
              {selectedAddOns.map(key => {
                const addOnDef = addOns.find(a => a.key === key);
                if (!addOnDef) return null;
                const cost = (base ?? 0) * (addOnDef.feePct / 100);
                return (
                  <div key={key} className="flex justify-between items-center text-[13px] font-medium text-[var(--ink-500)]">
                    <span>{addOnDef.label}</span>
                    <span className={cost === 0 ? "text-emerald-600 font-bold" : ""}>
                      {cost === 0 ? "Free" : `+${formatCurrency(cost)}`}
                    </span>
                  </div>
                );
              })}

              {promoDiscountAmt > 0 && (
                <div className="flex justify-between items-center text-[13px] font-bold text-emerald-600 pt-2 border-t border-[var(--border)]">
                  <span>Promo ({appliedPromo.toUpperCase()})</span>
                  <span>-{formatCurrency(promoDiscountAmt)}</span>
                </div>
              )}

              {paymentFeePct > 0 && (
                 <div className="flex justify-between items-center text-[13px] font-medium text-amber-600">
                  <span>Payment Gateway Fee</span>
                  <span>+{paymentFeePct}%</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-end border-t border-[var(--border)] pt-4">
              <span className="font-bold text-[15px] text-[var(--ink-950)]">Total</span>
              <span className="text-[28px] font-display font-bold text-[var(--ink-950)] leading-none">{formatCurrency(finalTotal)}</span>
            </div>
          </div>

          <div className="p-6 border-b border-[var(--border)]">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="peer sr-only" 
                />
                <div className="w-4 h-4 rounded border border-[var(--ink-300)] bg-white peer-checked:bg-[var(--accent)] peer-checked:border-[var(--accent)] transition-colors" />
                <Check className="w-3 h-3 text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <div className="text-[12px] text-[var(--ink-500)] leading-relaxed flex-1 select-none">
                I have read and agreed to the <span className="text-[var(--ink-950)] font-medium underline underline-offset-2">Trading Objectives</span> and <span className="text-[var(--ink-950)] font-medium underline underline-offset-2">Terms & Conditions</span>. All information provided is correct and matches government-issued ID. I confirm that I am not a U.S. citizen or resident.
              </div>
            </label>
          </div>

          <div className="p-6">
            <h3 className="font-bold text-[15px] text-[var(--ink-950)] mb-4">Select payment method</h3>
            
            <div className="space-y-2 border border-[var(--border)] rounded-2xl p-2 bg-[var(--paper-2)]/30">
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
                    "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors",
                    paymentMethod === method.id 
                      ? "bg-white border-[var(--accent)] shadow-sm" 
                      : "border-transparent hover:bg-[var(--paper-2)]"
                  )}
                >
                  <div className="flex items-center gap-3">
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
                      <div className="w-4 h-4 rounded-full border border-[var(--ink-300)] bg-white peer-checked:border-[var(--accent)] peer-checked:border-[5px] transition-all" />
                    </div>
                    <span className="text-[13px] font-bold text-[var(--ink-950)] flex items-center gap-2">
                      {method.id}
                      {method.fee && <span className="text-[11px] font-medium text-[var(--ink-400)]">{method.fee}</span>}
                    </span>
                  </div>
                  <div className="text-[14px] font-bold text-[var(--ink-900)] opacity-70">
                    {method.logo} {method.rightLogo && <span>{method.rightLogo}</span>}
                  </div>
                </label>
              ))}
            </div>

            {isFirstTpp && paymentMethod !== "Crypto" && (
              <div className="mt-4 p-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-[12px] font-medium">
                Coupon offers only support crypto payments. Please select Crypto.
              </div>
            )}

            <button 
              disabled={!agreed || (isFirstTpp && paymentMethod !== "Crypto")}
              className="w-full mt-6 h-12 bg-[var(--ink-950)] hover:bg-[var(--ink-800)] text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
            >
              Proceed to Payment
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
