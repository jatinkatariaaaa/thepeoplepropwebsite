"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Coins, Gift, RotateCcw, ShieldCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { ALL_SIZES, addOns, programs, type AccountSize, type AddOnKey, type ProgramKey } from "@/data/programs";
import { PERKS, isProgramKey, programDetails } from "@/data/catalogue";
import { useHydratedPrograms } from "@/hooks/useHydratedPrograms";
import { buildQuote, type CouponInfo } from "@/lib/pricing";
import { safeReturn } from "@/lib/auth-return";
import { Panel, SectionTitle, btn, field, fieldLabel } from "./glass";

type PlatformOption = { name: string; extra_fee_pct?: number | null };

const usd = (n: number) => (n === 0 ? "Free" : `$${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`);
const sizeLabel = (n: number) => (n >= 1000 ? `$${n / 1000}K` : `$${n}`);

function RadioCircle({ selected }: { selected: boolean }) {
  return (
    <span aria-hidden className={cn("flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ring-1 transition-all", selected ? "bg-[var(--g-ink)] ring-[var(--g-ink)]" : "bg-white ring-black/20")}>
      <span className={cn("h-2 w-2 rounded-full bg-[var(--g-lime)] transition-transform", selected ? "scale-100" : "scale-0")} />
    </span>
  );
}

const card = (selected: boolean) =>
  cn(
    "cursor-pointer rounded-[18px] text-left ring-1 transition-all",
    selected ? "bg-[var(--g-lime)]/[0.14] ring-2 ring-[var(--g-ink)] shadow-[0_14px_30px_-18px_rgba(16,40,34,0.45)]" : "bg-white/55 ring-black/[0.07] hover:bg-white/85 hover:ring-black/15",
  );

const skeleton = "w-full animate-pulse rounded-[18px] bg-white/55 ring-1 ring-black/[0.05]";

