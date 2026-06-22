import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { Toaster } from "sonner";
import {
  AdminRoleProvider,
  type AdminRole,
} from "@/lib/admin-context";

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin via profiles table
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  // Check admin_roles table for a specific role
  const { data: adminRole } = await supabaseAdmin
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  // Must be flagged as admin OR have an entry in admin_roles
  if (!profile?.is_admin && !adminRole) {
    redirect("/dashboard");
  }

  // Resolve the role: admin_roles table takes precedence, fallback to super_admin for is_admin users
  const role: AdminRole = (adminRole?.role as AdminRole) ?? "super_admin";

  return (
    <div className="min-h-screen bg-[var(--paper-2)]">
      <AdminRoleProvider role={role}>
        <AdminSidebar role={role} />
        <div className="lg:pl-[260px] flex flex-col min-h-screen">
          <DashboardHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-10 pt-20 lg:pt-10">
            {children}
          </main>
        </div>
      </AdminRoleProvider>
      <Toaster position="bottom-right" />
    </div>
  );
}
