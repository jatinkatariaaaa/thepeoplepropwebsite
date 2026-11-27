import type { Viewport } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ClientSidebar } from "@/components/dashboard/ClientSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DASH_THEME_SCRIPT } from "@/components/dashboard/theme";
import { AssistantWidget } from "@/components/assistant/assistant-widget";
import { cn } from "@/lib/utils";
import { getVerifiedUserId } from "@/lib/api-auth";
import { getSidebarFlags } from "@/lib/sidebar-flags";
import { supabaseAdmin } from "@/lib/supabase";
import styles from "./dashboard.module.css";

export const viewport: Viewport = {
  themeColor: "#f3f5f4",
};

async function DashboardSidebar({ userId }: { userId: string | undefined }) {
  if (!userId) return <ClientSidebar />;
  // The admin panel's own rule (getAdminRole), so every admin, whatever their role, gets the button.
  const { hasPartnerDesk, isAdmin } = await getSidebarFlags(userId);
  return <ClientSidebar hasPartnerDesk={hasPartnerDesk} isAdmin={isAdmin} />;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verify the identity locally for the profile check and sidebar.
  const userId = await getVerifiedUserId();
  if (userId) {
    const { data: profile, error } = await supabaseAdmin.from("profiles")
      .select("signup_details_pending")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error("Could not check your profile. Please try again.");
    if (profile?.signup_details_pending) redirect("/complete-profile");
  }
  return (
    // .v2-scope switches on the glass system (src/app/glass.css); styles.light turns it to the light side.
    // <html data-dash="dark"> (set by the theme toggle) turns the same markup dark: see dashboard.module.css.
    <div className={cn("v2-scope relative isolate min-h-screen overflow-x-clip antialiased", styles.light)}>
      <script dangerouslySetInnerHTML={{ __html: DASH_THEME_SCRIPT }} />

      {/* Pearl canvas lit from above, with soft mint and volt light for the frosted glass to pick up. */}
      <div aria-hidden="true" className="dash-canvas-light pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#e4ebe8_0%,#f1f4f3_40%,#f7f9f8_100%)]" />
        <div className="absolute -top-[30vh] -right-[12vw] h-[85vh] w-[70vw] rounded-full bg-[radial-gradient(closest-side,rgba(169,220,207,0.6),transparent)]" />
        <div className="absolute -bottom-[38vh] -left-[6vw] h-[80vh] w-[60vw] rounded-full bg-[radial-gradient(closest-side,rgba(220,251,146,0.42),transparent)]" />
        <div className="absolute top-[28vh] left-[30vw] h-[60vh] w-[50vw] rounded-full bg-[radial-gradient(closest-side,rgba(29,102,86,0.07),transparent)]" />
      </div>
      {/* The same room with the lights down. */}
      <div aria-hidden="true" className="dash-canvas-dark pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#151a19_0%,#0e1110_45%,#0b0e0d_100%)]" />
        <div className="absolute -top-[30vh] -right-[12vw] h-[85vh] w-[70vw] rounded-full bg-[radial-gradient(closest-side,rgba(29,102,86,0.4),transparent)]" />
        <div className="absolute -bottom-[38vh] -left-[6vw] h-[80vh] w-[60vw] rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.07),transparent)]" />
      </div>

      <Suspense fallback={<ClientSidebar />}>
        <DashboardSidebar userId={userId ?? undefined} />
      </Suspense>
      <div className="flex min-h-screen flex-col lg:pl-[272px]">
        <DashboardHeader />
        <main className="flex-1 px-4 pt-7 pb-24 sm:px-6 lg:px-8 lg:pt-8">
          {children}
        </main>
      </div>
      <AssistantWidget supportHref="/dashboard/support" />
    </div>
  );
}