export function NewChallengeForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { programs: livePrograms, isLoading } = useHydratedPrograms();

  const initialProgram = params.get("program");
  const initialSize = Number(params.get("size"));
  const [programKey, setProgramKey] = useState<ProgramKey>(initialProgram && isProgramKey(initialProgram) ? initialProgram : programs[0].key);
  const [size, setSize] = useState<AccountSize>((ALL_SIZES as number[]).includes(initialSize) ? (initialSize as AccountSize) : 25_000);
  const [selected, setSelected] = useState<AddOnKey[]>(() => addOns.filter(addon =>
    params.get("addons")?.split(",").includes(addon.key)).map(addon => addon.key));
  const [platforms, setPlatforms] = useState<PlatformOption[]>([]);
  const [platform, setPlatform] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [promoInput, setPromoInput] = useState(params.get("promo") || "");
  const [coupon, setCoupon] = useState<CouponInfo | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoBusy, setPromoBusy] = useState(false);

  const [info, setInfo] = useState({ firstName: "", lastName: "", country: "", address: "" });
  const [busy, setBusy] = useState(false);
  const checkoutAttempt = useRef({ choices: "", id: "" });
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push("/login?" + new URLSearchParams({ redirect: safeReturn(window.location.pathname + window.location.search) }));
    });
    fetch("/api/platforms").then(response => response.ok ? response.json() : null).then(data => {
      const list = (data?.platforms ?? []) as PlatformOption[];
      setPlatforms(list);
      if (list[0]) setPlatform(list.find(p => p.name === new URLSearchParams(window.location.search).get("platform"))?.name ?? list[0].name);
    }).catch(() => {});
  }, [router]);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search);
    if (requested.get("promo") !== "FIRSTTPP" || requested.get("program") !== programKey) return;
    const controller = new AbortController();
    fetch("/api/launch-offer?program=" + encodeURIComponent(programKey), { cache: "no-store", signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(data => { if (!controller.signal.aborted && data?.offer) setCoupon(data.offer); })
      .catch(() => {});
    return () => controller.abort();
  }, [programKey]);

  const program = useMemo(() => livePrograms.find((p) => p.key === programKey) ?? livePrograms[0], [programKey, livePrograms]);
  const detail = programDetails[program.key];
  const isAccess = program.key === "access";

  const sizes = useMemo(
    () =>
      (Object.keys(program.fees) as unknown as string[])
        .map((s) => Number(s) as AccountSize)
        .filter((s) => program.fees[s] != null)
        .sort((a, b) => a - b),
    [program],
  );
  const effectiveSize = sizes.includes(size) ? size : (sizes.filter((s) => s <= size).pop() ?? sizes[0]);
  const base = program.fees[effectiveSize] ?? 0;
  const platformExtraPct = Number(platforms.find((p) => p.name === platform)?.extra_fee_pct ?? 0);

  const quote = useMemo(
    () => buildQuote({ programKey: program.key, size: effectiveSize, base, addOnKeys: selected, platformExtraPct, coupon, payAfterPass: isAccess, upfrontFee: PERKS.accessUpfront }),
    [program.key, effectiveSize, base, selected, platformExtraPct, coupon, isAccess],
  );

  const availableAddOns = addOns.filter((a) => a.appliesTo.includes(program.key));
  const toggle = (key: AddOnKey) => setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const applyPromo = async () => {
    setPromoError("");
    const code = promoInput.trim().toUpperCase();
    if (!code) return setCoupon(null);
    setPromoBusy(true);
    try {
      const res = await fetch("/api/checkout/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programKey: program.key, accountSize: effectiveSize, addOns: selected, platform, promoCode: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCoupon(null);
        setPromoError(data.error || "That promo code is not valid.");
      } else {
        const q = data.quote as { base: number; discount: number; couponCode: string | null; addOns: { key: string; free?: boolean }[] };
        const grants = q.addOns.filter((a) => a.free).map((a) => a.key);
        const whole = q.discount >= q.base;
        setCoupon({ code, discountPct: whole ? 100 : Math.round((q.discount / q.base) * 100), freeEvaluation: whole, grantsAddons: grants });
      }
    } catch {
      setPromoError("Could not check that code. Try again.");
    }
    setPromoBusy(false);
  };

  const checkout = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const choices = JSON.stringify([program.key,effectiveSize,selected,platform,coupon?.code,info]);
      if (checkoutAttempt.current.choices !== choices) checkoutAttempt.current = {choices,id:crypto.randomUUID()};
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({
          programKey: program.key,
          attemptId: checkoutAttempt.current.id,
          accountSize: effectiveSize,
          addOns: selected,
          platform,
          promoCode: coupon?.code ?? null,
          fullName: `${info.firstName} ${info.lastName}`.trim(),
          country: info.country,
          address: info.address,
        }),
      });
      const data = await res.json();
      if (data.restart) checkoutAttempt.current = { choices: "", id: "" };
      if (!res.ok) setMessage({ tone: "error", text: data.error || "Checkout failed. Please try again." });
      else if (data.invoice_url) {
        setMessage({ tone: "ok", text: data.account ? "Your account is ready. Taking you to the dashboard…" : "Redirecting to the payment page…" });
        window.location.href = data.invoice_url;
        return;
      } else setMessage({ tone: "error", text: "The payment page could not be opened. Please contact support." });
    } catch {
      setMessage({ tone: "error", text: "Something went wrong. Please try again." });
    }
    setBusy(false);
  };

  const canPay = agreed && info.firstName.trim() && info.lastName.trim() && !busy;
  const perksLine = [
    { icon: Coins, text: `${PERKS.stipend.ratePct}% monthly stipend: ${usd(Math.round((effectiveSize * PERKS.stipend.ratePct) / 100))} a month` },
    { icon: Zap, text: `First ${PERKS.onDemandPayouts} payouts on demand` },
    ...(effectiveSize >= PERKS.freeReset.minSize ? [{ icon: RotateCcw, text: `Free reset if it fails in the first ${PERKS.freeReset.windowHours} hours` }] : []),
  ];

  return (
    <div className="grid grid-cols-1 gap-6 pb-16 sm:pb-20 lg:gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
      <div className="min-w-0 space-y-9 sm:space-y-10">
        <section>
          <SectionTitle as="h3" title="Account type" sub="Five routes to a funded account. The rules of each are one tap away." />
          {isLoading ? (
            <div className={cn(skeleton, "h-20")} />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {livePrograms.map((p) => {
                const on = program.key === p.key;
                return (
                  <button key={p.key} type="button" onClick={() => {if (p.key !== programKey) { setProgramKey(p.key); setCoupon(null); }}} className={cn(card(on), "flex min-h-[72px] items-start gap-3 p-4")}>
                    <span className="mt-0.5">
                      <RadioCircle selected={on} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14px] leading-tight font-semibold text-[var(--g-ink)]">{p.shortLabel}</span>
                      <span className="mt-1 line-clamp-2 block text-[12px] leading-snug text-[var(--g-muted-ink)]">{p.tagline}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[18px] bg-white/55 px-4 py-3 text-[12.5px] text-[var(--g-muted-ink)] ring-1 ring-black/[0.06]">
            <span>
              Target <b className="text-[var(--g-ink)]">{detail.phases.length ? detail.phases.map((p) => `${p.targetPct}%`).join(" + ") : "none"}</b>
            </span>
            <span>
              Daily loss <b className="text-[var(--g-ink)]">{detail.funded.dailyLossPct}%</b>
            </span>
            <span>
              Max loss <b className="text-[var(--g-ink)]">{detail.funded.maxLossPct}%</b>
            </span>
            <span>
              Min days <b className="text-[var(--g-ink)]">{detail.phases[0]?.minTradingDays ?? 0}</b>
            </span>
            <Link href={`/challenges/${program.key}`} target="_blank" className="ml-auto font-semibold text-[var(--g-emerald)] underline-offset-4 hover:underline">
              Full {detail.name} rules
            </Link>
          </div>
        </section>

        <section>
          <SectionTitle as="h3" title="Account size" sub={isAccess ? `Pay $${PERKS.accessUpfront} today. The fee shown is due only after you pass.` : "One-time fee. No monthly charges."} />
          {isLoading ? (
            <div className={cn(skeleton, "h-24")} />
          ) : (
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3">
              {sizes.map((s) => {
                const on = effectiveSize === s;
                return (
                  <button key={s} type="button" onClick={() => setSize(s)} className={cn(card(on), "flex items-center gap-3 px-4 py-3.5")}>
                    <RadioCircle selected={on} />
                    <span className="min-w-0">
                      <span className="g-num block text-[16px] leading-tight font-semibold text-[var(--g-ink)]">{sizeLabel(s)}</span>
                      <span className="g-num mt-0.5 block text-[12px] text-[var(--g-muted-ink)]">{usd(program.fees[s] ?? 0)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {availableAddOns.length > 0 && (
          <section>
            <SectionTitle as="h3" title="Add-ons" sub="Optional. Each one changes a rule on this account for good." />
            <div className="grid gap-3">
              {availableAddOns.map((a) => {
                const granted = coupon?.grantsAddons.includes(a.key) ?? false;
                const on = selected.includes(a.key) || granted;
                const cost = granted ? 0 : Math.round(base * a.feePct) / 100;
                return (
                  <button key={a.key} type="button" disabled={granted} onClick={() => toggle(a.key)} aria-pressed={on} className={cn(card(on), "flex items-center justify-between gap-4 px-4 py-3.5 disabled:cursor-default")}>
                    <span className="flex min-w-0 items-start gap-3">
                      <span className={cn("mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-md ring-1", on ? "bg-[var(--g-ink)] ring-[var(--g-ink)]" : "bg-white ring-black/20")}>
                        {on ? <Check className="h-3 w-3 text-[var(--g-lime)]" strokeWidth={3} /> : null}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[14px] font-semibold text-[var(--g-ink)]">{a.label}</span>
                        <span className="mt-0.5 block text-[12.5px] leading-snug text-[var(--g-muted-ink)]">{a.description}</span>
                      </span>
                    </span>
                    <span className="g-num shrink-0 text-[13px] font-semibold text-[var(--g-emerald)]">{granted ? "Included" : `+${usd(cost)}`}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {platforms.length > 1 && (
          <section>
            <SectionTitle as="h3" title="Trading platform" />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {platforms.map((p) => {
                const on = platform === p.name;
                const extra = Math.round(base * Number(p.extra_fee_pct ?? 0)) / 100;
                return (
                  <button key={p.name} type="button" onClick={() => setPlatform(p.name)} className={cn(card(on), "flex min-h-[52px] items-center justify-between gap-3 px-4 py-3.5")}>
                    <span className="flex min-w-0 items-center gap-3">
                      <RadioCircle selected={on} />
                      <span className="truncate text-[13px] font-semibold text-[var(--g-ink)]">{p.name}</span>
                    </span>
                    <span className="g-num shrink-0 text-[12px] font-semibold text-[var(--g-emerald)]">{extra === 0 ? "Included" : `+${usd(extra)}`}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <SectionTitle as="h3" title="Your details" sub="Use the name on your government ID. Payouts are only sent to the account holder." />
          <Panel className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(
                [
                  ["firstName", "First name", "given-name"],
                  ["lastName", "Last name", "family-name"],
                  ["country", "Country", "country-name"],
                  ["address", "Billing address", "street-address"],
                ] as const
              ).map(([key, label, auto]) => (
                <div key={key} className={key === "address" ? "sm:col-span-2" : undefined}>
                  <label className={fieldLabel} htmlFor={`nc-${key}`}>
                    {label}
                  </label>
                  <input id={`nc-${key}`} type="text" autoComplete={auto} value={info[key]} onChange={(e) => setInfo({ ...info, [key]: e.target.value })} className={field()} />
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <section>
          <SectionTitle as="h3" title="Payment" />
          <div className={cn(card(true), "flex items-center gap-3 px-4 py-4")}>
            <RadioCircle selected />
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold text-[var(--g-ink)]">Crypto</span>
              <span className="mt-0.5 block text-[12.5px] text-[var(--g-muted-ink)]">USDT, BTC, ETH and 100+ coins through NOWPayments. Your account is issued when the network confirms the payment.</span>
            </span>
          </div>
        </section>
      </div>

      <div className="w-full min-w-0">
        <div className="space-y-6 xl:sticky xl:top-24">
          <section>
            <SectionTitle as="h3" title="Promo code" />
            <div className="flex flex-col gap-2.5 min-[420px]:flex-row">
              <input type="text" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="Enter code" aria-label="Promo code" className={cn(field(), "min-w-0 flex-1 text-[13px] font-medium tracking-wide uppercase")} />
              <button type="button" onClick={applyPromo} disabled={promoBusy} className={btn.ink}>
                {promoBusy ? "Checking…" : "Apply"}
              </button>
            </div>
            {promoError ? <p className="mt-2 px-1 text-[12px] font-medium text-red-600">{promoError}</p> : null}
            {coupon ? <p className="mt-2 px-1 text-[12px] font-semibold text-[var(--g-emerald)]">{coupon.code} applied.</p> : null}
          </section>

          <Panel className="overflow-hidden">
            <div className="border-b border-black/[0.06] p-5 sm:p-6">
              <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[var(--g-ink)]">Order summary</h3>
            </div>
            <div className="border-b border-black/[0.06] p-5 sm:p-6">
              <dl className="space-y-3 text-[13px]">
                <div className="flex justify-between gap-4 font-medium text-[var(--g-ink)]">
                  <dt>
                    {sizeLabel(effectiveSize)} {program.shortLabel}
                  </dt>
                  <dd className="g-num font-semibold">{usd(quote.base)}</dd>
                </div>
                {quote.addOns.map((l) => (
                  <div key={l.key} className="flex justify-between gap-4 text-[var(--g-muted-ink)]">
                    <dt>{l.label}</dt>
                    <dd className={cn("g-num", l.free && "font-semibold text-[var(--g-emerald)]")}>{l.free ? "Included" : `+${usd(l.amount)}`}</dd>
                  </div>
                ))}
                {quote.platformFee > 0 ? (
                  <div className="flex justify-between gap-4 text-[var(--g-muted-ink)]">
                    <dt>{platform}</dt>
                    <dd className="g-num">+{usd(quote.platformFee)}</dd>
                  </div>
                ) : null}
                {quote.discount > 0 ? (
                  <div className="flex justify-between gap-4 font-semibold text-[var(--g-emerald)]">
                    <dt>Promo {quote.couponCode}</dt>
                    <dd className="g-num">-{usd(quote.discount)}</dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-5 flex items-end justify-between gap-4 border-t border-black/[0.06] pt-4">
                <span className="text-[15px] font-semibold text-[var(--g-ink)]">{isAccess ? "Due today" : "Total"}</span>
                <span className="g-num text-[30px] leading-none font-semibold text-[var(--g-ink)]">{usd(quote.dueToday)}</span>
              </div>
              {isAccess && quote.dueAfterPass > quote.dueToday ? (
                <p className="mt-3 text-[12.5px] leading-relaxed text-[var(--g-muted-ink)]">
                  Then <b className="text-[var(--g-ink)]">{usd(quote.dueAfterPass - quote.dueToday)}</b>, due within {PERKS.accessActivationHours} hours of passing Phase 2. Nothing more if you do not pass.
                </p>
              ) : null}
            </div>

            <div className="border-b border-black/[0.06] p-5 sm:p-6">
              <p className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.1em] text-[var(--g-muted-ink)] uppercase">
                <Gift className="h-3.5 w-3.5" /> Included with this account
              </p>
              <ul className="mt-3 space-y-2.5">
                {perksLine.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-2.5 text-[13px] text-[var(--g-ink)]">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--g-emerald)]" strokeWidth={2} />
                    {text}
                  </li>
                ))}
                <li className="flex items-start gap-2.5 text-[13px] text-[var(--g-ink)]">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--g-emerald)]" strokeWidth={2} />
                  {detail.feeNote}
                </li>
              </ul>
            </div>

            <div className="p-5 sm:p-6">
              <label className="group flex cursor-pointer items-start gap-3">
                <span className="relative mt-0.5 flex items-center justify-center">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="peer sr-only" />
                  <span className="h-[18px] w-[18px] rounded-md bg-white ring-1 ring-black/20 transition-colors peer-checked:bg-[var(--g-ink)] peer-checked:ring-[var(--g-ink)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--g-emerald)]" />
                  <Check className="absolute h-3 w-3 text-[var(--g-lime)] opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} />
                </span>
                <span className="flex-1 text-[12.5px] leading-relaxed text-[var(--g-muted-ink)] select-none">
                  I have read the{" "}
                  <Link href={`/challenges/${program.key}#terms`} target="_blank" className="font-medium text-[var(--g-ink)] underline underline-offset-2">
                    {detail.name} program terms
                  </Link>
                  , the{" "}
                  <Link href="/terms" target="_blank" className="font-medium text-[var(--g-ink)] underline underline-offset-2">
                    Terms of Service
                  </Link>{" "}
                  and the{" "}
                  <Link href="/refund-policy" target="_blank" className="font-medium text-[var(--g-ink)] underline underline-offset-2">
                    Refund Policy
                  </Link>
                  , and the details above match my government ID.
                </span>
              </label>

              <button type="button" onClick={checkout} disabled={!canPay} className={cn(btn.lime, "mt-6 w-full")}>
                {busy ? "Processing…" : quote.dueToday > 0 ? `Pay ${usd(quote.dueToday)}` : "Get my account"}
              </button>
              {message ? <p className={cn("mt-4 text-center text-[13px] font-semibold", message.tone === "ok" ? "text-[var(--g-emerald)]" : "text-red-600")}>{message.text}</p> : null}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
