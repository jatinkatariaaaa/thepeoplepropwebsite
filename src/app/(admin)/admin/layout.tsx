import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { Toaster } from "sonner";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[var(--paper-2)]">
      <AdminSidebar />
      <div className="lg:pl-[260px] flex flex-col min-h-screen">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-10 pt-20 lg:pt-10">
          {children}
        </main>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}
