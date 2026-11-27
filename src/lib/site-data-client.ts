/**
 * Browser side of lib/site-data: one request to /api/programs brings the programs, the landing stats and
 * the platform list, and every component on the page shares it. A copy is reused for a minute, so moving
 * between pages does not refetch; after that the next component that asks loads it again.
 */
export interface SiteDataResponse {
  programs?: unknown[];
  stats?: unknown[];
  platforms?: unknown[];
}

const REUSE_MS = 60_000;
let pending: Promise<SiteDataResponse | null> | null = null;
let loadedAt = 0;

export function loadSiteData(): Promise<SiteDataResponse | null> {
  if (pending && Date.now() - loadedAt < REUSE_MS) return pending;
  loadedAt = Date.now();
  pending = fetch("/api/programs")
    .then((res) => (res.ok ? (res.json() as Promise<SiteDataResponse>) : null))
    .catch(() => null)
    .then((data) => {
      // A failed load is not kept: the next caller tries again.
      if (!data) pending = null;
      return data;
    });
  return pending;
}

/** Admin screens call this after saving programs, fees, landing stats or platforms. */
export function refreshPublicSiteData(): void {
  pending = null;
  void fetch("/api/admin/site-data", { method: "POST" }).catch(() => {});
}
