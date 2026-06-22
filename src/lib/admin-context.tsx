"use client";

import { createContext, useContext, type ReactNode } from "react";

export type AdminRole = "super_admin" | "finance" | "support" | "marketing";

interface AdminRoleContextValue {
  role: AdminRole;
}

const AdminRoleContext = createContext<AdminRoleContextValue>({
  role: "super_admin",
});

export function AdminRoleProvider({
  role,
  children,
}: {
  role: AdminRole;
  children: ReactNode;
}) {
  return (
    <AdminRoleContext.Provider value={{ role }}>
      {children}
    </AdminRoleContext.Provider>
  );
}

export function useAdminRole() {
  return useContext(AdminRoleContext);
}
