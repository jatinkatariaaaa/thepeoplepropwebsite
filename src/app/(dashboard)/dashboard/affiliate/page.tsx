import { AffiliateWithdrawal } from "@/components/dashboard/AffiliateWithdrawal";
import { AffiliateClient } from "./AffiliateClient";

export default function AffiliatePage() {
  return <div className="space-y-6"><AffiliateClient /><AffiliateWithdrawal /></div>;
}
