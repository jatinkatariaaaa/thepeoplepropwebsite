import type { Metadata } from "next";
import { preload } from "react-dom";
import { supabaseAdmin } from "@/lib/supabase";
import { VerifyPage } from "@/components/v2/glass/pages/verify-page";

export const revalidate = 60; // Cache for 60 seconds

export const metadata: Metadata = {
  title: "Certificate verification",
  description: "Check that a The People Prop certificate is genuine.",
};

export default async function VerifyCertificatePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  preload("/art/page-verify.webp", { as: "image", fetchPriority: "high" });

  // Fetch account details
  const { data: account, error } = await supabaseAdmin
    .from("accounts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !account || (account.status !== "passed" && account.status !== "funded")) {
    return <VerifyPage certificate={null} />;
  }

  const { data: profile } = await supabaseAdmin.from("profiles").select("display_name").eq("id", account.user_id).single();
  const traderName = profile?.display_name || "Valued Trader";
  const passDate = new Date(account.updated_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <VerifyPage
      certificate={{ id, traderName, accountSize: `$${account.starting_balance.toLocaleString()}`, passDate }}
    />
  );
}
