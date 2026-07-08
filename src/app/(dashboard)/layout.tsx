import { ClientSidebar } from "@/components/dashboard/ClientSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dash-scope min-h-dvh">
      <ClientSidebar />
      <div className="flex min-h-dvh flex-col pt-14 lg:pl-[248px] lg:pt-0">
        <DashboardHeader />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
