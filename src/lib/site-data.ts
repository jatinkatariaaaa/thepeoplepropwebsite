import { createClient } from "@supabase/supabase-js";
import { revalidateTag, unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * What every marketing page shows from the database: the active programs with their fees, the landing
 * stats and the public platform list. Until 2026-11 each page view fetched these itself (three requests
 * and two CORS preflights to Supabase per visit). Now they are read once, shared by every visitor through
 * the Next.js data cache for up to five minutes, and refreshed at once when an admin saves a change
 * (refreshSiteData, called by /api/admin/site-data).
 *
 * Each source is read exactly as before: programs with the service role (as /api/programs always did),
 * stats as an anonymous visitor (the same row-level security the browser had), platforms through the
 * same list_public_platforms function.
 */
export const SITE_DATA_TAG = "site-data";

export interface SiteData {
  programs: unknown[];
  stats: unknown[];
  platforms: unknown[];
}

const anon =
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

async function readSiteData(): Promise<SiteData> {
  if (!anon) throw new Error("Supabase is not configured");
  const [programs, stats, platforms] = await Promise.all([
    supabaseAdmin
      .from("tpp_programs")
      .select("*, tpp_program_fees(account_size, fee)")
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    anon.from("tpp_stats").select("*").order("key_name"),
    anon.rpc("list_public_platforms"),
  ]);
  // A failed read is thrown, never cached: the next request tries again.
  const failed = programs.error ?? stats.error ?? platforms.error;
  if (failed) throw new Error(failed.message);
  return { programs: programs.data ?? [], stats: stats.data ?? [], platforms: platforms.data ?? [] };
}

export const getSiteData = unstable_cache(readSiteData, ["site-data-v1"], {
  tags: [SITE_DATA_TAG],
  revalidate: 300,
});

/** Drops the cached copy so the next visitor reads the database again. */
export function refreshSiteData(): void {
  revalidateTag(SITE_DATA_TAG, { expire: 0 });
}
