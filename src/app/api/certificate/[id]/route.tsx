import { findCertificate } from "@/lib/certificates/data";
import { certificateRoute } from "@/lib/certificates/route";

// Any certificate by its id. Older links that carry an account or payout id still resolve.
export const GET = certificateRoute(findCertificate);
