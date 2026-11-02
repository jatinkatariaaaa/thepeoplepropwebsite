import { getPayoutCertificate } from "@/lib/certificates/data";
import { certificateRoute } from "@/lib/certificates/route";

// Payout Certificate for a paid payout.
export const GET = certificateRoute(getPayoutCertificate);
