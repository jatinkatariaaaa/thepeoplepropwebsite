import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { listPartners } from "@/lib/partners";
import { PartnerProgramClient } from "./PartnerProgramClient";

export default async function PartnerProgramPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const admin = await getAdminUser().catch(() => null);
  if (admin?.role !== "super_admin") redirect("/admin");
  const requested = Number((await searchParams).page ?? 1);
  const page = Number.isSafeInteger(requested) && requested > 0 && requested <= 100000 ? requested : 1;
  const result = await listPartners(page);
  return <PartnerProgramClient page={page} {...result} />;
}
