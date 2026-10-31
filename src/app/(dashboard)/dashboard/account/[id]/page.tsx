import { AccountClient } from "@/components/dashboard/account/AccountClient";

export default async function AccountDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const accountId = resolvedParams?.id;
  
  if (!accountId) return null;

  return <AccountClient accountId={accountId} />;
}
