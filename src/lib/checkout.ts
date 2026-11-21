import { supabaseAdmin } from "@/lib/supabase";
import { buildQuote, type CouponInfo, type Quote } from "@/lib/pricing";
import { isProgramKey } from "@/data/catalogue";
import type { ProgramKey } from "@/data/programs";

/**
 * Server-side pricing for an order. Everything that affects the amount is read
 * from Supabase here: the fee for the size, the platform surcharge, the coupon.
 */

export class CheckoutError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export interface OrderRequest {
  programKey: string;
  accountSize: number;
  addOns?: string[];
  platform?: string | null;
  promoCode?: string | null;
}

export async function loadCoupon(code: unknown, programKey: string): Promise<CouponInfo | null> {
  const couponCode = String(code || "").trim().toUpperCase();
  if (!couponCode) return null;

  const { data: coupon, error } = await supabaseAdmin.from("tpp_coupons").select("*").eq("code", couponCode).maybeSingle();
  if (error || !coupon || !coupon.is_active) throw new CheckoutError("That promo code is not valid.");
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) throw new CheckoutError("That promo code has expired.");
  if (coupon.max_uses != null && Number(coupon.current_uses || 0) >= Number(coupon.max_uses)) throw new CheckoutError("That promo code has reached its usage limit.");

  const scoped = coupon.challenge_specific || coupon.challenge_key;
  if (scoped && scoped !== programKey) throw new CheckoutError("That promo code does not apply to this account type.");

  return {
    code: couponCode,
    discountPct: Math.max(0, Math.min(100, Number(coupon.discount_pct) || 0)),
    freeEvaluation: Boolean(coupon.free_evaluation) && Number(coupon.discount_pct) >= 100,
    grantsAddons: Array.isArray(coupon.grants_addons) ? coupon.grants_addons.map(String) : [],
  };
}

export async function quoteOrder(req: OrderRequest): Promise<{ quote: Quote; program: Record<string, any>; platformName: string | null }> {
  if (!isProgramKey(req.programKey)) throw new CheckoutError("Unknown account type.");
  const size = Number(req.accountSize);
  if (!Number.isFinite(size) || size <= 0) throw new CheckoutError("Choose an account size.");

  const { data: program } = await supabaseAdmin.from("tpp_programs").select("*").eq("key", req.programKey).maybeSingle();
  if (!program || program.is_active === false) throw new CheckoutError("This account type is not on sale right now.");

  const { data: feeRow } = await supabaseAdmin.from("tpp_program_fees").select("fee").eq("program_key", req.programKey).eq("account_size", size).maybeSingle();
  if (!feeRow) throw new CheckoutError("That account size is not offered for this account type.");

  let platformExtraPct = 0;
  let platformName: string | null = null;
  const { data: platforms } = await supabaseAdmin.from("tpp_platforms").select("name, extra_fee_pct").eq("is_active", true).order("created_at");
  const chosen = (platforms ?? []).find((p) => p.name === req.platform) ?? (platforms ?? [])[0];
  if (chosen) {
    platformExtraPct = Number(chosen.extra_fee_pct) || 0;
    platformName = chosen.name;
  }

  const coupon = await loadCoupon(req.promoCode, req.programKey);
  const quote = buildQuote({
    programKey: req.programKey as ProgramKey,
    size,
    base: Number(feeRow.fee),
    addOnKeys: (req.addOns ?? []).map(String),
    platformExtraPct,
    coupon,
    payAfterPass: Boolean(program.pay_after_pass),
    upfrontFee: program.upfront_fee,
  });
  return { quote, program, platformName };
}

export async function redeemCoupon(code: string | null) {
  if (!code) return;
  const { data: coupon } = await supabaseAdmin.from("tpp_coupons").select("id, current_uses").eq("code", code).maybeSingle();
  if (coupon) await supabaseAdmin.from("tpp_coupons").update({ current_uses: Number(coupon.current_uses || 0) + 1 }).eq("id", coupon.id);
}

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://thepeopleprop.live").replace(/\/$/, "");

/** Creates a NOWPayments invoice and returns its hosted payment page. */
export async function createInvoice(o: { amount: number; orderId: string; description: string; email?: string | null }): Promise<string> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY || process.env.NOWPAYMENTS_KEY;
  if (!apiKey) throw new CheckoutError("Payments are not configured yet. Please contact support.", 503);

  const res = await fetch("https://api.nowpayments.io/v1/invoice", {
    method: "POST",
    headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      price_amount: o.amount,
      price_currency: "usd",
      order_id: o.orderId,
      order_description: o.description,
      success_url: `${siteUrl()}/dashboard?success=true`,
      cancel_url: `${siteUrl()}/dashboard?canceled=true`,
      ipn_callback_url: `${siteUrl()}/api/nowpayments-ipn`,
      customer_email: o.email || undefined,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as { invoice_url?: string; message?: string };
  if (!res.ok || !data.invoice_url) throw new CheckoutError(data.message || "Could not create the payment invoice.", 502);
  return data.invoice_url;
}

export const newOrderId = (prefix = "ORD") => `${prefix}-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
