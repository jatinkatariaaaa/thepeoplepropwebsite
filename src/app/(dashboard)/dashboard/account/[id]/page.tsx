import { AccountClient } from "@/components/dashboard/account/AccountClient";

export default function AccountDashboardPage({ params }: { params: { id: string } }) {
  const accountId = params?.id || "100626155";
  return <AccountClient accountId={accountId} />;
}
