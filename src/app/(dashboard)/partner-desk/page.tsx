import { AffiliateWithdrawal } from "@/components/dashboard/AffiliateWithdrawal";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/api-auth";
import { readPartnerDesk } from "@/lib/partner-desk-server";
import { PartnerDesk } from "./PartnerDesk";

export const dynamic = "force-dynamic";
export const metadata = { title: "Partner Desk | The People Prop" };

export default async function PartnerDeskPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?redirect=/partner-desk");
  const desk = await readPartnerDesk(user.id);
  if (!desk) redirect("/dashboard");
  return <div className="space-y-6"><PartnerDesk desk={desk} />{(desk.member?.permissions.includes("view_commissions") || desk.promotions.length > 0) && <AffiliateWithdrawal />}</div>;
}
