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
    <div className="dash-scope min-h-dvh">
      <AdminRoleProvider role={role}>
        <AdminSidebar role={role} />
        <div className="flex min-h-dvh flex-col pt-14 lg:pl-[248px] lg:pt-0">
          <DashboardHeader />
          <main className="flex-1">
            <div className="mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </AdminRoleProvider>
      <Toaster position="bottom-right" />
    </div>
  );
}
