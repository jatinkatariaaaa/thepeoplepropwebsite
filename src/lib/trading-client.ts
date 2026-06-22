// Client-side fetch helpers for the admin Trading Operations endpoints.
// Centralises calls so UI pages don't talk to Supabase directly for mutations.

async function handle<T>(res: Response): Promise<T> {
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // ignore non-JSON bodies
  }
  if (!res.ok) {
    throw new Error(json?.error || `Request failed (${res.status})`);
  }
  return json as T;
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------
export async function fetchTradingAccounts() {
  const res = await fetch("/api/admin/trading/accounts", { cache: "no-store" });
  return handle<{ accounts: any[] }>(res);
}

export async function createTradingAccount(payload: {
  user_id: string;
  platform_id: string;
  rule_id?: string | null;
  starting_balance: number;
  leverage?: number;
  phase?: string;
}) {
  const res = await fetch("/api/admin/trading/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<{ success: boolean; account: any }>(res);
}

export async function accountAction(
  id: string,
  payload: { action: string; [key: string]: any }
) {
  const res = await fetch(`/api/admin/trading/accounts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<{ success: boolean; account: any }>(res);
}

export async function deleteTradingAccount(id: string) {
  const res = await fetch(`/api/admin/trading/accounts/${id}`, {
    method: "DELETE",
  });
  return handle<{ success: boolean }>(res);
}

// ---------------------------------------------------------------------------
// Dropdown reads (platforms + customers)
// ---------------------------------------------------------------------------
export async function fetchTradingPlatforms() {
  const res = await fetch("/api/admin/trading/platforms", { cache: "no-store" });
  return handle<{ platforms: any[] }>(res);
}

export async function fetchCustomers(search = "") {
  const params = new URLSearchParams({ limit: "20", role: "user" });
  if (search) params.set("search", search);
  const res = await fetch(`/api/admin/users?${params.toString()}`, {
    cache: "no-store",
  });
  return handle<{ users: any[] }>(res);
}

// ---------------------------------------------------------------------------
// Rule templates
// ---------------------------------------------------------------------------
export async function fetchTradingRules() {
  const res = await fetch("/api/admin/trading/rules", { cache: "no-store" });
  return handle<{ rules: any[] }>(res);
}

export async function createTradingRule(payload: Record<string, any>) {
  const res = await fetch("/api/admin/trading/rules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<{ success: boolean; rule: any }>(res);
}

export async function updateTradingRule(payload: Record<string, any>) {
  const res = await fetch("/api/admin/trading/rules", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handle<{ success: boolean; rule: any }>(res);
}

export async function deleteTradingRule(id: string) {
  const res = await fetch(`/api/admin/trading/rules?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return handle<{ success: boolean }>(res);
}
