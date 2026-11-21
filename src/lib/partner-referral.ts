import { createHmac, timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase";

export const partnerCookie = "tpp_partner_visit";
export const referralLifetime = 90 * 24 * 60 * 60;
const codePattern = /^[a-f0-9]{32}$/;

function signature(payload: string) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Referral tracking is unavailable.");
  return createHmac("sha256", key).update("partner-visit:v1:" + payload).digest("base64url");
}

export function createVisit(code: string) {
  const payload = code + "." + Date.now();
  return payload + "." + signature(payload);
}

export function readVisit(value: string | undefined) {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [code, time, mac] = parts;
  if (!codePattern.test(code) || !/^\d{13}$/.test(time) || !/^[A-Za-z0-9_-]{43}$/.test(mac)) return null;
  const visitedAt = Number(time);
  if (visitedAt > Date.now() || Date.now() - visitedAt > referralLifetime * 1000) return null;
  if (!timingSafeEqual(Buffer.from(mac), Buffer.from(signature(code + "." + time)))) return null;
  return { code, visitedAt };
}

export async function activePartnerLink(code: string) {
  if (!codePattern.test(code)) return false;
  const { data, error } = await supabaseAdmin.from("partner_links").select("id,staff_members!inner(active)")
    .eq("code", code).eq("active", true).eq("staff_members.active", true).maybeSingle();
  if (error) throw new Error("Could not verify the partner link.", { cause: error });
  return !!data;
}

export async function resolveLegacyRef(code: string | undefined): Promise<string | null> {
  if (!code || !/^[a-zA-Z0-9_-]{1,80}$/.test(code)) return null;
  const { data, error } = await supabaseAdmin.rpc("partner_resolve_legacy_ref", { p_code: code });
  if (error) throw new Error("Could not verify the affiliate link.", { cause: error });
  return data;
}
