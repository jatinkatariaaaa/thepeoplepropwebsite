import { NextResponse } from "next/server";
import { getSiteData } from "@/lib/site-data";

export const dynamic = "force-dynamic";

/**
 * Active programs and their fees, plus the landing stats and the public platform list, from the shared
 * cache in lib/site-data (one database read per five minutes, refreshed at once on admin saves).
 * `programs` keeps the shape this route always returned.
 */
export async function GET() {
  try {
    const { programs, stats, platforms } = await getSiteData();
    return NextResponse.json({ programs, stats, platforms });
  } catch (error) {
    console.error("Programs API Error:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
