import { listCertificates } from "@/lib/certificates/data";
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

  // Funding certificates for passed and funded accounts, payout certificates for paid
  // payouts, and highest-payout awards (see src/lib/certificates/data.ts).
  const certificates = await listCertificates(user.id);

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle lead="My Certificates" lede="View and share your well-earned trading certificates." />

      <CertificatesClient certificates={certificates} />
    </div>
  );
}
