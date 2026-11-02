import type { Viewport } from "next";
import { ClientSidebar } from "@/components/dashboard/ClientSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { cn } from "@/lib/utils";
import styles from "./dashboard.module.css";

export const viewport: Viewport = {
  themeColor: "#f3f5f4",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // .v2-scope switches on the glass system (src/app/glass.css); styles.light turns it to the light side.
    <div className={cn("v2-scope relative isolate min-h-screen overflow-x-clip antialiased", styles.light)}>
      {/* Pearl canvas lit from above, with soft mint and volt light for the frosted glass to pick up. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#e4ebe8_0%,#f1f4f3_40%,#f7f9f8_100%)]" />
        <div className="absolute -top-[30vh] -right-[12vw] h-[85vh] w-[70vw] rounded-full bg-[radial-gradient(closest-side,rgba(169,220,207,0.6),transparent)]" />
        <div className="absolute -bottom-[38vh] -left-[6vw] h-[80vh] w-[60vw] rounded-full bg-[radial-gradient(closest-side,rgba(220,251,146,0.42),transparent)]" />
        <div className="absolute top-[28vh] left-[30vw] h-[60vh] w-[50vw] rounded-full bg-[radial-gradient(closest-side,rgba(29,102,86,0.07),transparent)]" />
      </div>

      <ClientSidebar />
      <div className="flex min-h-screen flex-col lg:pl-[272px]">
        <DashboardHeader />
        <main className="flex-1 px-4 pt-7 pb-16 sm:px-6 lg:px-8 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
