"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

export function NewChallengeForm() {
  const [challengeType, setChallengeType] = useState("2 Step Standard");
  const [swapFree, setSwapFree] = useState("No");
  const [profitTarget, setProfitTarget] = useState("8%");
  const [currency, setCurrency] = useState("INR");
  const [accountSize, setAccountSize] = useState("₹90 lakh");
  const [platform, setPlatform] = useState("MetaTrader 5");
  const [paymentMethod, setPaymentMethod] = useState("Credit / Debit Card");
  const [agreed, setAgreed] = useState(false);

  // Mock Pricing Logic
  let basePrice = 0;
  if (accountSize === "₹4.5 lakh") basePrice = 49;
  if (accountSize === "₹9 lakh") basePrice = 99;
  if (accountSize === "₹22.5 lakh") basePrice = 199;
  if (accountSize === "₹45 lakh") basePrice = 349;
  if (accountSize === "₹90 lakh") basePrice = 544; // Matching the screenshot default

  let extras = 0;
  if (swapFree === "Yes") extras += basePrice * 0.1; // +10%
  if (profitTarget === "10%") extras -= 55; // -$55.00 flat modifier
  if (platform === "CTrader") extras += 20;

  let total = basePrice + extras;
  
  // Payment gateway fees
  if (paymentMethod === "Neteller" || paymentMethod === "Skrill") {
    total = total * 1.04;
  }
  if (paymentMethod === "Paysafecard") {
    total = total * 1.10;
  }

  // To fix floating point weirdness
  total = Math.max(0, total);

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-20">
      
      {/* Left Column: Configuration */}
      <div className="flex-1 space-y-8">
        
        {/* Challenge Type */}
        <div>
          <h3 className="font-bold text-[15px] text-[var(--ink-950)] mb-3">Challenge Type</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {["Zero", "1 Step", "2 Step Standard", "2 Step Pro"].map(type => (
              <button
                key={type}
                onClick={() => setChallengeType(type)}
                className={cn(
                  "py-3 px-2 rounded-xl text-[13px] font-bold border transition-all text-center",
                  challengeType === type 
                    ? "bg-[var(--paper-2)] border-[var(--ink-400)] text-[var(--ink-950)] shadow-sm" 
                    : "bg-white border-[var(--border)] text-[var(--ink-600)] hover:border-[var(--ink-300)]"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Customise Trading Rules */}
        <div>
          <h3 className="font-bold text-[15px] text-[var(--ink-950)]">Customise Trading Rules</h3>
          <p className="text-[13px] text-[var(--ink-500)] mb-4">Adjust your challenge parameters to match your trading style</p>
          
          <div className="space-y-4">
            {/* Swap Free */}
            <div>
              <div className="text-[14px] font-bold text-[var(--ink-700)] mb-2">Swap Free</div>
              <p className="text-[12px] text-[var(--ink-500)] mb-2">Choose options for swap free</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSwapFree("No")}
                  className={cn(
                    "flex items-center justify-between py-3 px-4 rounded-xl text-[13px] font-medium border transition-all",
                    swapFree === "No" 
                      ? "bg-[var(--paper-2)] border-[var(--ink-400)] text-[var(--ink-950)]" 
                      : "bg-white border-[var(--border)] text-[var(--ink-600)]"
                  )}
                >
                  <span className="font-bold">No</span>
                  <span className="text-[var(--ink-400)] text-[12px]">Default</span>
                </button>
                <button
                  onClick={() => setSwapFree("Yes")}
                  className={cn(
                    "flex items-center justify-between py-3 px-4 rounded-xl text-[13px] font-medium border transition-all",
                    swapFree === "Yes" 
                      ? "bg-[var(--paper-2)] border-[var(--ink-400)] text-[var(--ink-950)]" 
                      : "bg-white border-[var(--border)] text-[var(--ink-600)]"
                  )}
                >
                  <span className="font-bold">Yes</span>
                  <span className="text-emerald-600 font-bold text-[12px]">+{((basePrice * 0.1)).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </button>
              </div>
            </div>

            {/* Profit Target */}
            <div>
              <div className="text-[14px] font-bold text-[var(--ink-700)] mb-2">Profit Target</div>
              <p className="text-[12px] text-[var(--ink-500)] mb-2">Choose options for profit target</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setProfitTarget("8%")}
                  className={cn(
                    "flex items-center justify-between py-3 px-4 rounded-xl text-[13px] font-medium border transition-all",
                    profitTarget === "8%" 
                      ? "bg-[var(--paper-2)] border-[var(--ink-400)] text-[var(--ink-950)]" 
                      : "bg-white border-[var(--border)] text-[var(--ink-600)]"
                  )}
                >
                  <span className="font-bold">8%</span>
                  <span className="text-[var(--ink-400)] text-[12px]">Default</span>
                </button>
                <button
                  onClick={() => setProfitTarget("10%")}
                  className={cn(
                    "flex items-center justify-between py-3 px-4 rounded-xl text-[13px] font-medium border transition-all",
                    profitTarget === "10%" 
                      ? "bg-[var(--paper-2)] border-[var(--ink-400)] text-[var(--ink-950)]" 
                      : "bg-white border-[var(--border)] text-[var(--ink-600)]"
                  )}
                >
                  <span className="font-bold">10%</span>
                  <span className="text-emerald-600 font-bold text-[12px]">-$55.00</span>
                </button>
              </div>
            </div>
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
            {["₹4.5 lakh", "₹9 lakh", "₹22.5 lakh", "₹45 lakh", "₹90 lakh"].map(size => (
              <button
                key={size}
                onClick={() => setAccountSize(size)}
                className={cn(
                  "py-3 px-2 rounded-xl text-[13px] font-bold border transition-all text-center",
                  accountSize === size 
                    ? "bg-[var(--paper-2)] border-[var(--ink-400)] text-[var(--ink-950)] shadow-sm" 
                    : "bg-white border-[var(--border)] text-[var(--ink-600)] hover:border-[var(--ink-300)]"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Trading Platform */}
        <div>
          <h3 className="font-bold text-[15px] text-[var(--ink-950)] mb-3">Trading Platform</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: "MetaTrader 5", extra: "" },
              { id: "MatchTrader", extra: "" },
              { id: "CTrader", extra: "+$20.00" }
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
                {plat.extra && <span className="text-[var(--ink-400)] text-[12px]">{plat.extra}</span>}
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
            <button className="flex items-center gap-2 text-[13px] font-bold text-[var(--ink-700)] mb-4">
              Have a promo code? <ChevronDown className="w-4 h-4" />
            </button>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-[13px] font-medium text-[var(--ink-700)]">
                <span>{accountSize} • {challengeType}</span>
                <span className="font-bold text-[var(--ink-950)]">${basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[13px] font-medium text-[var(--ink-500)]">
                <span>Platform: {platform}</span>
                {platform === "CTrader" && <span>+$20.00</span>}
              </div>
              {swapFree === "Yes" && (
                <div className="flex justify-between items-center text-[13px] font-medium text-[var(--ink-500)]">
                  <span>Swap Free</span>
                  <span>+${(basePrice * 0.1).toFixed(2)}</span>
                </div>
              )}
              {profitTarget === "10%" && (
                <div className="flex justify-between items-center text-[13px] font-medium text-[var(--ink-500)]">
                  <span>10% Profit Target</span>
                  <span>-$55.00</span>
                </div>
              )}
              {paymentMethod === "Neteller" || paymentMethod === "Skrill" || paymentMethod === "Paysafecard" ? (
                 <div className="flex justify-between items-center text-[13px] font-medium text-amber-600">
                  <span>Payment Gateway Fee</span>
                  <span>+{(paymentMethod === "Paysafecard" ? 10 : 4)}%</span>
                </div>
              ) : null}
            </div>

            <div className="flex justify-between items-end border-t border-[var(--border)] pt-4">
              <span className="font-bold text-[15px] text-[var(--ink-950)]">Total</span>
              <span className="text-[28px] font-display font-bold text-[var(--ink-950)] leading-none">${total.toFixed(2)}</span>
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
                        onChange={(e) => setPaymentMethod(e.target.value)}
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

            <button 
              disabled={!agreed}
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
