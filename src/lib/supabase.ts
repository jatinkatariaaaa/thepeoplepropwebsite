import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xnvtgpoocikieikgiotm.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhudnRncG9vY2lraWVpa2dpb3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MTI4NjEsImV4cCI6MjA5MzM4ODg2MX0._lj2Fek8Fvn6NZ89FdLn7GsloRdx_nwA_2dpgZgp-hU";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
