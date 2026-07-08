import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

// Fall back to placeholder values when Supabase env vars are not configured,
// so client creation doesn't throw at module load and the app can still render.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-key-placeholder";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookieOptions: cookieDomain ? {
    domain: cookieDomain,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  } : undefined
});

// Fail loudly if the service-role key is missing in production: silently
// falling back to the anon key would make every admin operation no-op
// against RLS instead of surfacing the misconfiguration.
const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
if (!supabaseServiceRoleKey && isSupabaseConfigured) {
  const message =
    "SUPABASE_SERVICE_ROLE_KEY is not set — admin operations (supabaseAdmin) will fail. " +
    "Set it in the server environment.";
  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  }
  console.error(`[supabase] ${message}`);
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface UserProfile {
  id: string;
  display_name: string;
  referral_code: string;
  referrals_count: number;
  earnings: number;
  conversion_rate: number;
  global_rank: number;
}
