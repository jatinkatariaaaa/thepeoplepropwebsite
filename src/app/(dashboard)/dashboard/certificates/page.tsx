import { supabaseAdmin } from "@/lib/supabase";
import { CertificatesClient } from "./CertificatesClient";
import { PageTitle } from "@/components/dashboard/glass";
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
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["passed", "funded"])
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle lead="My Certificates" lede="View and share your well-earned trading certificates." />

      <CertificatesClient accounts={accounts || []} />
    </div>
  );
}
