import { loadCoupon, CheckoutError } from "@/lib/checkout";
import { isProgramKey } from "@/data/catalogue";

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("program");
  const headers = { "Cache-Control": "no-store" };
  if (!key || !isProgramKey(key)) return Response.json({ offer: null }, { status: 400, headers });
  try {
    return Response.json({ offer: await loadCoupon("FIRSTTPP", key) }, { headers });
  } catch (error) {
    return Response.json({ offer: null }, { headers, status: error instanceof CheckoutError && error.status === 400 ? 200 : 503 });
  }
}
