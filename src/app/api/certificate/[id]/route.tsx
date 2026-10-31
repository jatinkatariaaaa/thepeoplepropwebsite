import { ImageResponse } from "next/og";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Fetch account details
    const { data: account, error } = await supabaseAdmin
      .from("accounts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !account || (account.status !== "passed" && account.status !== "funded")) {
      return new Response("Certificate not found or account not eligible", { status: 404 });
    }

    const { data: profile } = await supabaseAdmin.from("profiles").select("display_name").eq("id", account.user_id).single();
    const traderName = profile?.display_name || "Valued Trader";
    const passDate = new Date(account.updated_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const accountSizeStr = `$${account.starting_balance.toLocaleString()}`;

    // Get background image URL (we'll just read it from the deployment URL)
    // For Vercel edge functions, it's easier to fetch from an absolute URL or read file
    const bgUrl = new URL("/certificate-bg.jpg", request.url).toString();

    // Satori config: The image dimensions should match the background aspect ratio.
    // The provided image looks like standard 1920x1358 or similar. Let's use 1200x850.
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: "100% 100%",
            backgroundRepeat: "no-repeat",
            flexDirection: "column",
            position: "relative",
            fontFamily: "sans-serif",
          }}
        >
          {/* Certificate ID */}
          <div
            style={{
              position: "absolute",
              top: "12%",
              right: "12%",
              fontSize: "18px",
              color: "#64748b",
              fontWeight: 500,
            }}
          >
            {id.split("-")[0].toUpperCase()}
          </div>

          {/* Trader Name */}
          <div
            style={{
              position: "absolute",
              top: "43%",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              fontSize: "46px",
              fontWeight: "bold",
              color: "#0f172a",
              letterSpacing: "2px",
            }}
          >
            {traderName.toUpperCase()}
          </div>

          {/* Account Size */}
          <div
            style={{
              position: "absolute",
              top: "61.5%",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              fontSize: "36px",
              fontWeight: "bold",
              color: "#1e3a8a",
            }}
          >
            {accountSizeStr}
          </div>

          {/* Date Passed */}
          <div
            style={{
              position: "absolute",
              bottom: "10.5%",
              left: "14%",
              fontSize: "16px",
              color: "#64748b",
              fontWeight: 500,
              width: "150px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {passDate}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 850,
      }
    );
  } catch (e: any) {
    console.error("Certificate generation error:", e);
    return new Response("Failed to generate certificate", { status: 500 });
  }
}
