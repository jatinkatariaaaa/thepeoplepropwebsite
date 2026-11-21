/**
 * Bridge between the CRM (this app) and TPP Terminal.
 * The terminal exposes two admin endpoints, authenticated with the API key
 * stored on the platform row in tpp_platforms.
 */

export interface PingResult {
  success: boolean;
  message: string;
  latencyMs?: number;
}

const trimSlash = (url: string) => (url.endsWith("/") ? url.slice(0, -1) : url);

function authHeaders(apiKey: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "x-api-key": apiKey };
}

async function fetchWithTimeout(url: string, init: RequestInit, ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Checks terminal health and freshness of its server-side pricing. */
export async function pingTerminal(apiUrl: string, apiKey: string): Promise<PingResult> {
  const started = Date.now();
  const base = trimSlash(apiUrl);
  try {
    const res = await fetchWithTimeout(`${base}/api/health`, { method: "GET", headers: authHeaders(apiKey) }, 6000);
    const latencyMs = Date.now() - started;
    const report = await res.json().catch(() => null);
    if (report?.service === "tpp-terminal") {
      if (res.ok && report.ok === true && report.priceFeed === "live") {
        return { success: true, message: "Terminal reachable and prices current", latencyMs };
      }
      if (["stale", "no prices", "degraded"].includes(report.priceFeed)) {
        return { success: false, message: "Terminal reachable, but server quotes are incomplete or stale", latencyMs };
      }
    }
    return { success: false, message: `Terminal returned ${res.status} ${res.statusText}`, latencyMs };
  } catch (err) {
    const e = err as Error;
    return { success: false, message: e.name === "AbortError" ? "Timed out after 6 seconds" : `Could not connect: ${e.message}` };
  }
}

export interface TerminalRules {
  profit_target_pct?: number | string | null;
  max_daily_drawdown_pct?: number | string | null;
  max_overall_drawdown_pct?: number | string | null;
  min_trading_days?: number | string | null;
  [key: string]: unknown;
}

export interface TerminalAccountParams {
  apiUrl: string;
  apiKey: string;
  userEmail: string;
  userId: string;
  accountSize: number;
  rules: TerminalRules;
  programKey?: string;
  phase?: "challenge" | "funded";
  status?: "active" | "funded";
  label?: string;
  businessAccountId?: string;
}

export interface TerminalAccountResult {
  success: boolean;
  login: string;
  password?: string;
  server?: string;
  terminalAccountId?: string;
  error?: string;
}

/** Creates the account the trader actually trades on. Fails loudly: there is no fallback account. */
export async function createTradingAccount(params: TerminalAccountParams): Promise<TerminalAccountResult> {
  const { apiUrl, apiKey, userId, accountSize, rules, programKey, phase, status, label } = params;
  try {
    const res = await fetchWithTimeout(
      `${trimSlash(apiUrl)}/api/admin/create-account`,
      { method: "POST", headers: authHeaders(apiKey), body: JSON.stringify({ userId, accountSize, rules, programKey, phase, status, label, businessAccountId: params.businessAccountId }) },
      15000,
    );
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      return { success: false, login: "", error: `Terminal returned ${res.status}: ${body.error || "unknown error"}` };
    }
    const data = (await res.json()) as { account?: { id?: string } };
    const id = data.account?.id;
    if (!id) return { success: false, login: "", error: "Terminal did not return an account id" };
    // The terminal signs traders in with their TPP session; the account id is the login.
    return { success: true, login: id, password: "sso", server: "TPP-Terminal", terminalAccountId: id };
  } catch (err) {
    return { success: false, login: "", error: `Could not reach the terminal: ${(err as Error).message}` };
  }
}

/** Stops trading on a terminal account (used when the CRM closes an account). */
export async function disableTradingAccount(apiUrl: string, apiKey: string, login: string, reason: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(
      `${trimSlash(apiUrl)}/api/admin/disable-account`,
      { method: "POST", headers: authHeaders(apiKey), body: JSON.stringify({ login, reason }) },
      8000,
    );
    return res.ok;
  } catch {
    return false;
  }
}
