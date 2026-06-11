import { supabaseAdmin } from "@/lib/supabase";
import { ShieldCheck, Calendar, Trophy, User } from "lucide-react";
import Image from "next/image";

export const revalidate = 60; // Cache for 60 seconds

export default async function VerifyCertificatePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  // Fetch account details
  const { data: account, error } = await supabaseAdmin
    .from("accounts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !account || (account.status !== "passed" && account.status !== "funded")) {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--ink-950)] mb-2">Certificate Not Found</h1>
          <p className="text-[var(--ink-500)]">This certificate is invalid or the account has not met the passing criteria.</p>
        </div>
      </div>
    );
  }

  const { data: profile } = await supabaseAdmin.from("profiles").select("display_name").eq("id", account.user_id).single();
  const traderName = profile?.display_name || "Valued Trader";
  const passDate = new Date(account.updated_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-[var(--paper)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Verification Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold text-[var(--ink-950)] mb-3">
            Verified The People Prop Certificate
          </h1>
          <p className="text-lg text-[var(--ink-500)] max-w-2xl mx-auto">
            This certifies that the trader has successfully passed our evaluation program and met all required trading objectives.
          </p>
        </div>

        {/* Certificate Display */}
        <div className="bg-white rounded-3xl border border-[var(--border)] shadow-xl overflow-hidden mb-10 p-2">
          <div className="relative aspect-[1.41] w-full rounded-2xl overflow-hidden bg-[var(--paper-2)]">
            <Image 
              src={`/api/certificate/${id}`}
              alt={`Certificate for ${traderName}`}
              fill
              className="object-contain"
              priority
              unoptimized // Allow the API route to serve it directly
            />
          </div>
        </div>

        {/* Verification Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[var(--border)] shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--brand-50)] text-[var(--brand-500)] flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-[var(--ink-500)] font-medium mb-1">Trader Name</p>
              <p className="text-base font-bold text-[var(--ink-950)]">{traderName}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[var(--border)] shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--brand-50)] text-[var(--brand-500)] flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-[var(--ink-500)] font-medium mb-1">Account Size</p>
              <p className="text-base font-bold text-[var(--ink-950)]">${account.starting_balance.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[var(--border)] shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--brand-50)] text-[var(--brand-500)] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-[var(--ink-500)] font-medium mb-1">Issue Date</p>
              <p className="text-base font-bold text-[var(--ink-950)]">{passDate}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
