import { supabaseAdmin } from "@/lib/supabase";
import { PERKS } from "@/data/catalogue";

/**
 * The perk and payout settings an admin can change without a deploy
 * (Admin → Settings → Trading). Rows live in admin_settings; anything missing
 * falls back to the catalogue default so the site never runs without a value.
 */
export interface PerkSettings {
  stipendEnabled: boolean;
  stipendRatePct: number;
  stipendCycleDays: number;
  stipendMinTradingDays: number;
  /** "with_payout": the rewards balance is paid alongside payouts. "monthly_cash": it can be withdrawn on its own. */
  stipendRelease: "with_payout" | "monthly_cash";
  onDemandPayouts: number;
  payoutCycleDays: number;
  payoutMinAmount: number;
  freeResetEnabled: boolean;
  freeResetMinSize: number;
  freeResetWindowHours: number;
  freeResetClaimHours: number;
  accessActivationHours: number;
  affiliateCommissionPct: number;
}

export const DEFAULT_PERK_SETTINGS: PerkSettings = {
  stipendEnabled: true,
  stipendRatePct: PERKS.stipend.ratePct,
  stipendCycleDays: PERKS.stipend.cycleDays,
  stipendMinTradingDays: PERKS.stipend.minTradingDays,
  stipendRelease: "with_payout",
  onDemandPayouts: PERKS.onDemandPayouts,
  payoutCycleDays: PERKS.payoutCycleDays,
  payoutMinAmount: PERKS.minPayout,
  freeResetEnabled: true,
  freeResetMinSize: PERKS.freeReset.minSize,
  freeResetWindowHours: PERKS.freeReset.windowHours,
  freeResetClaimHours: PERKS.freeReset.claimHours,
  accessActivationHours: PERKS.accessActivationHours,
  affiliateCommissionPct: 10,
};

const KEYS: Record<keyof PerkSettings, string> = {
  stipendEnabled: "stipend_enabled",
  stipendRatePct: "stipend_rate_pct",
  stipendCycleDays: "stipend_cycle_days",
  stipendMinTradingDays: "stipend_min_trading_days",
  stipendRelease: "stipend_release",
  onDemandPayouts: "on_demand_payouts",
  payoutCycleDays: "payout_cycle_days",
  payoutMinAmount: "payout_min_amount",
  freeResetEnabled: "free_reset_enabled",
  freeResetMinSize: "free_reset_min_size",
  freeResetWindowHours: "free_reset_window_hours",
  freeResetClaimHours: "free_reset_claim_hours",
  accessActivationHours: "access_activation_hours",
  affiliateCommissionPct: "affiliate_commission_pct",
};

export const PERK_SETTING_KEYS = KEYS;

const toBool = (v: unknown, d: boolean) => (v == null ? d : ["true", "1", "yes", "on"].includes(String(v).toLowerCase()));
const toNum = (v: unknown, d: number) => {
  const n = Number(v);
  return v == null || v === "" || !Number.isFinite(n) ? d : n;
};

export async function getPerkSettings(): Promise<PerkSettings> {
  const d = DEFAULT_PERK_SETTINGS;
  const { data, error } = await supabaseAdmin.from("admin_settings").select("key, value").in("key", Object.values(KEYS));
  if (error || !data) return d;
  const map = new Map(data.map((r) => [r.key as string, r.value as unknown]));
  const get = (k: keyof PerkSettings) => map.get(KEYS[k]);
  return {
    stipendEnabled: toBool(get("stipendEnabled"), d.stipendEnabled),
    stipendRatePct: toNum(get("stipendRatePct"), d.stipendRatePct),
    stipendCycleDays: toNum(get("stipendCycleDays"), d.stipendCycleDays),
    stipendMinTradingDays: toNum(get("stipendMinTradingDays"), d.stipendMinTradingDays),
    stipendRelease: get("stipendRelease") === "monthly_cash" ? "monthly_cash" : "with_payout",
    onDemandPayouts: toNum(get("onDemandPayouts"), d.onDemandPayouts),
    payoutCycleDays: toNum(get("payoutCycleDays"), d.payoutCycleDays),
    payoutMinAmount: toNum(get("payoutMinAmount"), d.payoutMinAmount),
    freeResetEnabled: toBool(get("freeResetEnabled"), d.freeResetEnabled),
    freeResetMinSize: toNum(get("freeResetMinSize"), d.freeResetMinSize),
    freeResetWindowHours: toNum(get("freeResetWindowHours"), d.freeResetWindowHours),
    freeResetClaimHours: toNum(get("freeResetClaimHours"), d.freeResetClaimHours),
    accessActivationHours: toNum(get("accessActivationHours"), d.accessActivationHours),
    affiliateCommissionPct: toNum(get("affiliateCommissionPct"), d.affiliateCommissionPct),
  };
}
