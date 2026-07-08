import { supabaseAdmin } from "@/lib/supabase";

const COMMISSION_RATE = 0.1;

/**
 * Credits the referring affiliate their commission for a purchase.
 * Callers must only invoke this once per purchase (i.e. when the
 * trading account is first provisioned) to keep it idempotent —
 * webhook retries must not double-credit commissions.
 */
export async function creditAffiliateCommission(purchase: {
  user_id: string;
  price_amount: number | string;
}) {
  try {
    const { data: referral } = await supabaseAdmin
      .from("affiliate_referrals")
      .select("affiliate_id")
      .eq("referred_user_id", purchase.user_id)
      .single();

    if (!referral?.affiliate_id) return;

    const commission = Number(purchase.price_amount) * COMMISSION_RATE;
    if (!Number.isFinite(commission) || commission <= 0) return;

    const { data: affiliateData } = await supabaseAdmin
      .from("affiliates")
      .select("total_earnings, pending_payout")
      .eq("user_id", referral.affiliate_id)
      .single();

    if (!affiliateData) return;

    await supabaseAdmin
      .from("affiliates")
      .update({
        total_earnings: Number(affiliateData.total_earnings) + commission,
        pending_payout: Number(affiliateData.pending_payout) + commission,
      })
      .eq("user_id", referral.affiliate_id);
  } catch (error) {
    // Commission failures should not fail the payment fulfillment.
    console.error("Affiliate commission error:", error);
  }
}
