import { ClientSidebar } from "@/components/dashboard/ClientSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#e8e8e6]">
      <ClientSidebar />
      <div className="lg:pl-[272px] flex flex-col min-h-screen">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 lg:px-8 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
