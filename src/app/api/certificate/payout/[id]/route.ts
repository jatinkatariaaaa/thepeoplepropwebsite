import { findByPayout } from "@/lib/certificates/data";
import { certificateRoute } from "@/lib/certificates/route";

// Older payout links: the payout certificate recorded for a payout id.
export const GET = certificateRoute((id) => findByPayout(id, "payout"));
