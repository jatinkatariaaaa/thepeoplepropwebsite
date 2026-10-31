import { NextResponse } from "next/server";

/**
 * GET /api/status
 * Live checks of the services the site runs on, for the /status page.
 * Each probe has a hard timeout; the CDN caches the answer for a minute.
 */
export const dynamic = "force-dynamic";

type State = "operational" | "degraded" | "down" | "unknown";
type Probe = { state: State; latency: number | null };

const SLOW_MS = 2500;
const TIMEOUT_MS = 6000;
const NOT_CONFIGURED: Probe = { state: "unknown", latency: null };

async function probe(request: () => Promise<Response>, healthy: (res: Response) => boolean | Promise<boolean> = (res) => res.ok): Promise<Probe> {
  const started = performance.now();
  try {
    const res = await request();
    const latency = Math.round(performance.now() - started);
    if (!(await healthy(res))) return { state: "down", latency };
    return { state: latency > SLOW_MS ? "degraded" : "operational", latency };
  } catch {
    return { state: "down", latency: null };
  }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = url && key ? { apikey: key, Authorization: `Bearer ${key}` } : null;
  const init = (headers?: Record<string, string>): RequestInit => ({ headers, cache: "no-store", signal: AbortSignal.timeout(TIMEOUT_MS) });

  const [auth, data, payments] = await Promise.all([
    supabase ? probe(() => fetch(`${url}/auth/v1/health`, init(supabase))) : NOT_CONFIGURED,
    supabase ? probe(() => fetch(`${url}/rest/v1/tpp_stats?select=key_name&limit=1`, init(supabase))) : NOT_CONFIGURED,
    probe(
      () => fetch("https://api.nowpayments.io/v1/status", init()),
      async (res) => res.ok && (await res.json().catch(() => null))?.message === "OK",
    ),
  ]);

  const services = [
    { key: "site", name: "Website", detail: "Every page on this site", state: "operational" as State, latency: null },
    { key: "auth", name: "Sign-in & accounts", detail: "Log in, sign up and password resets", ...auth },
    { key: "data", name: "Trader data", detail: "Dashboard, programs and live stats", ...data },
    { key: "payments", name: "Crypto checkout", detail: "NOWPayments invoices for new challenges", ...payments },
  ];

  return NextResponse.json(
    { checkedAt: new Date().toISOString(), services },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" } },
  );
}
