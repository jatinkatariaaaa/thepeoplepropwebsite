import type { Metadata } from "next";
import { preload } from "react-dom";
import { ContestPage } from "@/components/v2/glass/pages/contest-page";
import { getReferralTerms } from "@/lib/referrals";

// terms come from admin settings; refresh them every few minutes
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { target } = await getReferralTerms();
  return {
    title: "Referral contest",
    description: `Invite ${target} friends to The People Prop. When they sign up and confirm their email, claim a free 3-Step challenge.`,
  };
}

export default async function Page() {
  preload("/art/contest-hero.webp", { as: "image", fetchPriority: "high", media: "(min-width: 1024px)" });
  preload("/art/contest-mobile.webp", { as: "image", fetchPriority: "high", media: "(max-width: 1023px)" });
  const terms = await getReferralTerms();
  return <ContestPage terms={terms} />;
}
