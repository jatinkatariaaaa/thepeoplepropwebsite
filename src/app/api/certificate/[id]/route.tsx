import { getFundedCertificate } from "@/lib/certificates/data";
import { certificateRoute } from "@/lib/certificates/route";

// Certificate of Funding for a terminal account that passed or is funded.
export const GET = certificateRoute(getFundedCertificate);
