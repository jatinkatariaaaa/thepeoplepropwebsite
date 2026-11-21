import { getSessionUser } from "@/lib/api-auth";
import { deskResponse, readPartnerDesk } from "@/lib/partner-desk-server";

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return deskResponse({ error: "Sign in to access your partner desk." }, 401);
  try {
    const desk = await readPartnerDesk(user.id);
    return desk ? deskResponse(desk) : deskResponse({ error: "Partner access is unavailable." }, 403);
  } catch {
    return deskResponse({ error: "Could not load the partner desk. Please try again." }, 503);
  }
}
