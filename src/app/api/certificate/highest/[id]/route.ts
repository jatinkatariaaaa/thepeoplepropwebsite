import { getHighestPayoutCertificate } from "@/lib/certificates/data";
import { certificateRoute } from "@/lib/certificates/route";

// Highest Payout award for the largest paid payout of a finished month.
export const GET = certificateRoute(getHighestPayoutCertificate);
