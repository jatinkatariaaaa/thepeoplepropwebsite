import { renderCertificate } from "./render";
import type { Certificate } from "./types";

/** GET handler for a certificate image route: 404 unless `load` finds an eligible certificate. */
export function certificateRoute(load: (id: string) => Promise<Certificate | null>) {
  return async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
      const { id } = await params;
      const certificate = await load(id);
      if (!certificate) return new Response("Certificate not found or not eligible", { status: 404 });
      return await renderCertificate(certificate);
    } catch (error) {
      console.error("Certificate generation error:", error);
      return new Response("Failed to generate certificate", { status: 500 });
    }
  };
}
