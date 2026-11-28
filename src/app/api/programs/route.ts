import { NextResponse } from "next/server";
import { getSiteData } from "@/lib/site-data";

// Served from Vercel's cache (incremental static regeneration) and rebuilt at most every five minutes, or
// at once when an admin saves a change: refreshSiteData() revalidates the "site-data" tag, which covers
// this route too. Until 2026-11 it ran a function on every page view.
export const revalidate = 300;

/**
 * Active programs and their fees, plus the landing stats and the public platform list, from the shared
 * cache in lib/site-data. `programs` keeps the shape this route always returned.
 *
 * A failed read throws rather than returning an error body: the last good copy keeps being served and an
 * error is never cached. The browser treats any non-OK answer as "no data yet" (lib/site-data-client).
 */
export async function GET() {
  const { programs, stats, platforms } = await getSiteData();
  return NextResponse.json({ programs, stats, platforms });
}
