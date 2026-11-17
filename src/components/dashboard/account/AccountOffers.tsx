"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { btn } from "../glass";

type OfferAccount = { id?: string; status?: string; activation_fee?: number | string | null; activation_due_at?: string | null; starting_balance?: number | string | null };
type Reset = { id: string; kind: string; eligible_until: string | null };

function left(until: string | null) {
  if (!until) return "";
  const ms = new Date(until).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const h = Math.floor(ms / 3_600_000);
  return h >= 1 ? `${h}h ${Math.floor((ms % 3_600_000) / 60_000)}m left` : `${Math.max(1, Math.floor(ms / 60_000))}m left`;
}

/**
 * Time-limited actions on an account:
 *   - a free reset after an early breach (or the Free Retry add-on)
 *   - the fee payment that turns a passed Access evaluation into a funded account
 */
export function AccountOffers({ account }: { account: OfferAccount }) {
  const router = useRouter();
  const [reset, setReset] = useState<Reset | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!account.id || account.status !== "breached") return;
    let alive = true;
    supabase
      .from("account_resets")
      .select("id, kind, eligible_until")
      .eq("source_account_id", account.id)
      .eq("status", "eligible")
      .maybeSingle()
      .then(({ data }) => {
        if (alive && data && (!data.eligible_until || new Date(data.eligible_until).getTime() > Date.now())) setReset(data as Reset);
      });
    return () => {
      alive = false;
    };
  }, [account.id, account.status]);

  const post = async (url: string, body: unknown, onDone: (data: { account?: { id?: string }; invoice_url?: string }) => void) => {
    setBusy(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}) }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) setError(data.error || "That did not work. Please try again.");
      else onDone(data);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setBusy(false);
  };

  const fee = Number(account.activation_fee) || 0;
  const awaitingActivation = account.status === "passed" && fee > 0;
  const activationOpen = !account.activation_due_at || new Date(account.activation_due_at).getTime() > Date.now();

  if (!reset && !awaitingActivation) return null;

  return (
    <div className="mb-6 grid gap-3">
      {reset && (
        <div className="g-card-dark g-hair relative flex flex-col gap-4 overflow-hidden rounded-[26px] p-5 text-white sm:flex-row sm:items-center sm:p-6">
          <span aria-hidden="true" className="pointer-events-none absolute -top-24 -right-16 h-60 w-60 rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.18),transparent)]" />
          <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-[var(--g-lime)] text-[#0e1110]">
            <RotateCcw className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div className="relative min-w-0 flex-1">
            <p className="text-[17px] font-semibold tracking-[-0.02em]">{reset.kind === "free_24h" ? "This account qualifies for a free reset" : "Your Free Retry is ready"}</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-white/60">
              {reset.kind === "free_24h" ? "It failed within 24 hours of its first trade." : "You bought the Free Retry add-on with this account."} Claim a fresh account at the same phase, size and rules, at no cost. <b className="text-[var(--g-lime-soft)]">{left(reset.eligible_until)}</b>
            </p>
            {error ? <p className="mt-2 text-[13px] font-medium text-red-300">{error}</p> : null}
          </div>
          <button type="button" disabled={busy} onClick={() => void post("/api/accounts/reset", { resetId: reset.id }, (d) => router.push(d.account?.id ? `/dashboard/account/${d.account.id}` : "/dashboard"))} className={cn(btn.lime, "relative shrink-0")}>
            {busy ? "Creating account…" : "Claim free reset"}
          </button>
        </div>
      )}

      {awaitingActivation && (
        <div className="g-card-emerald g-hair relative flex flex-col gap-4 overflow-hidden rounded-[26px] p-5 text-white sm:flex-row sm:items-center sm:p-6">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-[var(--g-lime)] text-[#0e1110]">
            <BadgeCheck className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-semibold tracking-[-0.02em]">You passed. Activate your funded account</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-white/75">
              {activationOpen ? (
                <>
                  Pay the account fee of <b className="g-num text-white">${fee.toLocaleString("en-US")}</b> to receive your ${Number(account.starting_balance).toLocaleString("en-US")} funded account. <b className="text-[var(--g-lime-soft)]">{left(account.activation_due_at ?? null)}</b>
                </>
              ) : (
                "The 48-hour activation window has closed. Open a support ticket and we will look at reopening it."
              )}
            </p>
            {error ? <p className="mt-2 text-[13px] font-medium text-red-200">{error}</p> : null}
          </div>
          {activationOpen ? (
            <button type="button" disabled={busy} onClick={() => void post("/api/checkout", { kind: "activation", accountId: account.id }, (d) => d.invoice_url && (window.location.href = d.invoice_url))} className={cn(btn.lime, "shrink-0")}>
              {busy ? "Opening payment…" : `Pay $${fee.toLocaleString("en-US")}`}
            </button>
          ) : (
            <a href="/dashboard/support" className={cn(btn.light, "shrink-0")}>
              Contact support
            </a>
          )}
        </div>
      )}
    </div>
  );
}
