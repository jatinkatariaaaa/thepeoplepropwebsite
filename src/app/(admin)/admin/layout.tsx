import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import styles from "../../(dashboard)/dashboard.module.css";
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
  const { data: adminRole, error: roleError } = await supabaseAdmin
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (roleError) throw new Error("Unable to verify admin role");

  // Must be flagged as admin OR have an entry in admin_roles
  if (!profile?.is_admin && !adminRole) {
    const { data: hasDesk } = await supabaseAdmin.rpc("partner_desk_eligible", { p_user_id: user.id });
    redirect(hasDesk === true ? "/partner-desk" : "/dashboard");
  }

  // Resolve the role: admin_roles table takes precedence, fallback to super_admin for is_admin users
  const role: AdminRole = (adminRole?.role as AdminRole) ?? "super_admin";

  return (
    // Same glass system and pearl canvas as the trader dashboard. The --ink-* variables the admin
    // pages were written with are remapped in globals.css (.admin-scope) to the glass palette.
    <div className={cn("v2-scope admin-scope relative isolate min-h-screen overflow-x-clip antialiased", styles.light)}>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#e4ebe8_0%,#f1f4f3_40%,#f7f9f8_100%)]" />
        <div className="absolute -top-[30vh] -right-[12vw] h-[85vh] w-[70vw] rounded-full bg-[radial-gradient(closest-side,rgba(169,220,207,0.45),transparent)]" />
        <div className="absolute -bottom-[38vh] -left-[6vw] h-[80vh] w-[60vw] rounded-full bg-[radial-gradient(closest-side,rgba(220,251,146,0.3),transparent)]" />
      </div>
      <AdminRoleProvider role={role}>
        <AdminSidebar role={role} />
        <div className="lg:pl-[272px] flex flex-col min-h-screen">
          <AdminHeader />
          <main className="flex-1 p-4 sm:p-6 lg:px-8 lg:py-6">
            {children}
          </main>
        </div>
      </AdminRoleProvider>
      <Toaster position="bottom-right" />
    </div>
  );
}
