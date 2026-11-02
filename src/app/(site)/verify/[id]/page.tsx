import type { Metadata } from "next";
import { preload } from "react-dom";
import { findCertificate } from "@/lib/certificates/data";
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

  // Funding certificates carry the account id, payout and highest-payout certificates the payout id.
  return <VerifyPage certificate={await findCertificate(id)} />;
}
