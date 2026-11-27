import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";

/** The signed-in trader for an API route: a Bearer token if one is sent, otherwise the session cookie. */
export async function getSessionUser(request?: Request): Promise<User | null> {
  const token = request?.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (token) {
    const { data } = await supabaseAdmin.auth.getUser(token);
    if (data.user) return data.user;
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: { getAll: () => cookieStore.getAll() },
  });
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/**
 * The signed-in user's id from the session cookie, verified locally: the access token's signature
 * against the project's published signing key, and its expiry. No request to Supabase Auth.
 *
 * For server reads that only need to know who is signed in (the dashboard sidebar). Anything that moves
 * money, changes data or grants access keeps getSessionUser(), which also confirms with Auth that the
 * session has not been revoked. Deduplicated per request.
 */
export const getVerifiedUserId = cache(async (): Promise<string | null> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: { getAll: () => cookieStore.getAll() },
  });
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  return typeof sub === "string" && sub.length > 0 ? sub : null;
});

export const jsonError = (message: string, status = 400) => Response.json({ error: message }, { status });
