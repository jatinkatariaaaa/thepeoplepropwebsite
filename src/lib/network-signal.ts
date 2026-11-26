import { supabaseAdmin } from "@/lib/supabase";

/**
 * Where a request came from: the visitor's internet connection and browser.
 *
 * The contest only counts one sign-up per person, so the server records the connection
 * (IP address, compared per /64 for IPv6, whose last 64 bits change on every reconnect)
 * and a first-party device cookie when an account signs up, logs in, or checks or claims
 * its referrals. The rules that use them live in the database:
 * supabase/migrations/20261126191933_referral_signup_checks.sql.
 */

/** Long-lived random id for this browser; nothing else is stored in it. */
export const DEVICE_COOKIE = "tpp_did";
export const DEVICE_COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 365 * 2,
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const isDeviceId = (v: unknown): v is string => typeof v === "string" && UUID.test(v);
export const newDeviceId = () => crypto.randomUUID();

export type Signal = { ip: string | null; net: string | null; country: string | null; device: string | null };

/** Request headers, from a Request or from next/headers. */
type HeaderSource = Pick<Headers, "get">;

/**
 * The client's address as the hosting edge reports it. Vercel overwrites these headers at its edge,
 * so a visitor cannot choose them; the first x-forwarded-for entry is the client.
 */
export function clientIp(h: HeaderSource): string | null {
  const candidates = [
    h.get("x-vercel-forwarded-for")?.split(",")[0],
    h.get("x-real-ip"),
    h.get("x-forwarded-for")?.split(",")[0],
    h.get("cf-connecting-ip"),
  ];
  for (const c of candidates) {
    const ip = c?.trim();
    if (ip && networkKey(ip)) return ip;
  }
  return null;
}

/**
 * The connection an address belongs to: "v4:1.2.3.4" for IPv4, "v6:" and the first 64 bits in hex
 * for IPv6 (a home or phone keeps its /64 while the rest rotates). Matches the backfill from the
 * auth logs, which computed the same key.
 */
export function networkKey(raw: string): string | null {
  let s = raw.trim().toLowerCase().replace(/^\[|\]$/g, "").split("%")[0];
  const mapped = s.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mapped) s = mapped[1];

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(s)) {
    return s.split(".").every((p) => Number(p) <= 255) ? `v4:${s.split(".").map(Number).join(".")}` : null;
  }
  if (!s.includes(":")) return null;

  // an embedded IPv4 tail (64:ff9b::1.2.3.4) is two groups; only the first four groups matter anyway
  const v4tail = s.match(/(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (v4tail) {
    const [a, b, c, d] = v4tail[1].split(".").map(Number);
    s = s.slice(0, -v4tail[1].length) + `${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const halves = s.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const fill = halves.length === 2 ? 8 - head.length - tail.length : 0;
  if (fill < 0) return null;
  const groups = [...head, ...Array(fill).fill("0"), ...tail];
  if (groups.length !== 8 || !groups.every((g) => /^[0-9a-f]{1,4}$/.test(g))) return null;
  return `v6:${groups.slice(0, 4).map((g) => g.padStart(4, "0")).join("")}`;
}

/** Two-letter country from the edge's geolocation header, when there is one. */
export function clientCountry(h: HeaderSource): string | null {
  const c = (h.get("x-vercel-ip-country") || h.get("cf-ipcountry") || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(c) && c !== "XX" ? c : null;
}

export function readSignal(h: HeaderSource, device: string | null | undefined): Signal {
  const ip = clientIp(h);
  return { ip, net: ip ? networkKey(ip) : null, country: clientCountry(h), device: isDeviceId(device) ? device : null };
}

/** Remember where this account was seen. Never throws: a failure here must not stop a login or a claim. */
export async function recordAccountSignal(userId: string, signal: Signal) {
  if (!signal.net && !signal.device) return;
  try {
    const { error } = await supabaseAdmin.rpc("record_account_signal", {
      p_user: userId,
      p_net: signal.net,
      p_ip: signal.ip,
      p_country: signal.country,
      p_device: signal.device,
    });
    if (error) console.error("record_account_signal failed:", error.message);
  } catch (error) {
    console.error("record_account_signal failed:", error);
  }
}
