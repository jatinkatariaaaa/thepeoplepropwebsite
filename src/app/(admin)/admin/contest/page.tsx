import type { Metadata } from "next";
import { ContestReview } from "./ContestReview";

export const metadata: Metadata = { title: "Contest review" };

/**
 * Referral contest: which sign-ups count (one per person, device and internet connection),
 * claims waiting for review, and the free accounts already given.
 */
export default function AdminContestPage() {
  return <ContestReview />;
}
