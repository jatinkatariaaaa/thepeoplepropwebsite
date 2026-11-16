import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase";

/** The signed-in trader for an API route: a Bearer token if one is sent, otherwise the session cookie. */
export async function getSessionUser(request: Request): Promise<User | null> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
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

export const jsonError = (message: string, status = 400) => Response.json({ error: message }, { status });
