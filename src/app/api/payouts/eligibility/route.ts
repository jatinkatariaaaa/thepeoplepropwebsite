import { getSessionUser } from "@/lib/api-auth";
import { checkPayout, payoutError } from "@/lib/payouts";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const accountId = new URL(request.url).searchParams.get("accountId");
  if (!accountId) return Response.json({ error: "accountId is required" }, { status: 400 });
  const { data, error } = await checkPayout(user.id, accountId);
  if (error) return payoutError(error);
  return Response.json(data);
}
