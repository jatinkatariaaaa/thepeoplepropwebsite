import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--paper-2)]">
      <Sidebar />
      <div className="lg:pl-[260px] flex flex-col min-h-screen">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-10 pt-20 lg:pt-10">
          {children}
        </main>
      </div>
    </div>
  );
}
