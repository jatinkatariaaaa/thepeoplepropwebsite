import { findByPayout } from "@/lib/certificates/data";
import { certificateRoute } from "@/lib/certificates/route";

// Older highest-payout links: only awards an admin actually issued for that payout.
export const GET = certificateRoute((id) => findByPayout(id, "highest_payout"));
