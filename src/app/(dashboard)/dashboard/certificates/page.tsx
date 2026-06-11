import { supabaseAdmin } from "@/lib/supabase";
import { CertificatesClient } from "./CertificatesClient";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const revalidate = 0;

export default async function CertificatesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch passed and funded accounts
  const { data: accounts } = await supabaseAdmin
    .from("accounts")
    .select("*, profiles(display_name)")
    .eq("user_id", user.id)
    .in("status", ["passed", "funded"])
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">My Certificates</h1>
        <p className="text-[var(--ink-500)]">View and share your well-earned trading certificates.</p>
      </div>

      <CertificatesClient accounts={accounts || []} />
    </div>
  );
}
